/**
 * The response to a referral in, as the receiving clinician works through the referred patient: what the patient came
 * with (the triage note from the referral, the chief complaint, when it started), their vitals, and the ECG, with a
 * prompt to do one when the complaint can be cardiac. Laid out like the UHC decision-support prototype.
 *
 * Nothing is saved until "Save response": accepting the ECG prompt, or adding an order (ECG, troponin, echo, glucose,
 * creatinine: config responseForm.orderables), only marks it to be ordered. Saving creates one Referral Response
 * encounter with the answers and the orders, like the O3 Referral Response form it replaces, so the Referrals page
 * closes the referral as before. The ECG order sits in that encounter, which is how CCE ties the ECG to the referral.
 * Results are not entered here: imaging on the Imaging page, lab tests by the lab.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ComboBox,
  ComposedModal,
  InlineLoading,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@carbon/react';
import { showSnackbar, useConfig, usePatient, useSession } from '@openmrs/esm-framework';
import type { ChiefComplaintOption, ReferralFulfillmentConfig } from '../config-schema';
import {
  type ObsInput,
  type PatientRecord,
  createResponseEncounter,
  fetchPatientRecord,
  fetchVisitVitals,
} from './referral-response.resource';
import './referral-response.css';

export interface RespondedReferral {
  uuid: string;
  orderNumber: string;
  dateActivated?: string;
  instructions?: string | null;
  concept?: { display: string };
  orderer?: { display: string; person?: { display: string } | null };
}

interface Props {
  open: boolean;
  referral: RespondedReferral | null;
  patientUuid: string;
  visit: { uuid: string; startDatetime?: string; location?: { display?: string } } | null;
  onClose: () => void;
  /** Called when the response is saved: the page closes the referral then. */
  onSaved: (referral: RespondedReferral, encounterUuid: string) => void;
}

type VitalKey = 'bp' | 'pulse' | 'spo2' | 'respiratoryRate' | 'temperature';
type Vitals = Record<VitalKey, string>;
const NO_VITALS: Vitals = { bp: '', pulse: '', spo2: '', respiratoryRate: '', temperature: '' };

type PromptKind = 'chest' | 'abdominal' | 'breath';
interface Prompt {
  kind: PromptKind;
  status: 'open' | 'dismissed';
  at?: string;
  reason?: string;
}

/** An order marked to be placed when the response is saved */
interface PlannedOrder {
  key: string;
  at: string;
  /** The ECG for chest pain: urgent, due ecgDueMinutes after the order */
  urgent: boolean;
}

interface LogEntry {
  at: string;
  text: string;
  /** The chief complaint line, replaced when the complaint changes */
  complaint?: boolean;
}

/** The orderables key of the ECG: the order the ECG prompt places */
const ECG_KEY = 'ecg';

const DISMISS_REASONS: Array<[string, string]> = [
  ['done', 'ECG already done today'],
  ['other', 'Pain clearly has another cause (injury, local tenderness)'],
  ['declined', 'Patient declined the ECG'],
];

const hhmm = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';

const parseBp = (bp: string): [number, number] | null => {
  const m = bp.trim().match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
  return m ? [Number(m[1]), Number(m[2])] : null;
};
/**
 * Plausible ranges, within the CIEL concepts' absolute limits (OpenMRS rejects a value outside those, e.g. a
 * temperature above 43 °C). A value outside is taken as a typing error. Only SpO2 and temperature allow decimals.
 */
const RANGES: Record<Exclude<VitalKey, 'bp'>, [number, number]> = {
  pulse: [20, 230],
  spo2: [50, 100],
  respiratoryRate: [5, 80],
  temperature: [25, 43],
};
const WHOLE_NUMBERS: VitalKey[] = ['pulse', 'respiratoryRate'];
const BP_RANGES = { systolic: [50, 250], diastolic: [30, 150] } as const;

const num = (v: string): number | null => (v.trim() === '' || isNaN(Number(v)) ? null : Number(v));

const yearsSince = (birthDate?: string) => {
  if (!birthDate) return undefined;
  const b = new Date(birthDate);
  const now = new Date();
  return now.getFullYear() - b.getFullYear() - (now < new Date(now.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0);
};

function Req({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <span className="rr-req" aria-hidden="true">
        {' *'}
      </span>
    </>
  );
}

function Chip({ tone, children }: { tone: 'grey' | 'amber' | 'green' | 'red' | 'indigo'; children: React.ReactNode }) {
  return <span className={`rr-chip rr-chip-${tone}`}>{children}</span>;
}

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rr-card">
      <div className="rr-card-head">
        <h2>{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

const ReferralResponseModal: React.FC<Props> = ({ open, referral, patientUuid, visit, onClose, onSaved }) => {
  const { t: translate } = useTranslation();
  const t = useCallback(
    (key: string, defaultValue: string, options?: Record<string, unknown>): string =>
      translate(key, defaultValue, { ...options, interpolation: { escapeValue: false } }) as string,
    [translate],
  );
  const config = useConfig<ReferralFulfillmentConfig>();
  const rf = config.responseForm;
  const session = useSession();
  const { patient } = usePatient(patientUuid);

  const defaultOnset = rf.defaultSymptomOnsetConceptUuid ?? '';
  const [openedAt, setOpenedAt] = useState(() => new Date().toISOString());
  const [complaint, setComplaint] = useState('');
  const [onset, setOnset] = useState(defaultOnset);
  const [vitals, setVitals] = useState<Vitals>(NO_VITALS);
  const [vitalsAt, setVitalsAt] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [planned, setPlanned] = useState<PlannedOrder[]>([]);
  const ecg = planned.find((o) => o.key === ECG_KEY) ?? null;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  const addLog = useCallback((text: string) => setLog((cur) => [...cur, { at: new Date().toISOString(), text }]), []);

  // A fresh response each time the form opens for a referral
  useEffect(() => {
    if (!open || !referral) return;
    setOpenedAt(new Date().toISOString());
    setComplaint('');
    setOnset(defaultOnset);
    setVitals(NO_VITALS);
    setVitalsAt(null);
    setPrompt(null);
    setPlanned([]);
    setError(null);
    setLog([]);
    fetchPatientRecord(patientUuid, visit?.uuid)
      .then(setRecord)
      .catch(() => setRecord({ conditions: [], medicines: [], lastVisit: null, allergies: [] }));
    fetchVisitVitals(patientUuid, visit?.startDatetime, rf.vitalsConceptUuids)
      .then((v) => {
        if (!v.at) return;
        setVitals({
          bp: v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic}` : '',
          pulse: v.pulse?.toString() ?? '',
          spo2: v.spo2?.toString() ?? '',
          respiratoryRate: v.respiratoryRate?.toString() ?? '',
          temperature: v.temperature?.toString() ?? '',
        });
        setVitalsAt(v.at);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, referral?.uuid]);

  const age = yearsSince(patient?.birthDate);
  const sex = patient?.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '';
  const name =
    patient?.name?.[0]?.text ??
    [patient?.name?.[0]?.given?.join(' '), patient?.name?.[0]?.family].filter(Boolean).join(' ');
  const identifier = patient?.identifier?.find((i: any) => i.use === 'official')?.value ?? patient?.identifier?.[0]?.value;
  const clinician = session?.user?.person?.display ?? '';
  const where = session?.sessionLocation?.display ?? visit?.location?.display ?? '';

  const complaintOption: ChiefComplaintOption | undefined = useMemo(
    () => rf.chiefComplaints.find((c) => c.label.toLowerCase() === complaint.trim().toLowerCase()),
    [rf.chiefComplaints, complaint],
  );
  const onsetOptions = useMemo(
    () =>
      rf.symptomOnsets.map((o) => {
        const at = new Date(Date.now() - (o.hoursAgo ?? 0) * 3_600_000);
        at.setMinutes(0, 0, 0);
        return { ...o, text: o.label.replace('{{time}}', hhmm(at.toISOString())) };
      }),
    [rf.symptomOnsets],
  );

  const systolic = parseBp(vitals.bp)?.[0] ?? null;
  const riskWords = useMemo(() => {
    const conds = (record?.conditions ?? []).join(' ');
    const words: string[] = [];
    if (/diabet/i.test(conds)) words.push(t('riskDiabetes', 'diabetes'));
    if (/hypert/i.test(conds)) words.push(t('riskHypertension', 'hypertension'));
    else if (systolic !== null && systolic >= 140) words.push(t('riskRaisedBp', 'a raised BP today'));
    if (/tobacco|smok/i.test(conds)) words.push(t('riskTobacco', 'tobacco use'));
    return words.length ? words.join(` ${t('and', 'and')} `) : t('theseRiskFactors', 'these risk factors');
  }, [record, systolic, t]);

  /** Which ECG prompt the complaint raises (the prototype's rules), or none. */
  const promptKindFor = useCallback(
    (text: string): PromptKind | null => {
      const option = rf.chiefComplaints.find((c) => c.label.toLowerCase() === text.trim().toLowerCase());
      const c = text.toLowerCase();
      const kind = (option?.ecgPrompt || null) as PromptKind | null;
      const guess: PromptKind | null =
        kind ??
        (/chest/.test(c)
          ? 'chest'
          : /abdom|epigast|gastric|stomach|heartburn|indigest/.test(c)
            ? 'abdominal'
            : /breath/.test(c)
              ? 'breath'
              : null);
      if (guess !== 'abdominal') return guess;
      let risky = systolic !== null && systolic >= 140;
      try {
        risky = risky || new RegExp(rf.riskConditionPattern, 'i').test((record?.conditions ?? []).join(' '));
      } catch {
        /* bad pattern in config: only the BP counts */
      }
      return (age ?? 0) >= 40 && risky ? 'abdominal' : null;
    },
    [rf.chiefComplaints, rf.riskConditionPattern, systolic, record, age],
  );

  const changeComplaint = useCallback(
    (text: string) => {
      setComplaint(text);
      // One timeline line for the complaint: the latest choice
      setLog((cur) => {
        const rest = cur.filter((l) => !l.complaint);
        return text.trim()
          ? [...rest, { at: new Date().toISOString(), text: t('logChiefComplaint', 'Chief complaint: {{text}}', { text }), complaint: true }]
          : rest;
      });
      const kind = ecg ? null : promptKindFor(text);
      setPrompt(kind ? { kind, status: 'open' } : null);
    },
    [ecg, promptKindFor, t],
  );

  const orderable = useCallback((key: string) => rf.orderables.find((o) => o.key === key), [rf.orderables]);

  const planOrder = useCallback(
    (key: string) => {
      const item = orderable(key);
      if (!item || planned.some((o) => o.key === key)) return;
      // The ECG for chest pain is urgent: its clock starts when the response is saved
      const urgent = key === ECG_KEY && (prompt?.kind ?? promptKindFor(complaint)) === 'chest';
      setPlanned((cur) => [...cur, { key, at: new Date().toISOString(), urgent }]);
      if (key === ECG_KEY) setPrompt(null);
      addLog(t('logOrderToPlace', '{{order}} to be ordered on save', { order: item.label }));
    },
    [orderable, planned, prompt, promptKindFor, complaint, addLog, t],
  );

  const unplanOrder = useCallback(
    (key: string) => {
      setPlanned((cur) => cur.filter((o) => o.key !== key));
      addLog(t('logOrderRemoved', '{{order}} removed', { order: orderable(key)?.label ?? key }));
      if (key === ECG_KEY) {
        const kind = promptKindFor(complaint);
        setPrompt(kind ? { kind, status: 'open' } : null);
      }
    },
    [addLog, t, orderable, promptKindFor, complaint],
  );

  const dismissPrompt = useCallback(() => {
    setPrompt((cur) => (cur ? { ...cur, status: 'dismissed', at: new Date().toISOString() } : cur));
    addLog(t('logEcgPromptDismissed', 'ECG prompt dismissed'));
  }, [addLog, t]);

  // ─── What must be filled in before saving ──────────────────────────────
  const required = useMemo(() => new Set(rf.requiredVitals), [rf.requiredVitals]);
  const vitalError = useCallback(
    (key: VitalKey): string | null => {
      const raw = vitals[key].trim();
      if (!raw) return null;
      if (key === 'bp') {
        const bp = parseBp(raw);
        if (!bp) return t('bpFormatShort', 'Enter as systolic/diastolic, e.g. 172/104');
        const [s, d] = bp;
        if (s < BP_RANGES.systolic[0] || s > BP_RANGES.systolic[1] || d < BP_RANGES.diastolic[0] || d > BP_RANGES.diastolic[1] || d >= s)
          return t('bpOutOfRangeShort', 'Systolic 50–250, diastolic 30–150, systolic higher');
        return null;
      }
      const v = num(raw);
      if (v !== null && WHOLE_NUMBERS.includes(key) && !Number.isInteger(v))
        return t('vitalWholeNumberShort', 'Whole number only');
      const [lo, hi] = RANGES[key];
      return v === null || v < lo || v > hi
        ? t('vitalOutOfRangeShort', 'Must be {{lo}}–{{hi}}', { lo, hi })
        : null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vitals, t],
  );
  const vitalLabel = (key: VitalKey) =>
    ({
      bp: t('bpMmHg', 'BP, mmHg'),
      pulse: t('pulsePerMin', 'Pulse, /min'),
      spo2: t('oxygenSaturation', 'Oxygen saturation'),
      respiratoryRate: t('breathsPerMin', 'Breaths, /min'),
      temperature: t('temperature', 'Temperature'),
    })[key];
  const vitalKeys: VitalKey[] = ['bp', 'pulse', 'spo2', 'respiratoryRate', 'temperature'];
  const missing = useMemo(() => {
    const m: string[] = [];
    if (!complaint.trim()) m.push(t('missingComplaint', 'chief complaint'));
    if (!onset) m.push(t('missingOnset', 'when the symptoms started'));
    const missingVitals = vitalKeys.filter((k) => required.has(k) && !vitals[k].trim()).map(vitalLabel);
    if (missingVitals.length) m.push(missingVitals.join(', '));
    if (prompt?.status === 'open') m.push(t('missingPrompt', 'accept or dismiss the ECG recommendation'));
    if (prompt?.status === 'dismissed' && !prompt.reason) m.push(t('missingDismissReason', 'why the ECG recommendation was dismissed'));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaint, onset, vitals, required, prompt, t]);
  const invalidVitals = vitalKeys.filter((k) => vitalError(k));
  const canSave = missing.length === 0 && invalidVitals.length === 0;

  // ─── Saving ─────────────────────────────────────────────────────────────
  const save = useCallback(async () => {
    if (!referral || !visit || !canSave) return;
    if (!session?.currentProvider?.uuid) {
      setError(t('noProvider', 'You are not set up as a provider, so the response cannot be saved.'));
      return;
    }
    const bp = parseBp(vitals.bp);
    const numeric = (concept: string, v: number | null): ObsInput | null => (v === null ? null : { concept, value: v });
    const dismissed =
      prompt?.status === 'dismissed' && prompt.reason
        ? `ECG recommendation dismissed: ${DISMISS_REASONS.find(([k]) => k === prompt.reason)?.[1] ?? prompt.reason}`
        : null;
    const obs = [
      complaint.trim() ? { concept: rf.chiefComplaintTextConceptUuid, value: complaint.trim() } : null,
      complaintOption?.conceptUuid ? { concept: rf.chiefComplaintConceptUuid, value: complaintOption.conceptUuid } : null,
      onset ? { concept: rf.symptomOnsetConceptUuid, value: onset } : null,
      numeric(rf.vitalsConceptUuids.systolic, bp?.[0] ?? null),
      numeric(rf.vitalsConceptUuids.diastolic, bp?.[1] ?? null),
      numeric(rf.vitalsConceptUuids.pulse, num(vitals.pulse)),
      numeric(rf.vitalsConceptUuids.spo2, num(vitals.spo2)),
      numeric(rf.vitalsConceptUuids.respiratoryRate, num(vitals.respiratoryRate)),
      numeric(rf.vitalsConceptUuids.temperature, num(vitals.temperature)),
      dismissed ? { concept: rf.noteConceptUuid, value: dismissed } : null,
    ].filter(Boolean) as ObsInput[];

    setSaving(true);
    setError(null);
    try {
      const created = await createResponseEncounter({
        patientUuid,
        visitUuid: visit.uuid,
        encounterTypeUuid: config.encounterTypeUuid,
        locationUuid: session?.sessionLocation?.uuid,
        providerUuid: session.currentProvider.uuid,
        encounterRoleUuid: config.clinicianEncounterRoleUuid,
        obs,
        orders: planned.flatMap((o) => {
          const item = orderable(o.key);
          return item
            ? [
                {
                  concept: item.conceptUuid,
                  orderType: item.orderTypeUuid,
                  careSetting: config.careSettingUuid,
                  orderer: session.currentProvider.uuid,
                  urgency: o.urgent ? ('STAT' as const) : ('ROUTINE' as const),
                  instructions: referral.instructions ?? undefined,
                },
              ]
            : [];
        }),
      });
      onSaved(referral, created.encounterUuid);
      showSnackbar({
        kind: 'success',
        isLowContrast: true,
        title: t('referralResponseSaved', 'Referral response saved'),
        subtitle: planned.length
          ? t('responseSavedOrders', 'Ordered: {{orders}}.', {
              orders: planned.map((o) => orderable(o.key)?.label ?? o.key).join(', '),
            }) +
            (ecg?.urgent
              ? ' ' +
                t('responseSavedEcgDueBy', 'The ECG is due by {{time}}.', {
                  time: hhmm(new Date(Date.now() + rf.ecgDueMinutes * 60_000).toISOString()),
                })
              : '')
          : referral.orderNumber,
      });
      onClose();
    } catch (e: any) {
      // OpenMRS says "Invalid Submission" and puts the reason in its field errors
      const body = e?.responseBody?.error;
      const fieldErrors = Object.values(body?.fieldErrors ?? {})
        .flat()
        .map((f: any) => f?.message)
        .concat((body?.globalErrors ?? []).map((g: any) => g?.message))
        .filter(Boolean);
      setError(fieldErrors.length ? fieldErrors.join(' ') : body?.message ?? e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }, [referral, visit, session, vitals, prompt, complaint, complaintOption, onset, rf, patientUuid, config, planned, orderable, ecg, onSaved, onClose, t, canSave]);

  // ─── Rendering ──────────────────────────────────────────────────────────
  if (!referral) return null;

  const promptCard = (() => {
    if (!prompt) return null;
    if (prompt.status === 'dismissed') {
      return (
        <div className="rr-cds rr-cds-muted">
          <div className="rr-cds-kind">
            <span>{t('dismissedAt', 'Dismissed {{time}}', { time: hhmm(prompt.at) })}</span>
          </div>
          <p className="rr-cds-title">{t('ecgRecommendationDismissed', 'ECG recommendation dismissed')}</p>
          <Select
            id="rr-dismiss-reason"
            labelText={<Req>{t('reason', 'Reason')}</Req>}
            value={prompt.reason ?? ''}
            onChange={(e) => setPrompt({ ...prompt, reason: e.target.value })}
            size="sm"
          >
            <SelectItem value="" text={t('chooseAReason', 'Choose a reason')} />
            {DISMISS_REASONS.map(([k, label]) => (
              <SelectItem key={k} value={k} text={label} />
            ))}
          </Select>
          {prompt.reason && (
            <p className="rr-small">
              {t('dismissRecorded', 'Recorded for the monthly review of dismissed recommendations.')}
            </p>
          )}
        </div>
      );
    }
    const texts: Record<PromptKind, { kind: string; title: string; body: string; accept: string; dismiss: string }> = {
      chest: {
        kind: t('promptKindChest', 'chest pain'),
        title: t('promptTitleChest', 'Consider doing an ECG within {{n}} minutes', { n: rf.ecgDueMinutes }),
        body: t(
          'promptBodyChestOnSave',
          'Any adult with chest pain, whether or not hypertension is on record. Accept adds the ECG to the orders; it is ordered, and the {{n}}-minute clock starts, when you save the response.',
          { n: rf.ecgDueMinutes },
        ),
        accept: t('acceptOrderEcg', 'Accept: order ECG'),
        dismiss: t('dismiss', 'Dismiss'),
      },
      abdominal: {
        kind: t('promptKindAtypical', 'atypical presentation'),
        title: t('promptTitleEcg', 'Consider doing an ECG'),
        body: t(
          'promptBodyAbdominal',
          'Upper abdominal pain in a {{age}}-year-old with {{risk}} can be a heart attack. Rule out the heart before treating it as gastritis.',
          { age: age ?? '', risk: riskWords },
        ),
        accept: t('orderEcg', 'Order ECG'),
        dismiss: t('notNeeded', 'Not needed'),
      },
      breath: {
        kind: t('promptKindSymptom', 'symptom'),
        title: t('promptTitleConsiderEcg', 'Consider an ECG'),
        body: t('promptBodyBreath', 'New breathlessness on effort can be the only sign of angina or heart failure.'),
        accept: t('orderEcg', 'Order ECG'),
        dismiss: t('notNeeded', 'Not needed'),
      },
    };
    const p = texts[prompt.kind];
    return (
      <div className="rr-cds">
        <div className="rr-cds-kind">
          <span>{p.kind}</span>
          <Chip tone="indigo">{t('decisionSupport', 'Decision support')}</Chip>
        </div>
        <p className="rr-cds-title">{p.title}</p>
        <p className="rr-cds-body">{p.body}</p>
        <div className="rr-actrow">
          <Button size="sm" kind="primary" onClick={() => planOrder(ECG_KEY)}>
            {p.accept}
          </Button>
          <Button size="sm" kind="tertiary" onClick={dismissPrompt}>
            {p.dismiss}
          </Button>
        </div>
      </div>
    );
  })();

  const vitalTiles: Array<{ key: VitalKey; label: string; suffix?: string }> = vitalKeys.map((key) => ({
    key,
    label: vitalLabel(key),
    suffix: key === 'spo2' ? '%' : key === 'temperature' ? '°C' : undefined,
  }));

  const today = new Date().toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <ComposedModal
      open={open}
      onClose={() => (saving ? false : onClose())}
      size="lg"
      className="rr-modal"
      preventCloseOnClickOutside
    >
      <ModalHeader
        label={t('referralResponseFor', 'Referral response · {{orderNumber}}', { orderNumber: referral.orderNumber })}
        title={name || t('referralResponse', 'Referral response')}
      />
      <ModalBody hasScrollingContent className="rr-body">
        <div className="rr-moment">{[today, where, clinician].filter(Boolean).join(' · ')}</div>

        <section className="rr-card rr-banner">
          <div>
            <div className="rr-name">{name}</div>
            <div className="rr-meta">
              <span>{[age !== undefined ? String(age) : '', sex].filter(Boolean).join(' · ')}</span>
              {identifier && (
                <span>
                  {t('id', 'ID')} <span className="rr-mono">{identifier}</span>
                </span>
              )}
              <span>
                {t('allergies', 'Allergies')}:{' '}
                {record ? (record.allergies.length ? record.allergies.join(', ') : t('noneKnown', 'None known')) : '…'}
              </span>
            </div>
          </div>
          <div className="rr-meta">
            {visit?.startDatetime && (
              <span>
                {[where, t('arrivedAt', 'arrived {{time}}', { time: hhmm(visit.startDatetime) })]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            )}
            <Chip tone="grey">{t('encounterAt', 'Encounter {{time}}', { time: hhmm(openedAt) })}</Chip>
          </div>
        </section>

        {error && (
          <InlineNotification
            kind="error"
            lowContrast
            title={t('couldNotSave', 'Could not save the response')}
            subtitle={error}
            onCloseButtonClick={() => setError(null)}
          />
        )}

        <div className="rr-cols">
          <div className="rr-main">
            <Card title={t('presentingComplaint', 'Presenting complaint')}>
              <div className="rr-pad">
                <div className="rr-field">
                  <span className="rr-label">
                    {t('nursesTriageNote', 'Nurse’s triage note, {{time}}', { time: hhmm(referral.dateActivated) })}
                  </span>
                  <div className="rr-ro">
                    {referral.instructions?.trim() || t('noTriageNote', 'No note came with the referral.')}
                  </div>
                  <span className="rr-small">
                    {[
                      referral.concept?.display,
                      referral.orderNumber,
                      referral.orderer?.person?.display ?? referral.orderer?.display,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </div>
                <div className="rr-row2">
                  <div className="rr-grow">
                    <ComboBox
                      id="rr-chief-complaint"
                      titleText={<Req>{t('chiefComplaint', 'Chief complaint')}</Req>}
                      placeholder={t('typeOrChoose', 'Type or choose from the list')}
                      items={rf.chiefComplaints.map((c) => c.label)}
                      selectedItem={complaintOption?.label ?? (complaint || null)}
                      allowCustomValue
                      onChange={({ selectedItem, inputValue }: { selectedItem?: string | null; inputValue?: string }) =>
                        changeComplaint((selectedItem ?? inputValue ?? '').toString())
                      }
                      shouldFilterItem={({ item, inputValue }: { item: string; inputValue: string | null }) =>
                        !inputValue || item.toLowerCase().includes(inputValue.toLowerCase())
                      }
                    />
                  </div>
                  <div className="rr-onset">
                    <Select
                      id="rr-onset"
                      labelText={<Req>{t('symptomsStarted', 'Symptoms started')}</Req>}
                      value={onset}
                      onChange={(e) => setOnset(e.target.value)}
                    >
                      <SelectItem value="" text={t('choose', 'Choose')} />
                      {onsetOptions.map((o) => (
                        <SelectItem key={o.conceptUuid} value={o.conceptUuid} text={o.text} />
                      ))}
                    </Select>
                  </div>
                </div>
                {promptCard}
              </div>
            </Card>

            <Card
              title={t('vitals', 'Vitals')}
              right={
                vitalsAt ? (
                  <Chip tone="grey">{t('nurseAt', 'Nurse, {{time}}', { time: hhmm(vitalsAt) })}</Chip>
                ) : (
                  <Chip tone="grey">{t('enterVitals', 'Enter today’s readings')}</Chip>
                )
              }
            >
              <div className="rr-pad">
                <div className="rr-vit">
                  {vitalTiles.map((v) => (
                    <label key={v.key} className={`rr-vit-tile${vitalError(v.key) ? ' rr-invalid' : ''}`}>
                      <span className="rr-vit-value">
                        <input
                          aria-label={v.label}
                          aria-required={required.has(v.key)}
                          aria-invalid={!!vitalError(v.key)}
                          inputMode={v.key === 'bp' ? 'text' : 'decimal'}
                          value={vitals[v.key]}
                          placeholder="—"
                          onChange={(e) => setVitals({ ...vitals, [v.key]: e.target.value })}
                        />
                        {v.suffix && vitals[v.key] && <span className="rr-vit-suffix">{v.suffix}</span>}
                      </span>
                      <span className="rr-vit-label">{required.has(v.key) ? <Req>{v.label}</Req> : v.label}</span>
                      {vitalError(v.key) && (
                        <span className="rr-vit-error" role="alert">
                          {vitalError(v.key)}
                        </span>
                      )}
                    </label>
                  ))}
                </div>

              </div>
            </Card>

            <Card
              title={t('orders', 'Orders')}
              right={
                planned.length ? (
                  <Chip tone="grey">
                    {planned.length === 1
                      ? t('oneOrder', '1 order')
                      : t('nOrders', '{{n}} orders', { n: planned.length })}
                  </Chip>
                ) : undefined
              }
            >
              {planned.length ? (
                <div className="rr-table-wrap">
                  <table className="rr-table">
                    <thead>
                      <tr>
                        <th>{t('order', 'Order')}</th>
                        <th>{t('status', 'Status')}</th>
                        <th>{t('result', 'Result')}</th>
                        <th aria-label={t('actions', 'Actions')} />
                      </tr>
                    </thead>
                    <tbody>
                      {planned.map((o) => {
                        const item = orderable(o.key);
                        const imaging = item?.orderTypeUuid === config.imaging.imagingOrderTypeUuid;
                        return (
                          <tr key={o.key}>
                            <td>
                              <strong>{item?.label ?? o.key}</strong>
                              <div className="rr-small">{clinician}</div>
                            </td>
                            <td>
                              <Chip tone={o.urgent ? 'amber' : 'indigo'}>
                                {o.urgent
                                  ? t('orderedOnSaveDue', 'Ordered on save · due {{n}} minutes after', {
                                      n: rf.ecgDueMinutes,
                                    })
                                  : t('orderedOnSave', 'Ordered on save')}
                              </Chip>
                            </td>
                            <td>
                              <Chip tone="grey">
                                {imaging
                                  ? t('uploadOnImagingPage', 'Uploaded on the Imaging page')
                                  : t('enteredByLab', 'Entered by the lab')}
                              </Chip>
                            </td>
                            <td className="rr-td-action">
                              <Button size="sm" kind="ghost" onClick={() => unplanOrder(o.key)}>
                                {t('remove', 'Remove')}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rr-hint rr-pad">{t('noOrdersYet', 'No orders yet.')}</p>
              )}
              {planned.length < rf.orderables.length && (
                <div className="rr-pad rr-divider">
                  <div className="rr-add-order">
                    <Select
                      id="rr-add-order"
                      labelText={t('addAnOrder', 'Add an order')}
                      value=""
                      onChange={(e) => e.target.value && planOrder(e.target.value)}
                    >
                      <SelectItem value="" text={t('choose', 'Choose')} />
                      {rf.orderables
                        .filter((item) => !planned.some((o) => o.key === item.key))
                        .map((item) => (
                          <SelectItem key={item.key} value={item.key} text={item.label} />
                        ))}
                    </Select>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <aside className="rr-side">
            <Card title={t('record', 'Record')}>
              <div className="rr-pad">
                {record ? (
                  <dl className="rr-kv">
                    <dt>{t('conditions', 'Conditions')}</dt>
                    <dd>{record.conditions.length ? record.conditions.join('\n') : t('noneOnRecord', 'None on record')}</dd>
                    <dt>{t('medicines', 'Medicines')}</dt>
                    <dd>{record.medicines.length ? record.medicines.join('\n') : t('none', 'None')}</dd>
                    <dt>{t('lastVisit', 'Last visit')}</dt>
                    <dd>{record.lastVisit ?? t('noneOnRecord', 'None on record')}</dd>
                  </dl>
                ) : (
                  <InlineLoading />
                )}
              </div>
            </Card>
            <Card title={t('todaysTimeline', 'Today’s timeline')}>
              <div className="rr-pad">
                {log.length ? (
                  <ul className="rr-log">
                    {log.map((l, i) => (
                      <li key={i}>
                        <span className="rr-mono">{hhmm(l.at)}</span>
                        <span>{l.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rr-hint">{t('nothingRecordedYet', 'Nothing recorded yet.')}</p>
                )}
              </div>
            </Card>
          </aside>
        </div>
        {!canSave && (
          <p className="rr-missing" role="status">
            <span className="rr-req">*</span> {t('requiredFields', 'Required.')}{' '}
            {missing.length > 0 &&
              t('toSaveFillIn', 'To save, fill in: {{list}}.', { list: missing.join('; ') })}
            {missing.length === 0 && invalidVitals.length > 0 && t('fixVitals', 'Correct the vitals marked in red.')}
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose} disabled={saving}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={() => void save()} disabled={saving || !canSave}>
          {saving ? (
            <InlineLoading description={t('saving', 'Saving…')} />
          ) : planned.length === 1 && ecg ? (
            t('saveResponseAndOrderEcg', 'Save response and order ECG')
          ) : planned.length ? (
            t('saveResponseAndPlaceOrders', 'Save response and place {{n}} orders', { n: planned.length }).replace(
              /place 1 orders/,
              'place 1 order',
            )
          ) : (
            t('saveResponse', 'Save response')
          )}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default ReferralResponseModal;

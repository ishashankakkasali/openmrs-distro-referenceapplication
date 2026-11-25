/**
 * The result of one imaging order, in one of two places:
 * - mode "upload", on the Imaging page (imaging staff): upload the file from the machine; afterwards only the image,
 *   with whether the doctor has reviewed it.
 * - mode "review", in the patient chart's Imaging results (the doctor, back in consultation): the image, and for an
 *   ECG the AI interpretation and, once the AI read is in (and not disputed), the assessment: working diagnosis and
 *   the STEMI pathway with the cardiac centres; then Complete review.
 *
 * The order's status follows the work: uploading the file moves it to IN_PROGRESS (in review); "Complete review"
 * saves the review as the order's result (an "Imaging review" obs group: finding, working diagnosis, plan) and marks
 * it COMPLETED. A completed order shows that saved review, read-only. Until then the clinician's picks are kept in
 * sessionStorage. "Yes, refer for primary PCI" raises a real referral out to the chosen cardiac centre (Referral order
 * in a Referral Out encounter, see create-referral-out.ts); "Send to cardiologist" is not connected yet.
 *
 * The AI read comes from the ecgai OpenMRS module (modules/ecgai): the upload starts it, the module sends the ECG to the
 * configured LLM and saves the result on the order ("ECG AI interpretation" observation). In review it is loaded from
 * there, or started and polled when missing; without an API key on the backend the demo read from config is shown.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, InlineLoading, Select, SelectItem, Tag, TextArea, TextInput } from '@carbon/react';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import type { CardiacCentre, ReferralFulfillmentConfig } from '../config-schema';
import { createReferralOut } from '../create-referral-out';
import {
  type AiRead,
  type ImagingOrder,
  type ImagingResultFile,
  type ImagingReview,
  completeImagingReview,
  fetchAiRead,
  fetchAiStatus,
  fetchImagingResult,
  fetchImagingReview,
  startAiRead,
  uploadImagingResult,
} from './imaging.resource';

/** loading | running (the module is reading) | done | failed | demo (module not configured) | none (none saved) */
type AiState = 'loading' | 'running' | 'done' | 'failed' | 'demo' | 'none';
const AI_POLL_MS = 3000;

interface Props {
  order: ImagingOrder;
  /** "upload" on the Imaging page; "review" in the patient chart's Imaging results. */
  mode: 'upload' | 'review';
  /** Called after an upload so the list can refresh the order's status (now awaiting review). */
  onUploaded?: () => void;
  /** Called after Complete review (the order is now COMPLETED). */
  onCompleted?: () => void;
}


interface Assessment {
  /** Free-text finding, for imaging other than an ECG (an ECG's finding is the AI read). */
  finding: string;
  aiAgreedAt: string | null;
  /** When the ECG was sent to the hub cardiologist for a confirmatory read */
  sentToCardiologistAt: string | null;
  readingDiffers: string;
  /** The MO refers for primary PCI although the AI advised no referral */
  referOverrideAt: string | null;
  diagnosis: string;
  diagnosisEdited: boolean;
  centre: string | null;
  given: Record<string, string>;
  /** accepted: the referral out raised to the chosen centre (its order number), or declined with a reason */
  referDecision: { kind: 'accepted' | 'declined'; at: string; reason?: string; orderNumber?: string } | null;
}

const EMPTY: Assessment = {
  finding: '',
  aiAgreedAt: null,
  sentToCardiologistAt: null,
  readingDiffers: '',
  referOverrideAt: null,
  diagnosis: '',
  diagnosisEdited: false,
  centre: null,
  given: {},
  referDecision: null,
};

const storageKey = (orderUuid: string) => `imaging-assessment:${orderUuid}`;

function loadAssessment(orderUuid: string): Assessment {
  try {
    const raw = window.sessionStorage.getItem(storageKey(orderUuid));
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export const hhmm = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
const addMinutes = (iso: string, minutes: number) => new Date(+new Date(iso) + minutes * 60_000).toISOString();

const ImagingResult: React.FC<Props> = ({ order, mode, onUploaded, onCompleted }) => {
  const { t: translate } = useTranslation();
  // React escapes rendered text, so i18next must not escape interpolated values too.
  const t = useCallback(
    (key: string, defaultValue: string, options?: Record<string, unknown>): string =>
      translate(key, defaultValue, { ...options, interpolation: { escapeValue: false } }) as string,
    [translate],
  );
  const config = useConfig<ReferralFulfillmentConfig>();
  const { imaging } = config;
  const isEcg = imaging.ecgConceptUuids.includes(order.concept.uuid);

  const [file, setFile] = useState<ImagingResultFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referring, setReferring] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const [a, setA] = useState<Assessment>(() => loadAssessment(order.uuid));
  const update = useCallback(
    (patch: Partial<Assessment>) =>
      setA((cur) => {
        const next = { ...cur, ...patch };
        try {
          window.sessionStorage.setItem(storageKey(order.uuid), JSON.stringify(next));
        } catch {
          /* storage unavailable: kept in memory only */
        }
        return next;
      }),
    [order.uuid],
  );

  const completed = order.fulfillerStatus === 'COMPLETED';
  const [review, setReview] = useState<ImagingReview | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchImagingResult(order).then((f) => !cancelled && setFile(f)),
      completed && mode === 'review'
        ? fetchImagingReview(order, imaging.reviewConceptUuids).then((r) => !cancelled && setReview(r))
        : Promise.resolve(),
    ])
      .catch((e) => !cancelled && setError(e?.message ?? String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [order, completed, mode, imaging.reviewConceptUuids]);

  // the doctor works on the review between the upload and Complete review; a completed order is read-only
  const reviewing = mode === 'review' && !!file && !completed;

  // ---- AI read ----
  const [aiRead, setAiRead] = useState<AiRead | null>(null);
  const [aiState, setAiState] = useState<AiState>('loading');
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAttempt, setAiAttempt] = useState(0); // bumped by Retry
  const wantsAi = isEcg && mode === 'review' && !!file;

  useEffect(() => {
    if (!wantsAi || !file) return;
    if (!imaging.aiRead.enabled) {
      setAiState('demo');
      return;
    }
    let cancelled = false;
    let timer: number | undefined;
    const fail = (message: string) => {
      if (cancelled) return;
      setAiError(message);
      setAiState('failed');
    };
    const loadSaved = async () => {
      const saved = await fetchAiRead(order, imaging.aiRead.conceptUuid);
      if (cancelled) return true;
      if (saved) {
        setAiRead(saved);
        setAiState('done');
        return true;
      }
      return false;
    };
    const poll = async () => {
      try {
        const st = await fetchAiStatus(order);
        if (cancelled) return;
        if (st.status === 'running') timer = window.setTimeout(poll, AI_POLL_MS);
        else if (st.status === 'done') {
          if (!(await loadSaved())) fail(t('aiReadNotSaved', 'The AI read finished but was not saved.'));
        } else if (st.status === 'not_configured') setAiState('demo');
        else fail(st.error ?? t('aiReadFailed', 'The AI read failed.'));
      } catch (e: any) {
        fail(e?.message ?? String(e));
      }
    };
    (async () => {
      setAiError(null);
      setAiState('loading');
      try {
        if (aiAttempt === 0 && (await loadSaved())) return;
        if (cancelled) return;
        if (completed && aiAttempt === 0) {
          setAiState('none'); // reviewed before AI reads existed: nothing to start
          return;
        }
        const st = aiAttempt === 0 ? await fetchAiStatus(order) : await startAiRead(order, file.uuid);
        if (cancelled) return;
        if (st.status === 'not_configured') setAiState('demo');
        else if (st.status === 'done') {
          if (!(await loadSaved())) fail(t('aiReadNotSaved', 'The AI read finished but was not saved.'));
        } else if (st.status === 'failed') fail(st.error ?? t('aiReadFailed', 'The AI read failed.'));
        else {
          // idle: never asked (e.g. uploaded before the module existed) -> ask now; running -> wait
          if (st.status === 'idle') {
            const started = await startAiRead(order, file.uuid);
            if (cancelled) return;
            if (started.status === 'not_configured') {
              setAiState('demo');
              return;
            }
          }
          setAiState('running');
          timer = window.setTimeout(poll, AI_POLL_MS);
        }
      } catch (e: any) {
        fail(e?.message ?? String(e));
      }
    })();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [wantsAi, file, order, completed, imaging.aiRead.enabled, imaging.aiRead.conceptUuid, aiAttempt, t]);

  const demoRead = aiState === 'demo';
  const aiReady = demoRead || (aiState === 'done' && !!aiRead);
  // the finding and diagnosis come from the AI read; the config texts are the demo read
  const headline = aiRead?.headline || imaging.ecgAiFinding;
  const suggestedDiagnosis = aiRead?.suggestedDiagnosis || imaging.suggestedDiagnosis;
  const referralAdvised = aiRead ? aiRead.disposition === 'IMMEDIATE_CATH_LAB_REFERRAL' : true;
  const assessing = isEcg && reviewing && aiReady && !a.readingDiffers;
  // The clinician can override an AI "no referral": the STEMI pathway then opens as if a referral were advised
  const overridden = !referralAdvised && !!a.referOverrideAt;
  const pathwayOpen = assessing && (referralAdvised || overridden);
  const noReferral = assessing && !referralAdvised && !overridden;

  useEffect(() => {
    if (assessing && !a.diagnosisEdited && a.diagnosis !== suggestedDiagnosis) {
      update({ diagnosis: suggestedDiagnosis });
    }
  }, [assessing, a.diagnosisEdited, a.diagnosis, suggestedDiagnosis, update]);

  const onFileChosen = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const chosen = e.target.files?.[0];
      e.target.value = '';
      if (!chosen) return;
      setUploading(true);
      setError(null);
      try {
        const attachmentUuid = await uploadImagingResult(order, chosen);
        // start the AI read now, so it is ready when the doctor opens Imaging results (the module saves it)
        if (isEcg && imaging.aiRead.enabled && attachmentUuid) {
          startAiRead(order, attachmentUuid).catch(() => {
            /* the review page retries */
          });
        }
        setFile(await fetchImagingResult(order));
        onUploaded?.();
        showSnackbar({
          kind: 'success',
          title: t('resultUploadedTitle', '{{test}} uploaded', { test: order.concept.display }),
          subtitle: t('resultUploadedSubtitle', '{{patient}}: the doctor reviews it in the patient\'s Imaging results.', {
            patient: order.patient.name,
          }),
        });
      } catch (err: any) {
        setError(t('uploadFailed', 'Could not upload the result: {{err}}', { err: err?.message ?? String(err) }));
      } finally {
        setUploading(false);
      }
    },
    [order, onUploaded, isEcg, imaging.aiRead.enabled, t],
  );

  if (loading) return <InlineLoading description={t('loadingResult', 'Loading the result…')} />;

  const uploadLabel = isEcg ? t('uploadEcg', 'Upload ECG from the machine') : t('uploadResult', 'Upload result');

  const centres = imaging.cardiacCentres ?? [];
  const chosen: CardiacCentre | undefined =
    centres.find((c) => c.name === a.centre) ?? centres.find((c) => c.recommended) ?? centres[0];
  const within = (c?: CardiacCentre) => !!c && c.arteryOpenedMinutes <= imaging.pciLimitMinutes;
  const cardiologist = imaging.cardiologist;
  const sentAt = a.sentToCardiologistAt;
  const sentTo = `${cardiologist.name}, ${cardiologist.facility}`;
  const confirmation = sentAt
    ? t('confirmationPending', 'cardiologist confirmation pending')
    : a.aiAgreedAt
      ? t('agreedByMo', 'agreed by the MO')
      : t('notYetConfirmed', 'not yet confirmed by a clinician');

  // What Complete review saves as the order's result (the rows of the chart's Orders widget). Stored in English, as
  // clinical record text.
  const buildReview = (): ImagingReview => {
    if (!isEcg) return { finding: a.finding, diagnosis: a.diagnosis, plan: '' };
    let finding = a.readingDiffers
      ? `${headline} (AI read); clinician reading differs: ${a.readingDiffers}`
      : a.aiAgreedAt
        ? `${headline} (AI read, agreed by the MO at ${hhmm(a.aiAgreedAt)})`
        : `${headline} (AI read)`;
    if (sentAt) finding += `; sent to ${sentTo} for confirmatory interpretation at ${hhmm(sentAt)}, reply pending`;
    if (overridden) finding += `; AI advised no referral, overridden by the MO at ${hhmm(a.referOverrideAt)}`;
    const given = Object.entries(a.given).map(([item, at]) => `${item.split(',')[0]} at ${hhmm(at)}`);
    let plan: string;
    if (a.readingDiffers) plan = 'STEMI pathway paused: the clinician reading differs from the AI read';
    else if (noReferral) plan = 'No referral: serial ECG monitoring (AI disposition)';
    else if (a.referDecision?.kind === 'accepted' && chosen)
      plan =
        `${within(chosen) ? 'Refer for primary PCI' : 'Fibrinolysis, then refer for PCI'}: ${chosen.name} ` +
        `(${a.referDecision.orderNumber ? `referral ${a.referDecision.orderNumber}; ` : ''}` +
        `artery opened about ${chosen.arteryOpenedMinutes} minutes after the ECG)`;
    else plan = `Not referred now${a.referDecision?.reason ? `: ${a.referDecision.reason}` : ''}`;
    if (given.length) plan += `. Given: ${given.join(', ')}`;
    return { finding, diagnosis: a.diagnosis, plan };
  };

  // "Yes, refer": raise the referral out to the chosen centre in the ECG order's visit; on the Referrals page it then
  // offers "Record referral response" (the PCI response form).
  const referPci = async () => {
    if (!chosen) return;
    setError(null);
    if (!chosen.locationUuid) {
      setError(t('centreNoLocation', '{{centre}} has no location in the configuration, so it cannot be referred to.', { centre: chosen.name }));
      return;
    }
    if (!order.visitUuid) {
      setError(t('ecgNoVisit', 'The ECG order has no visit, so the referral cannot be raised.'));
      return;
    }
    setReferring(true);
    try {
      const { orderNumber } = await createReferralOut(
        {
          patientUuid: order.patient.uuid,
          visitUuid: order.visitUuid,
          conceptUuid: imaging.pciReferral.conceptUuid,
          destinationLocationUuid: chosen.locationUuid,
          urgency: 'STAT',
          instructions:
            `${within(chosen) ? 'Primary PCI' : 'PCI after fibrinolysis'}: ${headline} ` +
            `(ECG ${order.orderNumber}${a.diagnosis ? `; working diagnosis ${a.diagnosis}` : ''})`,
        },
        config,
      );
      update({ referDecision: { kind: 'accepted', at: new Date().toISOString(), orderNumber } });
      showSnackbar({
        kind: 'success',
        isLowContrast: true,
        title: t('pciReferralRaised', 'Referral {{orderNumber}} raised', { orderNumber }),
        subtitle: t('pciReferralRaisedTo', 'Referral for primary PCI to {{centre}}', { centre: chosen.name }),
      });
    } catch (err: any) {
      const message = err?.responseBody?.error?.message ?? err?.message ?? String(err);
      setError(t('pciReferralFailed', 'Could not raise the referral: {{err}}', { err: message }));
    } finally {
      setReferring(false);
    }
  };

  // What is still needed before the review can be completed (null when it can)
  const missing: string | null = !isEcg
    ? a.finding.trim()
      ? null
      : t('missingFinding', 'Record the finding.')
    : a.readingDiffers
      ? null
      : !a.aiAgreedAt && !sentAt && !overridden
        ? t('missingAiDecision', 'Agree with the AI read, send it to the cardiologist, or record that your reading differs.')
        : !pathwayOpen
          ? null
          : !a.referDecision
          ? t('missingReferDecision', 'Decide on the referral: refer for PCI, or not now.')
          : a.referDecision.kind === 'declined' && !a.referDecision.reason
            ? t('missingDeclineReason', 'Choose the reason for not referring now.')
            : null;

  const complete = async () => {
    setCompleting(true);
    setError(null);
    try {
      await completeImagingReview(order, buildReview(), imaging.reviewConceptUuids);
      try {
        window.sessionStorage.removeItem(storageKey(order.uuid));
      } catch {
        /* nothing to clear */
      }
      showSnackbar({
        kind: 'success',
        title: t('reviewCompleted', 'Review completed'),
        subtitle: t('reviewCompletedSubtitle', '{{orderNumber}} · {{patient}}: saved as the order result.', {
          orderNumber: order.orderNumber,
          patient: order.patient.name,
        }),
      });
      onCompleted?.();
    } catch (e: any) {
      setError(t('reviewFailed', 'Could not complete the review: {{err}}', { err: e?.message ?? String(e) }));
      setCompleting(false);
    }
  };

  const renderAiBody = () => {
    if (aiState === 'loading') return <InlineLoading description={t('aiReadLoading', 'Loading the AI read…')} />;
    if (aiState === 'running')
      return <InlineLoading description={t('aiReadRunning', 'The AI is reading the ECG… (this can take a minute)')} />;
    if (aiState === 'failed')
      return (
        <div className="img-actrow" style={{ marginTop: 0 }}>
          <span className="img-error" style={{ padding: 0 }}>
            {t('aiReadError', 'AI read failed: {{err}}', { err: aiError ?? '' })}
          </span>
          {!completed && (
            <Button kind="tertiary" size="sm" onClick={() => setAiAttempt((n) => n + 1)}>
              {t('retryAiRead', 'Retry AI read')}
            </Button>
          )}
        </div>
      );
    if (aiState === 'none') return <p className="img-small">{t('noAiRead', 'No AI read was saved for this ECG.')}</p>;
    if (aiState === 'demo')
      return (
        <>
          <Tag type="warm-gray" size="sm">
            {t('aiDemoRead', 'Demo read: AI service not configured')}
          </Tag>
          <p>{imaging.ecgAiInterpretation}</p>
        </>
      );
    if (!aiRead) return null;
    const urgent = aiRead.disposition === 'IMMEDIATE_CATH_LAB_REFERRAL';
    return (
      <div className="img-ai">
        {!aiRead.isTwelveLeadEcg && (
          <Tag type="red" size="sm">
            {t('notTwelveLead', 'The AI could not read this file as a 12-lead ECG')}
          </Tag>
        )}
        <span className="img-label">{t('aiSectionInterpretation', '1. ECG interpretation')}</span>
        <p>{aiRead.ecgInterpretation}</p>
        <span className="img-label">{t('aiSectionDisposition', '2. Disposition')}</span>
        <p>
          <Tag type={urgent ? 'red' : 'green'} size="sm">
            {urgent
              ? t('dispositionUrgent', 'Immediate cath lab referral / urgent PCI transfer')
              : t('dispositionNoReferral', 'No referral / serial ECG monitoring')}
          </Tag>{' '}
          {aiRead.dispositionText}
        </p>
        <span className="img-label">{t('aiSectionNextSteps', '3. Immediate next steps')}</span>
        <div className="img-ai-steps">
          <div>
            <span className="img-small">{t('pciWithin120', 'If PCI transfer is achievable within 120 minutes')}</span>
            <ul>
              {aiRead.nextStepsIfPciWithin120Min.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="img-small">{t('pciBeyond120', 'If PCI transfer will exceed 120 minutes')}</span>
            <ul>
              {aiRead.nextStepsIfPciBeyond120Min.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="img-result">
      <input
        ref={fileInput}
        className="img-file-input"
        type="file"
        accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
        onChange={onFileChosen}
      />
      {error && <p className="img-error">{error}</p>}

      {!file && completed && (
        <p className="img-small">{t('noResultFile', 'No result file was uploaded for this order.')}</p>
      )}

      {!file && !completed && mode === 'review' && (
        <p className="img-small">
          {isEcg
            ? t('waitingForEcg', 'Waiting for the ECG to be uploaded on the Imaging page.')
            : t('waitingForResult', 'Waiting for the result to be uploaded on the Imaging page.')}
        </p>
      )}

      {!file && !completed && mode === 'upload' && (
        <div className="img-actrow" style={{ marginTop: 0 }}>
          {uploading ? (
            <InlineLoading description={t('uploading', 'Uploading…')} />
          ) : (
            <Button kind="primary" size="md" onClick={() => fileInput.current?.click()}>
              {uploadLabel}
            </Button>
          )}
        </div>
      )}

      {file && (
        <>
          <div className="img-field">
            <span className="img-label">
              {t('resultImageCaption', '{{test}} · uploaded {{time}} · {{file}}', {
                test: order.concept.display,
                time: hhmm(file.dateTime),
                file: file.filename,
              })}
            </span>
            <div className="img-ecg-frame">
              {file.contentFamily === 'IMAGE' ? (
                <img src={file.url} alt={order.concept.display} />
              ) : (
                <iframe src={file.url} title={order.concept.display} />
              )}
            </div>
          </div>

          {isEcg && mode === 'review' && (
            <div className="img-cds img-plain">
              <div className="img-kind">
                <span>{t('aiInterpretation', 'AI interpretation')}</span>
                <Tag type="high-contrast" size="sm">
                  {t('aiDisclaimer', 'AI · for clinician review, not a diagnosis')}
                </Tag>
              </div>
              {renderAiBody()}
              {reviewing && a.readingDiffers && (
                <p className="img-small">
                  {t(
                    'readingDiffersNote',
                    'Clinician reading differs: {{reading}}. Recommendations paused for this ECG; send to the cardiologist if in doubt.',
                    { reading: a.readingDiffers },
                  )}
                </p>
              )}
              {reviewing && sentAt && (
                <div className="img-actrow">
                  <Tag type="purple">
                    {t('sentToCardiologist', 'Sent to {{to}}, at {{time}} · reply due by {{due}}', {
                      to: sentTo,
                      time: hhmm(sentAt),
                      due: hhmm(addMinutes(sentAt, cardiologist.replyDueMinutes)),
                    })}
                  </Tag>
                </div>
              )}
              {reviewing && !sentAt && (
                <div className="img-actrow">
                  {a.aiAgreedAt ? (
                    <Tag type="green">{t('agreedAt', 'Agreed by the MO {{time}}', { time: hhmm(a.aiAgreedAt) })}</Tag>
                  ) : (
                    <Button
                      kind="tertiary"
                      size="md"
                      disabled={!!a.readingDiffers || !aiReady || overridden}
                      onClick={() => update({ aiAgreedAt: new Date().toISOString() })}
                    >
                      {t('agreeWithAi', 'Agree with the AI read')}
                    </Button>
                  )}
                  <Button
                    kind={a.aiAgreedAt ? 'tertiary' : 'primary'}
                    size="md"
                    onClick={() => update({ sentToCardiologistAt: new Date().toISOString() })}
                  >
                    {t('sendToCardiologist', 'Send to cardiologist for confirmatory interpretation')}
                  </Button>
                  {!a.aiAgreedAt && (
                    <Select
                      id={`reading-differs-${order.uuid}`}
                      labelText={t('readingDiffers', 'My reading differs')}
                      value={a.readingDiffers}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update({ readingDiffers: e.target.value })}
                    >
                      <SelectItem value="" text={t('choose', 'Choose')} />
                      <SelectItem value="Normal ECG" text={t('normalEcg', 'Normal ECG')} />
                      <SelectItem
                        value="Different abnormality"
                        text={t('differentAbnormality', 'Different abnormality, noted in the record')}
                      />
                    </Select>
                  )}
                </div>
              )}
            </div>
          )}

          {isEcg && reviewing && (
            <div className="img-cds img-plain">
              <div className="img-kind">
                <span>{t('assessmentAndPlan', 'Assessment and plan')}</span>
              </div>
              <TextInput
                id={`diagnosis-${order.uuid}`}
                labelText={
                  pathwayOpen && !a.diagnosisEdited
                    ? t('workingDiagnosisSuggested', 'Working diagnosis · suggested, edit if needed')
                    : t('workingDiagnosis', 'Working diagnosis')
                }
                placeholder={t('enterDiagnosis', 'Enter a diagnosis')}
                value={a.diagnosis}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update({ diagnosis: e.target.value, diagnosisEdited: true })
                }
              />

              {noReferral && aiRead && (
                <div className="img-cds img-muted">
                  <div className="img-kind">
                    <span>{t('aiDisposition', 'AI disposition')}</span>
                  </div>
                  <p className="img-cds-title">
                    {t('noReferralSerialEcg', 'No referral: serial ECG monitoring')}
                  </p>
                  <p>{aiRead.dispositionText}</p>
                  <div className="img-actrow">
                    <Button
                      kind="danger--tertiary"
                      size="sm"
                      onClick={() =>
                        update({
                          referOverrideAt: new Date().toISOString(),
                          aiAgreedAt: null,
                          // the AI's diagnosis (e.g. normal sinus rhythm) no longer fits: a clinical one, to edit
                          diagnosis: t(
                            'overrideDiagnosis',
                            'Suspected acute coronary syndrome (clinical judgement; AI read: no ST elevation)',
                          ),
                          diagnosisEdited: true,
                        })
                      }
                    >
                      {t('referAnyway', 'Refer for primary PCI anyway')}
                    </Button>
                    <span className="img-small">
                      {t('referAnywayHint', 'Your clinical judgement overrides the AI disposition; it is noted in the record.')}
                    </span>
                  </div>
                </div>
              )}

              {pathwayOpen && chosen && (
                <div className="img-cds img-stop">
                  <div className="img-kind">
                    <span>
                      {overridden
                        ? t('stemiPathwayOverride', 'STEMI pathway · opened by the MO')
                        : t('stemiPathway', 'Recommendation · STEMI pathway')}
                    </span>
                  </div>
                  {overridden && (
                    <div className="img-actrow" style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                      <Tag type="purple">
                        {t('aiOverridden', 'AI advised no referral · overridden by the MO {{time}}', {
                          time: hhmm(a.referOverrideAt),
                        })}
                      </Tag>
                      {!a.referDecision && (
                        <Button
                          kind="ghost"
                          size="sm"
                          onClick={() => update({ referOverrideAt: null, diagnosisEdited: false })}
                        >
                          {t('undo', 'Undo')}
                        </Button>
                      )}
                    </div>
                  )}
                  <p className="img-cds-title">
                    {within(chosen)
                      ? t('referPrimaryPci', 'Refer now for primary PCI')
                      : t('giveLysis', 'Give fibrinolysis within 10 minutes, by {{time}}, then refer', {
                          time: hhmm(addMinutes(file.dateTime, 10)),
                        })}
                  </p>
                  {!within(chosen) && (
                    <p>
                      {t(
                        'lysisBody',
                        'PCI at {{centre}} would be about {{minutes}} minutes after the ECG, beyond the {{limit}}-minute limit. Check the reasons against fibrinolysis first.',
                        { centre: chosen.name, minutes: chosen.arteryOpenedMinutes, limit: imaging.pciLimitMinutes },
                      )}
                    </p>
                  )}
                  <ul className="img-facts">
                    {order.instructions && (
                      <li>{t('factOrderReason', 'Ordered for: {{reason}}', { reason: order.instructions })}</li>
                    )}
                    <li>
                      {t('factEcg', 'ECG at {{time}}: {{finding}} (AI read, {{confirmation}})', {
                        time: hhmm(file.dateTime),
                        finding: headline,
                        confirmation,
                      })}
                    </li>
                    <li>
                      {t(
                        'factLimit',
                        'Limit: the artery should be opened within {{limit}} minutes of the ECG; if no centre can do that, fibrinolysis within 10 minutes, then transfer',
                        { limit: imaging.pciLimitMinutes },
                      )}
                    </li>
                  </ul>
                  <span className="img-label">
                    {t('cardiacCentres', 'Cardiac centres with a cath lab · {{note}}', {
                      note: imaging.cardiacCentresNote,
                    })}
                  </span>
                  {centres.map((c) => {
                    const isChosen = c.name === chosen.name;
                    return (
                      <div key={c.name} className={`img-centre${isChosen ? ' img-chosen' : ''}`}>
                        <div>
                          <div className="img-centre-name">
                            {c.name}{' '}
                            {c.recommended && (
                              <Tag type="purple" size="sm">
                                {t('recommended', 'Recommended')}
                              </Tag>
                            )}
                          </div>
                          <div className="img-centre-meta">
                            {[
                              c.distance,
                              c.travel,
                              c.cathLab,
                              t('arteryOpenedAbout', 'artery opened about {{minutes}} minutes after the ECG', {
                                minutes: c.arteryOpenedMinutes,
                              }),
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </div>
                        </div>
                        <div className="img-centre-side">
                          <Tag type={within(c) ? 'green' : 'warm-gray'}>
                            {within(c)
                              ? t('withinLimit', 'Within {{limit}} minutes', { limit: imaging.pciLimitMinutes })
                              : t('beyondLimit', 'Beyond {{limit}} minutes', { limit: imaging.pciLimitMinutes })}
                          </Tag>
                          <Button
                            size="sm"
                            kind={isChosen ? 'secondary' : 'tertiary'}
                            disabled={!!a.referDecision}
                            onClick={() => update({ centre: c.name })}
                          >
                            {isChosen ? t('chosen', 'Chosen') : t('chooseCentre', 'Choose')}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="img-field" style={{ marginTop: '0.75rem' }}>
                    <span className="img-label">{t('giveNow', 'Give now, tick as given')}</span>
                    {imaging.giveNow.map((item, i) => {
                      const at = a.given[item];
                      return (
                        <div key={item} className="img-check">
                          <Checkbox
                            id={`given-${order.uuid}-${i}`}
                            labelText={item}
                            checked={!!at}
                            onChange={(_: unknown, { checked }: { checked: boolean }) => {
                              const given = { ...a.given };
                              if (checked) given[item] = new Date().toISOString();
                              else delete given[item];
                              update({ given });
                            }}
                          />
                          {at && (
                            <Tag type="green" size="sm">
                              {t('givenAt', 'given {{time}}', { time: hhmm(at) })}
                            </Tag>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {a.referDecision?.kind === 'accepted' ? (
                    <div className="img-actrow">
                      <Tag type="green">
                        {a.referDecision.orderNumber
                          ? t('referRaised', 'Referral {{orderNumber}} to {{centre}} raised {{time}}', {
                              orderNumber: a.referDecision.orderNumber,
                              centre: chosen.name,
                              time: hhmm(a.referDecision.at),
                            })
                          : t('referAccepted', 'Referral to {{centre}} accepted {{time}}', {
                              centre: chosen.name,
                              time: hhmm(a.referDecision.at),
                            })}
                      </Tag>
                      {!a.referDecision.orderNumber && (
                        <Button kind="ghost" size="sm" onClick={() => update({ referDecision: null })}>
                          {t('undo', 'Undo')}
                        </Button>
                      )}
                    </div>
                  ) : a.referDecision?.kind === 'declined' ? (
                    <div className="img-actrow">
                      <Select
                        id={`refer-declined-${order.uuid}`}
                        labelText={t('reasonNotReferring', 'Reason for not referring now')}
                        value={a.referDecision.reason ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          update({ referDecision: { ...a.referDecision!, reason: e.target.value } })
                        }
                      >
                        <SelectItem value="" text={t('chooseReason', 'Choose a reason')} />
                        <SelectItem
                          value="Patient or family declined transfer"
                          text={t('familyDeclined', 'Patient or family declined transfer')}
                        />
                        <SelectItem value="Other, noted in the record" text={t('otherNoted', 'Other, noted in the record')} />
                      </Select>
                      <Button kind="tertiary" size="md" onClick={() => update({ referDecision: null })}>
                        {t('reconsider', 'Reconsider')}
                      </Button>
                    </div>
                  ) : (
                    <div className="img-actrow">
                      <Button kind="primary" disabled={referring} onClick={() => void referPci()}>
                        {referring ? (
                          <InlineLoading description={t('raisingReferral', 'Raising the referral…')} />
                        ) : within(chosen) ? (
                          t('yesReferPci', 'Yes, refer for primary PCI')
                        ) : (
                          t('yesReferAfterLysis', 'Yes, refer for PCI')
                        )}
                      </Button>
                      <Button
                        kind="tertiary"
                        onClick={() => update({ referDecision: { kind: 'declined', at: new Date().toISOString() } })}
                      >
                        {t('notNow', 'Not now')}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {a.readingDiffers && (
                <div className="img-cds img-muted">
                  <p className="img-cds-title">{t('pathwayPaused', 'STEMI pathway paused')}</p>
                  <p>
                    {t(
                      'pathwayPausedBody',
                      'Your reading of the ECG differs from the AI read. Send it to the cardiologist if in doubt.',
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isEcg && reviewing && (
            <div className="img-cds img-plain">
              <div className="img-kind">
                <span>{t('review', 'Review')}</span>
              </div>
              <TextArea
                id={`finding-${order.uuid}`}
                labelText={t('finding', 'Finding')}
                rows={3}
                value={a.finding}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update({ finding: e.target.value })}
              />
              <div style={{ marginTop: '0.75rem' }}>
                <TextInput
                  id={`diagnosis-${order.uuid}`}
                  labelText={t('workingDiagnosis', 'Working diagnosis')}
                  value={a.diagnosis}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    update({ diagnosis: e.target.value, diagnosisEdited: true })
                  }
                />
              </div>
            </div>
          )}

          {reviewing && (
            <div className="img-complete">
              <Button kind="primary" disabled={!!missing || completing} onClick={() => void complete()}>
                {completing ? t('completing', 'Completing…') : t('completeReview', 'Complete review')}
              </Button>
              <span className="img-small">
                {missing ??
                  t('completeReviewHint', 'Saves the review as the order result and moves the order to Completed.')}
              </span>
            </div>
          )}

          {mode === 'upload' && (
            <div className="img-actrow">
              <Tag type={completed ? 'green' : 'blue'}>
                {completed ? t('statusReviewed', 'Reviewed') : t('statusAwaitingReview', 'Awaiting review')}
              </Tag>
              <span className="img-small">
                {completed
                  ? t('reviewedByDoctor', 'The doctor has reviewed this result.')
                  : t('awaitingReviewHint', 'The doctor reviews it in the patient\'s Imaging results.')}
              </span>
            </div>
          )}

          {completed && mode === 'review' && (
            <div className="img-cds img-plain">
              <div className="img-kind">
                <span>{t('review', 'Review')}</span>
                {review?.at && (
                  <Tag type="green" size="sm">
                    {t('reviewedAt', 'Reviewed {{time}}', { time: new Date(review.at).toLocaleString() })}
                  </Tag>
                )}
              </div>
              {review ? (
                <dl className="img-review">
                  {review.finding && (
                    <>
                      <dt>{t('finding', 'Finding')}</dt>
                      <dd>{review.finding}</dd>
                    </>
                  )}
                  {review.diagnosis && (
                    <>
                      <dt>{t('workingDiagnosis', 'Working diagnosis')}</dt>
                      <dd>{review.diagnosis}</dd>
                    </>
                  )}
                  {review.plan && (
                    <>
                      <dt>{t('plan', 'Plan')}</dt>
                      <dd>{review.plan}</dd>
                    </>
                  )}
                </dl>
              ) : (
                <p className="img-small">{t('noReviewSaved', 'Completed without a saved review.')}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImagingResult;

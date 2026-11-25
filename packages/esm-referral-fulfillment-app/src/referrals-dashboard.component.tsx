import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Button,
  InlineLoading,
  Tile,
  Tag,
  StructuredListWrapper,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
  Modal,
  Dropdown,
  TextArea,
} from '@carbon/react';
import { AddIcon, launchWorkspace, openmrsFetch, showSnackbar, useConfig, useVisit } from '@openmrs/esm-framework';
import { closeReferralOrder, declineReferralOrder, discontinueReferralOrder } from './close-referral-order';
import type { ReferralFulfillmentConfig } from './config-schema';
import NewReferralOutModal from './new-referral-out-modal.component';
import ReferralResponseModal from './referral-response/referral-response-modal.component';
import { fetchReferralDestinations } from './create-referral-out';

// `launchWorkspace2` is the new (workspaces2) launcher; not yet in this package's
// type definitions. Cast through framework module to call it without bundling.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const framework = require('@openmrs/esm-framework');
const launchWorkspace2: (
  name: string,
  workspaceProps?: any,
  windowProps?: any,
  groupProps?: any,
) => void = framework.launchWorkspace2 ?? framework.launchWorkspace;

// How long, after "Record referral response" is clicked, the page keeps looking for the saved
// Referral Response encounter so it can close the referral order.
const RESPONSE_POLL_WINDOW_MS = 30 * 60_000;

interface ReferralOrder {
  uuid: string;
  orderNumber: string;
  display?: string;
  dateActivated?: string;
  fulfillerStatus?: string | null;
  fulfillerComment?: string | null;
  instructions?: string | null;
  commentToFulfiller?: string | null;
  accessionNumber?: string | null;
  urgency?: string | null;
  action?: string | null;
  previousOrder?: { uuid: string } | null;
  concept?: { uuid: string; display: string };
  orderer?: { uuid: string; display: string; person?: { display: string } | null };
  encounter?: {
    uuid: string;
    display: string;
    encounterType?: { uuid: string; display?: string };
    obs?: Array<{ concept?: { uuid: string }; value?: unknown }>;
  };
  careSetting?: { uuid?: string; display: string };
  orderType: { uuid: string; name?: string; display?: string };
  patient?: { uuid: string };
}

// Everything the dashboard reads from an order, including the encounter type that
// tells a referral in (filed under Referral In by the receiver) from a referral out,
// and the encounter's obs, which hold the destination of a referral out.
const REFERRAL_ORDER_REPRESENTATION =
  'custom:(uuid,orderNumber,display,dateActivated,fulfillerStatus,fulfillerComment,instructions,' +
  'commentToFulfiller,accessionNumber,urgency,action,previousOrder:(uuid),concept:(uuid,display),orderer:(uuid,display,person:(display)),' +
  'encounter:(uuid,display,encounterType:(uuid,display),obs:(concept:(uuid),value)),careSetting:(uuid,display),' +
  'orderType:(uuid,name,display),patient:(uuid))';

interface DashboardProps {
  patientUuid?: string;
  patient?: { id?: string; uuid?: string };
}

const ReferralsDashboard: React.FC<DashboardProps> = (props) => {
  const { t } = useTranslation();
  const config = useConfig<ReferralFulfillmentConfig>();
  const patientUuid = props.patientUuid ?? props.patient?.id ?? props.patient?.uuid;
  // The referral response is part of the patient's visit at this facility: it can only be
  // recorded once the patient has arrived and a visit has been started (check-in).
  const { activeVisit, isLoading: isLoadingVisit } = useVisit(patientUuid);

  const [orders, setOrders] = useState<ReferralOrder[] | null>(null);
  // referral order uuid → clinical notes recorded with its Referral Response form
  const [responseNotes, setResponseNotes] = useState<Record<string, string>>({});
  // the PCI centre's answer ("Stent procedure"), by referral order uuid
  const [stentProcedure, setStentProcedure] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Decline modal state. Kept locally because the modal is small and tightly
  // coupled to the dashboard's Decline action.
  const [declineTarget, setDeclineTarget] = useState<ReferralOrder | null>(null);
  const [declineReason, setDeclineReason] = useState<string | null>(null);
  const [declineNotes, setDeclineNotes] = useState<string>('');
  const [declineSubmitting, setDeclineSubmitting] = useState(false);

  const [referralOutOpen, setReferralOutOpen] = useState(false);
  // The referral in being answered with this page's own response form (config.responseForm)
  const [responding, setResponding] = useState<ReferralOrder | null>(null);

  // destination location uuid → facility name, for the "Referred to" column of referrals out
  const [destinationNames, setDestinationNames] = useState<Record<string, string>>({});
  useEffect(() => {
    fetchReferralDestinations(config.referralDestinationLocationTag)
      .then((destinations) => setDestinationNames(Object.fromEntries(destinations.map((d) => [d.uuid, d.display]))))
      .catch(() => setDestinationNames({}));
  }, [config.referralDestinationLocationTag]);

  // The facility a referral out was sent to, recorded on its Referral Out encounter.
  const referredToOf = useCallback(
    (order?: ReferralOrder): string | null => {
      const value: any = order?.encounter?.obs?.find(
        (obs) => obs.concept?.uuid === config.referralDestinationConceptUuid,
      )?.value;
      // the REST API returns a location-uuid text value as the Location itself ({uuid, display, …})
      if (value && typeof value === 'object') return value.display ?? destinationNames[value.uuid] ?? value.uuid ?? null;
      if (typeof value !== 'string' || !value) return null;
      return destinationNames[value] ?? value;
    },
    [config.referralDestinationConceptUuid, destinationNames],
  );

  // A referral in arrived from another facility (the receiver files it under the Referral In
  // encounter type) and is answered here; anything else was raised here and sent out.
  const isReferralIn = useCallback(
    (order?: ReferralOrder) => order?.encounter?.encounterType?.uuid === config.referralInEncounterTypeUuid,
    [config.referralInEncounterTypeUuid],
  );

  // A referral for primary PCI is raised here (Imaging results, "Yes, refer for primary PCI") but, for the demo, the
  // PCI centre's response is recorded here too, with its own form.
  const isPciReferral = useCallback(
    (order?: ReferralOrder) => !!order && order.concept?.uuid === config.imaging.pciReferral.conceptUuid,
    [config.imaging.pciReferral.conceptUuid],
  );

  // Structured decline reasons. Keep this list short and clinically meaningful;
  // free-text "Other (specify in notes)" is the escape hatch.
  const declineReasons = React.useMemo(
    () => [
      t('declineReasonWrongPatient', 'Wrong patient'),
      t('declineReasonAlreadySeenElsewhere', 'Patient already seen at another facility'),
      t('declineReasonRefusedCare', 'Patient refused care'),
      t('declineReasonOutOfScope', 'Out of scope for this facility'),
      t('declineReasonDuplicate', 'Duplicate referral'),
      t('declineReasonInsufficientInfo', 'Insufficient clinical information'),
      t('declineReasonOther', 'Other (specify in notes)'),
    ],
    [t],
  );

  const loadOrders = useCallback(async () => {
    if (!patientUuid) return;
    try {
      const res = await openmrsFetch(`/ws/rest/v1/order?patient=${patientUuid}&v=${REFERRAL_ORDER_REPRESENTATION}`);
      const all: ReferralOrder[] = res.data?.results ?? [];
      // Hide DISCONTINUE revision rows: they are immutable audit siblings
      // generated by close-the-loop and should not appear as a separate
      // referral in the UI. The original NEW row continues to reflect status.
      const referrals = all.filter(
        (o) =>
          o.orderType?.uuid === config.orderTypeUuid &&
          (o.action ?? 'NEW').toUpperCase() !== 'DISCONTINUE',
      );
      setOrders(referrals);
      // A referral answered with the Referral Response form is closed by a DISCONTINUE order placed in the
      // response encounter, so that encounter's obs hold the notes the clinician sent back to the source.
      const notes: Record<string, string> = {};
      const stent: Record<string, string> = {};
      for (const o of all) {
        if ((o.action ?? '').toUpperCase() !== 'DISCONTINUE' || !o.previousOrder?.uuid) continue;
        const value = o.encounter?.obs?.find((obs) => obs.concept?.uuid === config.responseNotesConceptUuid)?.value;
        if (typeof value === 'string' && value) notes[o.previousOrder.uuid] = value;
        const answer: any = o.encounter?.obs?.find(
          (obs) => obs.concept?.uuid === config.imaging.pciReferral.stentProcedureConceptUuid,
        )?.value;
        const answerText = typeof answer === 'object' ? answer?.display : answer;
        if (answerText) stent[o.previousOrder.uuid] = answerText;
      }
      setResponseNotes(notes);
      setStentProcedure(stent);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }, [patientUuid, config.orderTypeUuid, config.responseNotesConceptUuid, config.imaging.pciReferral.stentProcedureConceptUuid]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  // Track timers so we can clean up on unmount.
  const pollTimers = useRef<number[]>([]);
  useEffect(() => () => pollTimers.current.forEach((t) => window.clearTimeout(t)), []);

  // Orders this page has already started closing. The form's handlePostResponse and the encounter
  // poll can both notice the same save; a second close would try to stop an order that is already
  // stopped and fail.
  const closingOrders = useRef<Set<string>>(new Set());

  const closeAndReload = useCallback(
    async (order: ReferralOrder, responseEncounterUuid?: string) => {
      try {
        // ─── DISCONTINUE FIRST ───────────────────────────────────────────
        // Create the DISCONTINUE order BEFORE marking COMPLETED so the FHIR2
        // module adds `basedOn → ServiceRequest` to the response Encounter as
        // early as possible. The OpenMRS emitter adaptor enriches the encounter
        // with the source-referral-order extension by following basedOn; if we
        // delay this, the emitter picks up the encounter without the link.
        let resolvedEncUuid = responseEncounterUuid;
        if (!resolvedEncUuid) {
          try {
            const encRes = await openmrsFetch(
              `/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${config.encounterTypeUuid}&v=custom:(uuid)&limit=1&order=desc`,
            );
            resolvedEncUuid = encRes.data?.results?.[0]?.uuid;
          } catch {
            /* fall back to original encounter */
          }
        }

        if (resolvedEncUuid) {
          // eslint-disable-next-line no-console
          console.log('[referral-fulfillment] firing DISCONTINUE for', order.uuid, 'in encounter', resolvedEncUuid);
          const orderData = { ...order, encounter: { uuid: resolvedEncUuid } };
          try {
            await discontinueReferralOrder({
              order: orderData,
              patientUuid,
              reason: config.fulfillerComment,
            });
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('[referral-fulfillment] DISCONTINUE failed (best-effort)', err);
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn('[referral-fulfillment] no response encounter UUID; skipping DISCONTINUE');
        }

        // ─── THEN MARK COMPLETED ─────────────────────────────────────────
        await closeReferralOrder({ orderUuid: order.uuid, comment: config.fulfillerComment });
        // eslint-disable-next-line no-console
        console.log('[referral-fulfillment] order closed', order.uuid);

        await loadOrders();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[referral-fulfillment] close failed', err);
      }
    },
    [config, loadOrders, patientUuid],
  );

  const handleStartVisit = useCallback(() => {
    launchWorkspace2('start-visit-workspace-form', { openedFrom: 'referral-fulfillment' });
  }, []);

  const handleRecord = useCallback(
    async (order: ReferralOrder) => {
      if (!activeVisit) {
        showSnackbar({
          kind: 'warning',
          isLowContrast: true,
          title: t('startVisitFirst', 'Start a visit first'),
          subtitle: t(
            'startVisitFirstSubtitle',
            'The referral response is recorded during the patient’s visit. Start a visit when the patient arrives.',
          ),
        });
        return;
      }
      // A referral in is answered with this page's own response form; a PCI referral keeps its O3 form.
      if (config.responseForm.enabled && !isPciReferral(order)) {
        setResponding(order);
        return;
      }
      try {
        // Fetch full form object — workspaces2 launcher expects the form, not just a UUID. A PCI referral is answered
        // with the PCI response form; it saves the same Referral Response encounter type, so the close below holds.
        const formUuid = isPciReferral(order) ? config.imaging.pciReferral.responseFormUuid : config.formUuid;
        const formRes = await openmrsFetch(`/ws/rest/v1/form/${formUuid}?v=full`);
        const form = formRes.data;
        // The workspace title bar reads `form.display`; mutate it so the order
        // number is visible in the workspace header. (windowProps.title is ignored
        // by the patient-forms wrapper in this build.)
        const baseDisplay = (form.display as string) || (form.name as string) || 'Referral Response';
        form.display = order.orderNumber
          ? `${baseDisplay} — ${order.orderNumber}`
          : baseDisplay;

        // Snapshot most-recent referral-response encounter time BEFORE launching, so
        // the poll below can detect a NEW one created by the form engine.
        const encUrl = `/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${config.encounterTypeUuid}&v=custom:(uuid,encounterDatetime)&limit=1&order=desc`;
        let lastEncounterUuid: string | null = null;
        try {
          const r = await openmrsFetch(encUrl);
          lastEncounterUuid = r.data?.results?.[0]?.uuid ?? null;
        } catch {
          /* ignore */
        }
        const clickedAt = Date.now();

        // Close the referral once, whichever path sees the saved encounter first.
        let stopped = false;
        const closeOnce = (encounterUuid: string | undefined, via: string) => {
          stopped = true;
          if (closingOrders.current.has(order.uuid)) {
            return;
          }
          closingOrders.current.add(order.uuid);
          // eslint-disable-next-line no-console
          console.log(`[referral-fulfillment] closing order via ${via}`, {
            order: order.uuid,
            encounter: encounterUuid,
          });
          void closeAndReload(order, encounterUuid);
        };

        // eslint-disable-next-line no-console
        console.log('[referral-fulfillment] launching form workspace', {
          orderNumber: order.orderNumber,
          orderUuid: order.uuid,
        });

        launchWorkspace2(
          'patient-form-entry-workspace',
          {
            form,
            encounterUuid: '',
            additionalProps: {
              orderUuid: order.uuid,
              orderNumber: order.orderNumber,
              orderInstructions: order.instructions ?? '',
              orderAccessionNumber: order.accessionNumber ?? '',
              orderUrgency: order.urgency ?? '',
              orderConceptDisplay: order.concept?.display ?? '',
            },
            handlePostResponse: (encounter: unknown) => {
              // eslint-disable-next-line no-console
              console.log('[referral-fulfillment] handlePostResponse fired', {
                orderUuid: order.uuid,
                encounter,
              });
              const encUuid = (encounter as any)?.uuid ?? (encounter as any)?.id;
              closeOnce(encUuid, 'handlePostResponse');
            },
          },
          {
            // The order # is shown in the workspace title bar so the clinician
            // always sees which referral they are responding to.
            title: t('referralResponseTitle', 'Referral response — {{orderNumber}}', {
              orderNumber: order.orderNumber ?? '',
            }),
          },
        );

        // Fallback path: poll for a new Referral Response encounter for this patient.
        // Strict match: the encounter MUST be newer than our snapshot AND must contain
        // at least one obs with formFieldPath starting with "rfe-forms-" (proving it
        // came from the React form engine, i.e. our Referral Response form). Because
        // workspaces2 only allows one patient-form-entry-workspace at a time, the
        // newly-saved encounter unambiguously corresponds to the order we clicked.
        const isFromOurForm = (enc: any): boolean => {
          if (!enc) return false;
          if (clickedAt && enc.encounterDatetime) {
            // Skip encounters created before the click (clock skew tolerance: 60s).
            const ts = new Date(enc.encounterDatetime).getTime();
            if (ts + 60_000 < clickedAt) return false;
          }
          const walk = (obs: any[]): boolean =>
            !!obs?.some((o) => {
              if (typeof o?.formFieldPath === 'string' && o.formFieldPath.startsWith('rfe-forms-'))
                return true;
              if (Array.isArray(o?.groupMembers) && walk(o.groupMembers)) return true;
              return false;
            });
          return walk(enc.obs ?? []);
        };
        const poll = async () => {
          if (stopped) return;
          try {
            const r = await openmrsFetch(encUrl);
            const newest = r.data?.results?.[0]?.uuid ?? null;
            if (newest && newest !== lastEncounterUuid) {
              try {
                const full = await openmrsFetch(`/ws/rest/v1/encounter/${newest}?v=full`);
                if (isFromOurForm(full.data)) {
                  closeOnce(newest, 'encounter poll');
                  return;
                }
                // eslint-disable-next-line no-console
                console.log(
                  '[referral-fulfillment] new encounter does not look like our form, ignoring',
                  newest,
                );
              } catch {
                /* ignore — try again next tick */
              }
            }
          } catch {
            /* ignore */
          }
          const id = window.setTimeout(poll, 2000);
          pollTimers.current.push(id);
        };
        const id = window.setTimeout(poll, 2000);
        pollTimers.current.push(id);
        // Give up only after the clinician has had ample time to fill in the form. A 60 s limit
        // left referrals open whenever the form took longer than a minute, and the clinician then
        // submitted it again (a second set of orders). The poll stops sooner once the order closes.
        const stopId = window.setTimeout(() => {
          stopped = true;
        }, RESPONSE_POLL_WINDOW_MS);
        pollTimers.current.push(stopId);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    },
    [config, patientUuid, closeAndReload, t, activeVisit, isPciReferral],
  );

  const handleManualClose = useCallback(
    async (order: ReferralOrder) => {
      // Retained for potential admin/debug use; no UI surface exposes it now.
      // The referral is otherwise marked COMPLETED only when the Referral
      // Response form is submitted (see handleRecord/closeAndReload).
      await closeReferralOrder({
        orderUuid: order.uuid,
        comment: config.fulfillerComment,
      });
      void loadOrders();
    },
    [config, loadOrders],
  );
  // Suppress unused-var warnings while keeping the helper available.
  void handleManualClose;

  const handleDecline = useCallback(
    (order: ReferralOrder) => {
      // Open the structured-decline modal; submission happens in submitDecline.
      setDeclineTarget(order);
      setDeclineReason(null);
      setDeclineNotes('');
    },
    [],
  );

  const closeDeclineModal = useCallback(() => {
    if (declineSubmitting) return;
    setDeclineTarget(null);
    setDeclineReason(null);
    setDeclineNotes('');
  }, [declineSubmitting]);

  const submitDecline = useCallback(async () => {
    if (!declineTarget || !declineReason) return;
    // Persist as "<reason>: <notes>" or just "<reason>" so the structured choice
    // is preserved at the front of the comment string.
    const trimmedNotes = declineNotes.trim();
    const comment = trimmedNotes ? `${declineReason}: ${trimmedNotes}` : declineReason;
    setDeclineSubmitting(true);
    try {
      await declineReferralOrder({ orderUuid: declineTarget.uuid, comment });
      // Best-effort: emit a DISCONTINUE order so the change is visible to
      // FHIR ServiceRequest?_lastUpdated polling. See docs/referral-close-loop-implementation.md.
      void discontinueReferralOrder({
        order: declineTarget,
        patientUuid,
        reason: comment,
      });
      setDeclineTarget(null);
      setDeclineReason(null);
      setDeclineNotes('');
      void loadOrders();
    } finally {
      setDeclineSubmitting(false);
    }
  }, [declineTarget, declineReason, declineNotes, loadOrders, patientUuid]);

  if (!patientUuid) {
    return <Tile>{t('noPatient', 'No patient context')}</Tile>;
  }

  if (orders === null && !error) {
    return <InlineLoading description={t('loading', 'Loading referrals…')} />;
  }

  if (error) {
    return <Tile>{t('errorLoading', 'Error loading referrals: {{err}}', { err: error })}</Tile>;
  }

  // "New referral out" needs an active visit: the referral is raised during the patient's visit here.
  const referralOutToolbar = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '0.5rem' }}>
      {!activeVisit && !isLoadingVisit && (
        <span style={{ color: '#6f6f6f', marginRight: '0.75rem', fontSize: '0.875rem' }}>
          {t('startVisitToReferOut', 'Start a visit to raise a referral out')}
        </span>
      )}
      {/* O3's widget action style (as "Record vitals"): ghost button with a trailing icon */}
      <Button
        kind="ghost"
        size="sm"
        disabled={!activeVisit}
        renderIcon={(props) => <AddIcon size={16} {...props} />}
        iconDescription={t('newReferralOut', 'New referral out')}
        onClick={() => setReferralOutOpen(true)}
      >
        {t('newReferralOut', 'New referral out')}
      </Button>
    </div>
  );

  const referralOutModal = activeVisit ? (
    <NewReferralOutModal
      open={referralOutOpen}
      patientUuid={patientUuid}
      visitUuid={activeVisit.uuid}
      onClose={() => setReferralOutOpen(false)}
      onCreated={() => void loadOrders()}
    />
  ) : null;

  if ((orders?.length ?? 0) === 0) {
    return (
      <div style={{ padding: '1rem' }}>
        {referralOutToolbar}
        <Tile>
          <p>{t('noReferrals', 'No referral orders for this patient.')}</p>
        </Tile>
        {referralOutModal}
      </div>
    );
  }

  const headers = [
    { key: 'orderNumber', header: t('orderNumber', 'Order #') },
    { key: 'direction', header: t('direction', 'Direction') },
    { key: 'display', header: t('order', 'Order') },
    { key: 'dateActivated', header: t('dateActivated', 'Date') },
    { key: 'status', header: t('status', 'Status') },
    { key: 'action', header: '' },
  ];

  const rows = (orders ?? []).map((o) => ({
    id: o.uuid,
    orderNumber: o.orderNumber,
    direction: isReferralIn(o) ? 'IN' : 'OUT',
    display: o.display ?? '',
    dateActivated: o.dateActivated ? new Date(o.dateActivated).toLocaleDateString() : '',
    // a referral in waits on this facility (PENDING); a referral out waits on the receiving facility (SENT)
    status: o.fulfillerStatus ?? (isReferralIn(o) ? 'PENDING' : 'SENT'),
    raw: o,
  }));

  return (
    <div style={{ padding: '1rem' }}>
      {/* The outer dashboard wrapper renders its own "Referrals" heading; we
          bold it via a global style and skip rendering our own duplicate title. */}
      <style>{`.cds--css-grid h4, .patient-chart-dashboard-title { font-weight: 600 !important; }`}</style>
      {referralOutToolbar}
      <DataTable rows={rows as any} headers={headers as any}>
        {({ rows: dtRows, headers: dtHeaders, getHeaderProps, getRowProps, getTableProps, getExpandHeaderProps }: any) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                <TableExpandHeader {...getExpandHeaderProps()} />
                {dtHeaders.map((h: any) => (
                  <TableHeader key={h.key} {...getHeaderProps({ header: h })}>
                    {h.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dtRows.map((row: any, idx: number) => {
                const o = (orders ?? [])[idx];
                const completed = o?.fulfillerStatus === 'COMPLETED';
                const declined = o?.fulfillerStatus === 'DECLINED';
                // A referral is "terminal" once it's either completed or declined;
                // no further action buttons should be offered.
                const terminal = completed || declined;
                // Record response / Decline belong to the facility the referral was sent to, so
                // they are only offered on referrals in; a referral out is answered elsewhere, except a PCI
                // referral, whose response is recorded here (demo).
                const referralIn = isReferralIn(o);
                const answerable = referralIn || isPciReferral(o);
                const fmt = (v: any) =>
                  v === null || v === undefined || v === '' ? <span style={{ color: '#8d8d8d' }}>—</span> : v;
                const fmtDate = (v?: string) => (v ? new Date(v).toLocaleString() : null);
                // The fulfiller name is encoded in fulfillerComment as `<comment> | by: <name>`
                // (see close-referral-order.ts). Split it for display.
                const splitFulfiller = (raw?: string | null): { comment: string | null; by: string | null } => {
                  if (!raw) return { comment: null, by: null };
                  const idx = raw.indexOf(' | by: ');
                  if (idx < 0) return { comment: raw, by: null };
                  return { comment: raw.slice(0, idx) || null, by: raw.slice(idx + ' | by: '.length) || null };
                };
                const { comment: fulfillerCommentText, by: fulfilledBy } = splitFulfiller(o?.fulfillerComment);
                return (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell: any) => {
                        if (cell.info.header === 'action') {
                          return (
                            <TableCell key={cell.id}>
                              {answerable && !terminal && (
                                <>
                                  {activeVisit || isLoadingVisit ? (
                                    <Button
                                      kind="tertiary"
                                      size="sm"
                                      disabled={!activeVisit}
                                      onClick={() => handleRecord(o)}
                                      style={{ marginRight: '0.5rem' }}
                                      title={
                                        isPciReferral(o)
                                          ? t(
                                              'recordPciResponseHint',
                                              'The PCI centre has no system of its own here: record its answer to this referral out (stent procedure performed or not)',
                                            )
                                          : undefined
                                      }
                                    >
                                      {isPciReferral(o)
                                        ? t('recordPciResponse', "Record PCI centre's response")
                                        : t('recordReferralResponse', 'Record referral response')}
                                    </Button>
                                  ) : (
                                    <Button
                                      kind="tertiary"
                                      size="sm"
                                      onClick={handleStartVisit}
                                      style={{ marginRight: '0.5rem' }}
                                      title={t(
                                        'startVisitToRespondHint',
                                        'Start a visit when the patient arrives, then record the referral response',
                                      )}
                                    >
                                      {t('startVisitToRespond', 'Start visit to respond')}
                                    </Button>
                                  )}
                                  <Button
                                    kind="danger--ghost"
                                    size="sm"
                                    onClick={() => handleDecline(o)}
                                  >
                                    {t('decline', 'Decline')}
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          );
                        }
                        if (cell.info.header === 'direction') {
                          return (
                            <TableCell key={cell.id}>
                              <Tag type={referralIn ? 'blue' : 'purple'}>
                                {referralIn ? t('referralIn', 'Referral in') : t('referralOut', 'Referral out')}
                              </Tag>
                            </TableCell>
                          );
                        }
                        if (cell.info.header === 'status') {
                          return (
                            <TableCell key={cell.id}>
                              <Tag type={completed ? 'green' : declined ? 'red' : referralIn ? 'gray' : 'cyan'}>
                                {cell.value}
                              </Tag>
                            </TableCell>
                          );
                        }
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                      })}
                    </TableExpandRow>
                    <TableExpandedRow colSpan={dtHeaders.length + 2}>
                      <div style={{ padding: '0.5rem 1rem' }}>
                        <StructuredListWrapper isCondensed selection={false} ariaLabel="Referral details">
                          <StructuredListBody>
                            <StructuredListRow>
                              <StructuredListCell noWrap>{t('referralType', 'Referral type')}</StructuredListCell>
                              <StructuredListCell>{fmt(o?.concept?.display)}</StructuredListCell>
                              <StructuredListCell noWrap>{t('referenceNumber', 'Reference number')}</StructuredListCell>
                              <StructuredListCell>{fmt(o?.accessionNumber)}</StructuredListCell>
                            </StructuredListRow>
                            <StructuredListRow>
                              {referralIn ? (
                                // a referral in arrives without its instructions (clinical text is redacted before
                                // CCE), so show what this facility sent back with the Referral Response form instead
                                <>
                                  <StructuredListCell noWrap>{t('clinicalNotes', 'Clinical notes')}</StructuredListCell>
                                  <StructuredListCell>{fmt(responseNotes[o?.uuid])}</StructuredListCell>
                                </>
                              ) : (
                                <>
                                  <StructuredListCell noWrap>{t('instructions', 'Instructions')}</StructuredListCell>
                                  <StructuredListCell>{fmt(o?.instructions)}</StructuredListCell>
                                </>
                              )}
                              <StructuredListCell noWrap>{t('urgency', 'Priority')}</StructuredListCell>
                              <StructuredListCell>{fmt(o?.urgency)}</StructuredListCell>
                            </StructuredListRow>
                            {isPciReferral(o) && (
                              <StructuredListRow>
                                <StructuredListCell noWrap>{t('stentProcedure', 'Stent procedure')}</StructuredListCell>
                                <StructuredListCell>{fmt(stentProcedure[o?.uuid])}</StructuredListCell>
                                <StructuredListCell />
                                <StructuredListCell />
                              </StructuredListRow>
                            )}
                            <StructuredListRow>
                              <StructuredListCell noWrap>{t('orderedBy', 'Ordered by')}</StructuredListCell>
                              <StructuredListCell>{fmt(o?.orderer?.person?.display ?? o?.orderer?.display)}</StructuredListCell>
                              <StructuredListCell noWrap>{t('dateActivatedFull', 'Date activated')}</StructuredListCell>
                              <StructuredListCell>{fmt(fmtDate(o?.dateActivated))}</StructuredListCell>
                            </StructuredListRow>
                            <StructuredListRow>
                              <StructuredListCell noWrap>{t('careSetting', 'Care setting')}</StructuredListCell>
                              <StructuredListCell>{fmt(o?.careSetting?.display)}</StructuredListCell>
                              <StructuredListCell noWrap>{t('orderEncounter', 'Source encounter')}</StructuredListCell>
                              <StructuredListCell>{fmt(o?.encounter?.display)}</StructuredListCell>
                            </StructuredListRow>
                            {referralIn ? (
                              // fulfilment is recorded here only for referrals in; a referral out is fulfilled elsewhere
                              <StructuredListRow>
                                <StructuredListCell noWrap>{t('fulfilledBy', 'Fulfilled by')}</StructuredListCell>
                                <StructuredListCell>{terminal ? fmt(fulfilledBy) : <span style={{ color: '#8d8d8d' }}>—</span>}</StructuredListCell>
                                <StructuredListCell noWrap>{t('fulfillerComment', 'Fulfiller comment')}</StructuredListCell>
                                <StructuredListCell>{fmt(fulfillerCommentText)}</StructuredListCell>
                              </StructuredListRow>
                            ) : (
                              <StructuredListRow>
                                <StructuredListCell noWrap>{t('referredTo', 'Referred to')}</StructuredListCell>
                                <StructuredListCell>{fmt(referredToOf(o))}</StructuredListCell>
                                <StructuredListCell noWrap />
                                <StructuredListCell />
                              </StructuredListRow>
                            )}
                          </StructuredListBody>
                        </StructuredListWrapper>
                      </div>
                    </TableExpandedRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DataTable>
      {referralOutModal}
      <ReferralResponseModal
        open={responding !== null}
        referral={responding}
        patientUuid={patientUuid}
        visit={activeVisit ?? null}
        onClose={() => setResponding(null)}
        onSaved={(referral, encounterUuid) => {
          const order = orders?.find((o) => o.uuid === referral.uuid);
          if (!order || closingOrders.current.has(order.uuid)) return;
          closingOrders.current.add(order.uuid);
          void closeAndReload(order, encounterUuid);
        }}
      />
      <Modal
        open={declineTarget !== null}
        modalHeading={t('declineReferralHeading', 'Decline referral {{orderNumber}}', {
          orderNumber: declineTarget?.orderNumber ?? '',
        })}
        primaryButtonText={
          declineSubmitting
            ? (t('declining', 'Declining…') as string)
            : (t('confirmDecline', 'Decline referral') as string)
        }
        secondaryButtonText={t('cancel', 'Cancel') as string}
        primaryButtonDisabled={!declineReason || declineSubmitting}
        danger
        onRequestClose={closeDeclineModal}
        onRequestSubmit={() => void submitDecline()}
      >
        <p style={{ marginBottom: '1rem' }}>
          {t(
            'declineModalDescription',
            'Choose a reason for declining this referral. The reason and any notes are saved with the order and visible to the source system.',
          )}
        </p>
        <Dropdown
          id="referral-decline-reason"
          titleText={t('reason', 'Reason') as string}
          label={t('selectReason', 'Select a reason') as string}
          items={declineReasons}
          selectedItem={declineReason}
          onChange={({ selectedItem }: { selectedItem: string | null }) =>
            setDeclineReason(selectedItem)
          }
        />
        <div style={{ marginTop: '1rem' }}>
          <TextArea
            id="referral-decline-notes"
            labelText={t('additionalNotes', 'Additional notes (optional)') as string}
            placeholder={t('notesPlaceholder', 'Any clinical context for the source system') as string}
            value={declineNotes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDeclineNotes(e.target.value)}
            rows={3}
            maxCount={500}
            enableCounter
          />
        </div>
      </Modal>
    </div>
  );
};

export default ReferralsDashboard;

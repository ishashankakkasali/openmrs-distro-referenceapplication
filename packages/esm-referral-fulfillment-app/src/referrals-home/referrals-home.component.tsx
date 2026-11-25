/**
 * Referrals page on the home screen (home/referrals): the referrals of this facility, across patients. The location the
 * user logged in at stands for the facility (referral-site.ts):
 * - at a cardiac centre, Incoming lists the referrals for primary PCI sent to that centre, with the acknowledgement
 *   clock and Acknowledge; the outcome is recorded in the patient's Referrals (after the patient is admitted there);
 * - elsewhere (the UHC), Incoming lists the referrals in (e.g. from Spice), answered in the patient's Referrals.
 * Sent lists the referrals out raised at this location, with how far the receiving facility has got.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DatePicker,
  DatePickerInput,
  InlineLoading,
  Search,
  Tab,
  TabList,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from '@carbon/react';
import { ConfigurableLink, useConfig, useSession } from '@openmrs/esm-framework';
import type { ReferralFulfillmentConfig } from '../config-schema';
import { acknowledgeReferralOrder } from '../close-referral-order';
import { destinationUuidOf, isCardiacCentre, splitFulfillerComment } from '../referral-site';
import { type WorklistReferral, fetchReferrals } from './referrals-home.resource';
import '../imaging/imaging.css';

const REFRESH_MS = 30_000;

const hhmm = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

const ReferralsHome: React.FC = () => {
  const { t: translate } = useTranslation();
  const t = useCallback(
    (key: string, defaultValue: string, options?: Record<string, unknown>): string =>
      translate(key, defaultValue, { ...options, interpolation: { escapeValue: false } }) as string,
    [translate],
  );
  const config = useConfig<ReferralFulfillmentConfig>();
  const session = useSession();
  const here = session?.sessionLocation?.uuid;
  const hereName = session?.sessionLocation?.display ?? '';
  const atCardiacCentre = isCardiacCentre(here, config.imaging.cardiacCentres);
  const ackMinutes = config.imaging.pciReferral.acknowledgeMinutes;

  const [range, setRange] = useState<[Date, Date]>(() => [new Date(), new Date()]);
  const [referrals, setReferrals] = useState<WorklistReferral[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const toggle = (uuid: string) =>
    setExpanded((cur) => {
      const next = new Set(cur);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });

  const load = useCallback(async () => {
    try {
      setReferrals(await fetchReferrals(config.orderTypeUuid, range[0], range[1]));
      setError(null);
      setNow(Date.now());
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }, [config.orderTypeUuid, range]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const isPci = useCallback(
    (r: WorklistReferral) => r.concept?.uuid === config.imaging.pciReferral.conceptUuid,
    [config.imaging.pciReferral.conceptUuid],
  );
  const isReferralIn = useCallback(
    (r: WorklistReferral) => r.encounter?.encounterType?.uuid === config.referralInEncounterTypeUuid,
    [config.referralInEncounterTypeUuid],
  );
  const destinationOf = useCallback(
    (r: WorklistReferral) => destinationUuidOf(r, config.referralDestinationConceptUuid),
    [config.referralDestinationConceptUuid],
  );
  const destinationName = useCallback(
    (r: WorklistReferral) => {
      const value: any = r.encounter?.obs?.find((o) => o.concept?.uuid === config.referralDestinationConceptUuid)?.value;
      if (value && typeof value === 'object') return value.display ?? '';
      const centre = config.imaging.cardiacCentres.find((c) => c.locationUuid === value);
      return centre?.name ?? (typeof value === 'string' ? value : '');
    },
    [config.referralDestinationConceptUuid, config.imaging.cardiacCentres],
  );

  const all = referrals ?? [];
  // Incoming: what this facility answers. Sent: the referrals out raised here.
  const incoming = all.filter((r) =>
    atCardiacCentre ? isPci(r) && destinationOf(r) === here : isReferralIn(r),
  );
  const sent = all.filter((r) => !isReferralIn(r) && (!r.encounter?.location || r.encounter.location.uuid === here));

  const closed = (r: WorklistReferral) => r.fulfillerStatus === 'COMPLETED' || r.fulfillerStatus === 'DECLINED';
  const acknowledged = (r: WorklistReferral) => r.fulfillerStatus === 'RECEIVED';
  // A PCI referral not yet acknowledged has a clock (minutes from the referral)
  const ackDue = (r: WorklistReferral) => new Date(+new Date(r.dateActivated) + ackMinutes * 60_000);
  const waitingAck = incoming.filter((r) => isPci(r) && !acknowledged(r) && !closed(r));

  const listed = [incoming, sent][tab].filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.patient.name, r.patient.identifier, r.orderNumber, r.concept.display].some((v) =>
      (v ?? '').toLowerCase().includes(q),
    );
  });
  // Open work first, newest first within each
  listed.sort((a, b) => Number(closed(a)) - Number(closed(b)) || +new Date(b.dateActivated) - +new Date(a.dateActivated));

  const headers = useMemo(
    () => [
      { key: 'patient', header: t('patient', 'Patient') },
      { key: 'referral', header: t('referral', 'Referral') },
      { key: 'party', header: tab === 0 ? t('referredBy', 'Referred by') : t('referredTo', 'Referred to') },
      { key: 'referred', header: t('referred', 'Referred') },
      { key: 'orderNumber', header: t('orderNumber', 'Order #') },
      { key: 'status', header: t('status', 'Status') },
    ],
    [t, tab],
  );

  const rows = listed.map((r) => ({
    id: r.uuid,
    patient: r.patient.name,
    referral: r.concept.display,
    party: tab === 0 ? r.ordererName ?? '' : destinationName(r),
    referred: new Date(r.dateActivated).toLocaleString(),
    orderNumber: r.orderNumber,
    status: '',
  }));
  const byId = Object.fromEntries(listed.map((r) => [r.uuid, r]));

  const statusTag = (r: WorklistReferral) => {
    if (r.fulfillerStatus === 'COMPLETED') return <Tag type="green">{t('statusCompleted', 'Completed')}</Tag>;
    if (r.fulfillerStatus === 'DECLINED') return <Tag type="red">{t('statusDeclined', 'Declined')}</Tag>;
    if (acknowledged(r)) return <Tag type="teal">{t('statusAcknowledged', 'Acknowledged')}</Tag>;
    if (isPci(r)) {
      const due = ackDue(r);
      const late = now > +due;
      return (
        <Tag type={late ? 'red' : 'warm-gray'}>
          {late
            ? t('ackOverdue', 'Not acknowledged · due {{time}}', { time: hhmm(due) })
            : t('ackDueBy', 'Awaiting acknowledgement · by {{time}}', { time: hhmm(due) })}
        </Tag>
      );
    }
    return <Tag type="gray">{tab === 0 ? t('statusAwaitingResponse', 'Awaiting response') : t('statusSent', 'Sent')}</Tag>;
  };

  const acknowledge = async (r: WorklistReferral) => {
    setBusy(r.uuid);
    const at = new Date().toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    await acknowledgeReferralOrder({
      orderUuid: r.uuid,
      comment: t('acknowledgedAtComment', 'Acknowledged at {{centre}}, {{at}}', { centre: hereName, at }),
    });
    setBusy(null);
    await load();
  };

  const tile = (title: string, label: string, value: number, alert = false) => (
    <div className="img-tile">
      <div className="img-tile-title">{title}</div>
      <div className="img-tile-label">{label}</div>
      <div className="img-tile-value" style={alert && value > 0 ? { color: '#da1e28' } : undefined}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="img-imaging">
      <header className="img-imaging-header">
        <svg className="img-imaging-icon" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M4 16h18M16 9l7 7-7 7M27 6v20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <div>
          <div className="img-imaging-location">{hereName}</div>
          <h1 className="img-imaging-title">{t('referrals', 'Referrals')}</h1>
        </div>
      </header>

      <div className="img-tiles">
        {atCardiacCentre ? (
          <>
            {tile(
              t('incomingReferrals', 'Incoming referrals'),
              t('notYetAcknowledged', 'Not yet acknowledged (within {{n}} min)', { n: ackMinutes }),
              waitingAck.length,
              waitingAck.some((r) => now > +ackDue(r)),
            )}
            {tile(
              t('acknowledged', 'Acknowledged'),
              t('awaitingOutcome', 'Awaiting the outcome'),
              incoming.filter(acknowledged).length,
            )}
            {tile(t('completed', 'Completed'), t('outcomeRecorded', 'Outcome recorded'), incoming.filter(closed).length)}
          </>
        ) : (
          <>
            {tile(
              t('incomingReferrals', 'Incoming referrals'),
              t('awaitingResponseHere', 'Awaiting a response here'),
              incoming.filter((r) => !closed(r)).length,
            )}
            {tile(
              t('sentReferrals', 'Sent referrals'),
              t('awaitingReceivingFacility', 'Awaiting the receiving facility'),
              sent.filter((r) => !closed(r)).length,
            )}
            {tile(t('completed', 'Completed'), t('closedInRange', 'Closed, in this date range'), all.filter(closed).length)}
          </>
        )}
      </div>

      <Tabs selectedIndex={tab} onChange={({ selectedIndex }: { selectedIndex: number }) => setTab(selectedIndex)}>
        <TabList contained aria-label={t('referrals', 'Referrals')}>
          <Tab>{t('tabIncoming', 'Incoming')}</Tab>
          <Tab>{t('tabSent', 'Sent')}</Tab>
        </TabList>
      </Tabs>

      <div className="img-imaging-panel">
        <div className="img-imaging-toolbar">
          <span className="img-small">{t('dateRange', 'Date range:')}</span>
          <DatePicker
            datePickerType="range"
            dateFormat="d/m/Y"
            value={range}
            maxDate={new Date().toISOString()}
            onChange={(dates: Date[]) => dates.length === 2 && setRange([dates[0], dates[1]])}
          >
            <DatePickerInput id="referrals-from" labelText="" hideLabel placeholder="dd/mm/yyyy" size="md" />
            <DatePickerInput id="referrals-to" labelText="" hideLabel placeholder="dd/mm/yyyy" size="md" />
          </DatePicker>
          <Search
            size="lg"
            labelText={t('searchThisList', 'Search this list')}
            placeholder={t('searchThisList', 'Search this list')}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>

        {error && <p className="img-error">{t('referralsLoadFailed', 'Could not load referrals: {{err}}', { err: error })}</p>}
        {referrals === null ? (
          <div className="img-pad">
            <InlineLoading description={t('loadingReferrals', 'Loading referrals…')} />
          </div>
        ) : rows.length === 0 ? (
          <div className="img-empty">
            <p className="img-empty-title">
              {tab === 0
                ? atCardiacCentre
                  ? t('noIncomingAtCentre', 'No referrals sent to {{centre}}', { centre: hereName })
                  : t('noIncoming', 'No incoming referrals')
                : t('noSent', 'No referrals sent from {{place}}', { place: hereName })}
            </p>
            <p>{t('checkFilters', 'Please check the filters above and try again')}</p>
          </div>
        ) : (
          <DataTable rows={rows} headers={headers}>
            {({ rows: dtRows, headers: dtHeaders, getHeaderProps, getRowProps, getTableProps }: any) => (
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader aria-label={t('expandRow', 'Expand row')} />
                    {dtHeaders.map((h: any) => (
                      <TableHeader key={h.key} {...getHeaderProps({ header: h })}>
                        {h.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dtRows.map((row: any) => {
                    const r = byId[row.id];
                    if (!r) return null;
                    const open = expanded.has(row.id);
                    const canAcknowledge = tab === 0 && atCardiacCentre && !acknowledged(r) && !closed(r);
                    const { comment: progress, by } = splitFulfillerComment(r.fulfillerComment);
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow
                          {...getRowProps({ row })}
                          isExpanded={open}
                          onExpand={() => toggle(row.id)}
                          className="img-row-clickable"
                          onClick={(e: React.MouseEvent) => {
                            if ((e.target as HTMLElement).closest('button, a')) return;
                            toggle(row.id);
                          }}
                        >
                          {row.cells.map((cell: any) => {
                            if (cell.info.header === 'patient') {
                              return (
                                <TableCell key={cell.id}>
                                  <span className="img-patient-name">{r.patient.name}</span>
                                  <div className="img-sub">
                                    {[r.patient.identifier, r.patient.age !== undefined ? `${r.patient.age} y` : '', r.patient.gender]
                                      .filter(Boolean)
                                      .join(' · ')}
                                  </div>
                                </TableCell>
                              );
                            }
                            if (cell.info.header === 'referral') {
                              return (
                                <TableCell key={cell.id}>
                                  {cell.value}
                                  {r.urgency === 'STAT' && (
                                    <Tag type="red" size="sm" style={{ marginLeft: '0.5rem' }}>
                                      {t('stat', 'STAT')}
                                    </Tag>
                                  )}
                                </TableCell>
                              );
                            }
                            if (cell.info.header === 'status') return <TableCell key={cell.id}>{statusTag(r)}</TableCell>;
                            return <TableCell key={cell.id}>{cell.value}</TableCell>;
                          })}
                        </TableExpandRow>
                        {open && (
                          <TableExpandedRow colSpan={dtHeaders.length + 1}>
                            <div className="img-result">
                              <div className="img-field">
                                <span className="img-label">{t('reasonForReferral', 'Reason for referral')}</span>
                                <div>{r.instructions || '—'}</div>
                              </div>
                              {progress && (
                                <div className="img-field">
                                  <span className="img-label">{t('progress', 'Progress')}</span>
                                  <div>
                                    {progress}
                                    {by ? ` · ${by}` : ''}
                                  </div>
                                </div>
                              )}
                              <div className="img-actrow" style={{ marginTop: 0 }}>
                                {canAcknowledge && (
                                  <Button size="sm" disabled={busy === r.uuid} onClick={() => void acknowledge(r)}>
                                    {t('acknowledge', 'Acknowledge')}
                                  </Button>
                                )}
                                <ConfigurableLink to={`\${openmrsSpaBase}/patient/${r.patient.uuid}/chart/Referrals`}>
                                  {tab === 0 && !closed(r)
                                    ? atCardiacCentre
                                      ? t('openToAdmitAndRecord', 'Open {{name}}’s referrals to admit and record the outcome', {
                                          name: r.patient.name,
                                        })
                                      : t('openToRespond', 'Open {{name}}’s referrals to respond', { name: r.patient.name })
                                    : t('openPatientReferrals', 'Open {{name}}’s referrals', { name: r.patient.name })}
                                </ConfigurableLink>
                              </div>
                            </div>
                          </TableExpandedRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </DataTable>
        )}
      </div>
    </div>
  );
};

export default ReferralsHome;

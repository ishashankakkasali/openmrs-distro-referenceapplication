/**
 * Imaging page on the home screen (home/imaging), for imaging staff, laid out like the Laboratory page: summary
 * tiles, Ordered / Uploaded tabs, date range and search, and the imaging orders. Expanding an order offers the upload;
 * once uploaded it shows only the image and whether the doctor has reviewed it. The doctor's review (AI read,
 * assessment, Complete review) is in the patient chart's Imaging results.
 *
 * Imaging orders come from the Referral Response form (Order ECG) or anywhere else that orders a concept of the
 * Radiology/Imaging Procedure class: OpenMRS files those under the Imaging Order type.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
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
import { type ImagingOrder, fetchImagingOrders } from './imaging.resource';
import ImagingResult from './imaging-result.component';
import './imaging.css';

const REFRESH_MS = 30_000;

const isDone = (o: ImagingOrder) => o.fulfillerStatus === 'COMPLETED';
// the result is uploaded and waits for the doctor's review (Complete review in the patient chart)
const isInReview = (o: ImagingOrder) => o.fulfillerStatus === 'IN_PROGRESS';
const isUploaded = (o: ImagingOrder) => isDone(o) || isInReview(o);

const ImagingDashboard: React.FC = () => {
  const { t: translate } = useTranslation();
  const t = useCallback(
    (key: string, defaultValue: string, options?: Record<string, unknown>): string =>
      translate(key, defaultValue, { ...options, interpolation: { escapeValue: false } }) as string,
    [translate],
  );
  const { imaging } = useConfig<ReferralFulfillmentConfig>();
  const session = useSession();

  const [range, setRange] = useState<[Date, Date]>(() => [new Date(), new Date()]);
  const [orders, setOrders] = useState<ImagingOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  // Expanded orders, kept here rather than in the DataTable: an upload moves the order to the Completed tab, and
  // the clinician must still see its image and AI read there.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const toggle = (uuid: string) =>
    setExpanded((cur) => {
      const next = new Set(cur);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });

  const load = useCallback(async () => {
    try {
      setOrders(await fetchImagingOrders(imaging.imagingOrderTypeUuid, range[0], range[1]));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }, [imaging.imagingOrderTypeUuid, range]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [load]);


  const all = orders ?? [];
  const pending = all.filter((o) => !isUploaded(o) && !o.dateStopped);
  // Results awaiting the doctor's review first, then the reviewed ones; each newest order first (the fetch order).
  const uploaded = all.filter(isUploaded).sort((a, b) => Number(isDone(a)) - Number(isDone(b)));
  const inReview = all.filter(isInReview);
  const listed = [pending, uploaded][tab].filter((o) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [o.patient.name, o.patient.identifier, o.orderNumber, o.concept.display].some((v) =>
      (v ?? '').toLowerCase().includes(q),
    );
  });

  const headers = useMemo(
    () => [
      { key: 'patient', header: t('patient', 'Patient') },
      { key: 'age', header: t('age', 'Age') },
      { key: 'sex', header: t('sex', 'Sex') },
      { key: 'test', header: t('imagingTest', 'Test') },
      { key: 'orderNumber', header: t('orderNumber', 'Order #') },
      { key: 'ordered', header: t('ordered', 'Ordered') },
      { key: 'orderedBy', header: t('orderedBy', 'Ordered by') },
      { key: 'status', header: t('status', 'Status') },
    ],
    [t],
  );

  const rows = listed.map((o) => ({
    id: o.uuid,
    patient: o.patient.name,
    age: o.patient.age ?? '',
    sex: o.patient.gender ?? '',
    test: o.concept.display,
    orderNumber: o.orderNumber,
    ordered: new Date(o.dateActivated).toLocaleString(),
    orderedBy: o.ordererName ?? '',
    status: '',
  }));
  const byId = Object.fromEntries(listed.map((o) => [o.uuid, o]));

  const statusTag = (o: ImagingOrder) => {
    if (isDone(o)) return <Tag type="green">{t('statusReviewed', 'Reviewed')}</Tag>;
    if (isInReview(o)) return <Tag type="blue">{t('statusAwaitingReview', 'Awaiting review')}</Tag>;
    return <Tag type="gray">{t('statusOrdered', 'Ordered')}</Tag>;
  };

  const tile = (title: string, label: string, value: number) => (
    <div className="img-tile">
      <div className="img-tile-title">{title}</div>
      <div className="img-tile-label">{label}</div>
      <div className="img-tile-value">{value}</div>
    </div>
  );

  return (
    <div className="img-imaging">
      <header className="img-imaging-header">
        <svg className="img-imaging-icon" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M3 17h6l3-8 5 15 4-11 2 4h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <div>
          <div className="img-imaging-location">{session?.sessionLocation?.display ?? ''}</div>
          <h1 className="img-imaging-title">{t('imaging', 'Imaging')}</h1>
        </div>
      </header>

      <div className="img-tiles">
        {tile(t('imagingOrdered', 'Imaging ordered'), t('notYetUploaded', 'Not yet uploaded'), pending.length)}
        {tile(t('uploaded', 'Uploaded'), t('awaitingDoctorReview', 'Awaiting the doctor\'s review'), inReview.length)}
        {tile(t('results', 'Results'), t('reviewedByDoctor2', 'Reviewed by the doctor'), all.filter(isDone).length)}
      </div>

      <Tabs selectedIndex={tab} onChange={({ selectedIndex }: { selectedIndex: number }) => setTab(selectedIndex)}>
        <TabList contained aria-label={t('imaging', 'Imaging')}>
          <Tab>{t('tabOrdered', 'Ordered')}</Tab>
          <Tab>{t('tabUploaded', 'Uploaded')}</Tab>
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
            <DatePickerInput id="imaging-from" labelText="" hideLabel placeholder="dd/mm/yyyy" size="md" />
            <DatePickerInput id="imaging-to" labelText="" hideLabel placeholder="dd/mm/yyyy" size="md" />
          </DatePicker>
          <Search
            size="lg"
            labelText={t('searchThisList', 'Search this list')}
            placeholder={t('searchThisList', 'Search this list')}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>

        {error && <p className="img-error">{t('imagingLoadFailed', 'Could not load imaging orders: {{err}}', { err: error })}</p>}
        {orders === null ? (
          <div className="img-pad">
            <InlineLoading description={t('loadingImaging', 'Loading imaging orders…')} />
          </div>
        ) : rows.length === 0 ? (
          <div className="img-empty">
            <p className="img-empty-title">{t('noImagingOrders', 'No imaging orders found')}</p>
            <p>{t('checkFilters', 'Please check the filters above and try again')}</p>
          </div>
        ) : (
          <DataTable rows={rows} headers={headers} isSortable>
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
                    const o = byId[row.id];
                    // DataTable syncs its rows one render late: after a tab switch it can still hand back the
                    // previous tab's rows for a frame
                    if (!o) return null;
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow
                          {...getRowProps({ row })}
                          isExpanded={expanded.has(row.id)}
                          onExpand={() => toggle(row.id)}
                        >
                          {row.cells.map((cell: any) => {
                            if (cell.info.header === 'patient') {
                              return (
                                <TableCell key={cell.id}>
                                  <ConfigurableLink to={`\${openmrsSpaBase}/patient/${o.patient.uuid}/chart`}>
                                    {o.patient.name}
                                  </ConfigurableLink>
                                  <div className="img-sub">{o.patient.identifier}</div>
                                </TableCell>
                              );
                            }
                            if (cell.info.header === 'status') return <TableCell key={cell.id}>{statusTag(o)}</TableCell>;
                            if (cell.info.header === 'test') {
                              return (
                                <TableCell key={cell.id}>
                                  {cell.value}
                                  {o.urgency === 'STAT' && (
                                    <Tag type="red" size="sm" style={{ marginLeft: '0.5rem' }}>
                                      {t('stat', 'STAT')}
                                    </Tag>
                                  )}
                                </TableCell>
                              );
                            }
                            return <TableCell key={cell.id}>{cell.value}</TableCell>;
                          })}
                        </TableExpandRow>
                        {expanded.has(row.id) && (
                          <TableExpandedRow colSpan={dtHeaders.length + 1}>
                            <ImagingResult
                              order={o}
                              mode="upload"
                              onUploaded={() => {
                                // uploaded: follow the order to the Uploaded tab, still open (it shows the image)
                                setTab(1);
                                void load();
                              }}
                            />
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

export default ImagingDashboard;

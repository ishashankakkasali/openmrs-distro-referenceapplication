/**
 * Imaging results in the patient chart: where the doctor, back in consultation, reviews the patient's imaging (e.g.
 * the ECG uploaded on the Imaging page): the image, the AI read, the assessment and Complete review, which saves the
 * review as the order's result (also listed under the order in the chart's Orders).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  InlineLoading,
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
  Tile,
} from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import type { ReferralFulfillmentConfig } from '../config-schema';
import { type ImagingOrder, fetchPatientImagingOrders } from './imaging.resource';
import ImagingResult from './imaging-result.component';
import './imaging.css';

interface Props {
  patientUuid?: string;
  patient?: { id?: string };
}

const REFRESH_MS = 30_000;

const ImagingResults: React.FC<Props> = (props) => {
  const { t: translate } = useTranslation();
  const t = useCallback(
    (key: string, defaultValue: string, options?: Record<string, unknown>): string =>
      translate(key, defaultValue, { ...options, interpolation: { escapeValue: false } }) as string,
    [translate],
  );
  const { imaging } = useConfig<ReferralFulfillmentConfig>();
  const patientUuid = props.patientUuid ?? props.patient?.id;

  const [orders, setOrders] = useState<ImagingOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string> | null>(null);

  const load = useCallback(async () => {
    if (!patientUuid) return;
    try {
      const rows = await fetchPatientImagingOrders(patientUuid, imaging.imagingOrderTypeUuid);
      setOrders(rows);
      setError(null);
      // On first load, open the order the Imaging page linked to (?order=<uuid>), or else what needs the doctor:
      // results awaiting review
      setExpanded((cur) => {
        if (cur) return cur;
        const linked = new URLSearchParams(window.location.search).get('order');
        if (linked && rows.some((o) => o.uuid === linked)) return new Set([linked]);
        return new Set(rows.filter((o) => o.fulfillerStatus === 'IN_PROGRESS').map((o) => o.uuid));
      });
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }, [patientUuid, imaging.imagingOrderTypeUuid]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [load]);

  // Bring the linked order into view once it is open
  const scrolledTo = useRef(false);
  useEffect(() => {
    const linked = new URLSearchParams(window.location.search).get('order');
    if (!linked || scrolledTo.current || !expanded?.has(linked)) return;
    scrolledTo.current = true;
    window.requestAnimationFrame(() =>
      document.querySelector(`[data-order-row="${linked}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }),
    );
  }, [expanded]);

  const toggle = (uuid: string) =>
    setExpanded((cur) => {
      const next = new Set(cur ?? []);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });

  const headers = useMemo(
    () => [
      { key: 'test', header: t('imagingTest', 'Test') },
      { key: 'orderNumber', header: t('orderNumber', 'Order #') },
      { key: 'ordered', header: t('ordered', 'Ordered') },
      { key: 'orderedBy', header: t('orderedBy', 'Ordered by') },
      { key: 'status', header: t('status', 'Status') },
    ],
    [t],
  );

  if (!patientUuid) return <Tile>{t('noPatient', 'No patient context')}</Tile>;
  if (error) return <p className="img-error">{t('imagingLoadFailed', 'Could not load imaging orders: {{err}}', { err: error })}</p>;
  if (orders === null) return <InlineLoading description={t('loadingImaging', 'Loading imaging orders…')} />;
  if (orders.length === 0) {
    return (
      <div className="img-empty">
        <p className="img-empty-title">{t('noImagingForPatient', 'No imaging ordered for this patient')}</p>
        <p>{t('imagingOrderedFromForm', 'An ECG ordered from the Referral Response form appears here.')}</p>
      </div>
    );
  }

  const byId = Object.fromEntries(orders.map((o) => [o.uuid, o]));
  const rows = orders.map((o) => ({
    id: o.uuid,
    test: o.concept.display,
    orderNumber: o.orderNumber,
    ordered: new Date(o.dateActivated).toLocaleString(),
    orderedBy: o.ordererName ?? '',
    status: '',
  }));

  const statusTag = (o: ImagingOrder) => {
    if (o.fulfillerStatus === 'COMPLETED') return <Tag type="green">{t('statusReviewed', 'Reviewed')}</Tag>;
    if (o.fulfillerStatus === 'IN_PROGRESS') return <Tag type="blue">{t('statusAwaitingReview', 'Awaiting review')}</Tag>;
    return <Tag type="gray">{t('statusWaitingUpload', 'Waiting for the result')}</Tag>;
  };

  return (
    <div className="img-chart">
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
                const o = byId[row.id];
                if (!o) return null;
                const isOpen = !!expanded?.has(row.id);
                return (
                  <React.Fragment key={row.id}>
                    <TableExpandRow
                      {...getRowProps({ row })}
                      isExpanded={isOpen}
                      onExpand={() => toggle(row.id)}
                      data-order-row={row.id}
                    >
                      {row.cells.map((cell: any) =>
                        cell.info.header === 'status' ? (
                          <TableCell key={cell.id}>{statusTag(o)}</TableCell>
                        ) : (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ),
                      )}
                    </TableExpandRow>
                    {isOpen && (
                      <TableExpandedRow colSpan={dtHeaders.length + 1}>
                        <ImagingResult order={o} mode="review" onCompleted={() => void load()} />
                      </TableExpandedRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
};

export default ImagingResults;

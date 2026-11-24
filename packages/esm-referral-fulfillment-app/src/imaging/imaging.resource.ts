import { makeUrl, openmrsFetch } from '@openmrs/esm-framework';

const REST = '/ws/rest/v1';

export interface ImagingOrder {
  uuid: string;
  orderNumber: string;
  dateActivated: string;
  dateStopped?: string | null;
  fulfillerStatus?: string | null;
  urgency?: string | null;
  instructions?: string | null;
  concept: { uuid: string; display: string };
  ordererName?: string;
  /** The encounter the order was placed in; the review result goes there for the chart's Orders widget. */
  encounterUuid?: string;
  visitUuid?: string;
  patient: {
    uuid: string;
    name: string;
    identifier: string;
    age?: number;
    gender?: string;
  };
}

export interface ImagingResultFile {
  uuid: string;
  dateTime: string;
  filename: string;
  contentFamily: string;
  url: string;
}

const ORDER_REPRESENTATION =
  'custom:(uuid,orderNumber,dateActivated,dateStopped,fulfillerStatus,urgency,instructions,action,' +
  'concept:(uuid,display),orderer:(display,person:(display)),encounter:(uuid,visit:(uuid)),' +
  'patient:(uuid,display,person:(age,gender,preferredName:(display))))';

const isoDay = (d: Date, endOfDay = false) => {
  const day = new Date(d);
  if (endOfDay) day.setHours(23, 59, 59, 999);
  else day.setHours(0, 0, 0, 0);
  return day.toISOString();
};

function toImagingOrder(o: any): ImagingOrder {
  // patient display is "<identifier> - <name>"
  const display: string = o.patient?.display ?? '';
  const sep = display.indexOf(' - ');
  return {
    uuid: o.uuid,
    orderNumber: o.orderNumber,
    dateActivated: o.dateActivated,
    dateStopped: o.dateStopped,
    fulfillerStatus: o.fulfillerStatus,
    urgency: o.urgency,
    instructions: o.instructions,
    concept: o.concept,
    ordererName: o.orderer?.person?.display ?? o.orderer?.display,
    encounterUuid: o.encounter?.uuid,
    visitUuid: o.encounter?.visit?.uuid,
    patient: {
      uuid: o.patient?.uuid,
      name: o.patient?.person?.preferredName?.display ?? (sep >= 0 ? display.slice(sep + 3) : display),
      identifier: sep >= 0 ? display.slice(0, sep) : '',
      age: o.patient?.person?.age,
      gender: o.patient?.person?.gender,
    },
  };
}

const newOrdersFirst = (rows: any[]): ImagingOrder[] =>
  rows
    .filter((o: any) => (o.action ?? 'NEW').toUpperCase() === 'NEW')
    .map(toImagingOrder)
    .sort((a, b) => +new Date(b.dateActivated) - +new Date(a.dateActivated));

/**
 * Imaging orders activated in the date range, across patients (new orders only, voided ones excluded). The range is
 * whole days in the browser's time zone. The server drops the time of both bounds and widens them to whole days in
 * its own time zone (UTC), so with a browser ahead of UTC the 24th also brings the evening of the 23rd: the server's
 * answer is only a superset, and the exact range is applied here.
 */
export async function fetchImagingOrders(orderTypeUuid: string, from: Date, to: Date): Promise<ImagingOrder[]> {
  const start = isoDay(from);
  const end = isoDay(to, true);
  const res = await openmrsFetch(
    `${REST}/order?orderTypes=${orderTypeUuid}&activatedOnOrAfterDate=${encodeURIComponent(start)}` +
      `&activatedOnOrBeforeDate=${encodeURIComponent(end)}&v=${ORDER_REPRESENTATION}&limit=100`,
  );
  const inRange = (o: any) => {
    const at = +new Date(o.dateActivated);
    return at >= +new Date(start) && at <= +new Date(end);
  };
  return newOrdersFirst((res.data?.results ?? []).filter(inRange));
}

/** The patient's imaging orders, newest first (for the chart's Imaging results). */
export async function fetchPatientImagingOrders(patientUuid: string, orderTypeUuid: string): Promise<ImagingOrder[]> {
  const res = await openmrsFetch(
    `${REST}/order?patient=${patientUuid}&orderTypes=${orderTypeUuid}&v=${ORDER_REPRESENTATION}&limit=100`,
  );
  return newOrdersFirst(res.data?.results ?? []);
}

/** The caption a result is uploaded with; it starts with the order number, which is how the result is found. */
export const resultCaption = (order: ImagingOrder) => `${order.orderNumber} · ${order.concept.display}`;

const toResultFile = (a: any): ImagingResultFile => ({
  uuid: a.uuid,
  dateTime: a.dateTime,
  filename: a.filename,
  contentFamily: a.bytesContentFamily,
  url: makeUrl(`${REST}/attachment/${a.uuid}/bytes`),
});

const newest = (rows: any[]) => [...rows].sort((a, b) => +new Date(b.dateTime) - +new Date(a.dateTime))[0];

/**
 * The newest file uploaded as the result of the order: an attachment captioned with the order number, or else (the
 * earlier convention) an attachment in the order's own encounter.
 */
export async function fetchImagingResult(order: ImagingOrder): Promise<ImagingResultFile | null> {
  const res = await openmrsFetch(`${REST}/attachment?patient=${order.patient.uuid}&v=full`);
  const captioned = (res.data?.results ?? []).filter(
    (a: any) => typeof a.comment === 'string' && a.comment.startsWith(`${order.orderNumber} `),
  );
  if (captioned.length) return toResultFile(newest(captioned));
  if (!order.encounterUuid) return null;
  const inEncounter = await openmrsFetch(
    `${REST}/attachment?patient=${order.patient.uuid}&encounter=${order.encounterUuid}&v=full`,
  );
  const rows = inEncounter.data?.results ?? [];
  return rows.length ? toResultFile(newest(rows)) : null;
}

/**
 * Uploads the result (e.g. the ECG from the machine) as an attachment in the order's own encounter, then moves the
 * order to IN_PROGRESS: the result is in but not yet reviewed (Complete review marks it COMPLETED). In the order's
 * encounter the emitted Observation carries the encounter's links (e.g. source-referral-order for an ECG ordered from
 * the Referral Response form), so CCE can tie the upload to the order's referral. Without an encounter (not expected)
 * it falls back to the order's visit. The caption starts with the order number, which is how the result is found.
 */
export async function uploadImagingResult(order: ImagingOrder, file: File): Promise<string> {
  const form = new FormData();
  form.append('patient', order.patient.uuid);
  if (order.encounterUuid) form.append('encounter', order.encounterUuid);
  else if (order.visitUuid) form.append('visit', order.visitUuid);
  form.append('fileCaption', resultCaption(order));
  form.append('file', file, file.name);
  const uploaded = await openmrsFetch(`${REST}/attachment`, { method: 'POST', body: form });
  await openmrsFetch(`${REST}/order/${order.uuid}/fulfillerdetails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { fulfillerStatus: 'IN_PROGRESS', fulfillerComment: 'Result uploaded, review pending' },
  });
  return uploaded.data?.uuid as string;
}

export interface ImagingReview {
  at?: string;
  finding: string;
  diagnosis: string;
  plan: string;
}

export interface ReviewConcepts {
  set: string;
  finding: string;
  diagnosis: string;
  plan: string;
}

/** The saved review of the order (the "Imaging review" obs group linked to it), if any. */
export async function fetchImagingReview(order: ImagingOrder, concepts: ReviewConcepts): Promise<ImagingReview | null> {
  const res = await openmrsFetch(
    `${REST}/obs?patient=${order.patient.uuid}&concept=${concepts.set}` +
      `&v=custom:(uuid,obsDatetime,order:(uuid),groupMembers:(concept:(uuid),value))`,
  );
  const group = (res.data?.results ?? [])
    .filter((o: any) => o.order?.uuid === order.uuid)
    .sort((a: any, b: any) => +new Date(b.obsDatetime) - +new Date(a.obsDatetime))[0];
  if (!group) return null;
  const valueOf = (concept: string) =>
    String((group.groupMembers ?? []).find((m: any) => m.concept?.uuid === concept)?.value ?? '');
  return {
    at: group.obsDatetime,
    finding: valueOf(concepts.finding),
    diagnosis: valueOf(concepts.diagnosis),
    plan: valueOf(concepts.plan),
  };
}

/**
 * Saves the review as an "Imaging review" obs group linked to the order, in the order's encounter (the chart's Orders
 * widget lists an order's result from the obs of its encounter that point at it), then marks the order COMPLETED.
 * Adding obs does not change the encounter itself, so a Referral Response encounter is not sent again.
 */
export async function completeImagingReview(
  order: ImagingOrder,
  review: ImagingReview,
  concepts: ReviewConcepts,
): Promise<void> {
  const obsDatetime = new Date().toISOString();
  const member = (concept: string, value: string) =>
    value.trim() ? [{ person: order.patient.uuid, obsDatetime, order: order.uuid, concept, value: value.trim() }] : [];
  await openmrsFetch(`${REST}/obs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      person: order.patient.uuid,
      encounter: order.encounterUuid,
      order: order.uuid,
      obsDatetime,
      concept: concepts.set,
      groupMembers: [
        ...member(concepts.finding, review.finding),
        ...member(concepts.diagnosis, review.diagnosis),
        ...member(concepts.plan, review.plan),
      ],
    },
  });
  await openmrsFetch(`${REST}/order/${order.uuid}/fulfillerdetails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { fulfillerStatus: 'COMPLETED', fulfillerComment: 'Reviewed' },
  });
}

// ---- AI read (ecgai backend module) ----------------------------------------------------------------------------------

export type AiDisposition = 'IMMEDIATE_CATH_LAB_REFERRAL' | 'NO_REFERRAL_SERIAL_ECG_MONITORING';

/** The AI read of an ECG, as the ecgai module saves it (JSON in the "ECG AI interpretation" observation). */
export interface AiRead {
  isTwelveLeadEcg: boolean;
  ecgInterpretation: string;
  meetsStemiOmiCriteria: boolean;
  headline: string;
  suggestedDiagnosis: string;
  disposition: AiDisposition;
  dispositionText: string;
  nextStepsIfPciWithin120Min: string[];
  nextStepsIfPciBeyond120Min: string[];
  provider?: string;
  model?: string;
  generatedAt?: string;
}

/** idle (never asked) | running | done | failed | not_configured (no provider or API key on the backend) */
export interface AiJobStatus {
  status: 'idle' | 'running' | 'done' | 'failed' | 'not_configured';
  error?: string;
}

/** The ecgai OpenMRS module's REST endpoints (modules/ecgai). */
const aiPath = (path: string) => `${REST}/ecgai/${path}`;

/** The saved AI read of the order, if any (newest). */
export async function fetchAiRead(order: ImagingOrder, conceptUuid: string): Promise<AiRead | null> {
  const res = await openmrsFetch(
    `${REST}/obs?patient=${order.patient.uuid}&concept=${conceptUuid}&v=custom:(uuid,obsDatetime,value,order:(uuid))`,
  );
  const row = (res.data?.results ?? [])
    .filter((o: any) => o.order?.uuid === order.uuid)
    .sort((a: any, b: any) => +new Date(b.obsDatetime) - +new Date(a.obsDatetime))[0];
  if (!row) return null;
  try {
    return JSON.parse(String(row.value)) as AiRead;
  } catch {
    return null;
  }
}

/** Asks the ecgai module to read the order's uploaded ECG (it saves the result on the order). */
export async function startAiRead(order: ImagingOrder, attachmentUuid: string): Promise<AiJobStatus> {
  const res = await openmrsFetch(aiPath('interpret'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      orderUuid: order.uuid,
      attachmentUuid,
    },
  });
  return res.data as AiJobStatus;
}

export async function fetchAiStatus(order: ImagingOrder): Promise<AiJobStatus> {
  const res = await openmrsFetch(aiPath(`status/${order.uuid}`));
  return res.data as AiJobStatus;
}

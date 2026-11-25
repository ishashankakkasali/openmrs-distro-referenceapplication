import { openmrsFetch } from '@openmrs/esm-framework';

export interface WorklistReferral {
  uuid: string;
  orderNumber: string;
  dateActivated: string;
  fulfillerStatus?: string | null;
  fulfillerComment?: string | null;
  urgency?: string | null;
  instructions?: string | null;
  concept: { uuid: string; display: string };
  ordererName?: string;
  encounter?: {
    uuid: string;
    encounterType?: { uuid: string };
    location?: { uuid: string; display: string } | null;
    obs?: Array<{ concept?: { uuid: string }; value?: unknown }>;
  };
  patient: { uuid: string; name: string; identifier: string; age?: number; gender?: string };
}

const REPRESENTATION =
  'custom:(uuid,orderNumber,action,dateActivated,fulfillerStatus,fulfillerComment,urgency,instructions,' +
  'concept:(uuid,display),orderer:(display,person:(display)),' +
  'encounter:(uuid,encounterType:(uuid),location:(uuid,display),obs:(concept:(uuid),value)),' +
  'patient:(uuid,display,person:(age,gender,preferredName:(display))))';

const dayBound = (d: Date, end: boolean) => {
  const x = new Date(d);
  if (end) x.setHours(23, 59, 59, 999);
  else x.setHours(0, 0, 0, 0);
  return x;
};

/**
 * Referral orders activated in the date range, across patients, newest first; the DISCONTINUE rows that close a
 * referral are left out (the referral's own row carries its status). The server widens the range to whole days in its
 * own time zone, so the exact range is applied here.
 */
export async function fetchReferrals(orderTypeUuid: string, from: Date, to: Date): Promise<WorklistReferral[]> {
  const start = dayBound(from, false);
  const end = dayBound(to, true);
  const res = await openmrsFetch(
    `/ws/rest/v1/order?orderTypes=${orderTypeUuid}&activatedOnOrAfterDate=${encodeURIComponent(start.toISOString())}` +
      `&activatedOnOrBeforeDate=${encodeURIComponent(end.toISOString())}&v=${REPRESENTATION}&limit=100`,
  );
  return (res.data?.results ?? [])
    .filter((o: any) => (o.action ?? 'NEW').toUpperCase() === 'NEW')
    .filter((o: any) => {
      const at = +new Date(o.dateActivated);
      return at >= +start && at <= +end;
    })
    .map((o: any): WorklistReferral => {
      const display: string = o.patient?.display ?? '';
      const sep = display.indexOf(' - ');
      return {
        uuid: o.uuid,
        orderNumber: o.orderNumber,
        dateActivated: o.dateActivated,
        fulfillerStatus: o.fulfillerStatus,
        fulfillerComment: o.fulfillerComment,
        urgency: o.urgency,
        instructions: o.instructions,
        concept: o.concept,
        ordererName: o.orderer?.person?.display ?? o.orderer?.display,
        encounter: o.encounter,
        patient: {
          uuid: o.patient?.uuid,
          name: o.patient?.person?.preferredName?.display ?? (sep >= 0 ? display.slice(sep + 3) : display),
          identifier: sep >= 0 ? display.slice(0, sep) : '',
          age: o.patient?.person?.age,
          gender: o.patient?.person?.gender,
        },
      };
    })
    .sort((a: WorklistReferral, b: WorklistReferral) => +new Date(b.dateActivated) - +new Date(a.dateActivated));
}

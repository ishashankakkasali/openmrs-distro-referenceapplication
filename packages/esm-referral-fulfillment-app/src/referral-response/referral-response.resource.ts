import { openmrsFetch } from '@openmrs/esm-framework';

const REST = '/ws/rest/v1';
const FHIR = '/ws/fhir2/R4';

export interface VitalsReading {
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  spo2?: number;
  respiratoryRate?: number;
  temperature?: number;
  /** When the newest of these was taken */
  at?: string;
}

export interface PatientRecord {
  conditions: string[];
  medicines: string[];
  /** The visit before this one, e.g. "12 Oct 2026 · OPD Visit" */
  lastVisit: string | null;
  /** Recorded allergies; empty when none are known */
  allergies: string[];
}

export interface VitalsConcepts {
  systolic: string;
  diastolic: string;
  pulse: string;
  spo2: string;
  respiratoryRate: string;
  temperature: string;
}

/**
 * Vitals already taken in this visit (e.g. by the nurse at triage), newest per measurement. Read through FHIR, which
 * searches several concepts at once.
 */
export async function fetchVisitVitals(
  patientUuid: string,
  visitStart: string | undefined,
  concepts: VitalsConcepts,
): Promise<VitalsReading> {
  const codes = Object.values(concepts).join(',');
  const res = await openmrsFetch(`${FHIR}/Observation?subject=${patientUuid}&code=${codes}&_sort=-date&_count=50`);
  const since = visitStart ? +new Date(visitStart) : 0;
  const reading: VitalsReading = {};
  for (const entry of res.data?.entry ?? []) {
    const obs = entry.resource;
    const at = obs?.effectiveDateTime;
    if (!at || +new Date(at) < since) continue;
    const code = obs.code?.coding?.find((c: any) => !c.system)?.code ?? obs.code?.coding?.[0]?.code;
    const key = (Object.keys(concepts) as Array<keyof VitalsConcepts>).find((k) => concepts[k] === code);
    const value = obs.valueQuantity?.value;
    if (!key || typeof value !== 'number' || reading[key] !== undefined) continue;
    reading[key] = value;
    if (!reading.at || +new Date(at) > +new Date(reading.at)) reading.at = at;
  }
  return reading;
}

/** What the record holds about the patient: active conditions, active medicines and the previous visit. */
export async function fetchPatientRecord(patientUuid: string, activeVisitUuid?: string): Promise<PatientRecord> {
  const [conditions, medicines, visits, allergies] = await Promise.all([
    openmrsFetch(`${FHIR}/Condition?patient=${patientUuid}&_count=50`)
      .then((r) =>
        (r.data?.entry ?? [])
          .map((e: any) => e.resource)
          .filter((c: any) => (c?.clinicalStatus?.coding?.[0]?.code ?? 'active') === 'active')
          .map((c: any) => {
            const name = c.code?.text ?? c.code?.coding?.[0]?.display ?? '';
            const since = c.onsetDateTime
              ? new Date(c.onsetDateTime).toLocaleDateString([], { month: 'short', year: 'numeric' })
              : '';
            return since ? `${name}, since ${since}` : name;
          })
          .filter(Boolean),
      )
      .catch(() => [] as string[]),
    openmrsFetch(`${REST}/order?patient=${patientUuid}&t=drugorder&status=ACTIVE&v=custom:(drug:(display),concept:(display))`)
      .then((r) =>
        (r.data?.results ?? []).map((o: any) => o?.drug?.display ?? o?.concept?.display ?? '').filter(Boolean),
      )
      .catch(() => [] as string[]),
    openmrsFetch(
      `${REST}/visit?patient=${patientUuid}&includeInactive=true&v=custom:(uuid,startDatetime,visitType:(display))&limit=5`,
    )
      .then((r) => r.data?.results ?? [])
      .catch(() => [] as any[]),
    openmrsFetch(`${FHIR}/AllergyIntolerance?patient=${patientUuid}&_count=50`)
      .then((r) =>
        (r.data?.entry ?? [])
          .map((e: any) => e.resource?.code?.text ?? e.resource?.code?.coding?.[0]?.display ?? '')
          .filter(Boolean),
      )
      .catch(() => [] as string[]),
  ]);
  const previous = visits
    .filter((v: any) => v.uuid !== activeVisitUuid)
    .sort((a: any, b: any) => +new Date(b.startDatetime) - +new Date(a.startDatetime))[0];
  const lastVisit = previous
    ? `${new Date(previous.startDatetime).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}` +
      (previous.visitType?.display ? ` · ${previous.visitType.display}` : '')
    : null;
  return {
    conditions: Array.from(new Set(conditions)),
    medicines: Array.from(new Set(medicines)),
    lastVisit,
    allergies: Array.from(new Set(allergies)),
  };
}

export interface ObsInput {
  concept: string;
  value: string | number;
}

export interface OrderInput {
  concept: string;
  orderType: string;
  careSetting: string;
  orderer: string;
  urgency: 'ROUTINE' | 'STAT';
  instructions?: string;
}

export interface SavedObs {
  uuid: string;
  concept: string;
}

/** Saves the Referral Response encounter with what is filled in so far, and any order (the ECG). */
export async function createResponseEncounter(args: {
  patientUuid: string;
  visitUuid: string;
  encounterTypeUuid: string;
  locationUuid?: string;
  providerUuid?: string;
  encounterRoleUuid: string;
  obs: ObsInput[];
  orders: OrderInput[];
}): Promise<{ encounterUuid: string; obs: SavedObs[]; orderUuids: string[] }> {
  const body: Record<string, unknown> = {
    patient: args.patientUuid,
    visit: args.visitUuid,
    encounterType: args.encounterTypeUuid,
    obs: args.obs,
    orders: args.orders.map((o) => ({ type: 'testorder', patient: args.patientUuid, ...o })),
  };
  if (args.locationUuid) body.location = args.locationUuid;
  if (args.providerUuid) {
    body.encounterProviders = [{ provider: args.providerUuid, encounterRole: args.encounterRoleUuid }];
  }
  const res = await openmrsFetch(
    `${REST}/encounter?v=custom:(uuid,obs:(uuid,concept:(uuid)),orders:(uuid))`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body },
  );
  return {
    encounterUuid: res.data.uuid,
    obs: (res.data.obs ?? []).map((o: any) => ({ uuid: o.uuid, concept: o.concept?.uuid })),
    orderUuids: (res.data.orders ?? []).map((o: any) => o.uuid),
  };
}

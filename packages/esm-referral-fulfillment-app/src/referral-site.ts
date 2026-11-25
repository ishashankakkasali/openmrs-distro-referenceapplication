/**
 * Where a referral is answered. For the demo the UHC and the cardiac centre share this OpenMRS, so the location the
 * user logged in at stands for the facility: a referral for primary PCI is answered only by a user logged in at the
 * cardiac centre it was sent to (its destination, recorded on the Referral Out encounter), and a cardiac centre does
 * not answer the UHC's referrals in.
 */
import { openmrsFetch } from '@openmrs/esm-framework';
import type { CardiacCentre } from './config-schema';

interface WithDestination {
  encounter?: { obs?: Array<{ concept?: { uuid: string }; value?: unknown }> } | null;
}

/** The destination location of a referral out; the REST API returns a location-uuid text value as the Location. */
export function destinationUuidOf(order: WithDestination | undefined, destinationConceptUuid: string): string | null {
  const value: any = order?.encounter?.obs?.find((obs) => obs.concept?.uuid === destinationConceptUuid)?.value;
  if (value && typeof value === 'object') return value.uuid ?? null;
  return typeof value === 'string' && value ? value : null;
}

export function isCardiacCentre(locationUuid: string | undefined, centres: CardiacCentre[]): boolean {
  return !!locationUuid && centres.some((c) => c.locationUuid === locationUuid);
}

/** A fulfiller comment is "<comment> | by: <name>" (close-referral-order.ts). */
export function splitFulfillerComment(raw?: string | null): { comment: string | null; by: string | null } {
  if (!raw) return { comment: null, by: null };
  const i = raw.indexOf(' | by: ');
  if (i < 0) return { comment: raw, by: null };
  return { comment: raw.slice(0, i) || null, by: raw.slice(i + ' | by: '.length) || null };
}

/**
 * The patient arrives at this facility: the visit elsewhere (the UHC's) ends now, and a visit starts here, of the
 * same visit type. Like a transfer: OpenMRS keeps one active visit per patient.
 */
export async function moveVisitHere(
  patientUuid: string,
  activeVisit: { uuid: string; visitType?: { uuid: string } } | null,
  locationUuid: string,
  fallbackVisitTypeUuid: string,
): Promise<string> {
  const now = new Date();
  if (activeVisit) {
    await openmrsFetch(`/ws/rest/v1/visit/${activeVisit.uuid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { stopDatetime: new Date(now.getTime() - 1000).toISOString() },
    });
  }
  const res = await openmrsFetch(`/ws/rest/v1/visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      patient: patientUuid,
      visitType: activeVisit?.visitType?.uuid ?? fallbackVisitTypeUuid,
      location: locationUuid,
      startDatetime: now.toISOString(),
    },
  });
  return res.data?.uuid;
}

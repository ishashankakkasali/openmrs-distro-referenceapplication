import { getSessionStore, openmrsFetch } from '@openmrs/esm-framework';
import type { ReferralFulfillmentConfig } from './config-schema';

export interface ReferralOutRequest {
  patientUuid: string;
  visitUuid: string;
  /** Concept of the referral, a member of the referral-out orderables set. */
  conceptUuid: string;
  /** Location the patient is referred to (tagged as a referral destination). */
  destinationLocationUuid: string;
  urgency: 'ROUTINE' | 'STAT';
  instructions?: string;
}

export interface ReferralOutOrderable {
  uuid: string;
  display: string;
}

export interface ReferralDestination {
  uuid: string;
  display: string;
}

/** The facilities a referral out can be sent to: the locations carrying the configured tag. */
export async function fetchReferralDestinations(locationTag: string): Promise<ReferralDestination[]> {
  const res = await openmrsFetch(
    `/ws/rest/v1/location?tag=${encodeURIComponent(locationTag)}&v=custom:(uuid,display)&limit=100`,
  );
  return res.data?.results ?? [];
}

/**
 * Reference number of a referral out, e.g. RO-20261023-K7Q2: the receiving facility quotes it when it
 * responds. It is generated here because OpenMRS assigns the order number only after the order is saved,
 * and orders cannot be edited afterwards.
 */
export function generateReferralOutReference(prefix: string, now: Date = new Date()): string {
  const day = now.toISOString().slice(0, 10).replace(/-/g, '');
  // unambiguous characters only (no 0/O, 1/I)
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const suffix = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `${prefix}-${day}-${suffix}`;
}

/**
 * The concepts a referral out can be raised for: the members of the
 * configured orderables concept set (e.g. "Referral to primary health care (PHC)").
 */
export async function fetchReferralOutOrderables(conceptSetUuid: string): Promise<ReferralOutOrderable[]> {
  const res = await openmrsFetch(`/ws/rest/v1/concept/${conceptSetUuid}?v=custom:(setMembers:(uuid,display))`);
  return res.data?.setMembers ?? [];
}

/**
 * Raises a referral out (e.g. a back-referral to a PHC) in two steps:
 *
 * 1. a "Referral Out" encounter in the patient's active visit, recording the destination facility, and
 * 2. a Referral order in that encounter, carrying a generated reference number.
 *
 * The order is a `testorder` carrying the Referral order type, the same shape
 * the receiver adaptor creates for referrals in: the order type is backed by
 * org.openmrs.TestOrder, and only test orders are published by the FHIR module
 * as ServiceRequest. The emitter adaptor then forwards that ServiceRequest to
 * OpenHIM, tagging it referral-direction "outbound" because its encounter type
 * is not Referral In.
 *
 * @returns the new order's number and reference number
 */
export async function createReferralOut(
  request: ReferralOutRequest,
  config: ReferralFulfillmentConfig,
): Promise<{ orderNumber: string; referenceNumber: string }> {
  const session: any = getSessionStore().getState()?.session;
  const providerUuid: string | undefined = session?.currentProvider?.uuid;
  const locationUuid: string | undefined = session?.sessionLocation?.uuid;
  if (!providerUuid) {
    throw new Error('The logged-in user is not a provider, so they cannot raise a referral.');
  }
  if (!locationUuid) {
    throw new Error('No session location is selected.');
  }

  const encounterRes = await openmrsFetch('/ws/rest/v1/encounter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      patient: request.patientUuid,
      visit: request.visitUuid,
      encounterType: config.referralOutEncounterTypeUuid,
      location: locationUuid,
      encounterDatetime: new Date().toISOString(),
      encounterProviders: [{ provider: providerUuid, encounterRole: config.clinicianEncounterRoleUuid }],
      // the destination travels with the encounter; the emitter sends it as ServiceRequest.performer
      obs: [{ concept: config.referralDestinationConceptUuid, value: request.destinationLocationUuid }],
    },
  });
  const encounterUuid: string = encounterRes.data.uuid;
  const referenceNumber = generateReferralOutReference(config.referralOutReferencePrefix);

  const orderRes = await openmrsFetch('/ws/rest/v1/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      // must match the Referral order type's Java class (org.openmrs.TestOrder)
      type: 'testorder',
      action: 'NEW',
      orderType: config.orderTypeUuid,
      patient: request.patientUuid,
      encounter: encounterUuid,
      orderer: providerUuid,
      careSetting: config.careSettingUuid,
      concept: request.conceptUuid,
      urgency: request.urgency,
      instructions: request.instructions?.trim() || null,
      // sent as the ServiceRequest's ACSN identifier
      accessionNumber: referenceNumber,
    },
  });
  return { orderNumber: orderRes.data.orderNumber, referenceNumber };
}

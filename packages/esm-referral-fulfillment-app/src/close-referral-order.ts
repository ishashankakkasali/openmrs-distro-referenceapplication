import { getSessionStore, openmrsFetch, showSnackbar } from '@openmrs/esm-framework';

interface CloseArgs {
  orderUuid: string;
  comment: string;
}

/**
 * Minimal subset of the Order REST resource (v=full) needed to compose a
 * DISCONTINUE order that references the original via `previousOrder`.
 */
export interface DiscontinuableOrder {
  uuid: string;
  patient?: { uuid: string } | null;
  encounter?: { uuid: string } | null;
  orderer?: { uuid: string } | null;
  concept?: { uuid: string } | null;
  careSetting?: { uuid?: string } | null;
  orderType?: { uuid: string } | null;
}

interface DiscontinueArgs {
  order: DiscontinuableOrder;
  /** Falls back to `order.patient.uuid` when omitted. */
  patientUuid?: string;
  reason: string;
}

// Encode "<comment> | by: <name>" so we can render the fulfiller in the UI.
// The Order REST resource has no dedicated fulfiller field and `auditInfo.changedBy`
// is not bumped by the fulfillerdetails PATCH, so we piggyback on fulfillerComment.
const FULFILLER_TAG = ' | by: ';

function currentUserDisplay(): string {
  try {
    const session: any = getSessionStore().getState()?.session;
    return (
      session?.currentProvider?.person?.display ??
      session?.user?.person?.display ??
      session?.user?.display ??
      session?.user?.username ??
      ''
    );
  } catch {
    return '';
  }
}

/**
 * POST /ws/rest/v1/order/{uuid}/fulfillerdetails
 * Sets fulfillerStatus = COMPLETED on a Referral order.
 */
export async function closeReferralOrder({ orderUuid, comment }: CloseArgs): Promise<void> {
  const fulfiller = currentUserDisplay();
  const fulfillerComment = fulfiller ? `${comment}${FULFILLER_TAG}${fulfiller}` : comment;
  try {
    await openmrsFetch(`/ws/rest/v1/order/${orderUuid}/fulfillerdetails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        fulfillerStatus: 'COMPLETED',
        fulfillerComment,
      },
    });
    showSnackbar({
      kind: 'success',
      title: 'Referral closed',
      subtitle: 'Order marked as completed',
      isLowContrast: true,
    });
  } catch (err) {
    console.error('Failed to close referral order', err);
    showSnackbar({
      kind: 'error',
      title: 'Could not close referral',
      subtitle: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

/**
 * POST /ws/rest/v1/order/{uuid}/fulfillerdetails
 * Sets fulfillerStatus = DECLINED on a Referral order. Used when the fulfiller
 * cannot/will-not act on the referral. The decliner's display name is recorded
 * in fulfillerComment via the same `<comment> | by: <name>` convention used by
 * closeReferralOrder so the dashboard can render "Declined by".
 */
export async function declineReferralOrder({ orderUuid, comment }: CloseArgs): Promise<void> {
  const fulfiller = currentUserDisplay();
  const fulfillerComment = fulfiller ? `${comment}${FULFILLER_TAG}${fulfiller}` : comment;
  try {
    await openmrsFetch(`/ws/rest/v1/order/${orderUuid}/fulfillerdetails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        fulfillerStatus: 'DECLINED',
        fulfillerComment,
      },
    });
    showSnackbar({
      kind: 'success',
      title: 'Referral declined',
      subtitle: 'Order marked as declined',
      isLowContrast: true,
    });
  } catch (err) {
    console.error('Failed to decline referral order', err);
    showSnackbar({
      kind: 'error',
      title: 'Could not decline referral',
      subtitle: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

/**
 * The receiving facility acknowledges a referral it was sent (e.g. the cardiac centre, a PCI referral): fulfillerStatus
 * RECEIVED, with who acknowledged it, encoded like the other fulfiller comments ("<comment> | by: <name>").
 */
export async function acknowledgeReferralOrder({ orderUuid, comment }: CloseArgs): Promise<boolean> {
  const fulfiller = currentUserDisplay();
  const fulfillerComment = fulfiller ? `${comment}${FULFILLER_TAG}${fulfiller}` : comment;
  try {
    await openmrsFetch(`/ws/rest/v1/order/${orderUuid}/fulfillerdetails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { fulfillerStatus: 'RECEIVED', fulfillerComment },
    });
    showSnackbar({ kind: 'success', title: 'Referral acknowledged', subtitle: comment, isLowContrast: true });
    return true;
  } catch (err) {
    console.error('Failed to acknowledge referral order', err);
    showSnackbar({
      kind: 'error',
      title: 'Could not acknowledge referral',
      subtitle: err instanceof Error ? err.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * POST /ws/rest/v1/order
 *
 * Creates a DISCONTINUE order that references the original via
 * `previousOrder`. This produces a *new* row in the `orders` table with a
 * fresh `date_created`, and stamps `date_stopped` on the original. Both rows
 * are then visible to FHIR `ServiceRequest?_lastUpdated=gt<X>` polling, which
 * is the only reliable change-data-capture surface for orders (the
 * `/fulfillerdetails` endpoint bypasses audit columns — see
 * docs/referral-close-loop-implementation.md).
 *
 * This call is best-effort: failures are logged + surfaced as a low-priority
 * warning snackbar but never thrown, because the user-visible state
 * (fulfillerStatus) has already been updated by the time we get here.
 */
export async function discontinueReferralOrder({
  order,
  patientUuid,
  reason,
}: DiscontinueArgs): Promise<void> {
  const patient = patientUuid ?? order.patient?.uuid;
  const encounter = order.encounter?.uuid;
  const orderer = order.orderer?.uuid;
  const concept = order.concept?.uuid;
  const careSetting = order.careSetting?.uuid;
  const orderType = order.orderType?.uuid;

  // Skip silently if we don't have the minimum context to compose the body.
  if (!patient || !encounter || !orderer || !concept || !careSetting || !orderType) {
    console.warn('[esm-referral-fulfillment] skipping DISCONTINUE — missing fields', {
      patient: !!patient,
      encounter: !!encounter,
      orderer: !!orderer,
      concept: !!concept,
      careSetting: !!careSetting,
      orderType: !!orderType,
    });
    return;
  }

  try {
    await openmrsFetch('/ws/rest/v1/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        // The Referral OrderType is backed by org.openmrs.TestOrder so the
        // FHIR module exposes referrals as ServiceRequest. The REST resource
        // discriminator must match the underlying class.
        type: 'testorder',
        action: 'DISCONTINUE',
        previousOrder: order.uuid,
        patient,
        encounter,
        orderer,
        careSetting,
        concept,
        orderType,
        orderReasonNonCoded: reason,
      },
    });
  } catch (err) {
    // Swallow — the fulfiller-status flip already succeeded; the FHIR
    // change-data-capture is a downstream concern and shouldn't block the user.
    console.warn('[esm-referral-fulfillment] DISCONTINUE post failed', err);
    showSnackbar({
      kind: 'warning',
      title: 'Order closed but downstream sync may be delayed',
      subtitle:
        err instanceof Error
          ? err.message
          : 'Could not record discontinuation — external systems may not see this change immediately.',
      isLowContrast: true,
    });
  }
}

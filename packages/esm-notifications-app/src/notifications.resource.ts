/**
 * REST helpers for the legacy OpenMRS Alert API.
 *
 * Endpoints used:
 *   GET  /ws/rest/v1/alert?u=<userUuid>&v=full&limit=N
 *   POST /ws/rest/v1/alert/{alertUuid}/recipient/{recipientUuid}    body: { alertRead: true }
 *
 * Notes:
 *   - `u=<currentUser>` scopes results to alerts where the logged-in user
 *     is a recipient. We pass the OpenMRS user UUID returned by useSession().
 *   - `alertRead` is writable only on the per-recipient sub-resource.
 *     Posting it to /alert/{uuid} returns 400 with
 *     "Some properties are not allowed to be set: alertRead".
 */

import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { NotificationItem, NotificationPayload, RawAlert } from './types';

const ALERT_PATH = `${restBaseUrl}/alert`;

export async function fetchAlerts(userUuid: string, limit = 50): Promise<NotificationItem[]> {
  const url = `${ALERT_PATH}?u=${encodeURIComponent(userUuid)}&v=full&limit=${limit}`;
  const res = await openmrsFetch(url);
  const rows: RawAlert[] = res?.data?.results ?? [];
  return rows.map((r) => toNotificationItem(r, userUuid));
}

// NOTE: The OpenMRS webservices.rest AlertResource does NOT expose `alertRead`
// as a writable property — neither on /alert/{uuid} nor on the per-recipient
// sub-resource. Both POSTs return:
//   "Some properties are not allowed to be set: alertRead"
// Until that is fixed upstream, we persist read-state in localStorage and
// overlay it onto the polled results in the hook layer.
export async function markAlertRead(_alertUuid: string, _recipientUuid: string): Promise<void> {
  return;
}

function toNotificationItem(raw: RawAlert, currentUserUuid: string): NotificationItem {
  // Locate the recipient row corresponding to the current user.
  const recipient = (raw.recipients ?? []).find((r) => r.recipient?.uuid === currentUserUuid);
  const read = recipient ? !!recipient.alertRead : !!raw.alertRead;
  return {
    uuid: raw.uuid,
    recipientUuid: recipient?.uuid ?? null,
    read,
    // The list endpoint returns `dateCreated` at the top level; older variants
    // nest it under `auditInfo`. Fall back to `dateChanged` and finally to
    // `dateToExpire` (which we can subtract a known TTL from) before resorting
    // to "now" — otherwise every alert looks like "just now".
    createdAt:
      raw.dateCreated ??
      raw.auditInfo?.dateCreated ??
      raw.dateChanged ??
      new Date().toISOString(),
    expiresAt: raw.dateToExpire ?? null,
    payload: parsePayload(raw.text),
    rawText: raw.text,
  };
}

function parsePayload(text: string): NotificationPayload {
  if (!text) return { v: 0, title: '' };
  if (!text.trim().startsWith('{')) {
    return { v: 0, title: text };
  }
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && typeof parsed.title === 'string') {
      return {
        v: typeof parsed.v === 'number' ? parsed.v : 1,
        type: parsed.type,
        severity: parsed.severity,
        title: parsed.title,
        body: parsed.body,
        link: parsed.link,
      };
    }
  } catch {
    /* fall through */
  }
  return { v: 0, title: text };
}

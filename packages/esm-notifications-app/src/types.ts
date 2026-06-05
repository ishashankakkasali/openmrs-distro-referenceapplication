/**
 * Domain types for notifications.
 *
 * The legacy OpenMRS `notification_alert.text` column is VARCHAR(512). We pack a
 * structured payload as JSON inside it; if parsing fails we fall back to
 * displaying the raw text (so manually-inserted alerts still appear).
 */

export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type NotificationType =
  | 'REFERRAL_ARRIVED'
  | 'REFERRAL_DELAYED'
  | 'REFERRAL_DECLINED'
  | 'LAB_RESULT_AVAILABLE'
  | 'LAB_RESULT_CRITICAL'
  | 'APPOINTMENT_REMINDER'
  | string; // forward-compatible

/** Shape encoded in notification_alert.text by the receiver-adaptor. */
export interface NotificationPayload {
  v: number;
  type?: NotificationType;
  severity?: NotificationSeverity;
  title: string;
  body?: string;
  link?: string;
}

/** Raw row returned by /ws/rest/v1/alert */
export interface RawAlertRecipient {
  uuid: string; // recipient sub-resource uuid
  recipient?: { uuid: string };
  alertRead?: boolean;
}

export interface RawAlert {
  uuid: string;
  text: string;
  alertRead: boolean;
  satisfiedByAny: boolean;
  dateToExpire?: string | null;
  /** Top-level field returned by /ws/rest/v1/alert?v=full. */
  dateCreated?: string | null;
  dateChanged?: string | null;
  /** Some endpoints nest the dates under auditInfo — keep as fallback. */
  auditInfo?: { dateCreated?: string };
  recipients?: RawAlertRecipient[];
}

/** Normalised representation used by the UI. */
export interface NotificationItem {
  uuid: string;
  /** Recipient sub-resource uuid for the *current* user. Needed to mark-read. */
  recipientUuid: string | null;
  read: boolean;
  createdAt: string;
  expiresAt: string | null;
  payload: NotificationPayload;
  /** Original raw text — preserved for fallback display + debugging. */
  rawText: string;
}

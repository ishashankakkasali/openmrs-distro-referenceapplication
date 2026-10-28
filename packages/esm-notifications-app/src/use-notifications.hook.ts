/**
 * Notification polling hook + lightweight pub/sub.
 *
 * - Polls /ws/rest/v1/alert every `pollIntervalMs` (when tab visible) or
 *   `pollIntervalMsHidden` (when hidden).
 * - Maintains a single subscriber list so multiple components (bell, snackbar
 *   host) share one poll loop.
 * - Emits "newly arrived since lastSeen" events for snackbar host to consume.
 */

import { useEffect, useRef, useState } from 'react';
import { useConfig, useSession } from '@openmrs/esm-framework';
import type { NotificationsConfig } from './config-schema';
import { fetchAlerts } from './notifications.resource';
import type { NotificationItem, NotificationSeverity } from './types';

interface NotificationsStore {
  items: NotificationItem[];
  loading: boolean;
  error: string | null;
  lastPolledAt: number | null;
}

type Listener = (s: NotificationsStore) => void;

let store: NotificationsStore = {
  items: [],
  loading: false,
  error: null,
  lastPolledAt: null,
};
const listeners = new Set<Listener>();
let pollTimer: number | null = null;
let pollUserUuid: string | null = null;
let lastSeenAt = readLastSeen();
let firstPollDone = false;

// Client-side read-state. The OpenMRS REST AlertResource does not allow
// updating `alertRead` (see notifications.resource.ts), so we persist a
// per-user set of read alert UUIDs in localStorage and overlay it onto each
// poll result.
const READ_KEY = 'cce.notifications.readUuids';
let readUuids: Set<string> = readReadSet();

function readReadSet(): Set<string> {
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeReadSet() {
  try {
    window.localStorage.setItem(READ_KEY, JSON.stringify(Array.from(readUuids)));
  } catch {
    /* ignore */
  }
}

function setStore(next: Partial<NotificationsStore>) {
  store = { ...store, ...next };
  listeners.forEach((l) => l(store));
}

function readLastSeen(): number {
  try {
    const raw = window.localStorage.getItem('cce.notifications.lastSeenAt');
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

function writeLastSeen(ts: number) {
  try {
    window.localStorage.setItem('cce.notifications.lastSeenAt', String(ts));
  } catch {
    /* ignore */
  }
}

async function pollOnce(
  userUuid: string,
  limit: number,
  snackbarSeverities: NotificationSeverity[],
) {
  setStore({ loading: true });
  try {
    const items = await fetchAlerts(userUuid, limit);
    // Sort newest first (defensive — REST usually returns this order already).
    items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    // Overlay client-side read-state.
    const overlaid = items.map((it) => (readUuids.has(it.uuid) ? { ...it, read: true } : it));

    // Compute deltas: items unseen + unread + matching configured snackbar
    // severities. Items with no severity are treated as INFO so that
    // adaptors which omit the field still trigger a toast (when INFO is
    // included in `snackbarSeverities`, which is the default).
    if (firstPollDone) {
      const newOnes = overlaid.filter((it) => {
        if (it.read) return false;
        if (+new Date(it.createdAt) <= lastSeenAt) return false;
        const sev = it.payload.severity ?? 'INFO';
        return snackbarSeverities.includes(sev);
      });
      newOnes.forEach((it) => fireSnackbar(it));
    }
    firstPollDone = true;

    setStore({ items: overlaid, loading: false, error: null, lastPolledAt: Date.now() });
  } catch (e: any) {
    setStore({ loading: false, error: e?.message ?? String(e) });
  }
}

function fireSnackbar(item: NotificationItem) {
  toastListeners.forEach((l) => l(item));
}

// Toast pub/sub — the snackbar host component subscribes and renders its own
// toasts at the top of the page (the framework's showActionableNotification
// is bottom-anchored and not easily repositionable).
type ToastListener = (item: NotificationItem) => void;
const toastListeners = new Set<ToastListener>();

export function subscribeToasts(l: ToastListener): () => void {
  toastListeners.add(l);
  return () => {
    toastListeners.delete(l);
  };
}

export function markReadLocally(uuid: string) {
  readUuids.add(uuid);
  writeReadSet();
  setStore({ items: store.items.map((i) => (i.uuid === uuid ? { ...i, read: true } : i)) });
}

function severityToCarbonKind(sev?: NotificationSeverity): 'info' | 'warning' | 'error' {
  if (sev === 'CRITICAL') return 'error';
  if (sev === 'WARNING') return 'warning';
  return 'info';
}

export { severityToCarbonKind };

function startPolling(userUuid: string, intervalMs: number, hiddenIntervalMs: number, limit: number, snackbarSeverities: NotificationSeverity[]) {
  pollUserUuid = userUuid;
  stopPolling();
  const tick = () => {
    void pollOnce(userUuid, limit, snackbarSeverities);
    const next = document.hidden ? hiddenIntervalMs : intervalMs;
    pollTimer = window.setTimeout(tick, next);
  };
  tick();
}

function stopPolling() {
  if (pollTimer != null) {
    window.clearTimeout(pollTimer);
    pollTimer = null;
  }
}

export function useNotifications() {
  const session = useSession();
  const config = useConfig<NotificationsConfig>();
  const [snapshot, setSnapshot] = useState<NotificationsStore>(store);

  useEffect(() => {
    const l: Listener = (s) => setSnapshot({ ...s });
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  useEffect(() => {
    const userUuid = session?.user?.uuid;
    if (!userUuid) return;
    startPolling(
      userUuid,
      config.pollIntervalMs,
      config.pollIntervalMsHidden,
      config.maxItems,
      config.snackbarSeverities,
    );
    const onVis = () => {
      if (!document.hidden && pollUserUuid) {
        // Fast refresh on tab focus.
        void pollOnce(pollUserUuid, config.maxItems, config.snackbarSeverities);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      stopPolling();
    };
  }, [
    session?.user?.uuid,
    config.pollIntervalMs,
    config.pollIntervalMsHidden,
    config.maxItems,
    config.snackbarSeverities,
  ]);

  return {
    items: snapshot.items,
    loading: snapshot.loading,
    error: snapshot.error,
    unreadCount: snapshot.items.filter((i) => !i.read).length,
    refresh: () => {
      if (pollUserUuid) void pollOnce(pollUserUuid, config.maxItems, config.snackbarSeverities);
    },
    markRead: async (uuid: string) => {
      const item = store.items.find((i) => i.uuid === uuid);
      if (!item) return;
      // Persist client-side. (REST does not allow updating alertRead.)
      readUuids.add(uuid);
      writeReadSet();
      setStore({ items: store.items.map((i) => (i.uuid === uuid ? { ...i, read: true } : i)) });
    },
    markAllRead: () => {
      const unread = store.items.filter((i) => !i.read);
      if (unread.length === 0) return;
      // Persist client-side, like markRead.
      unread.forEach((i) => readUuids.add(i.uuid));
      writeReadSet();
      setStore({ items: store.items.map((i) => (i.read ? i : { ...i, read: true })) });
    },
    acknowledgeAllVisible: () => {
      const max = store.items.reduce((m, i) => Math.max(m, +new Date(i.createdAt)), 0);
      if (max > lastSeenAt) {
        lastSeenAt = max;
        writeLastSeen(max);
      }
    },
  };
}

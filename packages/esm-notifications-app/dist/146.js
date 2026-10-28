(globalThis["webpackChunk_openmrs_esm_notifications_app"] = globalThis["webpackChunk_openmrs_esm_notifications_app"] || []).push([[146],{

/***/ 146
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  importTranslation: () => (/* binding */ importTranslation),
  notificationsBell: () => (/* binding */ notificationsBell),
  notificationsSnackbarHost: () => (/* binding */ notificationsSnackbarHost),
  startupApp: () => (/* binding */ startupApp)
});

// EXTERNAL MODULE: consume shared module (default) @openmrs/esm-framework@* (singleton)
var esm_framework_singleton_ = __webpack_require__(251);
;// ./src/config-schema.ts

const configSchema = {
    pollIntervalMs: {
        _type: esm_framework_singleton_.Type.Number,
        _description: 'How often to poll /ws/rest/v1/alert when the tab is visible (ms).',
        _default: 15000
    },
    pollIntervalMsHidden: {
        _type: esm_framework_singleton_.Type.Number,
        _description: 'How often to poll when the tab is hidden (ms).',
        _default: 300000
    },
    maxItems: {
        _type: esm_framework_singleton_.Type.Number,
        _description: 'Maximum number of alerts to fetch per poll.',
        _default: 50
    },
    snackbarSeverities: {
        _type: esm_framework_singleton_.Type.Array,
        _description: 'Severities that fire a top-right toast popup. Use ["INFO","WARNING","CRITICAL"] (default) for every notification, or restrict to e.g. ["CRITICAL"].',
        _default: [
            'INFO',
            'WARNING',
            'CRITICAL'
        ]
    }
};

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(848);
// EXTERNAL MODULE: consume shared module (default) react@* (singleton)
var consume_shared_module_default_react_singleton_ = __webpack_require__(403);
// EXTERNAL MODULE: consume shared module (default) react-i18next@* (singleton)
var consume_shared_module_default_react_i18next_singleton_ = __webpack_require__(857);
// EXTERNAL MODULE: ./node_modules/@carbon/react/es/index.js + 42 modules
var es = __webpack_require__(532);
;// ./src/notifications.resource.ts
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
const ALERT_PATH = `${esm_framework_singleton_.restBaseUrl}/alert`;
async function fetchAlerts(userUuid, limit = 50) {
    const url = `${ALERT_PATH}?u=${encodeURIComponent(userUuid)}&v=full&limit=${limit}`;
    const res = await (0,esm_framework_singleton_.openmrsFetch)(url);
    const rows = res?.data?.results ?? [];
    return rows.map((r)=>toNotificationItem(r, userUuid));
}
// NOTE: The OpenMRS webservices.rest AlertResource does NOT expose `alertRead`
// as a writable property — neither on /alert/{uuid} nor on the per-recipient
// sub-resource. Both POSTs return:
//   "Some properties are not allowed to be set: alertRead"
// Until that is fixed upstream, we persist read-state in localStorage and
// overlay it onto the polled results in the hook layer.
async function markAlertRead(_alertUuid, _recipientUuid) {
    return;
}
function toNotificationItem(raw, currentUserUuid) {
    // Locate the recipient row corresponding to the current user.
    const recipient = (raw.recipients ?? []).find((r)=>r.recipient?.uuid === currentUserUuid);
    const read = recipient ? !!recipient.alertRead : !!raw.alertRead;
    return {
        uuid: raw.uuid,
        recipientUuid: recipient?.uuid ?? null,
        read,
        // The list endpoint returns `dateCreated` at the top level; older variants
        // nest it under `auditInfo`. Fall back to `dateChanged` and finally to
        // `dateToExpire` (which we can subtract a known TTL from) before resorting
        // to "now" — otherwise every alert looks like "just now".
        createdAt: raw.dateCreated ?? raw.auditInfo?.dateCreated ?? raw.dateChanged ?? new Date().toISOString(),
        expiresAt: raw.dateToExpire ?? null,
        payload: parsePayload(raw.text),
        rawText: raw.text
    };
}
function parsePayload(text) {
    if (!text) return {
        v: 0,
        title: ''
    };
    if (!text.trim().startsWith('{')) {
        return {
            v: 0,
            title: text
        };
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
                link: parsed.link
            };
        }
    } catch  {
    /* fall through */ }
    return {
        v: 0,
        title: text
    };
}

;// ./src/use-notifications.hook.ts
/**
 * Notification polling hook + lightweight pub/sub.
 *
 * - Polls /ws/rest/v1/alert every `pollIntervalMs` (when tab visible) or
 *   `pollIntervalMsHidden` (when hidden).
 * - Maintains a single subscriber list so multiple components (bell, snackbar
 *   host) share one poll loop.
 * - Emits "newly arrived since lastSeen" events for snackbar host to consume.
 */ 


let store = {
    items: [],
    loading: false,
    error: null,
    lastPolledAt: null
};
const listeners = new Set();
let pollTimer = null;
let pollUserUuid = null;
let lastSeenAt = readLastSeen();
let firstPollDone = false;
// Client-side read-state. The OpenMRS REST AlertResource does not allow
// updating `alertRead` (see notifications.resource.ts), so we persist a
// per-user set of read alert UUIDs in localStorage and overlay it onto each
// poll result.
const READ_KEY = 'cce.notifications.readUuids';
let readUuids = readReadSet();
function readReadSet() {
    try {
        const raw = window.localStorage.getItem(READ_KEY);
        if (!raw) return new Set();
        const arr = JSON.parse(raw);
        return new Set(Array.isArray(arr) ? arr : []);
    } catch  {
        return new Set();
    }
}
function writeReadSet() {
    try {
        window.localStorage.setItem(READ_KEY, JSON.stringify(Array.from(readUuids)));
    } catch  {
    /* ignore */ }
}
function setStore(next) {
    store = {
        ...store,
        ...next
    };
    listeners.forEach((l)=>l(store));
}
function readLastSeen() {
    try {
        const raw = window.localStorage.getItem('cce.notifications.lastSeenAt');
        return raw ? Number(raw) : 0;
    } catch  {
        return 0;
    }
}
function writeLastSeen(ts) {
    try {
        window.localStorage.setItem('cce.notifications.lastSeenAt', String(ts));
    } catch  {
    /* ignore */ }
}
async function pollOnce(userUuid, limit, snackbarSeverities) {
    setStore({
        loading: true
    });
    try {
        const items = await fetchAlerts(userUuid, limit);
        // Sort newest first (defensive — REST usually returns this order already).
        items.sort((a, b)=>+new Date(b.createdAt) - +new Date(a.createdAt));
        // Overlay client-side read-state.
        const overlaid = items.map((it)=>readUuids.has(it.uuid) ? {
                ...it,
                read: true
            } : it);
        // Compute deltas: items unseen + unread + matching configured snackbar
        // severities. Items with no severity are treated as INFO so that
        // adaptors which omit the field still trigger a toast (when INFO is
        // included in `snackbarSeverities`, which is the default).
        if (firstPollDone) {
            const newOnes = overlaid.filter((it)=>{
                if (it.read) return false;
                if (+new Date(it.createdAt) <= lastSeenAt) return false;
                const sev = it.payload.severity ?? 'INFO';
                return snackbarSeverities.includes(sev);
            });
            newOnes.forEach((it)=>fireSnackbar(it));
        }
        firstPollDone = true;
        setStore({
            items: overlaid,
            loading: false,
            error: null,
            lastPolledAt: Date.now()
        });
    } catch (e) {
        setStore({
            loading: false,
            error: e?.message ?? String(e)
        });
    }
}
function fireSnackbar(item) {
    toastListeners.forEach((l)=>l(item));
}
const toastListeners = new Set();
function subscribeToasts(l) {
    toastListeners.add(l);
    return ()=>{
        toastListeners.delete(l);
    };
}
function markReadLocally(uuid) {
    readUuids.add(uuid);
    writeReadSet();
    setStore({
        items: store.items.map((i)=>i.uuid === uuid ? {
                ...i,
                read: true
            } : i)
    });
}
function severityToCarbonKind(sev) {
    if (sev === 'CRITICAL') return 'error';
    if (sev === 'WARNING') return 'warning';
    return 'info';
}

function startPolling(userUuid, intervalMs, hiddenIntervalMs, limit, snackbarSeverities) {
    pollUserUuid = userUuid;
    stopPolling();
    const tick = ()=>{
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
function useNotifications() {
    const session = (0,esm_framework_singleton_.useSession)();
    const config = (0,esm_framework_singleton_.useConfig)();
    const [snapshot, setSnapshot] = (0,consume_shared_module_default_react_singleton_.useState)(store);
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        const l = (s)=>setSnapshot({
                ...s
            });
        listeners.add(l);
        return ()=>{
            listeners.delete(l);
        };
    }, []);
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        const userUuid = session?.user?.uuid;
        if (!userUuid) return;
        startPolling(userUuid, config.pollIntervalMs, config.pollIntervalMsHidden, config.maxItems, config.snackbarSeverities);
        const onVis = ()=>{
            if (!document.hidden && pollUserUuid) {
                // Fast refresh on tab focus.
                void pollOnce(pollUserUuid, config.maxItems, config.snackbarSeverities);
            }
        };
        document.addEventListener('visibilitychange', onVis);
        return ()=>{
            document.removeEventListener('visibilitychange', onVis);
            stopPolling();
        };
    }, [
        session?.user?.uuid,
        config.pollIntervalMs,
        config.pollIntervalMsHidden,
        config.maxItems,
        config.snackbarSeverities
    ]);
    return {
        items: snapshot.items,
        loading: snapshot.loading,
        error: snapshot.error,
        unreadCount: snapshot.items.filter((i)=>!i.read).length,
        refresh: ()=>{
            if (pollUserUuid) void pollOnce(pollUserUuid, config.maxItems, config.snackbarSeverities);
        },
        markRead: async (uuid)=>{
            const item = store.items.find((i)=>i.uuid === uuid);
            if (!item) return;
            // Persist client-side. (REST does not allow updating alertRead.)
            readUuids.add(uuid);
            writeReadSet();
            setStore({
                items: store.items.map((i)=>i.uuid === uuid ? {
                        ...i,
                        read: true
                    } : i)
            });
        },
        markAllRead: ()=>{
            const unread = store.items.filter((i)=>!i.read);
            if (unread.length === 0) return;
            // Persist client-side, like markRead.
            unread.forEach((i)=>readUuids.add(i.uuid));
            writeReadSet();
            setStore({
                items: store.items.map((i)=>i.read ? i : {
                        ...i,
                        read: true
                    })
            });
        },
        acknowledgeAllVisible: ()=>{
            const max = store.items.reduce((m, i)=>Math.max(m, +new Date(i.createdAt)), 0);
            if (max > lastSeenAt) {
                lastSeenAt = max;
                writeLastSeen(max);
            }
        }
    };
}

// EXTERNAL MODULE: consume shared module (default) react-dom@* (singleton)
var consume_shared_module_default_react_dom_singleton_ = __webpack_require__(590);
var consume_shared_module_default_react_dom_singleton_default = /*#__PURE__*/__webpack_require__.n(consume_shared_module_default_react_dom_singleton_);
;// ./src/notifications-snackbar-host.component.tsx

/**
 * Renders top-of-page toast notifications for incoming alerts whose severity
 * is in `snackbarSeverities` (default: ['CRITICAL']).
 *
 * We do NOT use the framework's `showActionableNotification` here because
 * Carbon anchors its snackbar container to the bottom of the viewport, and
 * the container CSS is not part of our package. Instead we mount our own
 * fixed-position portal at the top-right of the screen.
 */ 


const AUTO_DISMISS_MS = 15000;
let toastSeq = 0;
const NotificationsSnackbarHost = ()=>{
    // The polling hook is owned by the bell component which is always mounted
    // alongside us in the top nav. We just listen for toast events.
    const [toasts, setToasts] = (0,consume_shared_module_default_react_singleton_.useState)([]);
    const dismiss = (0,consume_shared_module_default_react_singleton_.useCallback)((id)=>{
        setToasts((prev)=>prev.filter((t)=>t.id !== id));
    }, []);
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        const unsub = subscribeToasts((item)=>{
            const id = ++toastSeq;
            setToasts((prev)=>[
                    ...prev,
                    {
                        id,
                        item
                    }
                ]);
            window.setTimeout(()=>dismiss(id), AUTO_DISMISS_MS);
        });
        return unsub;
    }, [
        dismiss
    ]);
    if (toasts.length === 0) return /*#__PURE__*/ (0,jsx_runtime.jsx)(ToastStyles, {});
    // Portal into <body> so we escape any clipping from app shell containers.
    return /*#__PURE__*/ consume_shared_module_default_react_dom_singleton_default().createPortal(/*#__PURE__*/ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)(ToastStyles, {}),
            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                className: "cce-toasts",
                children: toasts.map((t)=>/*#__PURE__*/ (0,jsx_runtime.jsx)(ToastCard, {
                        item: t.item,
                        onDismiss: ()=>dismiss(t.id)
                    }, t.id))
            })
        ]
    }), document.body);
};
const ToastCard = ({ item, onDismiss })=>{
    const sev = item.payload.severity;
    const kindClass = severityClass(sev);
    const handleOpen = ()=>{
        markReadLocally(item.uuid);
        onDismiss();
        if (item.payload.link) window.location.assign(item.payload.link);
    };
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
        role: "alert",
        className: `cce-toast ${kindClass}`,
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                className: "cce-toast__bar"
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                className: "cce-toast__body",
                children: [
                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                        className: "cce-toast__title",
                        children: item.payload.title
                    }),
                    item.payload.body && /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                        className: "cce-toast__sub",
                        children: item.payload.body
                    })
                ]
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                className: "cce-toast__actions",
                children: [
                    item.payload.link && /*#__PURE__*/ (0,jsx_runtime.jsx)("button", {
                        type: "button",
                        className: "cce-toast__open",
                        onClick: handleOpen,
                        children: "Open"
                    }),
                    /*#__PURE__*/ (0,jsx_runtime.jsx)("button", {
                        type: "button",
                        "aria-label": "Dismiss",
                        className: "cce-toast__close",
                        onClick: onDismiss,
                        children: "×"
                    })
                ]
            })
        ]
    });
};
function severityClass(sev) {
    if (sev === 'CRITICAL') return 'is-critical';
    if (sev === 'WARNING') return 'is-warning';
    return 'is-info';
}
const ToastStyles = ()=>/*#__PURE__*/ (0,jsx_runtime.jsx)("style", {
        children: `
    .cce-toasts {
      position: fixed;
      top: 3.25rem; /* just below the OpenMRS top nav (3rem) */
      right: 1rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 24rem;
      pointer-events: none;
    }
    .cce-toast {
      pointer-events: auto;
      display: flex;
      align-items: stretch;
      background: #ffffff;
      color: #161616;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      border: 1px solid #e0e0e0;
      animation: cce-toast-in 180ms ease-out;
      min-height: 3rem;
    }
    @keyframes cce-toast-in {
      from { transform: translateY(-8px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .cce-toast__bar { width: 4px; flex-shrink: 0; }
    .cce-toast.is-critical .cce-toast__bar { background: #da1e28; }
    .cce-toast.is-warning  .cce-toast__bar { background: #f1c21b; }
    .cce-toast.is-info     .cce-toast__bar { background: #0f62fe; }
    .cce-toast__body {
      flex: 1;
      padding: 0.625rem 0.75rem;
      min-width: 0;
    }
    .cce-toast__title { font-weight: 600; font-size: 0.875rem; line-height: 1.2; }
    .cce-toast__sub   { font-size: 0.75rem; color: #393939; margin-top: 0.25rem; line-height: 1.3; }
    .cce-toast__actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0 0.5rem;
    }
    .cce-toast__open {
      background: transparent;
      border: 0;
      color: #0f62fe;
      font-weight: 600;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
    }
    .cce-toast__open:hover { text-decoration: underline; }
    .cce-toast__close {
      background: transparent;
      border: 0;
      cursor: pointer;
      font-size: 1.25rem;
      line-height: 1;
      width: 1.5rem;
      height: 1.5rem;
      color: #525252;
    }
    .cce-toast__close:hover { color: #161616; }
  `
    });
/* harmony default export */ const notifications_snackbar_host_component = (NotificationsSnackbarHost);

;// ./src/notifications-bell.component.tsx

/**
 * Bell icon + dropdown panel for the OpenMRS top navigation.
 *
 * Visually matches the sibling Carbon HeaderGlobalAction icons (Search,
 * Wrench, AddPerson, User, AppSwitcher) by reusing Carbon's classes.
 * Uses an SVG bell glyph rendered with `currentColor` so it inherits the
 * white-on-teal nav theme.
 */ 




const NotificationsBell = ()=>{
    const { t } = (0,consume_shared_module_default_react_i18next_singleton_.useTranslation)();
    const { items, unreadCount, markRead, markAllRead, acknowledgeAllVisible } = useNotifications();
    const [open, setOpen] = (0,consume_shared_module_default_react_singleton_.useState)(false);
    const wrapperRef = (0,consume_shared_module_default_react_singleton_.useRef)(null);
    // Close on outside click.
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        if (!open) return;
        const onDoc = (e)=>{
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return ()=>document.removeEventListener('mousedown', onDoc);
    }, [
        open
    ]);
    const togglePanel = (0,consume_shared_module_default_react_singleton_.useCallback)(()=>{
        setOpen((prev)=>{
            const next = !prev;
            if (next) acknowledgeAllVisible();
            return next;
        });
    }, [
        acknowledgeAllVisible
    ]);
    const handleItemClick = (0,consume_shared_module_default_react_singleton_.useCallback)(async (item)=>{
        setOpen(false);
        await markRead(item.uuid);
        if (item.payload.link) {
            window.location.assign(item.payload.link);
        }
    }, [
        markRead
    ]);
    const badgeText = (0,consume_shared_module_default_react_singleton_.useMemo)(()=>unreadCount > 99 ? '99+' : String(unreadCount), [
        unreadCount
    ]);
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
        ref: wrapperRef,
        className: "cce-notif-wrap",
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)(notifications_snackbar_host_component, {}),
            /*#__PURE__*/ (0,jsx_runtime.jsxs)("button", {
                type: "button",
                onClick: togglePanel,
                title: t('notifications.bell.tooltip', 'Notifications'),
                "aria-label": t('notifications.bell.tooltip', 'Notifications'),
                "aria-expanded": open,
                className: `cce-notif-btn${open ? ' is-open' : ''}`,
                children: [
                    /*#__PURE__*/ (0,jsx_runtime.jsx)(BellIcon, {}),
                    unreadCount > 0 && /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                        "aria-hidden": "true",
                        className: "cce-notif-badge",
                        children: badgeText
                    })
                ]
            }),
            open && /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                role: "dialog",
                "aria-label": t('notifications.panel.title', 'Notifications'),
                className: "cce-notif-panel",
                children: [
                    /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "cce-notif-panel__header",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                children: t('notifications.panel.title', 'Notifications')
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("button", {
                                type: "button",
                                className: "cce-notif-panel__mark-all",
                                onClick: markAllRead,
                                disabled: unreadCount === 0,
                                children: t('notifications.panel.markAllRead', 'Mark all as read')
                            })
                        ]
                    }),
                    items.length === 0 && /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                        className: "cce-notif-panel__empty",
                        children: t('notifications.panel.empty', 'No notifications')
                    }),
                    items.map((it)=>/*#__PURE__*/ (0,jsx_runtime.jsx)(NotificationRow, {
                            item: it,
                            onClick: handleItemClick
                        }, it.uuid))
                ]
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)(BellStyles, {})
        ]
    });
};
const NotificationRow = ({ item, onClick })=>{
    const { t } = (0,consume_shared_module_default_react_i18next_singleton_.useTranslation)();
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)("button", {
        type: "button",
        onClick: ()=>onClick(item),
        className: `cce-notif-row ${item.read ? 'is-read' : ''}`,
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                className: "cce-notif-row__meta",
                children: [
                    /*#__PURE__*/ (0,jsx_runtime.jsx)(SeverityTag, {
                        severity: item.payload.severity,
                        t: t
                    }),
                    /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                        className: "cce-notif-row__time",
                        children: formatRelative(item.createdAt)
                    })
                ]
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                className: "cce-notif-row__title",
                children: item.payload.title
            }),
            item.payload.body && /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                className: "cce-notif-row__body",
                children: item.payload.body
            })
        ]
    });
};
const SeverityTag = ({ severity, t })=>{
    if (severity === 'CRITICAL') return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
        type: "red",
        children: t('notifications.severity.critical', 'Critical')
    });
    if (severity === 'WARNING') return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
        type: "warm-gray",
        children: t('notifications.severity.warning', 'Warning')
    });
    return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
        type: "cool-gray",
        children: t('notifications.severity.info', 'Info')
    });
};
function formatRelative(iso) {
    const ts = new Date(iso).getTime();
    if (!Number.isFinite(ts)) return iso;
    const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return new Date(iso).toLocaleString();
}
const BellIcon = ()=>// 20px to match Carbon HeaderGlobalAction icons (Search/Wrench/User).
    /*#__PURE__*/ (0,jsx_runtime.jsx)("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 32 32",
        fill: "currentColor",
        "aria-hidden": "true",
        children: /*#__PURE__*/ (0,jsx_runtime.jsx)("path", {
            d: "M28 21.41L26.59 20H26V13a10 10 0 0 0-9-9.95V1h-2v2.05A10 10 0 0 0 6 13v7h-.59L4 21.41V24h9v.32a3.51 3.51 0 0 0 3 3.66 3.5 3.5 0 0 0 4-3.48V24h8zm-12 4.57a1.5 1.5 0 0 1-1.45-1.66V24h3v.41a1.51 1.51 0 0 1-1.55 1.57zM24 22H8v-.59L9.41 20h13.18L24 21.41zM24 18H8v-5a8 8 0 0 1 16 0z"
        })
    });
// Inline stylesheet — keeps the package self-contained without an SCSS pipeline.
const BellStyles = ()=>/*#__PURE__*/ (0,jsx_runtime.jsx)("style", {
        children: `
    .cce-notif-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      height: 3rem;
    }
    .cce-notif-btn {
      /* Match the OpenMRS top-nav action icons: 3rem square, transparent, white,
         no borders. Use !important to defeat any host "button {}" resets. */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      padding: 0;
      margin: 0;
      border: 0 !important;
      outline: none;
      background: transparent !important;
      color: #ffffff;
      cursor: pointer;
      position: relative;
      box-shadow: none;
      -webkit-appearance: none;
      appearance: none;
      transition: background-color 70ms ease;
    }
    .cce-notif-btn:hover { background: rgba(255, 255, 255, 0.1) !important; }
    .cce-notif-btn.is-open { background: rgba(255, 255, 255, 0.16) !important; }
    .cce-notif-btn:focus { outline: 2px solid #ffffff; outline-offset: -2px; }
    .cce-notif-btn:focus:not(:focus-visible) { outline: none; }
    .cce-notif-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      min-width: 1rem;
      height: 1rem;
      padding: 0 0.25rem;
      border-radius: 0.5rem;
      background: #da1e28;
      color: #fff;
      font-size: 0.625rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      pointer-events: none;
    }
    .cce-notif-panel {
      position: absolute;
      top: 3rem;
      right: 0;
      width: 22rem;
      max-height: 32rem;
      overflow-y: auto;
      background: #fff;
      color: #161616;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      z-index: 9999;
      border: 1px solid #e0e0e0;
    }
    .cce-notif-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e0e0e0;
      font-weight: 600;
    }
    .cce-notif-panel__mark-all {
      background: none;
      border: 0;
      padding: 0;
      color: #0f62fe;
      font-size: 0.875rem;
      cursor: pointer;
    }
    .cce-notif-panel__mark-all:hover:not(:disabled) { text-decoration: underline; }
    .cce-notif-panel__mark-all:disabled { color: #a8a8a8; cursor: default; }
    .cce-notif-panel__empty {
      padding: 1rem;
      color: #525252;
    }
    .cce-notif-row {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.75rem 1rem;
      border: 0;
      border-bottom: 1px solid #f4f4f4;
      background: #f4f4f4;
      cursor: pointer;
    }
    .cce-notif-row.is-read { background: #fff; }
    .cce-notif-row:hover { background: #e8e8e8; }
    .cce-notif-row__meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }
    .cce-notif-row__time { font-size: 0.75rem; color: #525252; }
    .cce-notif-row__title { font-weight: 600; font-size: 0.875rem; }
    .cce-notif-row__body { font-size: 0.75rem; color: #393939; margin-top: 0.25rem; }
  `
    });
/* harmony default export */ const notifications_bell_component = (NotificationsBell);

;// ./src/index.ts
/**
 * @openmrs/esm-notifications-app
 *
 * Top-nav bell + dropdown that polls /ws/rest/v1/alert and surfaces
 * notifications produced by the receiver-adaptor (CCE → adaptor → OpenMRS).
 *
 * No backend module required: uses the legacy OpenMRS Alert REST resource.
 */ 



const moduleName = '@openmrs/esm-notifications-app';
const options = {
    featureName: 'cce-notifications',
    moduleName
};
const importTranslation = __webpack_require__(767);
function startupApp() {
    (0,esm_framework_singleton_.defineConfigSchema)(moduleName, configSchema);
}
const notificationsBell = (0,esm_framework_singleton_.getSyncLifecycle)(notifications_bell_component, options);
const notificationsSnackbarHost = (0,esm_framework_singleton_.getSyncLifecycle)(notifications_snackbar_host_component, options);


/***/ },

/***/ 767
(module, __unused_webpack_exports, __webpack_require__) {

var map = {
	"./en.json": [
		300,
		[
			300
		]
	]
};
function webpackAsyncContext(req) {
	try {
		if(!__webpack_require__.o(map, req)) {
			return Promise.resolve().then(() => {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
});
		}
	} catch(err) {
		return Promise.reject(err);
	}

	var ids = map[req], id = ids[0];
	return __webpack_require__.e(ids[1][0]).then(() => (__webpack_require__(id)));
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = 767;
module.exports = webpackAsyncContext;

/***/ }

}]);
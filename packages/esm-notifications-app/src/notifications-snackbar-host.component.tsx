/**
 * Renders top-of-page toast notifications for incoming alerts whose severity
 * is in `snackbarSeverities` (default: ['CRITICAL']).
 *
 * We do NOT use the framework's `showActionableNotification` here because
 * Carbon anchors its snackbar container to the bottom of the viewport, and
 * the container CSS is not part of our package. Instead we mount our own
 * fixed-position portal at the top-right of the screen.
 */

import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { subscribeToasts, markReadLocally } from './use-notifications.hook';
import type { NotificationItem, NotificationSeverity } from './types';

const AUTO_DISMISS_MS = 15000;

interface ActiveToast {
  id: number;
  item: NotificationItem;
}

let toastSeq = 0;

const NotificationsSnackbarHost: React.FC = () => {
  // The polling hook is owned by the bell component which is always mounted
  // alongside us in the top nav. We just listen for toast events.
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const unsub = subscribeToasts((item) => {
      const id = ++toastSeq;
      setToasts((prev) => [...prev, { id, item }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    });
    return unsub;
  }, [dismiss]);

  if (toasts.length === 0) return <ToastStyles />;

  // Portal into <body> so we escape any clipping from app shell containers.
  return ReactDOM.createPortal(
    <>
      <ToastStyles />
      <div className="cce-toasts">
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t.item} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </>,
    document.body,
  );
};

const ToastCard: React.FC<{ item: NotificationItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  const sev = item.payload.severity;
  const kindClass = severityClass(sev);
  const handleOpen = () => {
    markReadLocally(item.uuid);
    onDismiss();
    if (item.payload.link) window.location.assign(item.payload.link);
  };
  return (
    <div role="alert" className={`cce-toast ${kindClass}`}>
      <div className="cce-toast__bar" />
      <div className="cce-toast__body">
        <div className="cce-toast__title">{item.payload.title}</div>
        {item.payload.body && <div className="cce-toast__sub">{item.payload.body}</div>}
      </div>
      <div className="cce-toast__actions">
        {item.payload.link && (
          <button type="button" className="cce-toast__open" onClick={handleOpen}>
            Open
          </button>
        )}
        <button type="button" aria-label="Dismiss" className="cce-toast__close" onClick={onDismiss}>
          ×
        </button>
      </div>
    </div>
  );
};

function severityClass(sev?: NotificationSeverity): string {
  if (sev === 'CRITICAL') return 'is-critical';
  if (sev === 'WARNING') return 'is-warning';
  return 'is-info';
}

const ToastStyles: React.FC = () => (
  <style>{`
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
  `}</style>
);

export default NotificationsSnackbarHost;

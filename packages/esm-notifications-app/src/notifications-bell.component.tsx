/**
 * Bell icon + dropdown panel for the OpenMRS top navigation.
 *
 * Visually matches the sibling Carbon HeaderGlobalAction icons (Search,
 * Wrench, AddPerson, User, AppSwitcher) by reusing Carbon's classes.
 * Uses an SVG bell glyph rendered with `currentColor` so it inherits the
 * white-on-teal nav theme.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from '@carbon/react';
import { useNotifications } from './use-notifications.hook';
import NotificationsSnackbarHost from './notifications-snackbar-host.component';
import type { NotificationItem, NotificationSeverity } from './types';

const NotificationsBell: React.FC = () => {
  const { t } = useTranslation();
  const { items, unreadCount, markRead, acknowledgeAllVisible } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const togglePanel = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) acknowledgeAllVisible();
      return next;
    });
  }, [acknowledgeAllVisible]);

  const handleItemClick = useCallback(
    async (item: NotificationItem) => {
      setOpen(false);
      await markRead(item.uuid);
      if (item.payload.link) {
        window.location.assign(item.payload.link);
      }
    },
    [markRead],
  );

  const badgeText = useMemo(() => (unreadCount > 99 ? '99+' : String(unreadCount)), [unreadCount]);

  return (
    <div ref={wrapperRef} className="cce-notif-wrap">
      {/* Toast host renders alongside the bell so it doesn't depend on a
          separate extension slot — the OpenMRS app shell does not expose
          a stable global mount point in this build. */}
      <NotificationsSnackbarHost />
      <button
        type="button"
        onClick={togglePanel}
        title={t('notifications.bell.tooltip', 'Notifications')}
        aria-label={t('notifications.bell.tooltip', 'Notifications')}
        aria-expanded={open}
        className={`cce-notif-btn${open ? ' is-open' : ''}`}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span aria-hidden="true" className="cce-notif-badge">
            {badgeText}
          </span>
        )}
      </button>
      {open && (
        <div role="dialog" aria-label={t('notifications.panel.title', 'Notifications')} className="cce-notif-panel">
          <div className="cce-notif-panel__header">{t('notifications.panel.title', 'Notifications')}</div>
          {items.length === 0 && (
            <div className="cce-notif-panel__empty">{t('notifications.panel.empty', 'No notifications')}</div>
          )}
          {items.map((it) => (
            <NotificationRow key={it.uuid} item={it} onClick={handleItemClick} />
          ))}
        </div>
      )}
      <BellStyles />
    </div>
  );
};

const NotificationRow: React.FC<{ item: NotificationItem; onClick: (i: NotificationItem) => void }> = ({
  item,
  onClick,
}) => {
  const { t } = useTranslation();
  return (
    <button type="button" onClick={() => onClick(item)} className={`cce-notif-row ${item.read ? 'is-read' : ''}`}>
      <div className="cce-notif-row__meta">
        <SeverityTag severity={item.payload.severity} t={t} />
        <span className="cce-notif-row__time">{formatRelative(item.createdAt)}</span>
      </div>
      <div className="cce-notif-row__title">{item.payload.title}</div>
      {item.payload.body && <div className="cce-notif-row__body">{item.payload.body}</div>}
    </button>
  );
};

const SeverityTag: React.FC<{ severity?: NotificationSeverity; t: (k: string, d: string) => string }> = ({
  severity,
  t,
}) => {
  if (severity === 'CRITICAL') return <Tag type="red">{t('notifications.severity.critical', 'Critical')}</Tag>;
  if (severity === 'WARNING') return <Tag type="warm-gray">{t('notifications.severity.warning', 'Warning')}</Tag>;
  return <Tag type="cool-gray">{t('notifications.severity.info', 'Info')}</Tag>;
};

function formatRelative(iso: string): string {
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return iso;
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return new Date(iso).toLocaleString();
}

const BellIcon: React.FC = () => (
  // 20px to match Carbon HeaderGlobalAction icons (Search/Wrench/User).
  <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M28 21.41L26.59 20H26V13a10 10 0 0 0-9-9.95V1h-2v2.05A10 10 0 0 0 6 13v7h-.59L4 21.41V24h9v.32a3.51 3.51 0 0 0 3 3.66 3.5 3.5 0 0 0 4-3.48V24h8zm-12 4.57a1.5 1.5 0 0 1-1.45-1.66V24h3v.41a1.51 1.51 0 0 1-1.55 1.57zM24 22H8v-.59L9.41 20h13.18L24 21.41zM24 18H8v-5a8 8 0 0 1 16 0z" />
  </svg>
);

// Inline stylesheet — keeps the package self-contained without an SCSS pipeline.
const BellStyles: React.FC = () => (
  <style>{`
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
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e0e0e0;
      font-weight: 600;
    }
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
  `}</style>
);

export default NotificationsBell;

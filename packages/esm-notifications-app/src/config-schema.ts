import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  pollIntervalMs: {
    _type: Type.Number,
    _description: 'How often to poll /ws/rest/v1/alert when the tab is visible (ms).',
    _default: 15_000,
  },
  pollIntervalMsHidden: {
    _type: Type.Number,
    _description: 'How often to poll when the tab is hidden (ms).',
    _default: 300_000,
  },
  maxItems: {
    _type: Type.Number,
    _description: 'Maximum number of alerts to fetch per poll.',
    _default: 50,
  },
  snackbarSeverities: {
    _type: Type.Array,
    _description:
      'Severities that fire a top-right toast popup. Use ["INFO","WARNING","CRITICAL"] (default) for every notification, or restrict to e.g. ["CRITICAL"].',
    _default: ['INFO', 'WARNING', 'CRITICAL'],
  },
};

export interface NotificationsConfig {
  pollIntervalMs: number;
  pollIntervalMsHidden: number;
  maxItems: number;
  snackbarSeverities: Array<'INFO' | 'WARNING' | 'CRITICAL'>;
}

/**
 * @openmrs/esm-notifications-app
 *
 * Top-nav bell + dropdown that polls /ws/rest/v1/alert and surfaces
 * notifications produced by the receiver-adaptor (CCE → adaptor → OpenMRS).
 *
 * No backend module required: uses the legacy OpenMRS Alert REST resource.
 */

import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import NotificationsBell from './notifications-bell.component';
import NotificationsSnackbarHost from './notifications-snackbar-host.component';

const moduleName = '@openmrs/esm-notifications-app';

const options = {
  featureName: 'cce-notifications',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const notificationsBell = getSyncLifecycle(NotificationsBell, options);
export const notificationsSnackbarHost = getSyncLifecycle(NotificationsSnackbarHost, options);

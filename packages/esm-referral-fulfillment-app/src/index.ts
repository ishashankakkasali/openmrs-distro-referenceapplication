/**
 * @openmrs/esm-referral-fulfillment-app
 *
 * Adds a "Record referral response" overflow-menu action to every Referral order
 * row in the patient-chart Orders widget. Clicking it launches the Referral
 * Response form workspace pre-bound to the clicked order, and on save closes the
 * order via POST /order/{uuid}/fulfillerdetails.
 */

import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import RecordReferralResponseAction from './record-referral-response.component';
import ReferralsDashboardLink from './dashboard-link.component';
import ReferralsDashboard from './referrals-dashboard.component';

const moduleName = '@openmrs/esm-referral-fulfillment-app';

const options = {
  featureName: 'referral-fulfillment',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const recordReferralResponseAction = getSyncLifecycle(
  RecordReferralResponseAction,
  options,
);

export const referralsDashboardLink = getSyncLifecycle(ReferralsDashboardLink, options);
export const referralsDashboard = getSyncLifecycle(ReferralsDashboard, options);

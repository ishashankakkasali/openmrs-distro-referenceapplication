import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { launchWorkspace, useConfig } from '@openmrs/esm-framework';
import { closeReferralOrder } from './close-referral-order';
import type { ReferralFulfillmentConfig } from './config-schema';

interface OrderItem {
  uuid: string;
  orderNumber?: string;
  type?: string;
  fulfillerStatus?: string | null;
  orderType?: { uuid?: string; name?: string };
}

interface RecordReferralResponseProps {
  // The dynamic slot in esm-patient-orders-app passes `state.orderItem`
  // (chunk 375.js: state:{ className, orderItem:i, responsiveSize }).
  order?: OrderItem;
  orderItem?: OrderItem;
}

const RecordReferralResponseAction: React.FC<RecordReferralResponseProps> = (props) => {
  const { t } = useTranslation();
  const config = useConfig<ReferralFulfillmentConfig>();
  const order = props.order ?? props.orderItem;

  // DEBUG: log entire props shape to discover what the slot actually passes
  // eslint-disable-next-line no-console
  console.log('[esm-referral-fulfillment] slot props =', props);

  // The slot we attach to (`order-detail-slot`) renders for every generic
  // Order (type === 'order'). Filter to only the Referral OrderType so we
  // don't pollute other order detail panels.
  const isReferral = order?.orderType?.uuid === config.orderTypeUuid;

  const handleClick = useCallback(() => {
    if (!order?.uuid) {
      console.warn('[esm-referral-fulfillment] No order context available; aborting');
      return;
    }

    launchWorkspace('patient-form-entry-workspace', {
      workspaceTitle: t('referralResponseTitle', 'Referral response — {{orderNumber}}', {
        orderNumber: order.orderNumber ?? order.uuid.slice(0, 8),
      }),
      mutateForm: () => {},
      formInfo: {
        formUuid: config.formUuid,
        encounterUuid: '',
        additionalProps: {
          orderUuid: order.uuid,
          orderNumber: order.orderNumber ?? '',
          orderInstructions: (order as any).instructions ?? '',
          orderAccessionNumber: (order as any).accessionNumber ?? '',
          orderUrgency: (order as any).urgency ?? '',
          orderConceptDisplay: (order as any).concept?.display ?? '',
        },
      },
      // Fired by the workspace framework when the user closes the workspace
      // after a successful save. The form-engine triggers `onSubmit` first;
      // we hook the workspace close to drive the order state change.
      closeWorkspaceWithSavedChanges: () => {
        void closeReferralOrder({
          orderUuid: order.uuid,
          comment: config.fulfillerComment,
        });
      },
    } as any);
  }, [order, config, t]);

  // Hide unless this is a Referral order that is not yet completed
  if (!isReferral || order?.fulfillerStatus === 'COMPLETED') {
    return null;
  }

  return (
    <div style={{ padding: '0.5rem 1rem' }}>
      <Button kind="tertiary" size="sm" onClick={handleClick}>
        {t('recordReferralResponse', 'Record referral response')}
      </Button>
    </div>
  );
};

export default RecordReferralResponseAction;

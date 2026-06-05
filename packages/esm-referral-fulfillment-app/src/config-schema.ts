import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  formUuid: {
    _type: Type.UUID,
    _description: 'UUID of the Referral Response form',
    _default: '2dcc7696-66b4-42fd-95c0-50603e0e2f4e',
  },
  orderTypeUuid: {
    _type: Type.UUID,
    _description: 'UUID of the Referral OrderType. Used to filter which order rows show the action.',
    _default: '778a9dc6-87d9-49c1-83d9-caa01041a8ad',
  },
  fulfillerComment: {
    _type: Type.String,
    _description: 'Comment recorded on the order when it is closed.',
    _default: 'Closed by Referral Response form',
  },
  encounterTypeUuid: {
    _type: Type.UUID,
    _description: 'UUID of the Referral Response encounter type. Used by the polling fallback to detect form save.',
    _default: '479e4805-90d9-44f5-b252-333d8a687e52',
  },
};

export interface ReferralFulfillmentConfig {
  formUuid: string;
  orderTypeUuid: string;
  fulfillerComment: string;
  encounterTypeUuid: string;
}

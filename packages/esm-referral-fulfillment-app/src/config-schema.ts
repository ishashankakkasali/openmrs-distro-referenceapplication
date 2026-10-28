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
  responseNotesConceptUuid: {
    _type: Type.UUID,
    _description:
      'Concept of the Referral Response form\'s "Clinical notes / addendum to send back to source" answer, shown as ' +
      'the Clinical notes of a referral in once it is answered.',
    _default: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  referralInEncounterTypeUuid: {
    _type: Type.UUID,
    _description:
      'UUID of the Referral In encounter type. The receiver adaptor files every inbound referral under it, so a ' +
      'Referral order in this encounter type is shown as "In"; any other Referral order is shown as "Out". ' +
      'Same rule the emitter uses for the referral-direction category.',
    _default: 'de0f5558-9813-4fa3-8613-467015f9fabd',
  },
  referralOutEncounterTypeUuid: {
    _type: Type.UUID,
    _description: 'UUID of the Referral Out encounter type, created for each outbound referral raised here.',
    _default: '7b3f4e2a-9c1d-4e8b-a6f0-2d5c8e1b9a47',
  },
  referralOutOrderablesConceptSetUuid: {
    _type: Type.UUID,
    _description: 'UUID of the concept set whose members can be chosen as the referral out (e.g. Referral to PHC).',
    _default: '3c1a7c1e-5a1d-4a52-9d55-4548a1c00003',
  },
  careSettingUuid: {
    _type: Type.UUID,
    _description: 'UUID of the care setting for referral out orders.',
    _default: '6f0c9a92-6f24-11e3-af88-005056821db0',
  },
  referralDestinationLocationTag: {
    _type: Type.String,
    _description: 'Location tag of the facilities offered as the destination of a referral out.',
    _default: 'Referral Destination',
  },
  referralDestinationConceptUuid: {
    _type: Type.UUID,
    _description:
      'Text concept recorded on the Referral Out encounter holding the destination location uuid; the emitter ' +
      'reads it to send the destination as ServiceRequest.performer.',
    _default: '5f8a2c6e-3b9d-4e1f-a7c4-0d6e9b2a8f15',
  },
  referralOutReferencePrefix: {
    _type: Type.String,
    _description: 'Prefix of the reference number generated for each referral out (e.g. RO-20261023-K7Q2).',
    _default: 'RO',
  },
  clinicianEncounterRoleUuid: {
    _type: Type.UUID,
    _description: 'UUID of the encounter role recorded for the provider raising a referral out.',
    _default: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
  },
};

export interface ReferralFulfillmentConfig {
  formUuid: string;
  orderTypeUuid: string;
  fulfillerComment: string;
  encounterTypeUuid: string;
  responseNotesConceptUuid: string;
  referralInEncounterTypeUuid: string;
  referralOutEncounterTypeUuid: string;
  referralOutOrderablesConceptSetUuid: string;
  careSettingUuid: string;
  referralDestinationLocationTag: string;
  referralDestinationConceptUuid: string;
  referralOutReferencePrefix: string;
  clinicianEncounterRoleUuid: string;
}

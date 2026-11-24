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
  imaging: {
    _description:
      'Imaging page on the home screen: imaging orders (e.g. the ECG ordered from the Referral Response form), ' +
      'upload of the result, the AI read and the STEMI assessment. Metadata: scripts/imaging-orders-o3-setup.sh.',
    imagingOrderTypeUuid: {
      _type: Type.UUID,
      _description: 'Imaging Order order type listed on the Imaging page.',
      _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e01',
    },
    ecgConceptUuids: {
      _type: Type.Array,
      _elements: { _type: Type.ConceptUuid },
      _description: 'Concepts treated as an ECG: the result gets the AI read and the STEMI assessment.',
      _default: ['5333e05c-de05-4719-87a1-31d1f3d48023', '161157AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
    },
    reviewConceptUuids: {
      _description:
        'Concepts of the "Imaging review" result saved by Complete review: an obs group (set) of three text members, ' +
        'linked to the order so the chart\'s Orders widget lists them as the order\'s result.',
      set: { _type: Type.ConceptUuid, _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e03' },
      finding: { _type: Type.ConceptUuid, _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e04' },
      diagnosis: { _type: Type.ConceptUuid, _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e05' },
      plan: { _type: Type.ConceptUuid, _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e06' },
    },
    ecgAiInterpretation: {
      _type: Type.String,
      _description: 'Demo AI interpretation, shown when the ecgai backend module is not configured (no API key).',
      _default:
        'ST elevation in V1–V4, greatest in V2–V3, with reciprocal ST depression in III and aVF. Suggestive of ' +
        'acute anterior STEMI. Sinus rhythm, 92/min. Normal PR and QRS; no conduction block.',
    },
    ecgAiFinding: {
      _type: Type.String,
      _description: 'Demo short AI finding (pathway facts, saved finding) when the ecgai backend module is not configured.',
      _default: 'ST elevation V1–V4',
    },
    suggestedDiagnosis: {
      _type: Type.String,
      _description: 'Demo suggested working diagnosis when the ecgai backend module is not configured.',
      _default: 'Suspected acute anterior STEMI (AI read)',
    },
    aiRead: {
      _description:
        'AI read of an uploaded ECG by the ecgai OpenMRS module (modules/ecgai, /ws/rest/v1/ecgai), which sends the ' +
        'ECG to the configured LLM and saves the result on the order. Without an API key on the backend the page ' +
        'shows the demo read (ecgAiInterpretation, ecgAiFinding, suggestedDiagnosis).',
      enabled: { _type: Type.Boolean, _default: true },
      conceptUuid: {
        _type: Type.ConceptUuid,
        _description: '"ECG AI interpretation" observation the ecgai module saves (JSON text).',
        _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e09',
      },
    },
    cardiologist: {
      _description:
        'Hub cardiologist an ECG is sent to for a confirmatory read ("Send to cardiologist"). Hardcoded until the ' +
        'send is connected; shown as "Sent to <name>, <facility>, at … · reply due by …".',
      name: { _type: Type.String, _default: 'Dr S. Ahmed' },
      facility: { _type: Type.String, _default: 'SZMCH' },
      replyDueMinutes: { _type: Type.Number, _default: 10 },
    },
    pciLimitMinutes: {
      _type: Type.Number,
      _description: 'The artery should be opened within this many minutes of the ECG (primary PCI).',
      _default: 120,
    },
    cardiacCentresNote: {
      _type: Type.String,
      _description: 'Where the cardiac centre list comes from, shown above it.',
      _default: 'service register, updated 08:30 today',
    },
    cardiacCentres: {
      _type: Type.Array,
      _elements: {
        _type: Type.Object,
        name: { _type: Type.String },
        distance: { _type: Type.String, _description: 'e.g. "14 km"' },
        travel: { _type: Type.String, _description: 'e.g. "about 30 minutes by ambulance"' },
        cathLab: { _type: Type.String, _description: 'e.g. "cath lab available now, team on call"' },
        arteryOpenedMinutes: { _type: Type.Number, _description: 'Expected minutes from the ECG to the opened artery' },
        recommended: { _type: Type.Boolean, _default: false },
      },
      _description: 'Cardiac centres with a cath lab. Hardcoded until a service register is connected.',
      _default: [
        {
          name: 'Shaheed Ziaur Rahman Medical College Hospital',
          distance: '14 km',
          travel: 'about 30 minutes by ambulance',
          cathLab: 'cath lab available now, team on call',
          arteryOpenedMinutes: 80,
          recommended: true,
        },
        {
          name: 'National Institute of Cardiovascular Diseases, Dhaka',
          distance: 'about 200 km',
          travel: 'about 5 hours by ambulance',
          cathLab: 'cath lab available',
          arteryOpenedMinutes: 350,
          recommended: false,
        },
      ],
    },
    giveNow: {
      _type: Type.Array,
      _elements: { _type: Type.String },
      _description: 'Treatments to give before transfer, ticked as given.',
      _default: [
        'Aspirin 300 mg, chewed',
        'Second antiplatelet drug, per the hub protocol',
        'Heparin, per the hub protocol',
        'Nitrate, only if systolic BP is above 90 and no sildenafil-type drug in the last 48 hours',
        'Oxygen, only if saturation is below 90%',
      ],
    },
  },
};

export interface CardiacCentre {
  name: string;
  distance: string;
  travel: string;
  cathLab: string;
  arteryOpenedMinutes: number;
  recommended?: boolean;
}

export interface ImagingConfig {
  imagingOrderTypeUuid: string;
  ecgConceptUuids: string[];
  reviewConceptUuids: { set: string; finding: string; diagnosis: string; plan: string };
  ecgAiInterpretation: string;
  ecgAiFinding: string;
  suggestedDiagnosis: string;
  aiRead: { enabled: boolean; conceptUuid: string };
  cardiologist: { name: string; facility: string; replyDueMinutes: number };
  pciLimitMinutes: number;
  cardiacCentresNote: string;
  cardiacCentres: CardiacCentre[];
  giveNow: string[];
}

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
  imaging: ImagingConfig;
}

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
  responseForm: {
    _description:
      '"Record referral response" for a referral in opens this page\'s own response form (presenting complaint, ' +
      'vitals, ECG order and result) instead of the O3 form (formUuid). It saves a Referral Response encounter, so ' +
      'the referral closes as before. Metadata: scripts/referral-response-form-o3-setup.sh.',
    enabled: {
      _type: Type.Boolean,
      _description: 'Off: "Record referral response" opens the O3 Referral Response form (formUuid) instead.',
      _default: true,
    },
    chiefComplaintConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'Coded "Chief complaint", saved when the complaint is one of chiefComplaints.',
      _default: '5219AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    chiefComplaintTextConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'Text "Chief complaint", always saved with the complaint as typed or chosen.',
      _default: '160531AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    chiefComplaints: {
      _type: Type.Array,
      _elements: {
        _type: Type.Object,
        label: { _type: Type.String },
        conceptUuid: { _type: Type.ConceptUuid },
        ecgPrompt: {
          _type: Type.String,
          _description: 'chest | abdominal | breath: the ECG prompt this complaint raises; empty for none.',
          _default: '',
        },
      },
      _description: 'The complaints offered in "Chief complaint" (any other text can be typed).',
      _default: [
        { label: 'Chest pain', conceptUuid: '120749AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', ecgPrompt: 'chest' },
        { label: 'Upper abdominal pain', conceptUuid: '141128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', ecgPrompt: 'abdominal' },
        { label: 'Breathlessness on exertion', conceptUuid: '141599AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', ecgPrompt: 'breath' },
        { label: 'Routine NCD review', conceptUuid: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e18', ecgPrompt: '' },
        { label: 'Tooth pain', conceptUuid: '124601AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', ecgPrompt: '' },
        { label: 'Fever', conceptUuid: '140238AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', ecgPrompt: '' },
        { label: 'Cough', conceptUuid: '143264AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', ecgPrompt: '' },
        { label: 'Headache', conceptUuid: '139084AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', ecgPrompt: '' },
      ],
    },
    symptomOnsetConceptUuid: {
      _type: Type.ConceptUuid,
      _description: '"Symptom onset" (Coded): when the symptoms started.',
      _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e11',
    },
    symptomOnsets: {
      _type: Type.Array,
      _elements: {
        _type: Type.Object,
        label: {
          _type: Type.String,
          _description: '"{{time}}" is replaced by the clock time hoursAgo hours before now, to the hour.',
        },
        conceptUuid: { _type: Type.ConceptUuid },
        hoursAgo: { _type: Type.Number, _default: 0 },
      },
      _description: 'The choices in "Symptoms started".',
      _default: [
        { label: 'About 1 hour ago', conceptUuid: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e12', hoursAgo: 0 },
        { label: 'About 4 hours ago, around {{time}}', conceptUuid: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e13', hoursAgo: 4 },
        { label: 'Last night, about 14 hours ago', conceptUuid: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e14', hoursAgo: 0 },
        { label: 'Several days, on and off', conceptUuid: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e16', hoursAgo: 0 },
        { label: 'Weeks, on and off', conceptUuid: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e17', hoursAgo: 0 },
      ],
    },
    defaultSymptomOnsetConceptUuid: {
      _type: Type.ConceptUuid,
      _description: '"Symptoms started" choice selected when the form opens (one of symptomOnsets).',
      _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e13',
    },
    requiredVitals: {
      _type: Type.Array,
      _elements: { _type: Type.String },
      _description:
        'Vitals that must be entered before the response can be saved: any of bp, pulse, spo2, respiratoryRate, ' +
        'temperature. None by default: vitals are optional, but a value that is entered must be valid. The chief complaint and when the symptoms started are always required, and an ECG ' +
        'recommendation must be accepted or dismissed with a reason.',
      _default: [],
    },
    vitalsConceptUuids: {
      _description: 'Vitals concepts: read from this visit (e.g. taken at triage) and saved with the response.',
      systolic: { _type: Type.ConceptUuid, _default: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
      diastolic: { _type: Type.ConceptUuid, _default: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
      pulse: { _type: Type.ConceptUuid, _default: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
      spo2: { _type: Type.ConceptUuid, _default: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
      respiratoryRate: { _type: Type.ConceptUuid, _default: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
      temperature: { _type: Type.ConceptUuid, _default: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
    },
    orderables: {
      _type: Type.Array,
      _elements: {
        _type: Type.Object,
        key: { _type: Type.String, _description: 'Unique key; "ecg" is the order the ECG prompt places.' },
        label: { _type: Type.String },
        conceptUuid: { _type: Type.ConceptUuid },
        orderTypeUuid: {
          _type: Type.UUID,
          _description: 'Imaging Order (result uploaded on the Imaging page) or Test Order (lab).',
        },
      },
      _description: 'The orders offered in "Add an order". Metadata: scripts/referral-response-form-o3-setup.sh.',
      _default: [
        {
          key: 'ecg',
          label: '12-lead ECG',
          conceptUuid: '5333e05c-de05-4719-87a1-31d1f3d48023',
          orderTypeUuid: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e01',
        },
        {
          key: 'troponin',
          label: 'Bedside troponin',
          conceptUuid: 'fb44445b-5638-4ad5-996b-b79fc2f90756',
          orderTypeUuid: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
        },
        {
          key: 'echo',
          label: 'Echo',
          conceptUuid: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e19',
          orderTypeUuid: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e01',
        },
        {
          key: 'glucose',
          label: 'Blood glucose',
          conceptUuid: '887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          orderTypeUuid: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
        },
        {
          key: 'creatinine',
          label: 'Creatinine',
          conceptUuid: '790AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          orderTypeUuid: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
        },
      ],
    },
    ecgDueMinutes: {
      _type: Type.Number,
      _description: 'An ECG for chest pain is due within this many minutes of the order.',
      _default: 10,
    },
    noteConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'Text note saved when the ECG recommendation is dismissed (with the reason).',
      _default: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    riskConditionPattern: {
      _type: Type.String,
      _description:
        'Conditions (case-insensitive regular expression) that, with age 40 or over, make upper abdominal pain ' +
        'raise the ECG prompt. A systolic BP of 140 or more today does too.',
      _default: 'diabet|hypert|tobacco|smok',
    },
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
    pciReferral: {
      _description:
        '"Yes, refer for primary PCI" raises a referral out to the chosen cardiac centre (a Referral order in a ' +
        'Referral Out encounter, like "New referral out"). On the Referrals page that referral offers "Record ' +
        'referral response", which opens the PCI response form. Metadata: scripts/pci-referral-o3-setup.sh.',
      conceptUuid: {
        _type: Type.ConceptUuid,
        _description: 'Concept of the Referral order ("Referral for primary PCI").',
        _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0a',
      },
      responseFormUuid: {
        _type: Type.UUID,
        _description:
          'Form opened by "Record referral response" for a PCI referral ("PCI Referral Response"). It must save a ' +
          'Referral Response encounter (encounterTypeUuid) so the referral is closed when it is saved.',
        _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e10',
      },
      acknowledgeMinutes: {
        _type: Type.Number,
        _description: 'The cardiac centre should acknowledge a PCI referral within this many minutes of it.',
        _default: 15,
      },
      visitTypeUuid: {
        _type: Type.UUID,
        _description:
          'Visit type of the visit started at the cardiac centre when the patient arrives there ("Admit at …"), if the ' +
          'patient has no visit to take the type from.',
        _default: '287463d3-2233-4c69-9851-5841a1f5e109',
      },
      stentProcedureConceptUuid: {
        _type: Type.ConceptUuid,
        _description: 'The response form\'s "Stent procedure" question, shown on the answered referral.',
        _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0b',
      },
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
        locationUuid: {
          _type: Type.UUID,
          _description: 'The centre as an OpenMRS location: the destination recorded on the PCI referral.',
        },
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
          locationUuid: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0e',
        },
        {
          name: 'National Institute of Cardiovascular Diseases, Dhaka',
          distance: 'about 200 km',
          travel: 'about 5 hours by ambulance',
          cathLab: 'cath lab available',
          arteryOpenedMinutes: 350,
          recommended: false,
          locationUuid: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0f',
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
  locationUuid?: string;
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
  pciReferral: { conceptUuid: string; responseFormUuid: string; stentProcedureConceptUuid: string; visitTypeUuid: string;
    acknowledgeMinutes: number;
  };
  pciLimitMinutes: number;
  cardiacCentresNote: string;
  cardiacCentres: CardiacCentre[];
  giveNow: string[];
}

export interface ChiefComplaintOption {
  label: string;
  conceptUuid?: string;
  ecgPrompt?: '' | 'chest' | 'abdominal' | 'breath';
}

export interface SymptomOnsetOption {
  label: string;
  conceptUuid: string;
  hoursAgo?: number;
}

export interface ResponseFormConfig {
  enabled: boolean;
  chiefComplaintConceptUuid: string;
  chiefComplaintTextConceptUuid: string;
  chiefComplaints: ChiefComplaintOption[];
  symptomOnsetConceptUuid: string;
  symptomOnsets: SymptomOnsetOption[];
  defaultSymptomOnsetConceptUuid: string;
  requiredVitals: string[];
  vitalsConceptUuids: {
    systolic: string;
    diastolic: string;
    pulse: string;
    spo2: string;
    respiratoryRate: string;
    temperature: string;
  };
  orderables: Array<{ key: string; label: string; conceptUuid: string; orderTypeUuid: string }>;
  ecgDueMinutes: number;
  noteConceptUuid: string;
  riskConditionPattern: string;
}

export interface ReferralFulfillmentConfig {
  responseForm: ResponseFormConfig;
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

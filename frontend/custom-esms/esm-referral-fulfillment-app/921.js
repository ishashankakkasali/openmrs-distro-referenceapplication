(globalThis["webpackChunk_openmrs_esm_referral_fulfillment_app"] = globalThis["webpackChunk_openmrs_esm_referral_fulfillment_app"] || []).push([[921],{

/***/ 98
(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* Imaging page (home/imaging). Scoped with the img- prefix; colours follow Carbon tokens with fallbacks. */

.img-pad {
  padding: 1rem;
}

.img-field {
  margin-bottom: 1rem;
}

.img-field:last-child {
  margin-bottom: 0;
}

.img-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--cds-text-secondary, #525252);
  margin-bottom: 0.375rem;
}

.img-small {
  font-size: 0.75rem;
  color: var(--cds-text-secondary, #525252);
}

/* Decision-support callouts */

.img-cds {
  border: 1px solid var(--cds-border-subtle-01, #e0e0e0);
  border-left: 3px solid var(--cds-interactive, #0f62fe);
  background: var(--cds-layer-02, #f4f4f4);
  padding: 0.875rem 1rem;
  margin-top: 1rem;
}

.img-cds.img-stop {
  border-color: #ffb3b8;
  border-left-color: var(--cds-support-error, #da1e28);
  background: #fff1f1;
}

.img-cds.img-muted {
  border-left-color: var(--cds-border-strong-01, #8d8d8d);
}

.img-cds.img-plain {
  background: var(--cds-layer-01, #fff);
  border-left-color: var(--cds-border-subtle-01, #e0e0e0);
}

.img-kind {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cds-text-secondary, #525252);
  margin-bottom: 0.375rem;
}

.img-cds-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.375rem;
}

.img-stop .img-cds-title {
  color: #a2191f;
}

.img-cds p {
  font-size: 0.875rem;
  line-height: 1.45;
  margin: 0 0 0.5rem;
}

.img-facts {
  list-style: none;
  padding: 0;
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  color: var(--cds-text-secondary, #525252);
}

.img-facts li::before {
  content: '·';
  margin-right: 0.5rem;
}

.img-actrow {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.img-sub {
  font-size: 0.75rem;
  color: var(--cds-text-secondary, #525252);
  margin-top: 0.125rem;
}

.img-ecg-frame {
  border: 1px solid #f2c4c4;
  background: #fff5f5;
  padding: 0.25rem;
  text-align: center;
}

.img-ecg-frame img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

.img-ecg-frame iframe {
  width: 100%;
  height: 32rem;
  border: 0;
}

/* Cardiac centres */

.img-centre {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: var(--cds-layer-01, #fff);
  border: 1px solid var(--cds-border-subtle-01, #e0e0e0);
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
}

.img-centre.img-chosen {
  border: 1px solid var(--cds-interactive, #0f62fe);
  box-shadow: inset 3px 0 0 var(--cds-interactive, #0f62fe);
}

.img-centre-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.img-centre-meta {
  font-size: 0.8125rem;
  color: var(--cds-text-secondary, #525252);
  margin-top: 0.25rem;
}

.img-centre-side {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.img-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.img-file-input {
  display: none;
}

/* Carbon tags truncate long labels; the AI disclaimer and timing tags must read in full */

.img-result .cds--tag,
.img-imaging .cds--tag {
  max-width: none;
}

.img-result .cds--tag .cds--tag__label,
.img-imaging .cds--tag .cds--tag__label {
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
}

/* selects next to buttons (e.g. "My reading differs") sit inline instead of taking the full row */

.img-actrow .cds--form-item,

.img-actrow .cds--select {
  flex: 0 1 18rem;
  width: auto;
  min-width: 14rem;
}

.img-kind .cds--tag {
  text-transform: none;
  letter-spacing: normal;
}

/* ── Imaging page layout, modelled on the Laboratory page ── */

.img-imaging {
  background: var(--cds-background, #f4f4f4);
  min-height: 100%;
}

.img-imaging-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--cds-layer-01, #fff);
  border-bottom: 1px solid var(--cds-border-subtle-01, #e0e0e0);
}

.img-imaging-icon {
  width: 3rem;
  height: 3rem;
  color: var(--brand-03, #007d79);
}

.img-imaging-location {
  font-size: 1rem;
  color: var(--cds-text-secondary, #525252);
}

.img-imaging-title {
  font-size: 1.75rem;
  font-weight: 400;
  margin: 0.25rem 0 0;
}

.img-tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.img-tile {
  background: var(--cds-layer-01, #fff);
  border: 1px solid var(--cds-border-subtle-01, #e0e0e0);
  padding: 1rem;
}

.img-tile-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.img-tile-label {
  font-size: 0.75rem;
  color: var(--cds-text-secondary, #525252);
}

.img-tile-value {
  font-size: 1.75rem;
  margin-top: 0.25rem;
}


.img-imaging-panel {
  margin: 1rem;
  background: var(--cds-layer-01, #fff);
  border: 1px solid var(--cds-border-subtle-01, #e0e0e0);
}

.img-imaging-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: var(--cds-layer-02, #f4f4f4);
}

.img-imaging-toolbar .cds--search {
  flex: 0 1 18rem;
}

.img-imaging .cds--tabs {
  padding: 0 1rem;
}

.img-empty {
  text-align: center;
  padding: 3rem 1rem;
  font-size: 0.875rem;
  color: var(--cds-text-secondary, #525252);
}

.img-empty-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--cds-text-primary, #161616);
  margin-bottom: 0.25rem;
}

.img-error {
  color: var(--cds-support-error, #da1e28);
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.img-result {
  padding: 1rem 0.5rem 1.25rem;
  max-width: 64rem;
}

/* keep the "given 15:17" tag next to its item, not at the far end of the row */
.img-check .cds--checkbox-wrapper,
.img-check .cds--form-item {
  flex: 0 1 auto;
  width: auto;
}

/* Complete review footer and the saved review of a completed order */
.img-complete {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--cds-border-subtle-01, #e0e0e0);
}

.img-review {
  display: grid;
  grid-template-columns: 9rem minmax(0, 1fr);
  gap: 0.5rem 1rem;
  font-size: 0.875rem;
  margin: 0.25rem 0 0;
}

.img-review dt {
  color: var(--cds-text-secondary, #525252);
}

.img-review dd {
  margin: 0;
}

.img-chart {
  padding: 1rem;
}

/* AI read: the three sections of the cardiologist prompt */
.img-ai p {
  margin: 0 0 0.75rem;
}

.img-ai .img-label {
  margin-top: 0.25rem;
}

.img-ai-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 0.75rem 1.5rem;
  margin-bottom: 0.5rem;
}

.img-ai-steps ul {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  line-height: 1.45;
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ },

/***/ 200
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  imagingDashboard: () => (/* binding */ imagingDashboard),
  imagingDashboardLink: () => (/* binding */ imagingDashboardLink),
  imagingResults: () => (/* binding */ imagingResults),
  imagingResultsLink: () => (/* binding */ imagingResultsLink),
  importTranslation: () => (/* binding */ importTranslation),
  recordReferralResponseAction: () => (/* binding */ recordReferralResponseAction),
  referralsDashboard: () => (/* binding */ referralsDashboard),
  referralsDashboardLink: () => (/* binding */ referralsDashboardLink),
  startupApp: () => (/* binding */ startupApp)
});

// EXTERNAL MODULE: consume shared module (default) @openmrs/esm-framework@* (singleton)
var esm_framework_singleton_ = __webpack_require__(251);
;// ./src/config-schema.ts

const configSchema = {
    formUuid: {
        _type: esm_framework_singleton_.Type.UUID,
        _description: 'UUID of the Referral Response form',
        _default: '2dcc7696-66b4-42fd-95c0-50603e0e2f4e'
    },
    orderTypeUuid: {
        _type: esm_framework_singleton_.Type.UUID,
        _description: 'UUID of the Referral OrderType. Used to filter which order rows show the action.',
        _default: '778a9dc6-87d9-49c1-83d9-caa01041a8ad'
    },
    fulfillerComment: {
        _type: esm_framework_singleton_.Type.String,
        _description: 'Comment recorded on the order when it is closed.',
        _default: 'Closed by Referral Response form'
    },
    encounterTypeUuid: {
        _type: esm_framework_singleton_.Type.UUID,
        _description: 'UUID of the Referral Response encounter type. Used by the polling fallback to detect form save.',
        _default: '479e4805-90d9-44f5-b252-333d8a687e52'
    },
    responseNotesConceptUuid: {
        _type: esm_framework_singleton_.Type.UUID,
        _description: 'Concept of the Referral Response form\'s "Clinical notes / addendum to send back to source" answer, shown as ' + 'the Clinical notes of a referral in once it is answered.',
        _default: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    },
    referralInEncounterTypeUuid: {
        _type: esm_framework_singleton_.Type.UUID,
        _description: 'UUID of the Referral In encounter type. The receiver adaptor files every inbound referral under it, so a ' + 'Referral order in this encounter type is shown as "In"; any other Referral order is shown as "Out". ' + 'Same rule the emitter uses for the referral-direction category.',
        _default: 'de0f5558-9813-4fa3-8613-467015f9fabd'
    },
    referralOutEncounterTypeUuid: {
        _type: esm_framework_singleton_.Type.UUID,
        _description: 'UUID of the Referral Out encounter type, created for each outbound referral raised here.',
        _default: '7b3f4e2a-9c1d-4e8b-a6f0-2d5c8e1b9a47'
    },
    referralOutOrderablesConceptSetUuid: {
        _type: esm_framework_singleton_.Type.UUID,
        _description: 'UUID of the concept set whose members can be chosen as the referral out (e.g. Referral to PHC).',
        _default: '3c1a7c1e-5a1d-4a52-9d55-4548a1c00003'
    },
    careSettingUuid: {
        _type: esm_framework_singleton_.Type.UUID,
        _description: 'UUID of the care setting for referral out orders.',
        _default: '6f0c9a92-6f24-11e3-af88-005056821db0'
    },
    referralDestinationLocationTag: {
        _type: esm_framework_singleton_.Type.String,
        _description: 'Location tag of the facilities offered as the destination of a referral out.',
        _default: 'Referral Destination'
    },
    referralDestinationConceptUuid: {
        _type: esm_framework_singleton_.Type.UUID,
        _description: 'Text concept recorded on the Referral Out encounter holding the destination location uuid; the emitter ' + 'reads it to send the destination as ServiceRequest.performer.',
        _default: '5f8a2c6e-3b9d-4e1f-a7c4-0d6e9b2a8f15'
    },
    referralOutReferencePrefix: {
        _type: esm_framework_singleton_.Type.String,
        _description: 'Prefix of the reference number generated for each referral out (e.g. RO-20261023-K7Q2).',
        _default: 'RO'
    },
    clinicianEncounterRoleUuid: {
        _type: esm_framework_singleton_.Type.UUID,
        _description: 'UUID of the encounter role recorded for the provider raising a referral out.',
        _default: '240b26f9-dd88-4172-823d-4a8bfeb7841f'
    },
    imaging: {
        _description: 'Imaging page on the home screen: imaging orders (e.g. the ECG ordered from the Referral Response form), ' + 'upload of the result, the AI read and the STEMI assessment. Metadata: scripts/imaging-orders-o3-setup.sh.',
        imagingOrderTypeUuid: {
            _type: esm_framework_singleton_.Type.UUID,
            _description: 'Imaging Order order type listed on the Imaging page.',
            _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e01'
        },
        ecgConceptUuids: {
            _type: esm_framework_singleton_.Type.Array,
            _elements: {
                _type: esm_framework_singleton_.Type.ConceptUuid
            },
            _description: 'Concepts treated as an ECG: the result gets the AI read and the STEMI assessment.',
            _default: [
                '5333e05c-de05-4719-87a1-31d1f3d48023',
                '161157AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
            ]
        },
        reviewConceptUuids: {
            _description: 'Concepts of the "Imaging review" result saved by Complete review: an obs group (set) of three text members, ' + 'linked to the order so the chart\'s Orders widget lists them as the order\'s result.',
            set: {
                _type: esm_framework_singleton_.Type.ConceptUuid,
                _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e03'
            },
            finding: {
                _type: esm_framework_singleton_.Type.ConceptUuid,
                _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e04'
            },
            diagnosis: {
                _type: esm_framework_singleton_.Type.ConceptUuid,
                _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e05'
            },
            plan: {
                _type: esm_framework_singleton_.Type.ConceptUuid,
                _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e06'
            }
        },
        ecgAiInterpretation: {
            _type: esm_framework_singleton_.Type.String,
            _description: 'Demo AI interpretation, shown when the ecgai backend module is not configured (no API key).',
            _default: 'ST elevation in V1–V4, greatest in V2–V3, with reciprocal ST depression in III and aVF. Suggestive of ' + 'acute anterior STEMI. Sinus rhythm, 92/min. Normal PR and QRS; no conduction block.'
        },
        ecgAiFinding: {
            _type: esm_framework_singleton_.Type.String,
            _description: 'Demo short AI finding (pathway facts, saved finding) when the ecgai backend module is not configured.',
            _default: 'ST elevation V1–V4'
        },
        suggestedDiagnosis: {
            _type: esm_framework_singleton_.Type.String,
            _description: 'Demo suggested working diagnosis when the ecgai backend module is not configured.',
            _default: 'Suspected acute anterior STEMI (AI read)'
        },
        aiRead: {
            _description: 'AI read of an uploaded ECG by the ecgai OpenMRS module (modules/ecgai, /ws/rest/v1/ecgai), which sends the ' + 'ECG to the configured LLM and saves the result on the order. Without an API key on the backend the page ' + 'shows the demo read (ecgAiInterpretation, ecgAiFinding, suggestedDiagnosis).',
            enabled: {
                _type: esm_framework_singleton_.Type.Boolean,
                _default: true
            },
            conceptUuid: {
                _type: esm_framework_singleton_.Type.ConceptUuid,
                _description: '"ECG AI interpretation" observation the ecgai module saves (JSON text).',
                _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e09'
            }
        },
        cardiologist: {
            _description: 'Hub cardiologist an ECG is sent to for a confirmatory read ("Send to cardiologist"). Hardcoded until the ' + 'send is connected; shown as "Sent to <name>, <facility>, at … · reply due by …".',
            name: {
                _type: esm_framework_singleton_.Type.String,
                _default: 'Dr S. Ahmed'
            },
            facility: {
                _type: esm_framework_singleton_.Type.String,
                _default: 'SZMCH'
            },
            replyDueMinutes: {
                _type: esm_framework_singleton_.Type.Number,
                _default: 10
            }
        },
        pciReferral: {
            _description: '"Yes, refer for primary PCI" raises a referral out to the chosen cardiac centre (a Referral order in a ' + 'Referral Out encounter, like "New referral out"). On the Referrals page that referral offers "Record ' + 'referral response", which opens the PCI response form. Metadata: scripts/pci-referral-o3-setup.sh.',
            conceptUuid: {
                _type: esm_framework_singleton_.Type.ConceptUuid,
                _description: 'Concept of the Referral order ("Referral for primary PCI").',
                _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0a'
            },
            responseFormUuid: {
                _type: esm_framework_singleton_.Type.UUID,
                _description: 'Form opened by "Record referral response" for a PCI referral ("PCI Referral Response"). It must save a ' + 'Referral Response encounter (encounterTypeUuid) so the referral is closed when it is saved.',
                _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e10'
            },
            stentProcedureConceptUuid: {
                _type: esm_framework_singleton_.Type.ConceptUuid,
                _description: 'The response form\'s "Stent procedure" question, shown on the answered referral.',
                _default: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0b'
            }
        },
        pciLimitMinutes: {
            _type: esm_framework_singleton_.Type.Number,
            _description: 'The artery should be opened within this many minutes of the ECG (primary PCI).',
            _default: 120
        },
        cardiacCentresNote: {
            _type: esm_framework_singleton_.Type.String,
            _description: 'Where the cardiac centre list comes from, shown above it.',
            _default: 'service register, updated 08:30 today'
        },
        cardiacCentres: {
            _type: esm_framework_singleton_.Type.Array,
            _elements: {
                _type: esm_framework_singleton_.Type.Object,
                name: {
                    _type: esm_framework_singleton_.Type.String
                },
                distance: {
                    _type: esm_framework_singleton_.Type.String,
                    _description: 'e.g. "14 km"'
                },
                travel: {
                    _type: esm_framework_singleton_.Type.String,
                    _description: 'e.g. "about 30 minutes by ambulance"'
                },
                cathLab: {
                    _type: esm_framework_singleton_.Type.String,
                    _description: 'e.g. "cath lab available now, team on call"'
                },
                arteryOpenedMinutes: {
                    _type: esm_framework_singleton_.Type.Number,
                    _description: 'Expected minutes from the ECG to the opened artery'
                },
                recommended: {
                    _type: esm_framework_singleton_.Type.Boolean,
                    _default: false
                },
                locationUuid: {
                    _type: esm_framework_singleton_.Type.UUID,
                    _description: 'The centre as an OpenMRS location: the destination recorded on the PCI referral.'
                }
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
                    locationUuid: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0e'
                },
                {
                    name: 'National Institute of Cardiovascular Diseases, Dhaka',
                    distance: 'about 200 km',
                    travel: 'about 5 hours by ambulance',
                    cathLab: 'cath lab available',
                    arteryOpenedMinutes: 350,
                    recommended: false,
                    locationUuid: '5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0f'
                }
            ]
        },
        giveNow: {
            _type: esm_framework_singleton_.Type.Array,
            _elements: {
                _type: esm_framework_singleton_.Type.String
            },
            _description: 'Treatments to give before transfer, ticked as given.',
            _default: [
                'Aspirin 300 mg, chewed',
                'Second antiplatelet drug, per the hub protocol',
                'Heparin, per the hub protocol',
                'Nitrate, only if systolic BP is above 90 and no sildenafil-type drug in the last 48 hours',
                'Oxygen, only if saturation is below 90%'
            ]
        }
    }
};

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(848);
// EXTERNAL MODULE: consume shared module (default) react@* (singleton)
var consume_shared_module_default_react_singleton_ = __webpack_require__(403);
var consume_shared_module_default_react_singleton_default = /*#__PURE__*/__webpack_require__.n(consume_shared_module_default_react_singleton_);
// EXTERNAL MODULE: consume shared module (default) react-i18next@* (singleton)
var consume_shared_module_default_react_i18next_singleton_ = __webpack_require__(857);
// EXTERNAL MODULE: ./node_modules/@carbon/react/es/index.js + 194 modules
var es = __webpack_require__(997);
;// ./src/close-referral-order.ts

// Encode "<comment> | by: <name>" so we can render the fulfiller in the UI.
// The Order REST resource has no dedicated fulfiller field and `auditInfo.changedBy`
// is not bumped by the fulfillerdetails PATCH, so we piggyback on fulfillerComment.
const FULFILLER_TAG = ' | by: ';
function currentUserDisplay() {
    try {
        const session = (0,esm_framework_singleton_.getSessionStore)().getState()?.session;
        return session?.currentProvider?.person?.display ?? session?.user?.person?.display ?? session?.user?.display ?? session?.user?.username ?? '';
    } catch  {
        return '';
    }
}
/**
 * POST /ws/rest/v1/order/{uuid}/fulfillerdetails
 * Sets fulfillerStatus = COMPLETED on a Referral order.
 */ async function closeReferralOrder({ orderUuid, comment }) {
    const fulfiller = currentUserDisplay();
    const fulfillerComment = fulfiller ? `${comment}${FULFILLER_TAG}${fulfiller}` : comment;
    try {
        await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/order/${orderUuid}/fulfillerdetails`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                fulfillerStatus: 'COMPLETED',
                fulfillerComment
            }
        });
        (0,esm_framework_singleton_.showSnackbar)({
            kind: 'success',
            title: 'Referral closed',
            subtitle: 'Order marked as completed',
            isLowContrast: true
        });
    } catch (err) {
        console.error('Failed to close referral order', err);
        (0,esm_framework_singleton_.showSnackbar)({
            kind: 'error',
            title: 'Could not close referral',
            subtitle: err instanceof Error ? err.message : 'Unknown error'
        });
    }
}
/**
 * POST /ws/rest/v1/order/{uuid}/fulfillerdetails
 * Sets fulfillerStatus = DECLINED on a Referral order. Used when the fulfiller
 * cannot/will-not act on the referral. The decliner's display name is recorded
 * in fulfillerComment via the same `<comment> | by: <name>` convention used by
 * closeReferralOrder so the dashboard can render "Declined by".
 */ async function declineReferralOrder({ orderUuid, comment }) {
    const fulfiller = currentUserDisplay();
    const fulfillerComment = fulfiller ? `${comment}${FULFILLER_TAG}${fulfiller}` : comment;
    try {
        await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/order/${orderUuid}/fulfillerdetails`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                fulfillerStatus: 'DECLINED',
                fulfillerComment
            }
        });
        (0,esm_framework_singleton_.showSnackbar)({
            kind: 'success',
            title: 'Referral declined',
            subtitle: 'Order marked as declined',
            isLowContrast: true
        });
    } catch (err) {
        console.error('Failed to decline referral order', err);
        (0,esm_framework_singleton_.showSnackbar)({
            kind: 'error',
            title: 'Could not decline referral',
            subtitle: err instanceof Error ? err.message : 'Unknown error'
        });
    }
}
/**
 * POST /ws/rest/v1/order
 *
 * Creates a DISCONTINUE order that references the original via
 * `previousOrder`. This produces a *new* row in the `orders` table with a
 * fresh `date_created`, and stamps `date_stopped` on the original. Both rows
 * are then visible to FHIR `ServiceRequest?_lastUpdated=gt<X>` polling, which
 * is the only reliable change-data-capture surface for orders (the
 * `/fulfillerdetails` endpoint bypasses audit columns — see
 * docs/referral-close-loop-implementation.md).
 *
 * This call is best-effort: failures are logged + surfaced as a low-priority
 * warning snackbar but never thrown, because the user-visible state
 * (fulfillerStatus) has already been updated by the time we get here.
 */ async function discontinueReferralOrder({ order, patientUuid, reason }) {
    const patient = patientUuid ?? order.patient?.uuid;
    const encounter = order.encounter?.uuid;
    const orderer = order.orderer?.uuid;
    const concept = order.concept?.uuid;
    const careSetting = order.careSetting?.uuid;
    const orderType = order.orderType?.uuid;
    // Skip silently if we don't have the minimum context to compose the body.
    if (!patient || !encounter || !orderer || !concept || !careSetting || !orderType) {
        console.warn('[esm-referral-fulfillment] skipping DISCONTINUE — missing fields', {
            patient: !!patient,
            encounter: !!encounter,
            orderer: !!orderer,
            concept: !!concept,
            careSetting: !!careSetting,
            orderType: !!orderType
        });
        return;
    }
    try {
        await (0,esm_framework_singleton_.openmrsFetch)('/ws/rest/v1/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                // The Referral OrderType is backed by org.openmrs.TestOrder so the
                // FHIR module exposes referrals as ServiceRequest. The REST resource
                // discriminator must match the underlying class.
                type: 'testorder',
                action: 'DISCONTINUE',
                previousOrder: order.uuid,
                patient,
                encounter,
                orderer,
                careSetting,
                concept,
                orderType,
                orderReasonNonCoded: reason
            }
        });
    } catch (err) {
        // Swallow — the fulfiller-status flip already succeeded; the FHIR
        // change-data-capture is a downstream concern and shouldn't block the user.
        console.warn('[esm-referral-fulfillment] DISCONTINUE post failed', err);
        (0,esm_framework_singleton_.showSnackbar)({
            kind: 'warning',
            title: 'Order closed but downstream sync may be delayed',
            subtitle: err instanceof Error ? err.message : 'Could not record discontinuation — external systems may not see this change immediately.',
            isLowContrast: true
        });
    }
}

;// ./src/record-referral-response.component.tsx






const RecordReferralResponseAction = (props)=>{
    const { t } = (0,consume_shared_module_default_react_i18next_singleton_.useTranslation)();
    const config = (0,esm_framework_singleton_.useConfig)();
    const order = props.order ?? props.orderItem;
    // Same rule as the Referrals dashboard: the response is recorded during the patient's visit
    const { patientUuid } = (0,esm_framework_singleton_.usePatient)();
    const { activeVisit } = (0,esm_framework_singleton_.useVisit)(patientUuid);
    // DEBUG: log entire props shape to discover what the slot actually passes
    // eslint-disable-next-line no-console
    console.log('[esm-referral-fulfillment] slot props =', props);
    // The slot we attach to (`order-detail-slot`) renders for every generic
    // Order (type === 'order'). Filter to only the Referral OrderType so we
    // don't pollute other order detail panels.
    const isReferral = order?.orderType?.uuid === config.orderTypeUuid;
    const handleClick = (0,consume_shared_module_default_react_singleton_.useCallback)(()=>{
        if (!order?.uuid) {
            console.warn('[esm-referral-fulfillment] No order context available; aborting');
            return;
        }
        (0,esm_framework_singleton_.launchWorkspace)('patient-form-entry-workspace', {
            workspaceTitle: t('referralResponseTitle', 'Referral response — {{orderNumber}}', {
                orderNumber: order.orderNumber ?? order.uuid.slice(0, 8)
            }),
            mutateForm: ()=>{},
            formInfo: {
                formUuid: config.formUuid,
                encounterUuid: '',
                additionalProps: {
                    orderUuid: order.uuid,
                    orderNumber: order.orderNumber ?? '',
                    orderInstructions: order.instructions ?? '',
                    orderAccessionNumber: order.accessionNumber ?? '',
                    orderUrgency: order.urgency ?? '',
                    orderConceptDisplay: order.concept?.display ?? ''
                }
            },
            // Fired by the workspace framework when the user closes the workspace
            // after a successful save. The form-engine triggers `onSubmit` first;
            // we hook the workspace close to drive the order state change.
            closeWorkspaceWithSavedChanges: ()=>{
                void closeReferralOrder({
                    orderUuid: order.uuid,
                    comment: config.fulfillerComment
                });
            }
        });
    }, [
        order,
        config,
        t
    ]);
    // Hide unless this is a Referral order that is not yet completed
    if (!isReferral || order?.fulfillerStatus === 'COMPLETED') {
        return null;
    }
    return /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
        style: {
            padding: '0.5rem 1rem'
        },
        children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
            kind: "tertiary",
            size: "sm",
            onClick: handleClick,
            disabled: !activeVisit,
            title: activeVisit ? undefined : t('startVisitToRespondHint', 'Start a visit when the patient arrives, then record the referral response'),
            children: t('recordReferralResponse', 'Record referral response')
        })
    });
};
/* harmony default export */ const record_referral_response_component = (RecordReferralResponseAction);

;// ./src/dashboard-link.component.tsx



const dashboardMeta = {
    path: 'Referrals',
    title: 'Referrals'
};
const ReferralsDashboardLink = ({ basePath })=>{
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)(esm_framework_singleton_.ConfigurableLink, {
        to: `${basePath}/${dashboardMeta.path}`,
        className: "cds--side-nav__link",
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                // Mirror Carbon's `cds--side-nav__icon` slot used by sibling links so the
                // label aligns with the others (icons live in a 16px-wide column with
                // 0.5rem inline padding).
                className: "cds--side-nav__icon",
                style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                children: /*#__PURE__*/ (0,jsx_runtime.jsx)("svg", {
                    // The styleguide sprite symbol uses a 16x16 viewBox (path is M16 0H0V16H16V0Z).
                    className: "omrs-icon",
                    "aria-hidden": "true",
                    width: 16,
                    height: 16,
                    viewBox: "0 0 16 16",
                    style: {
                        fill: 'currentColor'
                    },
                    children: /*#__PURE__*/ (0,jsx_runtime.jsx)("use", {
                        href: "#omrs-icon-referral-order"
                    })
                })
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                className: "cds--side-nav__link-text",
                children: dashboardMeta.title
            })
        ]
    });
};
/* harmony default export */ const dashboard_link_component = (ReferralsDashboardLink);

;// ./src/create-referral-out.ts

/** The facilities a referral out can be sent to: the locations carrying the configured tag. */ async function fetchReferralDestinations(locationTag) {
    const res = await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/location?tag=${encodeURIComponent(locationTag)}&v=custom:(uuid,display)&limit=100`);
    return res.data?.results ?? [];
}
/**
 * Reference number of a referral out, e.g. RO-20261023-K7Q2: the receiving facility quotes it when it
 * responds. It is generated here because OpenMRS assigns the order number only after the order is saved,
 * and orders cannot be edited afterwards.
 */ function generateReferralOutReference(prefix, now = new Date()) {
    const day = now.toISOString().slice(0, 10).replace(/-/g, '');
    // unambiguous characters only (no 0/O, 1/I)
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const suffix = Array.from({
        length: 4
    }, ()=>alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    return `${prefix}-${day}-${suffix}`;
}
/**
 * The concepts a referral out can be raised for: the members of the
 * configured orderables concept set (e.g. "Referral to primary health care (PHC)").
 */ async function fetchReferralOutOrderables(conceptSetUuid) {
    const res = await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/concept/${conceptSetUuid}?v=custom:(setMembers:(uuid,display))`);
    return res.data?.setMembers ?? [];
}
/**
 * Raises a referral out (e.g. a back-referral to a PHC) in two steps:
 *
 * 1. a "Referral Out" encounter in the patient's active visit, recording the destination facility, and
 * 2. a Referral order in that encounter, carrying a generated reference number.
 *
 * The order is a `testorder` carrying the Referral order type, the same shape
 * the receiver adaptor creates for referrals in: the order type is backed by
 * org.openmrs.TestOrder, and only test orders are published by the FHIR module
 * as ServiceRequest. The emitter adaptor then forwards that ServiceRequest to
 * OpenHIM, tagging it referral-direction "outbound" because its encounter type
 * is not Referral In.
 *
 * @returns the new order's number and reference number
 */ async function createReferralOut(request, config) {
    const session = (0,esm_framework_singleton_.getSessionStore)().getState()?.session;
    const providerUuid = session?.currentProvider?.uuid;
    const locationUuid = session?.sessionLocation?.uuid;
    if (!providerUuid) {
        throw new Error('The logged-in user is not a provider, so they cannot raise a referral.');
    }
    if (!locationUuid) {
        throw new Error('No session location is selected.');
    }
    const encounterRes = await (0,esm_framework_singleton_.openmrsFetch)('/ws/rest/v1/encounter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            patient: request.patientUuid,
            visit: request.visitUuid,
            encounterType: config.referralOutEncounterTypeUuid,
            location: locationUuid,
            encounterDatetime: new Date().toISOString(),
            encounterProviders: [
                {
                    provider: providerUuid,
                    encounterRole: config.clinicianEncounterRoleUuid
                }
            ],
            // the destination travels with the encounter; the emitter sends it as ServiceRequest.performer
            obs: [
                {
                    concept: config.referralDestinationConceptUuid,
                    value: request.destinationLocationUuid
                }
            ]
        }
    });
    const encounterUuid = encounterRes.data.uuid;
    const referenceNumber = generateReferralOutReference(config.referralOutReferencePrefix);
    const orderRes = await (0,esm_framework_singleton_.openmrsFetch)('/ws/rest/v1/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            // must match the Referral order type's Java class (org.openmrs.TestOrder)
            type: 'testorder',
            action: 'NEW',
            orderType: config.orderTypeUuid,
            patient: request.patientUuid,
            encounter: encounterUuid,
            orderer: providerUuid,
            careSetting: config.careSettingUuid,
            concept: request.conceptUuid,
            urgency: request.urgency,
            instructions: request.instructions?.trim() || null,
            // sent as the ServiceRequest's ACSN identifier
            accessionNumber: referenceNumber
        }
    });
    return {
        orderNumber: orderRes.data.orderNumber,
        referenceNumber
    };
}

;// ./src/new-referral-out-modal.component.tsx






/**
 * Raises a referral out (e.g. a back-referral to a PHC): pick what the patient is referred for,
 * the facility they are referred to, the priority and instructions for that facility.
 */ const NewReferralOutModal = ({ open, patientUuid, visitUuid, onClose, onCreated })=>{
    const { t } = (0,consume_shared_module_default_react_i18next_singleton_.useTranslation)();
    const config = (0,esm_framework_singleton_.useConfig)();
    const [orderables, setOrderables] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [orderablesError, setOrderablesError] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [referredFor, setReferredFor] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [destinations, setDestinations] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [referredTo, setReferredTo] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [urgency, setUrgency] = (0,consume_shared_module_default_react_singleton_.useState)('ROUTINE');
    const [instructions, setInstructions] = (0,consume_shared_module_default_react_singleton_.useState)('');
    const [submitting, setSubmitting] = (0,consume_shared_module_default_react_singleton_.useState)(false);
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        if (!open) return;
        setReferredFor(null);
        setReferredTo(null);
        setUrgency('ROUTINE');
        setInstructions('');
        fetchReferralOutOrderables(config.referralOutOrderablesConceptSetUuid).then((members)=>{
            setOrderables(members);
            // a single option needs no choosing
            if (members.length === 1) setReferredFor(members[0]);
        }).catch((e)=>setOrderablesError(e?.message ?? String(e)));
        fetchReferralDestinations(config.referralDestinationLocationTag).then(setDestinations).catch((e)=>setOrderablesError(e?.message ?? String(e)));
    }, [
        open,
        config.referralOutOrderablesConceptSetUuid,
        config.referralDestinationLocationTag
    ]);
    const submit = async ()=>{
        if (!referredFor || !referredTo) return;
        setSubmitting(true);
        try {
            const { orderNumber, referenceNumber } = await createReferralOut({
                patientUuid,
                visitUuid,
                conceptUuid: referredFor.uuid,
                destinationLocationUuid: referredTo.uuid,
                urgency,
                instructions
            }, config);
            (0,esm_framework_singleton_.showSnackbar)({
                kind: 'success',
                isLowContrast: true,
                title: t('referralOutCreated', 'Referral out created'),
                subtitle: t('referralOutCreatedSubtitle', '{{orderNumber}} ({{referenceNumber}}) sent to {{referredTo}}', {
                    orderNumber,
                    referenceNumber,
                    referredTo: referredTo.display
                })
            });
            onCreated();
            onClose();
        } catch (e) {
            (0,esm_framework_singleton_.showSnackbar)({
                kind: 'error',
                title: t('referralOutFailed', 'Could not create the referral out'),
                subtitle: e?.responseBody?.error?.message ?? e?.message ?? String(e)
            });
        } finally{
            setSubmitting(false);
        }
    };
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* Modal */.aFV, {
        open: open,
        modalHeading: t('newReferralOutHeading', 'New referral out'),
        primaryButtonText: submitting ? t('creating', 'Creating…') : t('createReferralOut', 'Create referral'),
        secondaryButtonText: t('cancel', 'Cancel'),
        primaryButtonDisabled: !referredFor || !referredTo || submitting,
        onRequestClose: ()=>!submitting && onClose(),
        onRequestSubmit: ()=>void submit(),
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                style: {
                    marginBottom: '1rem'
                },
                children: t('newReferralOutDescription', 'Refer the patient onward (e.g. back to a primary health care facility). The referral is sent to the receiving facility.')
            }),
            orderablesError && /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* InlineNotification */.jeF, {
                kind: "error",
                lowContrast: true,
                hideCloseButton: true,
                title: t('referralOutOrderablesError', 'Could not load referral options'),
                subtitle: orderablesError
            }),
            (orderables?.length ?? 0) > 1 && /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                style: {
                    marginBottom: '1rem'
                },
                children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Dropdown */.msM, {
                    id: "referral-out-referred-for",
                    titleText: t('referredFor', 'Referred for'),
                    label: t('selectReferral', 'Select a referral'),
                    items: orderables ?? [],
                    itemToString: (item)=>item?.display ?? '',
                    selectedItem: referredFor,
                    onChange: ({ selectedItem })=>setReferredFor(selectedItem)
                })
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Dropdown */.msM, {
                    id: "referral-out-referred-to",
                    titleText: t('referredTo', 'Referred to'),
                    label: t('selectFacility', 'Select a facility'),
                    items: destinations ?? [],
                    itemToString: (item)=>item?.display ?? '',
                    selectedItem: referredTo,
                    disabled: !destinations,
                    onChange: ({ selectedItem })=>setReferredTo(selectedItem)
                })
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                style: {
                    marginTop: '1rem'
                },
                children: /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* RadioButtonGroup */.zWQ, {
                    legendText: t('urgency', 'Priority'),
                    name: "referral-out-urgency",
                    valueSelected: urgency,
                    onChange: (value)=>setUrgency(value),
                    children: [
                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* RadioButton */.aaP, {
                            id: "referral-out-routine",
                            labelText: t('routine', 'Routine'),
                            value: "ROUTINE"
                        }),
                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* RadioButton */.aaP, {
                            id: "referral-out-stat",
                            labelText: t('stat', 'Urgent'),
                            value: "STAT"
                        })
                    ]
                })
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                style: {
                    marginTop: '1rem'
                },
                children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TextArea */.fs1, {
                    id: "referral-out-instructions",
                    labelText: t('referralOutInstructions', 'Instructions for the receiving facility (optional)'),
                    value: instructions,
                    onChange: (e)=>setInstructions(e.target.value),
                    rows: 3,
                    maxCount: 500,
                    enableCounter: true
                })
            })
        ]
    });
};
/* harmony default export */ const new_referral_out_modal_component = (NewReferralOutModal);

;// ./src/referrals-dashboard.component.tsx








// `launchWorkspace2` is the new (workspaces2) launcher; not yet in this package's
// type definitions. Cast through framework module to call it without bundling.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const framework = __webpack_require__(251);
const launchWorkspace2 = framework.launchWorkspace2 ?? framework.launchWorkspace;
// How long, after "Record referral response" is clicked, the page keeps looking for the saved
// Referral Response encounter so it can close the referral order.
const RESPONSE_POLL_WINDOW_MS = 30 * 60000;
// Everything the dashboard reads from an order, including the encounter type that
// tells a referral in (filed under Referral In by the receiver) from a referral out,
// and the encounter's obs, which hold the destination of a referral out.
const REFERRAL_ORDER_REPRESENTATION = 'custom:(uuid,orderNumber,display,dateActivated,fulfillerStatus,fulfillerComment,instructions,' + 'commentToFulfiller,accessionNumber,urgency,action,previousOrder:(uuid),concept:(uuid,display),orderer:(uuid,display,person:(display)),' + 'encounter:(uuid,display,encounterType:(uuid,display),obs:(concept:(uuid),value)),careSetting:(uuid,display),' + 'orderType:(uuid,name,display),patient:(uuid))';
const ReferralsDashboard = (props)=>{
    const { t } = (0,consume_shared_module_default_react_i18next_singleton_.useTranslation)();
    const config = (0,esm_framework_singleton_.useConfig)();
    const patientUuid = props.patientUuid ?? props.patient?.id ?? props.patient?.uuid;
    // The referral response is part of the patient's visit at this facility: it can only be
    // recorded once the patient has arrived and a visit has been started (check-in).
    const { activeVisit, isLoading: isLoadingVisit } = (0,esm_framework_singleton_.useVisit)(patientUuid);
    const [orders, setOrders] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    // referral order uuid → clinical notes recorded with its Referral Response form
    const [responseNotes, setResponseNotes] = (0,consume_shared_module_default_react_singleton_.useState)({});
    // the PCI centre's answer ("Stent procedure"), by referral order uuid
    const [stentProcedure, setStentProcedure] = (0,consume_shared_module_default_react_singleton_.useState)({});
    const [error, setError] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    // Decline modal state. Kept locally because the modal is small and tightly
    // coupled to the dashboard's Decline action.
    const [declineTarget, setDeclineTarget] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [declineReason, setDeclineReason] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [declineNotes, setDeclineNotes] = (0,consume_shared_module_default_react_singleton_.useState)('');
    const [declineSubmitting, setDeclineSubmitting] = (0,consume_shared_module_default_react_singleton_.useState)(false);
    const [referralOutOpen, setReferralOutOpen] = (0,consume_shared_module_default_react_singleton_.useState)(false);
    // destination location uuid → facility name, for the "Referred to" column of referrals out
    const [destinationNames, setDestinationNames] = (0,consume_shared_module_default_react_singleton_.useState)({});
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        fetchReferralDestinations(config.referralDestinationLocationTag).then((destinations)=>setDestinationNames(Object.fromEntries(destinations.map((d)=>[
                    d.uuid,
                    d.display
                ])))).catch(()=>setDestinationNames({}));
    }, [
        config.referralDestinationLocationTag
    ]);
    // The facility a referral out was sent to, recorded on its Referral Out encounter.
    const referredToOf = (0,consume_shared_module_default_react_singleton_.useCallback)((order)=>{
        const value = order?.encounter?.obs?.find((obs)=>obs.concept?.uuid === config.referralDestinationConceptUuid)?.value;
        // the REST API returns a location-uuid text value as the Location itself ({uuid, display, …})
        if (value && typeof value === 'object') return value.display ?? destinationNames[value.uuid] ?? value.uuid ?? null;
        if (typeof value !== 'string' || !value) return null;
        return destinationNames[value] ?? value;
    }, [
        config.referralDestinationConceptUuid,
        destinationNames
    ]);
    // A referral in arrived from another facility (the receiver files it under the Referral In
    // encounter type) and is answered here; anything else was raised here and sent out.
    const isReferralIn = (0,consume_shared_module_default_react_singleton_.useCallback)((order)=>order?.encounter?.encounterType?.uuid === config.referralInEncounterTypeUuid, [
        config.referralInEncounterTypeUuid
    ]);
    // A referral for primary PCI is raised here (Imaging results, "Yes, refer for primary PCI") but, for the demo, the
    // PCI centre's response is recorded here too, with its own form.
    const isPciReferral = (0,consume_shared_module_default_react_singleton_.useCallback)((order)=>!!order && order.concept?.uuid === config.imaging.pciReferral.conceptUuid, [
        config.imaging.pciReferral.conceptUuid
    ]);
    // Structured decline reasons. Keep this list short and clinically meaningful;
    // free-text "Other (specify in notes)" is the escape hatch.
    const declineReasons = consume_shared_module_default_react_singleton_default().useMemo(()=>[
            t('declineReasonWrongPatient', 'Wrong patient'),
            t('declineReasonAlreadySeenElsewhere', 'Patient already seen at another facility'),
            t('declineReasonRefusedCare', 'Patient refused care'),
            t('declineReasonOutOfScope', 'Out of scope for this facility'),
            t('declineReasonDuplicate', 'Duplicate referral'),
            t('declineReasonInsufficientInfo', 'Insufficient clinical information'),
            t('declineReasonOther', 'Other (specify in notes)')
        ], [
        t
    ]);
    const loadOrders = (0,consume_shared_module_default_react_singleton_.useCallback)(async ()=>{
        if (!patientUuid) return;
        try {
            const res = await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/order?patient=${patientUuid}&v=${REFERRAL_ORDER_REPRESENTATION}`);
            const all = res.data?.results ?? [];
            // Hide DISCONTINUE revision rows: they are immutable audit siblings
            // generated by close-the-loop and should not appear as a separate
            // referral in the UI. The original NEW row continues to reflect status.
            const referrals = all.filter((o)=>o.orderType?.uuid === config.orderTypeUuid && (o.action ?? 'NEW').toUpperCase() !== 'DISCONTINUE');
            setOrders(referrals);
            // A referral answered with the Referral Response form is closed by a DISCONTINUE order placed in the
            // response encounter, so that encounter's obs hold the notes the clinician sent back to the source.
            const notes = {};
            const stent = {};
            for (const o of all){
                if ((o.action ?? '').toUpperCase() !== 'DISCONTINUE' || !o.previousOrder?.uuid) continue;
                const value = o.encounter?.obs?.find((obs)=>obs.concept?.uuid === config.responseNotesConceptUuid)?.value;
                if (typeof value === 'string' && value) notes[o.previousOrder.uuid] = value;
                const answer = o.encounter?.obs?.find((obs)=>obs.concept?.uuid === config.imaging.pciReferral.stentProcedureConceptUuid)?.value;
                const answerText = typeof answer === 'object' ? answer?.display : answer;
                if (answerText) stent[o.previousOrder.uuid] = answerText;
            }
            setResponseNotes(notes);
            setStentProcedure(stent);
        } catch (e) {
            setError(e?.message ?? String(e));
        }
    }, [
        patientUuid,
        config.orderTypeUuid,
        config.responseNotesConceptUuid,
        config.imaging.pciReferral.stentProcedureConceptUuid
    ]);
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        void loadOrders();
    }, [
        loadOrders
    ]);
    // Track timers so we can clean up on unmount.
    const pollTimers = (0,consume_shared_module_default_react_singleton_.useRef)([]);
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>()=>pollTimers.current.forEach((t)=>window.clearTimeout(t)), []);
    // Orders this page has already started closing. The form's handlePostResponse and the encounter
    // poll can both notice the same save; a second close would try to stop an order that is already
    // stopped and fail.
    const closingOrders = (0,consume_shared_module_default_react_singleton_.useRef)(new Set());
    const closeAndReload = (0,consume_shared_module_default_react_singleton_.useCallback)(async (order, responseEncounterUuid)=>{
        try {
            // ─── DISCONTINUE FIRST ───────────────────────────────────────────
            // Create the DISCONTINUE order BEFORE marking COMPLETED so the FHIR2
            // module adds `basedOn → ServiceRequest` to the response Encounter as
            // early as possible. The OpenMRS emitter adaptor enriches the encounter
            // with the source-referral-order extension by following basedOn; if we
            // delay this, the emitter picks up the encounter without the link.
            let resolvedEncUuid = responseEncounterUuid;
            if (!resolvedEncUuid) {
                try {
                    const encRes = await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${config.encounterTypeUuid}&v=custom:(uuid)&limit=1&order=desc`);
                    resolvedEncUuid = encRes.data?.results?.[0]?.uuid;
                } catch  {
                /* fall back to original encounter */ }
            }
            if (resolvedEncUuid) {
                // eslint-disable-next-line no-console
                console.log('[referral-fulfillment] firing DISCONTINUE for', order.uuid, 'in encounter', resolvedEncUuid);
                const orderData = {
                    ...order,
                    encounter: {
                        uuid: resolvedEncUuid
                    }
                };
                try {
                    await discontinueReferralOrder({
                        order: orderData,
                        patientUuid,
                        reason: config.fulfillerComment
                    });
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.warn('[referral-fulfillment] DISCONTINUE failed (best-effort)', err);
                }
            } else {
                // eslint-disable-next-line no-console
                console.warn('[referral-fulfillment] no response encounter UUID; skipping DISCONTINUE');
            }
            // ─── THEN MARK COMPLETED ─────────────────────────────────────────
            await closeReferralOrder({
                orderUuid: order.uuid,
                comment: config.fulfillerComment
            });
            // eslint-disable-next-line no-console
            console.log('[referral-fulfillment] order closed', order.uuid);
            await loadOrders();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[referral-fulfillment] close failed', err);
        }
    }, [
        config,
        loadOrders,
        patientUuid
    ]);
    const handleStartVisit = (0,consume_shared_module_default_react_singleton_.useCallback)(()=>{
        launchWorkspace2('start-visit-workspace-form', {
            openedFrom: 'referral-fulfillment'
        });
    }, []);
    const handleRecord = (0,consume_shared_module_default_react_singleton_.useCallback)(async (order)=>{
        if (!activeVisit) {
            (0,esm_framework_singleton_.showSnackbar)({
                kind: 'warning',
                isLowContrast: true,
                title: t('startVisitFirst', 'Start a visit first'),
                subtitle: t('startVisitFirstSubtitle', 'The referral response is recorded during the patient’s visit. Start a visit when the patient arrives.')
            });
            return;
        }
        try {
            // Fetch full form object — workspaces2 launcher expects the form, not just a UUID. A PCI referral is answered
            // with the PCI response form; it saves the same Referral Response encounter type, so the close below holds.
            const formUuid = isPciReferral(order) ? config.imaging.pciReferral.responseFormUuid : config.formUuid;
            const formRes = await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/form/${formUuid}?v=full`);
            const form = formRes.data;
            // The workspace title bar reads `form.display`; mutate it so the order
            // number is visible in the workspace header. (windowProps.title is ignored
            // by the patient-forms wrapper in this build.)
            const baseDisplay = form.display || form.name || 'Referral Response';
            form.display = order.orderNumber ? `${baseDisplay} — ${order.orderNumber}` : baseDisplay;
            // Snapshot most-recent referral-response encounter time BEFORE launching, so
            // the poll below can detect a NEW one created by the form engine.
            const encUrl = `/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${config.encounterTypeUuid}&v=custom:(uuid,encounterDatetime)&limit=1&order=desc`;
            let lastEncounterUuid = null;
            try {
                const r = await (0,esm_framework_singleton_.openmrsFetch)(encUrl);
                lastEncounterUuid = r.data?.results?.[0]?.uuid ?? null;
            } catch  {
            /* ignore */ }
            const clickedAt = Date.now();
            // Close the referral once, whichever path sees the saved encounter first.
            let stopped = false;
            const closeOnce = (encounterUuid, via)=>{
                stopped = true;
                if (closingOrders.current.has(order.uuid)) {
                    return;
                }
                closingOrders.current.add(order.uuid);
                // eslint-disable-next-line no-console
                console.log(`[referral-fulfillment] closing order via ${via}`, {
                    order: order.uuid,
                    encounter: encounterUuid
                });
                void closeAndReload(order, encounterUuid);
            };
            // eslint-disable-next-line no-console
            console.log('[referral-fulfillment] launching form workspace', {
                orderNumber: order.orderNumber,
                orderUuid: order.uuid
            });
            launchWorkspace2('patient-form-entry-workspace', {
                form,
                encounterUuid: '',
                additionalProps: {
                    orderUuid: order.uuid,
                    orderNumber: order.orderNumber,
                    orderInstructions: order.instructions ?? '',
                    orderAccessionNumber: order.accessionNumber ?? '',
                    orderUrgency: order.urgency ?? '',
                    orderConceptDisplay: order.concept?.display ?? ''
                },
                handlePostResponse: (encounter)=>{
                    // eslint-disable-next-line no-console
                    console.log('[referral-fulfillment] handlePostResponse fired', {
                        orderUuid: order.uuid,
                        encounter
                    });
                    const encUuid = encounter?.uuid ?? encounter?.id;
                    closeOnce(encUuid, 'handlePostResponse');
                }
            }, {
                // The order # is shown in the workspace title bar so the clinician
                // always sees which referral they are responding to.
                title: t('referralResponseTitle', 'Referral response — {{orderNumber}}', {
                    orderNumber: order.orderNumber ?? ''
                })
            });
            // Fallback path: poll for a new Referral Response encounter for this patient.
            // Strict match: the encounter MUST be newer than our snapshot AND must contain
            // at least one obs with formFieldPath starting with "rfe-forms-" (proving it
            // came from the React form engine, i.e. our Referral Response form). Because
            // workspaces2 only allows one patient-form-entry-workspace at a time, the
            // newly-saved encounter unambiguously corresponds to the order we clicked.
            const isFromOurForm = (enc)=>{
                if (!enc) return false;
                if (clickedAt && enc.encounterDatetime) {
                    // Skip encounters created before the click (clock skew tolerance: 60s).
                    const ts = new Date(enc.encounterDatetime).getTime();
                    if (ts + 60000 < clickedAt) return false;
                }
                const walk = (obs)=>!!obs?.some((o)=>{
                        if (typeof o?.formFieldPath === 'string' && o.formFieldPath.startsWith('rfe-forms-')) return true;
                        if (Array.isArray(o?.groupMembers) && walk(o.groupMembers)) return true;
                        return false;
                    });
                return walk(enc.obs ?? []);
            };
            const poll = async ()=>{
                if (stopped) return;
                try {
                    const r = await (0,esm_framework_singleton_.openmrsFetch)(encUrl);
                    const newest = r.data?.results?.[0]?.uuid ?? null;
                    if (newest && newest !== lastEncounterUuid) {
                        try {
                            const full = await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/encounter/${newest}?v=full`);
                            if (isFromOurForm(full.data)) {
                                closeOnce(newest, 'encounter poll');
                                return;
                            }
                            // eslint-disable-next-line no-console
                            console.log('[referral-fulfillment] new encounter does not look like our form, ignoring', newest);
                        } catch  {
                        /* ignore — try again next tick */ }
                    }
                } catch  {
                /* ignore */ }
                const id = window.setTimeout(poll, 2000);
                pollTimers.current.push(id);
            };
            const id = window.setTimeout(poll, 2000);
            pollTimers.current.push(id);
            // Give up only after the clinician has had ample time to fill in the form. A 60 s limit
            // left referrals open whenever the form took longer than a minute, and the clinician then
            // submitted it again (a second set of orders). The poll stops sooner once the order closes.
            const stopId = window.setTimeout(()=>{
                stopped = true;
            }, RESPONSE_POLL_WINDOW_MS);
            pollTimers.current.push(stopId);
        } catch (e) {
            setError(e?.message ?? String(e));
        }
    }, [
        config,
        patientUuid,
        closeAndReload,
        t,
        activeVisit,
        isPciReferral
    ]);
    const handleManualClose = (0,consume_shared_module_default_react_singleton_.useCallback)(async (order)=>{
        // Retained for potential admin/debug use; no UI surface exposes it now.
        // The referral is otherwise marked COMPLETED only when the Referral
        // Response form is submitted (see handleRecord/closeAndReload).
        await closeReferralOrder({
            orderUuid: order.uuid,
            comment: config.fulfillerComment
        });
        void loadOrders();
    }, [
        config,
        loadOrders
    ]);
    // Suppress unused-var warnings while keeping the helper available.
    void handleManualClose;
    const handleDecline = (0,consume_shared_module_default_react_singleton_.useCallback)((order)=>{
        // Open the structured-decline modal; submission happens in submitDecline.
        setDeclineTarget(order);
        setDeclineReason(null);
        setDeclineNotes('');
    }, []);
    const closeDeclineModal = (0,consume_shared_module_default_react_singleton_.useCallback)(()=>{
        if (declineSubmitting) return;
        setDeclineTarget(null);
        setDeclineReason(null);
        setDeclineNotes('');
    }, [
        declineSubmitting
    ]);
    const submitDecline = (0,consume_shared_module_default_react_singleton_.useCallback)(async ()=>{
        if (!declineTarget || !declineReason) return;
        // Persist as "<reason>: <notes>" or just "<reason>" so the structured choice
        // is preserved at the front of the comment string.
        const trimmedNotes = declineNotes.trim();
        const comment = trimmedNotes ? `${declineReason}: ${trimmedNotes}` : declineReason;
        setDeclineSubmitting(true);
        try {
            await declineReferralOrder({
                orderUuid: declineTarget.uuid,
                comment
            });
            // Best-effort: emit a DISCONTINUE order so the change is visible to
            // FHIR ServiceRequest?_lastUpdated polling. See docs/referral-close-loop-implementation.md.
            void discontinueReferralOrder({
                order: declineTarget,
                patientUuid,
                reason: comment
            });
            setDeclineTarget(null);
            setDeclineReason(null);
            setDeclineNotes('');
            void loadOrders();
        } finally{
            setDeclineSubmitting(false);
        }
    }, [
        declineTarget,
        declineReason,
        declineNotes,
        loadOrders,
        patientUuid
    ]);
    if (!patientUuid) {
        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tile */.FAs, {
            children: t('noPatient', 'No patient context')
        });
    }
    if (orders === null && !error) {
        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* InlineLoading */.OuH, {
            description: t('loading', 'Loading referrals…')
        });
    }
    if (error) {
        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tile */.FAs, {
            children: t('errorLoading', 'Error loading referrals: {{err}}', {
                err: error
            })
        });
    }
    // "New referral out" needs an active visit: the referral is raised during the patient's visit here.
    const referralOutToolbar = /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
        style: {
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: '0.5rem'
        },
        children: [
            !activeVisit && !isLoadingVisit && /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                style: {
                    color: '#6f6f6f',
                    marginRight: '0.75rem',
                    fontSize: '0.875rem'
                },
                children: t('startVisitToReferOut', 'Start a visit to raise a referral out')
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                kind: "ghost",
                size: "sm",
                disabled: !activeVisit,
                renderIcon: (props)=>/*#__PURE__*/ (0,jsx_runtime.jsx)(esm_framework_singleton_.AddIcon, {
                        size: 16,
                        ...props
                    }),
                iconDescription: t('newReferralOut', 'New referral out'),
                onClick: ()=>setReferralOutOpen(true),
                children: t('newReferralOut', 'New referral out')
            })
        ]
    });
    const referralOutModal = activeVisit ? /*#__PURE__*/ (0,jsx_runtime.jsx)(new_referral_out_modal_component, {
        open: referralOutOpen,
        patientUuid: patientUuid,
        visitUuid: activeVisit.uuid,
        onClose: ()=>setReferralOutOpen(false),
        onCreated: ()=>void loadOrders()
    }) : null;
    if ((orders?.length ?? 0) === 0) {
        return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
            style: {
                padding: '1rem'
            },
            children: [
                referralOutToolbar,
                /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tile */.FAs, {
                    children: /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                        children: t('noReferrals', 'No referral orders for this patient.')
                    })
                }),
                referralOutModal
            ]
        });
    }
    const headers = [
        {
            key: 'orderNumber',
            header: t('orderNumber', 'Order #')
        },
        {
            key: 'direction',
            header: t('direction', 'Direction')
        },
        {
            key: 'display',
            header: t('order', 'Order')
        },
        {
            key: 'dateActivated',
            header: t('dateActivated', 'Date')
        },
        {
            key: 'status',
            header: t('status', 'Status')
        },
        {
            key: 'action',
            header: ''
        }
    ];
    const rows = (orders ?? []).map((o)=>({
            id: o.uuid,
            orderNumber: o.orderNumber,
            direction: isReferralIn(o) ? 'IN' : 'OUT',
            display: o.display ?? '',
            dateActivated: o.dateActivated ? new Date(o.dateActivated).toLocaleDateString() : '',
            // a referral in waits on this facility (PENDING); a referral out waits on the receiving facility (SENT)
            status: o.fulfillerStatus ?? (isReferralIn(o) ? 'PENDING' : 'SENT'),
            raw: o
        }));
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
        style: {
            padding: '1rem'
        },
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)("style", {
                children: `.cds--css-grid h4, .patient-chart-dashboard-title { font-weight: 600 !important; }`
            }),
            referralOutToolbar,
            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* DataTable */.bQt, {
                rows: rows,
                headers: headers,
                children: ({ rows: dtRows, headers: dtHeaders, getHeaderProps, getRowProps, getTableProps, getExpandHeaderProps })=>/*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* Table */.XIK, {
                        ...getTableProps(),
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableHead */.ndF, {
                                children: /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* TableRow */.Hjg, {
                                    children: [
                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableExpandHeader */.Uwq, {
                                            ...getExpandHeaderProps()
                                        }),
                                        dtHeaders.map((h)=>/*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableHeader */.A0N, {
                                                ...getHeaderProps({
                                                    header: h
                                                }),
                                                children: h.header
                                            }, h.key))
                                    ]
                                })
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableBody */.BFY, {
                                children: dtRows.map((row, idx)=>{
                                    const o = (orders ?? [])[idx];
                                    const completed = o?.fulfillerStatus === 'COMPLETED';
                                    const declined = o?.fulfillerStatus === 'DECLINED';
                                    // A referral is "terminal" once it's either completed or declined;
                                    // no further action buttons should be offered.
                                    const terminal = completed || declined;
                                    // Record response / Decline belong to the facility the referral was sent to, so
                                    // they are only offered on referrals in; a referral out is answered elsewhere, except a PCI
                                    // referral, whose response is recorded here (demo).
                                    const referralIn = isReferralIn(o);
                                    const answerable = referralIn || isPciReferral(o);
                                    const fmt = (v)=>v === null || v === undefined || v === '' ? /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                            style: {
                                                color: '#8d8d8d'
                                            },
                                            children: "—"
                                        }) : v;
                                    const fmtDate = (v)=>v ? new Date(v).toLocaleString() : null;
                                    // The fulfiller name is encoded in fulfillerComment as `<comment> | by: <name>`
                                    // (see close-referral-order.ts). Split it for display.
                                    const splitFulfiller = (raw)=>{
                                        if (!raw) return {
                                            comment: null,
                                            by: null
                                        };
                                        const idx = raw.indexOf(' | by: ');
                                        if (idx < 0) return {
                                            comment: raw,
                                            by: null
                                        };
                                        return {
                                            comment: raw.slice(0, idx) || null,
                                            by: raw.slice(idx + ' | by: '.length) || null
                                        };
                                    };
                                    const { comment: fulfillerCommentText, by: fulfilledBy } = splitFulfiller(o?.fulfillerComment);
                                    return /*#__PURE__*/ (0,jsx_runtime.jsxs)((consume_shared_module_default_react_singleton_default()).Fragment, {
                                        children: [
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableExpandRow */.fZD, {
                                                ...getRowProps({
                                                    row
                                                }),
                                                children: row.cells.map((cell)=>{
                                                    if (cell.info.header === 'action') {
                                                        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableCell */.nA6, {
                                                            children: answerable && !terminal && /*#__PURE__*/ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
                                                                children: [
                                                                    activeVisit || isLoadingVisit ? /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                                                                        kind: "tertiary",
                                                                        size: "sm",
                                                                        disabled: !activeVisit,
                                                                        onClick: ()=>handleRecord(o),
                                                                        style: {
                                                                            marginRight: '0.5rem'
                                                                        },
                                                                        title: isPciReferral(o) ? t('recordPciResponseHint', 'The PCI centre has no system of its own here: record its answer to this referral out (stent procedure performed or not)') : undefined,
                                                                        children: isPciReferral(o) ? t('recordPciResponse', "Record PCI centre's response") : t('recordReferralResponse', 'Record referral response')
                                                                    }) : /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                                                                        kind: "tertiary",
                                                                        size: "sm",
                                                                        onClick: handleStartVisit,
                                                                        style: {
                                                                            marginRight: '0.5rem'
                                                                        },
                                                                        title: t('startVisitToRespondHint', 'Start a visit when the patient arrives, then record the referral response'),
                                                                        children: t('startVisitToRespond', 'Start visit to respond')
                                                                    }),
                                                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                                                                        kind: "danger--ghost",
                                                                        size: "sm",
                                                                        onClick: ()=>handleDecline(o),
                                                                        children: t('decline', 'Decline')
                                                                    })
                                                                ]
                                                            })
                                                        }, cell.id);
                                                    }
                                                    if (cell.info.header === 'direction') {
                                                        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableCell */.nA6, {
                                                            children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                                                                type: referralIn ? 'blue' : 'purple',
                                                                children: referralIn ? t('referralIn', 'Referral in') : t('referralOut', 'Referral out')
                                                            })
                                                        }, cell.id);
                                                    }
                                                    if (cell.info.header === 'status') {
                                                        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableCell */.nA6, {
                                                            children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                                                                type: completed ? 'green' : declined ? 'red' : referralIn ? 'gray' : 'cyan',
                                                                children: cell.value
                                                            })
                                                        }, cell.id);
                                                    }
                                                    return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableCell */.nA6, {
                                                        children: cell.value
                                                    }, cell.id);
                                                })
                                            }),
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableExpandedRow */.cwJ, {
                                                colSpan: dtHeaders.length + 2,
                                                children: /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                                    style: {
                                                        padding: '0.5rem 1rem'
                                                    },
                                                    children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListWrapper */.r9c, {
                                                        isCondensed: true,
                                                        selection: false,
                                                        ariaLabel: "Referral details",
                                                        children: /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListBody */.GRJ, {
                                                            children: [
                                                                /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListRow */.Cvq, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('referralType', 'Referral type')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(o?.concept?.display)
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('referenceNumber', 'Reference number')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(o?.accessionNumber)
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListRow */.Cvq, {
                                                                    children: [
                                                                        referralIn ? // a referral in arrives without its instructions (clinical text is redacted before
                                                                        // CCE), so show what this facility sent back with the Referral Response form instead
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
                                                                            children: [
                                                                                /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                                    noWrap: true,
                                                                                    children: t('clinicalNotes', 'Clinical notes')
                                                                                }),
                                                                                /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                                    children: fmt(responseNotes[o?.uuid])
                                                                                })
                                                                            ]
                                                                        }) : /*#__PURE__*/ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
                                                                            children: [
                                                                                /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                                    noWrap: true,
                                                                                    children: t('instructions', 'Instructions')
                                                                                }),
                                                                                /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                                    children: fmt(o?.instructions)
                                                                                })
                                                                            ]
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('urgency', 'Priority')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(o?.urgency)
                                                                        })
                                                                    ]
                                                                }),
                                                                isPciReferral(o) && /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListRow */.Cvq, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('stentProcedure', 'Stent procedure')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(stentProcedure[o?.uuid])
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {}),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {})
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListRow */.Cvq, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('orderedBy', 'Ordered by')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(o?.orderer?.person?.display ?? o?.orderer?.display)
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('dateActivatedFull', 'Date activated')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(fmtDate(o?.dateActivated))
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListRow */.Cvq, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('careSetting', 'Care setting')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(o?.careSetting?.display)
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('orderEncounter', 'Source encounter')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(o?.encounter?.display)
                                                                        })
                                                                    ]
                                                                }),
                                                                referralIn ? // fulfilment is recorded here only for referrals in; a referral out is fulfilled elsewhere
                                                                /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListRow */.Cvq, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('fulfilledBy', 'Fulfilled by')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: terminal ? fmt(fulfilledBy) : /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                                                                style: {
                                                                                    color: '#8d8d8d'
                                                                                },
                                                                                children: "—"
                                                                            })
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('fulfillerComment', 'Fulfiller comment')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(fulfillerCommentText)
                                                                        })
                                                                    ]
                                                                }) : /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListRow */.Cvq, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('referredTo', 'Referred to')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(referredToOf(o))
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {})
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    })
                                                })
                                            })
                                        ]
                                    }, row.id);
                                })
                            })
                        ]
                    })
            }),
            referralOutModal,
            /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* Modal */.aFV, {
                open: declineTarget !== null,
                modalHeading: t('declineReferralHeading', 'Decline referral {{orderNumber}}', {
                    orderNumber: declineTarget?.orderNumber ?? ''
                }),
                primaryButtonText: declineSubmitting ? t('declining', 'Declining…') : t('confirmDecline', 'Decline referral'),
                secondaryButtonText: t('cancel', 'Cancel'),
                primaryButtonDisabled: !declineReason || declineSubmitting,
                danger: true,
                onRequestClose: closeDeclineModal,
                onRequestSubmit: ()=>void submitDecline(),
                children: [
                    /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                        style: {
                            marginBottom: '1rem'
                        },
                        children: t('declineModalDescription', 'Choose a reason for declining this referral. The reason and any notes are saved with the order and visible to the source system.')
                    }),
                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Dropdown */.msM, {
                        id: "referral-decline-reason",
                        titleText: t('reason', 'Reason'),
                        label: t('selectReason', 'Select a reason'),
                        items: declineReasons,
                        selectedItem: declineReason,
                        onChange: ({ selectedItem })=>setDeclineReason(selectedItem)
                    }),
                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                        style: {
                            marginTop: '1rem'
                        },
                        children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TextArea */.fs1, {
                            id: "referral-decline-notes",
                            labelText: t('additionalNotes', 'Additional notes (optional)'),
                            placeholder: t('notesPlaceholder', 'Any clinical context for the source system'),
                            value: declineNotes,
                            onChange: (e)=>setDeclineNotes(e.target.value),
                            rows: 3,
                            maxCount: 500,
                            enableCounter: true
                        })
                    })
                ]
            })
        ]
    });
};
/* harmony default export */ const referrals_dashboard_component = (ReferralsDashboard);

;// ./src/imaging/imaging-dashboard-link.component.tsx




/** "Imaging" in the home page's left navigation, next to Laboratory (home/imaging). */ const ImagingDashboardLink = ()=>{
    const { t } = (0,consume_shared_module_default_react_i18next_singleton_.useTranslation)();
    const isActive = ()=>window.location.pathname.split('/').includes('imaging');
    const [active, setActive] = (0,consume_shared_module_default_react_singleton_.useState)(isActive);
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        const onRoute = ()=>setActive(isActive());
        window.addEventListener('single-spa:routing-event', onRoute);
        return ()=>window.removeEventListener('single-spa:routing-event', onRoute);
    }, []);
    return /*#__PURE__*/ (0,jsx_runtime.jsx)(esm_framework_singleton_.ConfigurableLink, {
        to: `\${openmrsSpaBase}/home/imaging`,
        className: `cds--side-nav__link${active ? ' active-left-nav-link' : ''}`,
        children: t('imaging', 'Imaging')
    });
};
/* harmony default export */ const imaging_dashboard_link_component = (ImagingDashboardLink);

;// ./src/imaging/imaging.resource.ts

const REST = '/ws/rest/v1';
const ORDER_REPRESENTATION = 'custom:(uuid,orderNumber,dateActivated,dateStopped,fulfillerStatus,urgency,instructions,action,' + 'concept:(uuid,display),orderer:(display,person:(display)),encounter:(uuid,visit:(uuid)),' + 'patient:(uuid,display,person:(age,gender,preferredName:(display))))';
const isoDay = (d, endOfDay = false)=>{
    const day = new Date(d);
    if (endOfDay) day.setHours(23, 59, 59, 999);
    else day.setHours(0, 0, 0, 0);
    return day.toISOString();
};
function toImagingOrder(o) {
    // patient display is "<identifier> - <name>"
    const display = o.patient?.display ?? '';
    const sep = display.indexOf(' - ');
    return {
        uuid: o.uuid,
        orderNumber: o.orderNumber,
        dateActivated: o.dateActivated,
        dateStopped: o.dateStopped,
        fulfillerStatus: o.fulfillerStatus,
        urgency: o.urgency,
        instructions: o.instructions,
        concept: o.concept,
        ordererName: o.orderer?.person?.display ?? o.orderer?.display,
        encounterUuid: o.encounter?.uuid,
        visitUuid: o.encounter?.visit?.uuid,
        patient: {
            uuid: o.patient?.uuid,
            name: o.patient?.person?.preferredName?.display ?? (sep >= 0 ? display.slice(sep + 3) : display),
            identifier: sep >= 0 ? display.slice(0, sep) : '',
            age: o.patient?.person?.age,
            gender: o.patient?.person?.gender
        }
    };
}
const newOrdersFirst = (rows)=>rows.filter((o)=>(o.action ?? 'NEW').toUpperCase() === 'NEW').map(toImagingOrder).sort((a, b)=>+new Date(b.dateActivated) - +new Date(a.dateActivated));
/**
 * Imaging orders activated in the date range, across patients (new orders only, voided ones excluded). The range is
 * whole days in the browser's time zone. The server drops the time of both bounds and widens them to whole days in
 * its own time zone (UTC), so with a browser ahead of UTC the 24th also brings the evening of the 23rd: the server's
 * answer is only a superset, and the exact range is applied here.
 */ async function fetchImagingOrders(orderTypeUuid, from, to) {
    const start = isoDay(from);
    const end = isoDay(to, true);
    const res = await (0,esm_framework_singleton_.openmrsFetch)(`${REST}/order?orderTypes=${orderTypeUuid}&activatedOnOrAfterDate=${encodeURIComponent(start)}` + `&activatedOnOrBeforeDate=${encodeURIComponent(end)}&v=${ORDER_REPRESENTATION}&limit=100`);
    const inRange = (o)=>{
        const at = +new Date(o.dateActivated);
        return at >= +new Date(start) && at <= +new Date(end);
    };
    return newOrdersFirst((res.data?.results ?? []).filter(inRange));
}
/** The patient's imaging orders, newest first (for the chart's Imaging results). */ async function fetchPatientImagingOrders(patientUuid, orderTypeUuid) {
    const res = await (0,esm_framework_singleton_.openmrsFetch)(`${REST}/order?patient=${patientUuid}&orderTypes=${orderTypeUuid}&v=${ORDER_REPRESENTATION}&limit=100`);
    return newOrdersFirst(res.data?.results ?? []);
}
/** The caption a result is uploaded with; it starts with the order number, which is how the result is found. */ const resultCaption = (order)=>`${order.orderNumber} · ${order.concept.display}`;
const toResultFile = (a)=>({
        uuid: a.uuid,
        dateTime: a.dateTime,
        filename: a.filename,
        contentFamily: a.bytesContentFamily,
        url: (0,esm_framework_singleton_.makeUrl)(`${REST}/attachment/${a.uuid}/bytes`)
    });
const newest = (rows)=>[
        ...rows
    ].sort((a, b)=>+new Date(b.dateTime) - +new Date(a.dateTime))[0];
/**
 * The newest file uploaded as the result of the order: an attachment captioned with the order number, or else (the
 * earlier convention) an attachment in the order's own encounter.
 */ async function fetchImagingResult(order) {
    const res = await (0,esm_framework_singleton_.openmrsFetch)(`${REST}/attachment?patient=${order.patient.uuid}&v=full`);
    const captioned = (res.data?.results ?? []).filter((a)=>typeof a.comment === 'string' && a.comment.startsWith(`${order.orderNumber} `));
    if (captioned.length) return toResultFile(newest(captioned));
    if (!order.encounterUuid) return null;
    const inEncounter = await (0,esm_framework_singleton_.openmrsFetch)(`${REST}/attachment?patient=${order.patient.uuid}&encounter=${order.encounterUuid}&v=full`);
    const rows = inEncounter.data?.results ?? [];
    return rows.length ? toResultFile(newest(rows)) : null;
}
/**
 * Uploads the result (e.g. the ECG from the machine) as an attachment in the order's own encounter, then moves the
 * order to IN_PROGRESS: the result is in but not yet reviewed (Complete review marks it COMPLETED). In the order's
 * encounter the emitted Observation carries the encounter's links (e.g. source-referral-order for an ECG ordered from
 * the Referral Response form), so CCE can tie the upload to the order's referral. Without an encounter (not expected)
 * it falls back to the order's visit. The caption starts with the order number, which is how the result is found.
 */ async function uploadImagingResult(order, file) {
    const form = new FormData();
    form.append('patient', order.patient.uuid);
    if (order.encounterUuid) form.append('encounter', order.encounterUuid);
    else if (order.visitUuid) form.append('visit', order.visitUuid);
    form.append('fileCaption', resultCaption(order));
    form.append('file', file, file.name);
    const uploaded = await (0,esm_framework_singleton_.openmrsFetch)(`${REST}/attachment`, {
        method: 'POST',
        body: form
    });
    await (0,esm_framework_singleton_.openmrsFetch)(`${REST}/order/${order.uuid}/fulfillerdetails`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            fulfillerStatus: 'IN_PROGRESS',
            fulfillerComment: 'Result uploaded, review pending'
        }
    });
    return uploaded.data?.uuid;
}
/** The saved review of the order (the "Imaging review" obs group linked to it), if any. */ async function fetchImagingReview(order, concepts) {
    const res = await (0,esm_framework_singleton_.openmrsFetch)(`${REST}/obs?patient=${order.patient.uuid}&concept=${concepts.set}` + `&v=custom:(uuid,obsDatetime,order:(uuid),groupMembers:(concept:(uuid),value))`);
    const group = (res.data?.results ?? []).filter((o)=>o.order?.uuid === order.uuid).sort((a, b)=>+new Date(b.obsDatetime) - +new Date(a.obsDatetime))[0];
    if (!group) return null;
    const valueOf = (concept)=>String((group.groupMembers ?? []).find((m)=>m.concept?.uuid === concept)?.value ?? '');
    return {
        at: group.obsDatetime,
        finding: valueOf(concepts.finding),
        diagnosis: valueOf(concepts.diagnosis),
        plan: valueOf(concepts.plan)
    };
}
/**
 * Saves the review as an "Imaging review" obs group linked to the order, in the order's encounter (the chart's Orders
 * widget lists an order's result from the obs of its encounter that point at it), then marks the order COMPLETED.
 * Adding obs does not change the encounter itself, so a Referral Response encounter is not sent again.
 */ async function completeImagingReview(order, review, concepts) {
    const obsDatetime = new Date().toISOString();
    const member = (concept, value)=>value.trim() ? [
            {
                person: order.patient.uuid,
                obsDatetime,
                order: order.uuid,
                concept,
                value: value.trim()
            }
        ] : [];
    await (0,esm_framework_singleton_.openmrsFetch)(`${REST}/obs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            person: order.patient.uuid,
            encounter: order.encounterUuid,
            order: order.uuid,
            obsDatetime,
            concept: concepts.set,
            groupMembers: [
                ...member(concepts.finding, review.finding),
                ...member(concepts.diagnosis, review.diagnosis),
                ...member(concepts.plan, review.plan)
            ]
        }
    });
    await (0,esm_framework_singleton_.openmrsFetch)(`${REST}/order/${order.uuid}/fulfillerdetails`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            fulfillerStatus: 'COMPLETED',
            fulfillerComment: 'Reviewed'
        }
    });
}
/** The ecgai OpenMRS module's REST endpoints (modules/ecgai). */ const aiPath = (path)=>`${REST}/ecgai/${path}`;
/** The saved AI read of the order, if any (newest). */ async function fetchAiRead(order, conceptUuid) {
    const res = await (0,esm_framework_singleton_.openmrsFetch)(`${REST}/obs?patient=${order.patient.uuid}&concept=${conceptUuid}&v=custom:(uuid,obsDatetime,value,order:(uuid))`);
    const row = (res.data?.results ?? []).filter((o)=>o.order?.uuid === order.uuid).sort((a, b)=>+new Date(b.obsDatetime) - +new Date(a.obsDatetime))[0];
    if (!row) return null;
    try {
        return JSON.parse(String(row.value));
    } catch  {
        return null;
    }
}
/** Asks the ecgai module to read the order's uploaded ECG (it saves the result on the order). */ async function startAiRead(order, attachmentUuid) {
    const res = await (0,esm_framework_singleton_.openmrsFetch)(aiPath('interpret'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            orderUuid: order.uuid,
            attachmentUuid
        }
    });
    return res.data;
}
async function fetchAiStatus(order) {
    const res = await (0,esm_framework_singleton_.openmrsFetch)(aiPath(`status/${order.uuid}`));
    return res.data;
}

;// ./src/imaging/imaging-result.component.tsx

/**
 * The result of one imaging order, in one of two places:
 * - mode "upload", on the Imaging page (imaging staff): upload the file from the machine; afterwards only the image,
 *   with whether the doctor has reviewed it.
 * - mode "review", in the patient chart's Imaging results (the doctor, back in consultation): the image, and for an
 *   ECG the AI interpretation and, once the AI read is in (and not disputed), the assessment: working diagnosis and
 *   the STEMI pathway with the cardiac centres; then Complete review.
 *
 * The order's status follows the work: uploading the file moves it to IN_PROGRESS (in review); "Complete review"
 * saves the review as the order's result (an "Imaging review" obs group: finding, working diagnosis, plan) and marks
 * it COMPLETED. A completed order shows that saved review, read-only. Until then the clinician's picks are kept in
 * sessionStorage. "Yes, refer for primary PCI" raises a real referral out to the chosen cardiac centre (Referral order
 * in a Referral Out encounter, see create-referral-out.ts); "Send to cardiologist" is not connected yet.
 *
 * The AI read comes from the ecgai OpenMRS module (modules/ecgai): the upload starts it, the module sends the ECG to the
 * configured LLM and saves the result on the order ("ECG AI interpretation" observation). In review it is loaded from
 * there, or started and polled when missing; without an API key on the backend the demo read from config is shown.
 */ 





const AI_POLL_MS = 3000;
const EMPTY = {
    finding: '',
    aiAgreedAt: null,
    sentToCardiologistAt: null,
    readingDiffers: '',
    diagnosis: '',
    diagnosisEdited: false,
    centre: null,
    given: {},
    referDecision: null
};
const storageKey = (orderUuid)=>`imaging-assessment:${orderUuid}`;
function loadAssessment(orderUuid) {
    try {
        const raw = window.sessionStorage.getItem(storageKey(orderUuid));
        return raw ? {
            ...EMPTY,
            ...JSON.parse(raw)
        } : EMPTY;
    } catch  {
        return EMPTY;
    }
}
const hhmm = (iso)=>iso ? new Date(iso).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }) : '';
const addMinutes = (iso, minutes)=>new Date(+new Date(iso) + minutes * 60000).toISOString();
const ImagingResult = ({ order, mode, onUploaded, onCompleted })=>{
    const { t: translate } = (0,consume_shared_module_default_react_i18next_singleton_.useTranslation)();
    // React escapes rendered text, so i18next must not escape interpolated values too.
    const t = (0,consume_shared_module_default_react_singleton_.useCallback)((key, defaultValue, options)=>translate(key, defaultValue, {
            ...options,
            interpolation: {
                escapeValue: false
            }
        }), [
        translate
    ]);
    const config = (0,esm_framework_singleton_.useConfig)();
    const { imaging } = config;
    const isEcg = imaging.ecgConceptUuids.includes(order.concept.uuid);
    const [file, setFile] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [loading, setLoading] = (0,consume_shared_module_default_react_singleton_.useState)(true);
    const [uploading, setUploading] = (0,consume_shared_module_default_react_singleton_.useState)(false);
    const [error, setError] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [referring, setReferring] = (0,consume_shared_module_default_react_singleton_.useState)(false);
    const fileInput = (0,consume_shared_module_default_react_singleton_.useRef)(null);
    const [a, setA] = (0,consume_shared_module_default_react_singleton_.useState)(()=>loadAssessment(order.uuid));
    const update = (0,consume_shared_module_default_react_singleton_.useCallback)((patch)=>setA((cur)=>{
            const next = {
                ...cur,
                ...patch
            };
            try {
                window.sessionStorage.setItem(storageKey(order.uuid), JSON.stringify(next));
            } catch  {
            /* storage unavailable: kept in memory only */ }
            return next;
        }), [
        order.uuid
    ]);
    const completed = order.fulfillerStatus === 'COMPLETED';
    const [review, setReview] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [completing, setCompleting] = (0,consume_shared_module_default_react_singleton_.useState)(false);
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        let cancelled = false;
        Promise.all([
            fetchImagingResult(order).then((f)=>!cancelled && setFile(f)),
            completed && mode === 'review' ? fetchImagingReview(order, imaging.reviewConceptUuids).then((r)=>!cancelled && setReview(r)) : Promise.resolve()
        ]).catch((e)=>!cancelled && setError(e?.message ?? String(e))).finally(()=>!cancelled && setLoading(false));
        return ()=>{
            cancelled = true;
        };
    }, [
        order,
        completed,
        mode,
        imaging.reviewConceptUuids
    ]);
    // the doctor works on the review between the upload and Complete review; a completed order is read-only
    const reviewing = mode === 'review' && !!file && !completed;
    // ---- AI read ----
    const [aiRead, setAiRead] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [aiState, setAiState] = (0,consume_shared_module_default_react_singleton_.useState)('loading');
    const [aiError, setAiError] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [aiAttempt, setAiAttempt] = (0,consume_shared_module_default_react_singleton_.useState)(0); // bumped by Retry
    const wantsAi = isEcg && mode === 'review' && !!file;
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        if (!wantsAi || !file) return;
        if (!imaging.aiRead.enabled) {
            setAiState('demo');
            return;
        }
        let cancelled = false;
        let timer;
        const fail = (message)=>{
            if (cancelled) return;
            setAiError(message);
            setAiState('failed');
        };
        const loadSaved = async ()=>{
            const saved = await fetchAiRead(order, imaging.aiRead.conceptUuid);
            if (cancelled) return true;
            if (saved) {
                setAiRead(saved);
                setAiState('done');
                return true;
            }
            return false;
        };
        const poll = async ()=>{
            try {
                const st = await fetchAiStatus(order);
                if (cancelled) return;
                if (st.status === 'running') timer = window.setTimeout(poll, AI_POLL_MS);
                else if (st.status === 'done') {
                    if (!await loadSaved()) fail(t('aiReadNotSaved', 'The AI read finished but was not saved.'));
                } else if (st.status === 'not_configured') setAiState('demo');
                else fail(st.error ?? t('aiReadFailed', 'The AI read failed.'));
            } catch (e) {
                fail(e?.message ?? String(e));
            }
        };
        (async ()=>{
            setAiError(null);
            setAiState('loading');
            try {
                if (aiAttempt === 0 && await loadSaved()) return;
                if (cancelled) return;
                if (completed && aiAttempt === 0) {
                    setAiState('none'); // reviewed before AI reads existed: nothing to start
                    return;
                }
                const st = aiAttempt === 0 ? await fetchAiStatus(order) : await startAiRead(order, file.uuid);
                if (cancelled) return;
                if (st.status === 'not_configured') setAiState('demo');
                else if (st.status === 'done') {
                    if (!await loadSaved()) fail(t('aiReadNotSaved', 'The AI read finished but was not saved.'));
                } else if (st.status === 'failed') fail(st.error ?? t('aiReadFailed', 'The AI read failed.'));
                else {
                    // idle: never asked (e.g. uploaded before the module existed) -> ask now; running -> wait
                    if (st.status === 'idle') {
                        const started = await startAiRead(order, file.uuid);
                        if (cancelled) return;
                        if (started.status === 'not_configured') {
                            setAiState('demo');
                            return;
                        }
                    }
                    setAiState('running');
                    timer = window.setTimeout(poll, AI_POLL_MS);
                }
            } catch (e) {
                fail(e?.message ?? String(e));
            }
        })();
        return ()=>{
            cancelled = true;
            if (timer) window.clearTimeout(timer);
        };
    }, [
        wantsAi,
        file,
        order,
        completed,
        imaging.aiRead.enabled,
        imaging.aiRead.conceptUuid,
        aiAttempt,
        t
    ]);
    const demoRead = aiState === 'demo';
    const aiReady = demoRead || aiState === 'done' && !!aiRead;
    // the finding and diagnosis come from the AI read; the config texts are the demo read
    const headline = aiRead?.headline || imaging.ecgAiFinding;
    const suggestedDiagnosis = aiRead?.suggestedDiagnosis || imaging.suggestedDiagnosis;
    const referralAdvised = aiRead ? aiRead.disposition === 'IMMEDIATE_CATH_LAB_REFERRAL' : true;
    const assessing = isEcg && reviewing && aiReady && !a.readingDiffers;
    const pathwayOpen = assessing && referralAdvised;
    const noReferral = assessing && !referralAdvised;
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        if (assessing && !a.diagnosisEdited && a.diagnosis !== suggestedDiagnosis) {
            update({
                diagnosis: suggestedDiagnosis
            });
        }
    }, [
        assessing,
        a.diagnosisEdited,
        a.diagnosis,
        suggestedDiagnosis,
        update
    ]);
    const onFileChosen = (0,consume_shared_module_default_react_singleton_.useCallback)(async (e)=>{
        const chosen = e.target.files?.[0];
        e.target.value = '';
        if (!chosen) return;
        setUploading(true);
        setError(null);
        try {
            const attachmentUuid = await uploadImagingResult(order, chosen);
            // start the AI read now, so it is ready when the doctor opens Imaging results (the module saves it)
            if (isEcg && imaging.aiRead.enabled && attachmentUuid) {
                startAiRead(order, attachmentUuid).catch(()=>{
                /* the review page retries */ });
            }
            setFile(await fetchImagingResult(order));
            onUploaded?.();
            (0,esm_framework_singleton_.showSnackbar)({
                kind: 'success',
                title: t('resultUploadedTitle', '{{test}} uploaded', {
                    test: order.concept.display
                }),
                subtitle: t('resultUploadedSubtitle', '{{patient}}: the doctor reviews it in the patient\'s Imaging results.', {
                    patient: order.patient.name
                })
            });
        } catch (err) {
            setError(t('uploadFailed', 'Could not upload the result: {{err}}', {
                err: err?.message ?? String(err)
            }));
        } finally{
            setUploading(false);
        }
    }, [
        order,
        onUploaded,
        isEcg,
        imaging.aiRead.enabled,
        t
    ]);
    if (loading) return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* InlineLoading */.OuH, {
        description: t('loadingResult', 'Loading the result…')
    });
    const uploadLabel = isEcg ? t('uploadEcg', 'Upload ECG from the machine') : t('uploadResult', 'Upload result');
    const centres = imaging.cardiacCentres ?? [];
    const chosen = centres.find((c)=>c.name === a.centre) ?? centres.find((c)=>c.recommended) ?? centres[0];
    const within = (c)=>!!c && c.arteryOpenedMinutes <= imaging.pciLimitMinutes;
    const cardiologist = imaging.cardiologist;
    const sentAt = a.sentToCardiologistAt;
    const sentTo = `${cardiologist.name}, ${cardiologist.facility}`;
    const confirmation = sentAt ? t('confirmationPending', 'cardiologist confirmation pending') : a.aiAgreedAt ? t('agreedByMo', 'agreed by the MO') : t('notYetConfirmed', 'not yet confirmed by a clinician');
    // What Complete review saves as the order's result (the rows of the chart's Orders widget). Stored in English, as
    // clinical record text.
    const buildReview = ()=>{
        if (!isEcg) return {
            finding: a.finding,
            diagnosis: a.diagnosis,
            plan: ''
        };
        let finding = a.readingDiffers ? `${headline} (AI read); clinician reading differs: ${a.readingDiffers}` : a.aiAgreedAt ? `${headline} (AI read, agreed by the MO at ${hhmm(a.aiAgreedAt)})` : `${headline} (AI read)`;
        if (sentAt) finding += `; sent to ${sentTo} for confirmatory interpretation at ${hhmm(sentAt)}, reply pending`;
        const given = Object.entries(a.given).map(([item, at])=>`${item.split(',')[0]} at ${hhmm(at)}`);
        let plan;
        if (a.readingDiffers) plan = 'STEMI pathway paused: the clinician reading differs from the AI read';
        else if (noReferral) plan = 'No referral: serial ECG monitoring (AI disposition)';
        else if (a.referDecision?.kind === 'accepted' && chosen) plan = `${within(chosen) ? 'Refer for primary PCI' : 'Fibrinolysis, then refer for PCI'}: ${chosen.name} ` + `(${a.referDecision.orderNumber ? `referral ${a.referDecision.orderNumber}; ` : ''}` + `artery opened about ${chosen.arteryOpenedMinutes} minutes after the ECG)`;
        else plan = `Not referred now${a.referDecision?.reason ? `: ${a.referDecision.reason}` : ''}`;
        if (given.length) plan += `. Given: ${given.join(', ')}`;
        return {
            finding,
            diagnosis: a.diagnosis,
            plan
        };
    };
    // "Yes, refer": raise the referral out to the chosen centre in the ECG order's visit; on the Referrals page it then
    // offers "Record referral response" (the PCI response form).
    const referPci = async ()=>{
        if (!chosen) return;
        setError(null);
        if (!chosen.locationUuid) {
            setError(t('centreNoLocation', '{{centre}} has no location in the configuration, so it cannot be referred to.', {
                centre: chosen.name
            }));
            return;
        }
        if (!order.visitUuid) {
            setError(t('ecgNoVisit', 'The ECG order has no visit, so the referral cannot be raised.'));
            return;
        }
        setReferring(true);
        try {
            const { orderNumber } = await createReferralOut({
                patientUuid: order.patient.uuid,
                visitUuid: order.visitUuid,
                conceptUuid: imaging.pciReferral.conceptUuid,
                destinationLocationUuid: chosen.locationUuid,
                urgency: 'STAT',
                instructions: `${within(chosen) ? 'Primary PCI' : 'PCI after fibrinolysis'}: ${headline} ` + `(ECG ${order.orderNumber}${a.diagnosis ? `; working diagnosis ${a.diagnosis}` : ''})`
            }, config);
            update({
                referDecision: {
                    kind: 'accepted',
                    at: new Date().toISOString(),
                    orderNumber
                }
            });
            (0,esm_framework_singleton_.showSnackbar)({
                kind: 'success',
                isLowContrast: true,
                title: t('pciReferralRaised', 'Referral {{orderNumber}} raised', {
                    orderNumber
                }),
                subtitle: t('pciReferralRaisedTo', 'Referral for primary PCI to {{centre}}', {
                    centre: chosen.name
                })
            });
        } catch (err) {
            const message = err?.responseBody?.error?.message ?? err?.message ?? String(err);
            setError(t('pciReferralFailed', 'Could not raise the referral: {{err}}', {
                err: message
            }));
        } finally{
            setReferring(false);
        }
    };
    // What is still needed before the review can be completed (null when it can)
    const missing = !isEcg ? a.finding.trim() ? null : t('missingFinding', 'Record the finding.') : a.readingDiffers ? null : !a.aiAgreedAt && !sentAt ? t('missingAiDecision', 'Agree with the AI read, send it to the cardiologist, or record that your reading differs.') : !pathwayOpen ? null : !a.referDecision ? t('missingReferDecision', 'Decide on the referral: refer for PCI, or not now.') : a.referDecision.kind === 'declined' && !a.referDecision.reason ? t('missingDeclineReason', 'Choose the reason for not referring now.') : null;
    const complete = async ()=>{
        setCompleting(true);
        setError(null);
        try {
            await completeImagingReview(order, buildReview(), imaging.reviewConceptUuids);
            try {
                window.sessionStorage.removeItem(storageKey(order.uuid));
            } catch  {
            /* nothing to clear */ }
            (0,esm_framework_singleton_.showSnackbar)({
                kind: 'success',
                title: t('reviewCompleted', 'Review completed'),
                subtitle: t('reviewCompletedSubtitle', '{{orderNumber}} · {{patient}}: saved as the order result.', {
                    orderNumber: order.orderNumber,
                    patient: order.patient.name
                })
            });
            onCompleted?.();
        } catch (e) {
            setError(t('reviewFailed', 'Could not complete the review: {{err}}', {
                err: e?.message ?? String(e)
            }));
            setCompleting(false);
        }
    };
    const renderAiBody = ()=>{
        if (aiState === 'loading') return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* InlineLoading */.OuH, {
            description: t('aiReadLoading', 'Loading the AI read…')
        });
        if (aiState === 'running') return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* InlineLoading */.OuH, {
            description: t('aiReadRunning', 'The AI is reading the ECG… (this can take a minute)')
        });
        if (aiState === 'failed') return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
            className: "img-actrow",
            style: {
                marginTop: 0
            },
            children: [
                /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                    className: "img-error",
                    style: {
                        padding: 0
                    },
                    children: t('aiReadError', 'AI read failed: {{err}}', {
                        err: aiError ?? ''
                    })
                }),
                !completed && /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                    kind: "tertiary",
                    size: "sm",
                    onClick: ()=>setAiAttempt((n)=>n + 1),
                    children: t('retryAiRead', 'Retry AI read')
                })
            ]
        });
        if (aiState === 'none') return /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
            className: "img-small",
            children: t('noAiRead', 'No AI read was saved for this ECG.')
        });
        if (aiState === 'demo') return /*#__PURE__*/ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
            children: [
                /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                    type: "warm-gray",
                    size: "sm",
                    children: t('aiDemoRead', 'Demo read: AI service not configured')
                }),
                /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                    children: imaging.ecgAiInterpretation
                })
            ]
        });
        if (!aiRead) return null;
        const urgent = aiRead.disposition === 'IMMEDIATE_CATH_LAB_REFERRAL';
        return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
            className: "img-ai",
            children: [
                !aiRead.isTwelveLeadEcg && /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                    type: "red",
                    size: "sm",
                    children: t('notTwelveLead', 'The AI could not read this file as a 12-lead ECG')
                }),
                /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                    className: "img-label",
                    children: t('aiSectionInterpretation', '1. ECG interpretation')
                }),
                /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                    children: aiRead.ecgInterpretation
                }),
                /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                    className: "img-label",
                    children: t('aiSectionDisposition', '2. Disposition')
                }),
                /*#__PURE__*/ (0,jsx_runtime.jsxs)("p", {
                    children: [
                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                            type: urgent ? 'red' : 'green',
                            size: "sm",
                            children: urgent ? t('dispositionUrgent', 'Immediate cath lab referral / urgent PCI transfer') : t('dispositionNoReferral', 'No referral / serial ECG monitoring')
                        }),
                        ' ',
                        aiRead.dispositionText
                    ]
                }),
                /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                    className: "img-label",
                    children: t('aiSectionNextSteps', '3. Immediate next steps')
                }),
                /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                    className: "img-ai-steps",
                    children: [
                        /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                    className: "img-small",
                                    children: t('pciWithin120', 'If PCI transfer is achievable within 120 minutes')
                                }),
                                /*#__PURE__*/ (0,jsx_runtime.jsx)("ul", {
                                    children: aiRead.nextStepsIfPciWithin120Min.map((step, i)=>/*#__PURE__*/ (0,jsx_runtime.jsx)("li", {
                                            children: step
                                        }, i))
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                    className: "img-small",
                                    children: t('pciBeyond120', 'If PCI transfer will exceed 120 minutes')
                                }),
                                /*#__PURE__*/ (0,jsx_runtime.jsx)("ul", {
                                    children: aiRead.nextStepsIfPciBeyond120Min.map((step, i)=>/*#__PURE__*/ (0,jsx_runtime.jsx)("li", {
                                            children: step
                                        }, i))
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    };
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
        className: "img-result",
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)("input", {
                ref: fileInput,
                className: "img-file-input",
                type: "file",
                accept: ".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf",
                onChange: onFileChosen
            }),
            error && /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                className: "img-error",
                children: error
            }),
            !file && completed && /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                className: "img-small",
                children: t('noResultFile', 'No result file was uploaded for this order.')
            }),
            !file && !completed && mode === 'review' && /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                className: "img-small",
                children: isEcg ? t('waitingForEcg', 'Waiting for the ECG to be uploaded on the Imaging page.') : t('waitingForResult', 'Waiting for the result to be uploaded on the Imaging page.')
            }),
            !file && !completed && mode === 'upload' && /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                className: "img-actrow",
                style: {
                    marginTop: 0
                },
                children: uploading ? /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* InlineLoading */.OuH, {
                    description: t('uploading', 'Uploading…')
                }) : /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                    kind: "primary",
                    size: "md",
                    onClick: ()=>fileInput.current?.click(),
                    children: uploadLabel
                })
            }),
            file && /*#__PURE__*/ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
                children: [
                    /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "img-field",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                className: "img-label",
                                children: t('resultImageCaption', '{{test}} · uploaded {{time}} · {{file}}', {
                                    test: order.concept.display,
                                    time: hhmm(file.dateTime),
                                    file: file.filename
                                })
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                className: "img-ecg-frame",
                                children: file.contentFamily === 'IMAGE' ? /*#__PURE__*/ (0,jsx_runtime.jsx)("img", {
                                    src: file.url,
                                    alt: order.concept.display
                                }) : /*#__PURE__*/ (0,jsx_runtime.jsx)("iframe", {
                                    src: file.url,
                                    title: order.concept.display
                                })
                            })
                        ]
                    }),
                    isEcg && mode === 'review' && /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "img-cds img-plain",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                className: "img-kind",
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                        children: t('aiInterpretation', 'AI interpretation')
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                                        type: "high-contrast",
                                        size: "sm",
                                        children: t('aiDisclaimer', 'AI · for clinician review, not a diagnosis')
                                    })
                                ]
                            }),
                            renderAiBody(),
                            reviewing && a.readingDiffers && /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                                className: "img-small",
                                children: t('readingDiffersNote', 'Clinician reading differs: {{reading}}. Recommendations paused for this ECG; send to the cardiologist if in doubt.', {
                                    reading: a.readingDiffers
                                })
                            }),
                            reviewing && sentAt && /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                className: "img-actrow",
                                children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                                    type: "purple",
                                    children: t('sentToCardiologist', 'Sent to {{to}}, at {{time}} · reply due by {{due}}', {
                                        to: sentTo,
                                        time: hhmm(sentAt),
                                        due: hhmm(addMinutes(sentAt, cardiologist.replyDueMinutes))
                                    })
                                })
                            }),
                            reviewing && !sentAt && /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                className: "img-actrow",
                                children: [
                                    a.aiAgreedAt ? /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                                        type: "green",
                                        children: t('agreedAt', 'Agreed by the MO {{time}}', {
                                            time: hhmm(a.aiAgreedAt)
                                        })
                                    }) : /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                                        kind: "tertiary",
                                        size: "md",
                                        disabled: !!a.readingDiffers || !aiReady,
                                        onClick: ()=>update({
                                                aiAgreedAt: new Date().toISOString()
                                            }),
                                        children: t('agreeWithAi', 'Agree with the AI read')
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                                        kind: a.aiAgreedAt ? 'tertiary' : 'primary',
                                        size: "md",
                                        onClick: ()=>update({
                                                sentToCardiologistAt: new Date().toISOString()
                                            }),
                                        children: t('sendToCardiologist', 'Send to cardiologist for confirmatory interpretation')
                                    }),
                                    !a.aiAgreedAt && /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* Select */.l6P, {
                                        id: `reading-differs-${order.uuid}`,
                                        labelText: t('readingDiffers', 'My reading differs'),
                                        value: a.readingDiffers,
                                        onChange: (e)=>update({
                                                readingDiffers: e.target.value
                                            }),
                                        children: [
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* SelectItem */.ebT, {
                                                value: "",
                                                text: t('choose', 'Choose')
                                            }),
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* SelectItem */.ebT, {
                                                value: "Normal ECG",
                                                text: t('normalEcg', 'Normal ECG')
                                            }),
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* SelectItem */.ebT, {
                                                value: "Different abnormality",
                                                text: t('differentAbnormality', 'Different abnormality, noted in the record')
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    isEcg && reviewing && /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "img-cds img-plain",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                className: "img-kind",
                                children: /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                    children: t('assessmentAndPlan', 'Assessment and plan')
                                })
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TextInput */.ksK, {
                                id: `diagnosis-${order.uuid}`,
                                labelText: pathwayOpen && !a.diagnosisEdited ? t('workingDiagnosisSuggested', 'Working diagnosis · suggested, edit if needed') : t('workingDiagnosis', 'Working diagnosis'),
                                placeholder: t('enterDiagnosis', 'Enter a diagnosis'),
                                value: a.diagnosis,
                                onChange: (e)=>update({
                                        diagnosis: e.target.value,
                                        diagnosisEdited: true
                                    })
                            }),
                            noReferral && aiRead && /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                className: "img-cds img-muted",
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                        className: "img-kind",
                                        children: /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                            children: t('aiDisposition', 'AI disposition')
                                        })
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                                        className: "img-cds-title",
                                        children: t('noReferralSerialEcg', 'No referral: serial ECG monitoring')
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                                        children: aiRead.dispositionText
                                    })
                                ]
                            }),
                            pathwayOpen && chosen && /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                className: "img-cds img-stop",
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                        className: "img-kind",
                                        children: /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                            children: t('stemiPathway', 'Recommendation · STEMI pathway')
                                        })
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                                        className: "img-cds-title",
                                        children: within(chosen) ? t('referPrimaryPci', 'Refer now for primary PCI') : t('giveLysis', 'Give fibrinolysis within 10 minutes, by {{time}}, then refer', {
                                            time: hhmm(addMinutes(file.dateTime, 10))
                                        })
                                    }),
                                    !within(chosen) && /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                                        children: t('lysisBody', 'PCI at {{centre}} would be about {{minutes}} minutes after the ECG, beyond the {{limit}}-minute limit. Check the reasons against fibrinolysis first.', {
                                            centre: chosen.name,
                                            minutes: chosen.arteryOpenedMinutes,
                                            limit: imaging.pciLimitMinutes
                                        })
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsxs)("ul", {
                                        className: "img-facts",
                                        children: [
                                            order.instructions && /*#__PURE__*/ (0,jsx_runtime.jsx)("li", {
                                                children: t('factOrderReason', 'Ordered for: {{reason}}', {
                                                    reason: order.instructions
                                                })
                                            }),
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)("li", {
                                                children: t('factEcg', 'ECG at {{time}}: {{finding}} (AI read, {{confirmation}})', {
                                                    time: hhmm(file.dateTime),
                                                    finding: headline,
                                                    confirmation
                                                })
                                            }),
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)("li", {
                                                children: t('factLimit', 'Limit: the artery should be opened within {{limit}} minutes of the ECG; if no centre can do that, fibrinolysis within 10 minutes, then transfer', {
                                                    limit: imaging.pciLimitMinutes
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                        className: "img-label",
                                        children: t('cardiacCentres', 'Cardiac centres with a cath lab · {{note}}', {
                                            note: imaging.cardiacCentresNote
                                        })
                                    }),
                                    centres.map((c)=>{
                                        const isChosen = c.name === chosen.name;
                                        return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                            className: `img-centre${isChosen ? ' img-chosen' : ''}`,
                                            children: [
                                                /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                                            className: "img-centre-name",
                                                            children: [
                                                                c.name,
                                                                ' ',
                                                                c.recommended && /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                                                                    type: "purple",
                                                                    size: "sm",
                                                                    children: t('recommended', 'Recommended')
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                                            className: "img-centre-meta",
                                                            children: [
                                                                c.distance,
                                                                c.travel,
                                                                c.cathLab,
                                                                t('arteryOpenedAbout', 'artery opened about {{minutes}} minutes after the ECG', {
                                                                    minutes: c.arteryOpenedMinutes
                                                                })
                                                            ].filter(Boolean).join(' · ')
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                                    className: "img-centre-side",
                                                    children: [
                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                                                            type: within(c) ? 'green' : 'warm-gray',
                                                            children: within(c) ? t('withinLimit', 'Within {{limit}} minutes', {
                                                                limit: imaging.pciLimitMinutes
                                                            }) : t('beyondLimit', 'Beyond {{limit}} minutes', {
                                                                limit: imaging.pciLimitMinutes
                                                            })
                                                        }),
                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                                                            size: "sm",
                                                            kind: isChosen ? 'secondary' : 'tertiary',
                                                            disabled: !!a.referDecision,
                                                            onClick: ()=>update({
                                                                    centre: c.name
                                                                }),
                                                            children: isChosen ? t('chosen', 'Chosen') : t('chooseCentre', 'Choose')
                                                        })
                                                    ]
                                                })
                                            ]
                                        }, c.name);
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                        className: "img-field",
                                        style: {
                                            marginTop: '0.75rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                                className: "img-label",
                                                children: t('giveNow', 'Give now, tick as given')
                                            }),
                                            imaging.giveNow.map((item, i)=>{
                                                const at = a.given[item];
                                                return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                                    className: "img-check",
                                                    children: [
                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Checkbox */.Sc0, {
                                                            id: `given-${order.uuid}-${i}`,
                                                            labelText: item,
                                                            checked: !!at,
                                                            onChange: (_, { checked })=>{
                                                                const given = {
                                                                    ...a.given
                                                                };
                                                                if (checked) given[item] = new Date().toISOString();
                                                                else delete given[item];
                                                                update({
                                                                    given
                                                                });
                                                            }
                                                        }),
                                                        at && /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                                                            type: "green",
                                                            size: "sm",
                                                            children: t('givenAt', 'given {{time}}', {
                                                                time: hhmm(at)
                                                            })
                                                        })
                                                    ]
                                                }, item);
                                            })
                                        ]
                                    }),
                                    a.referDecision?.kind === 'accepted' ? /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                        className: "img-actrow",
                                        children: [
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                                                type: "green",
                                                children: a.referDecision.orderNumber ? t('referRaised', 'Referral {{orderNumber}} to {{centre}} raised {{time}}', {
                                                    orderNumber: a.referDecision.orderNumber,
                                                    centre: chosen.name,
                                                    time: hhmm(a.referDecision.at)
                                                }) : t('referAccepted', 'Referral to {{centre}} accepted {{time}}', {
                                                    centre: chosen.name,
                                                    time: hhmm(a.referDecision.at)
                                                })
                                            }),
                                            !a.referDecision.orderNumber && /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                                                kind: "ghost",
                                                size: "sm",
                                                onClick: ()=>update({
                                                        referDecision: null
                                                    }),
                                                children: t('undo', 'Undo')
                                            })
                                        ]
                                    }) : a.referDecision?.kind === 'declined' ? /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                        className: "img-actrow",
                                        children: [
                                            /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* Select */.l6P, {
                                                id: `refer-declined-${order.uuid}`,
                                                labelText: t('reasonNotReferring', 'Reason for not referring now'),
                                                value: a.referDecision.reason ?? '',
                                                onChange: (e)=>update({
                                                        referDecision: {
                                                            ...a.referDecision,
                                                            reason: e.target.value
                                                        }
                                                    }),
                                                children: [
                                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* SelectItem */.ebT, {
                                                        value: "",
                                                        text: t('chooseReason', 'Choose a reason')
                                                    }),
                                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* SelectItem */.ebT, {
                                                        value: "Patient or family declined transfer",
                                                        text: t('familyDeclined', 'Patient or family declined transfer')
                                                    }),
                                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* SelectItem */.ebT, {
                                                        value: "Other, noted in the record",
                                                        text: t('otherNoted', 'Other, noted in the record')
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                                                kind: "tertiary",
                                                size: "md",
                                                onClick: ()=>update({
                                                        referDecision: null
                                                    }),
                                                children: t('reconsider', 'Reconsider')
                                            })
                                        ]
                                    }) : /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                        className: "img-actrow",
                                        children: [
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                                                kind: "primary",
                                                disabled: referring,
                                                onClick: ()=>void referPci(),
                                                children: referring ? /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* InlineLoading */.OuH, {
                                                    description: t('raisingReferral', 'Raising the referral…')
                                                }) : within(chosen) ? t('yesReferPci', 'Yes, refer for primary PCI') : t('yesReferAfterLysis', 'Yes, refer for PCI')
                                            }),
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                                                kind: "tertiary",
                                                onClick: ()=>update({
                                                        referDecision: {
                                                            kind: 'declined',
                                                            at: new Date().toISOString()
                                                        }
                                                    }),
                                                children: t('notNow', 'Not now')
                                            })
                                        ]
                                    })
                                ]
                            }),
                            a.readingDiffers && /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                className: "img-cds img-muted",
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                                        className: "img-cds-title",
                                        children: t('pathwayPaused', 'STEMI pathway paused')
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                                        children: t('pathwayPausedBody', 'Your reading of the ECG differs from the AI read. Send it to the cardiologist if in doubt.')
                                    })
                                ]
                            })
                        ]
                    }),
                    !isEcg && reviewing && /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "img-cds img-plain",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                className: "img-kind",
                                children: /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                    children: t('review', 'Review')
                                })
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TextArea */.fs1, {
                                id: `finding-${order.uuid}`,
                                labelText: t('finding', 'Finding'),
                                rows: 3,
                                value: a.finding,
                                onChange: (e)=>update({
                                        finding: e.target.value
                                    })
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                style: {
                                    marginTop: '0.75rem'
                                },
                                children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TextInput */.ksK, {
                                    id: `diagnosis-${order.uuid}`,
                                    labelText: t('workingDiagnosis', 'Working diagnosis'),
                                    value: a.diagnosis,
                                    onChange: (e)=>update({
                                            diagnosis: e.target.value,
                                            diagnosisEdited: true
                                        })
                                })
                            })
                        ]
                    }),
                    reviewing && /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "img-complete",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                                kind: "primary",
                                disabled: !!missing || completing,
                                onClick: ()=>void complete(),
                                children: completing ? t('completing', 'Completing…') : t('completeReview', 'Complete review')
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                className: "img-small",
                                children: missing ?? t('completeReviewHint', 'Saves the review as the order result and moves the order to Completed.')
                            })
                        ]
                    }),
                    mode === 'upload' && /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "img-actrow",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                                type: completed ? 'green' : 'blue',
                                children: completed ? t('statusReviewed', 'Reviewed') : t('statusAwaitingReview', 'Awaiting review')
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                className: "img-small",
                                children: completed ? t('reviewedByDoctor', 'The doctor has reviewed this result.') : t('awaitingReviewHint', 'The doctor reviews it in the patient\'s Imaging results.')
                            })
                        ]
                    }),
                    completed && mode === 'review' && /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "img-cds img-plain",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                className: "img-kind",
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                        children: t('review', 'Review')
                                    }),
                                    review?.at && /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                                        type: "green",
                                        size: "sm",
                                        children: t('reviewedAt', 'Reviewed {{time}}', {
                                            time: new Date(review.at).toLocaleString()
                                        })
                                    })
                                ]
                            }),
                            review ? /*#__PURE__*/ (0,jsx_runtime.jsxs)("dl", {
                                className: "img-review",
                                children: [
                                    review.finding && /*#__PURE__*/ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
                                        children: [
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)("dt", {
                                                children: t('finding', 'Finding')
                                            }),
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)("dd", {
                                                children: review.finding
                                            })
                                        ]
                                    }),
                                    review.diagnosis && /*#__PURE__*/ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
                                        children: [
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)("dt", {
                                                children: t('workingDiagnosis', 'Working diagnosis')
                                            }),
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)("dd", {
                                                children: review.diagnosis
                                            })
                                        ]
                                    }),
                                    review.plan && /*#__PURE__*/ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
                                        children: [
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)("dt", {
                                                children: t('plan', 'Plan')
                                            }),
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)("dd", {
                                                children: review.plan
                                            })
                                        ]
                                    })
                                ]
                            }) : /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                                className: "img-small",
                                children: t('noReviewSaved', 'Completed without a saved review.')
                            })
                        ]
                    })
                ]
            })
        ]
    });
};
/* harmony default export */ const imaging_result_component = (ImagingResult);

// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js
var injectStylesIntoStyleTag = __webpack_require__(72);
var injectStylesIntoStyleTag_default = /*#__PURE__*/__webpack_require__.n(injectStylesIntoStyleTag);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleDomAPI.js
var styleDomAPI = __webpack_require__(825);
var styleDomAPI_default = /*#__PURE__*/__webpack_require__.n(styleDomAPI);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertBySelector.js
var insertBySelector = __webpack_require__(659);
var insertBySelector_default = /*#__PURE__*/__webpack_require__.n(insertBySelector);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js
var setAttributesWithoutAttributes = __webpack_require__(56);
var setAttributesWithoutAttributes_default = /*#__PURE__*/__webpack_require__.n(setAttributesWithoutAttributes);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertStyleElement.js
var insertStyleElement = __webpack_require__(540);
var insertStyleElement_default = /*#__PURE__*/__webpack_require__.n(insertStyleElement);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleTagTransform.js
var styleTagTransform = __webpack_require__(113);
var styleTagTransform_default = /*#__PURE__*/__webpack_require__.n(styleTagTransform);
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./src/imaging/imaging.css
var imaging = __webpack_require__(98);
;// ./src/imaging/imaging.css

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (styleTagTransform_default());
options.setAttributes = (setAttributesWithoutAttributes_default());
options.insert = insertBySelector_default().bind(null, "head");
options.domAPI = (styleDomAPI_default());
options.insertStyleElement = (insertStyleElement_default());

var update = injectStylesIntoStyleTag_default()(imaging/* default */.A, options);




       /* harmony default export */ const imaging_imaging = (imaging/* default */.A && imaging/* default */.A.locals ? imaging/* default */.A.locals : undefined);

;// ./src/imaging/imaging-dashboard.component.tsx

/**
 * Imaging page on the home screen (home/imaging), for imaging staff, laid out like the Laboratory page: summary
 * tiles, Ordered / Uploaded tabs, date range and search, and the imaging orders. Expanding an order offers the upload;
 * once uploaded it shows only the image and whether the doctor has reviewed it. The doctor's review (AI read,
 * assessment, Complete review) is in the patient chart's Imaging results.
 *
 * Imaging orders come from the Referral Response form (Order ECG) or anywhere else that orders a concept of the
 * Radiology/Imaging Procedure class: OpenMRS files those under the Imaging Order type.
 */ 






const REFRESH_MS = 30000;
const isDone = (o)=>o.fulfillerStatus === 'COMPLETED';
// the result is uploaded and waits for the doctor's review (Complete review in the patient chart)
const isInReview = (o)=>o.fulfillerStatus === 'IN_PROGRESS';
const isUploaded = (o)=>isDone(o) || isInReview(o);
const ImagingDashboard = ()=>{
    const { t: translate } = (0,consume_shared_module_default_react_i18next_singleton_.useTranslation)();
    const t = (0,consume_shared_module_default_react_singleton_.useCallback)((key, defaultValue, options)=>translate(key, defaultValue, {
            ...options,
            interpolation: {
                escapeValue: false
            }
        }), [
        translate
    ]);
    const { imaging } = (0,esm_framework_singleton_.useConfig)();
    const session = (0,esm_framework_singleton_.useSession)();
    const [range, setRange] = (0,consume_shared_module_default_react_singleton_.useState)(()=>[
            new Date(),
            new Date()
        ]);
    const [orders, setOrders] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [error, setError] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [tab, setTab] = (0,consume_shared_module_default_react_singleton_.useState)(0);
    const [search, setSearch] = (0,consume_shared_module_default_react_singleton_.useState)('');
    // Expanded orders, kept here rather than in the DataTable: an upload moves the order to the Completed tab, and
    // the clinician must still see its image and AI read there.
    const [expanded, setExpanded] = (0,consume_shared_module_default_react_singleton_.useState)(()=>new Set());
    const toggle = (uuid)=>setExpanded((cur)=>{
            const next = new Set(cur);
            if (next.has(uuid)) next.delete(uuid);
            else next.add(uuid);
            return next;
        });
    const load = (0,consume_shared_module_default_react_singleton_.useCallback)(async ()=>{
        try {
            setOrders(await fetchImagingOrders(imaging.imagingOrderTypeUuid, range[0], range[1]));
            setError(null);
        } catch (e) {
            setError(e?.message ?? String(e));
        }
    }, [
        imaging.imagingOrderTypeUuid,
        range
    ]);
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        void load();
        const id = window.setInterval(()=>void load(), REFRESH_MS);
        return ()=>window.clearInterval(id);
    }, [
        load
    ]);
    const all = orders ?? [];
    const pending = all.filter((o)=>!isUploaded(o) && !o.dateStopped);
    // Results awaiting the doctor's review first, then the reviewed ones; each newest order first (the fetch order).
    const uploaded = all.filter(isUploaded).sort((a, b)=>Number(isDone(a)) - Number(isDone(b)));
    const inReview = all.filter(isInReview);
    const listed = [
        pending,
        uploaded
    ][tab].filter((o)=>{
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return [
            o.patient.name,
            o.patient.identifier,
            o.orderNumber,
            o.concept.display
        ].some((v)=>(v ?? '').toLowerCase().includes(q));
    });
    const headers = (0,consume_shared_module_default_react_singleton_.useMemo)(()=>[
            {
                key: 'patient',
                header: t('patient', 'Patient')
            },
            {
                key: 'age',
                header: t('age', 'Age')
            },
            {
                key: 'sex',
                header: t('sex', 'Sex')
            },
            {
                key: 'test',
                header: t('imagingTest', 'Test')
            },
            {
                key: 'orderNumber',
                header: t('orderNumber', 'Order #')
            },
            {
                key: 'ordered',
                header: t('ordered', 'Ordered')
            },
            {
                key: 'orderedBy',
                header: t('orderedBy', 'Ordered by')
            },
            {
                key: 'status',
                header: t('status', 'Status')
            }
        ], [
        t
    ]);
    const rows = listed.map((o)=>({
            id: o.uuid,
            patient: o.patient.name,
            age: o.patient.age ?? '',
            sex: o.patient.gender ?? '',
            test: o.concept.display,
            orderNumber: o.orderNumber,
            ordered: new Date(o.dateActivated).toLocaleString(),
            orderedBy: o.ordererName ?? '',
            status: ''
        }));
    const byId = Object.fromEntries(listed.map((o)=>[
            o.uuid,
            o
        ]));
    const statusTag = (o)=>{
        if (isDone(o)) return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
            type: "green",
            children: t('statusReviewed', 'Reviewed')
        });
        if (isInReview(o)) return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
            type: "blue",
            children: t('statusAwaitingReview', 'Awaiting review')
        });
        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
            type: "gray",
            children: t('statusOrdered', 'Ordered')
        });
    };
    const tile = (title, label, value)=>/*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
            className: "img-tile",
            children: [
                /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                    className: "img-tile-title",
                    children: title
                }),
                /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                    className: "img-tile-label",
                    children: label
                }),
                /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                    className: "img-tile-value",
                    children: value
                })
            ]
        });
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
        className: "img-imaging",
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsxs)("header", {
                className: "img-imaging-header",
                children: [
                    /*#__PURE__*/ (0,jsx_runtime.jsx)("svg", {
                        className: "img-imaging-icon",
                        viewBox: "0 0 32 32",
                        "aria-hidden": "true",
                        children: /*#__PURE__*/ (0,jsx_runtime.jsx)("path", {
                            d: "M3 17h6l3-8 5 15 4-11 2 4h6",
                            fill: "none",
                            stroke: "currentColor",
                            strokeWidth: "2",
                            strokeLinejoin: "round"
                        })
                    }),
                    /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                className: "img-imaging-location",
                                children: session?.sessionLocation?.display ?? ''
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("h1", {
                                className: "img-imaging-title",
                                children: t('imaging', 'Imaging')
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                className: "img-tiles",
                children: [
                    tile(t('imagingOrdered', 'Imaging ordered'), t('notYetUploaded', 'Not yet uploaded'), pending.length),
                    tile(t('uploaded', 'Uploaded'), t('awaitingDoctorReview', 'Awaiting the doctor\'s review'), inReview.length),
                    tile(t('results', 'Results'), t('reviewedByDoctor2', 'Reviewed by the doctor'), all.filter(isDone).length)
                ]
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tabs */.tUM, {
                selectedIndex: tab,
                onChange: ({ selectedIndex })=>setTab(selectedIndex),
                children: /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* TabList */.wbY, {
                    contained: true,
                    "aria-label": t('imaging', 'Imaging'),
                    children: [
                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tab */.ozo, {
                            children: t('tabOrdered', 'Ordered')
                        }),
                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tab */.ozo, {
                            children: t('tabUploaded', 'Uploaded')
                        })
                    ]
                })
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                className: "img-imaging-panel",
                children: [
                    /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "img-imaging-toolbar",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                className: "img-small",
                                children: t('dateRange', 'Date range:')
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* DatePicker */.lrV, {
                                datePickerType: "range",
                                dateFormat: "d/m/Y",
                                value: range,
                                maxDate: new Date().toISOString(),
                                onChange: (dates)=>dates.length === 2 && setRange([
                                        dates[0],
                                        dates[1]
                                    ]),
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* DatePickerInput */.tKA, {
                                        id: "imaging-from",
                                        labelText: "",
                                        hideLabel: true,
                                        placeholder: "dd/mm/yyyy",
                                        size: "md"
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* DatePickerInput */.tKA, {
                                        id: "imaging-to",
                                        labelText: "",
                                        hideLabel: true,
                                        placeholder: "dd/mm/yyyy",
                                        size: "md"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Search */.vji, {
                                size: "lg",
                                labelText: t('searchThisList', 'Search this list'),
                                placeholder: t('searchThisList', 'Search this list'),
                                value: search,
                                onChange: (e)=>setSearch(e.target.value)
                            })
                        ]
                    }),
                    error && /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                        className: "img-error",
                        children: t('imagingLoadFailed', 'Could not load imaging orders: {{err}}', {
                            err: error
                        })
                    }),
                    orders === null ? /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                        className: "img-pad",
                        children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* InlineLoading */.OuH, {
                            description: t('loadingImaging', 'Loading imaging orders…')
                        })
                    }) : rows.length === 0 ? /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "img-empty",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                                className: "img-empty-title",
                                children: t('noImagingOrders', 'No imaging orders found')
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                                children: t('checkFilters', 'Please check the filters above and try again')
                            })
                        ]
                    }) : /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* DataTable */.bQt, {
                        rows: rows,
                        headers: headers,
                        isSortable: true,
                        children: ({ rows: dtRows, headers: dtHeaders, getHeaderProps, getRowProps, getTableProps })=>/*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* Table */.XIK, {
                                ...getTableProps(),
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableHead */.ndF, {
                                        children: /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* TableRow */.Hjg, {
                                            children: [
                                                /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableExpandHeader */.Uwq, {
                                                    "aria-label": t('expandRow', 'Expand row')
                                                }),
                                                dtHeaders.map((h)=>/*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableHeader */.A0N, {
                                                        ...getHeaderProps({
                                                            header: h
                                                        }),
                                                        children: h.header
                                                    }, h.key))
                                            ]
                                        })
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableBody */.BFY, {
                                        children: dtRows.map((row)=>{
                                            const o = byId[row.id];
                                            // DataTable syncs its rows one render late: after a tab switch it can still hand back the
                                            // previous tab's rows for a frame
                                            if (!o) return null;
                                            return /*#__PURE__*/ (0,jsx_runtime.jsxs)((consume_shared_module_default_react_singleton_default()).Fragment, {
                                                children: [
                                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableExpandRow */.fZD, {
                                                        ...getRowProps({
                                                            row
                                                        }),
                                                        isExpanded: expanded.has(row.id),
                                                        onExpand: ()=>toggle(row.id),
                                                        children: row.cells.map((cell)=>{
                                                            if (cell.info.header === 'patient') {
                                                                return /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* TableCell */.nA6, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(esm_framework_singleton_.ConfigurableLink, {
                                                                            to: `\${openmrsSpaBase}/patient/${o.patient.uuid}/chart`,
                                                                            children: o.patient.name
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                                                            className: "img-sub",
                                                                            children: o.patient.identifier
                                                                        })
                                                                    ]
                                                                }, cell.id);
                                                            }
                                                            if (cell.info.header === 'status') return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableCell */.nA6, {
                                                                children: statusTag(o)
                                                            }, cell.id);
                                                            if (cell.info.header === 'test') {
                                                                return /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* TableCell */.nA6, {
                                                                    children: [
                                                                        cell.value,
                                                                        o.urgency === 'STAT' && /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                                                                            type: "red",
                                                                            size: "sm",
                                                                            style: {
                                                                                marginLeft: '0.5rem'
                                                                            },
                                                                            children: t('stat', 'STAT')
                                                                        })
                                                                    ]
                                                                }, cell.id);
                                                            }
                                                            return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableCell */.nA6, {
                                                                children: cell.value
                                                            }, cell.id);
                                                        })
                                                    }),
                                                    expanded.has(row.id) && /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableExpandedRow */.cwJ, {
                                                        colSpan: dtHeaders.length + 1,
                                                        children: /*#__PURE__*/ (0,jsx_runtime.jsx)(imaging_result_component, {
                                                            order: o,
                                                            mode: "upload",
                                                            onUploaded: ()=>{
                                                                // uploaded: follow the order to the Uploaded tab, still open (it shows the image)
                                                                setTab(1);
                                                                void load();
                                                            }
                                                        })
                                                    })
                                                ]
                                            }, row.id);
                                        })
                                    })
                                ]
                            })
                    })
                ]
            })
        ]
    });
};
/* harmony default export */ const imaging_dashboard_component = (ImagingDashboard);

;// ./src/imaging/imaging-results-link.component.tsx




/** "Imaging results" in the patient chart's left navigation, next to Orders and Results. */ const ImagingResultsLink = ({ basePath })=>{
    const { t } = (0,consume_shared_module_default_react_i18next_singleton_.useTranslation)();
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)(esm_framework_singleton_.ConfigurableLink, {
        to: `${basePath}/Imaging results`,
        className: "cds--side-nav__link",
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                // same icon column as the sibling links
                className: "cds--side-nav__icon",
                style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                children: /*#__PURE__*/ (0,jsx_runtime.jsx)("svg", {
                    className: "omrs-icon",
                    "aria-hidden": "true",
                    width: 16,
                    height: 16,
                    viewBox: "0 0 16 16",
                    style: {
                        fill: 'currentColor'
                    },
                    children: /*#__PURE__*/ (0,jsx_runtime.jsx)("use", {
                        href: "#omrs-icon-image-medical"
                    })
                })
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                className: "cds--side-nav__link-text",
                children: t('imagingResults', 'Imaging results')
            })
        ]
    });
};
/* harmony default export */ const imaging_results_link_component = (ImagingResultsLink);

;// ./src/imaging/imaging-results.component.tsx

/**
 * Imaging results in the patient chart: where the doctor, back in consultation, reviews the patient's imaging (e.g.
 * the ECG uploaded on the Imaging page): the image, the AI read, the assessment and Complete review, which saves the
 * review as the order's result (also listed under the order in the chart's Orders).
 */ 






const imaging_results_component_REFRESH_MS = 30000;
const ImagingResults = (props)=>{
    const { t: translate } = (0,consume_shared_module_default_react_i18next_singleton_.useTranslation)();
    const t = (0,consume_shared_module_default_react_singleton_.useCallback)((key, defaultValue, options)=>translate(key, defaultValue, {
            ...options,
            interpolation: {
                escapeValue: false
            }
        }), [
        translate
    ]);
    const { imaging } = (0,esm_framework_singleton_.useConfig)();
    const patientUuid = props.patientUuid ?? props.patient?.id;
    const [orders, setOrders] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [error, setError] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [expanded, setExpanded] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const load = (0,consume_shared_module_default_react_singleton_.useCallback)(async ()=>{
        if (!patientUuid) return;
        try {
            const rows = await fetchPatientImagingOrders(patientUuid, imaging.imagingOrderTypeUuid);
            setOrders(rows);
            setError(null);
            // on first load, open what needs the doctor: results awaiting review
            setExpanded((cur)=>cur ?? new Set(rows.filter((o)=>o.fulfillerStatus === 'IN_PROGRESS').map((o)=>o.uuid)));
        } catch (e) {
            setError(e?.message ?? String(e));
        }
    }, [
        patientUuid,
        imaging.imagingOrderTypeUuid
    ]);
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        void load();
        const id = window.setInterval(()=>void load(), imaging_results_component_REFRESH_MS);
        return ()=>window.clearInterval(id);
    }, [
        load
    ]);
    const toggle = (uuid)=>setExpanded((cur)=>{
            const next = new Set(cur ?? []);
            if (next.has(uuid)) next.delete(uuid);
            else next.add(uuid);
            return next;
        });
    const headers = (0,consume_shared_module_default_react_singleton_.useMemo)(()=>[
            {
                key: 'test',
                header: t('imagingTest', 'Test')
            },
            {
                key: 'orderNumber',
                header: t('orderNumber', 'Order #')
            },
            {
                key: 'ordered',
                header: t('ordered', 'Ordered')
            },
            {
                key: 'orderedBy',
                header: t('orderedBy', 'Ordered by')
            },
            {
                key: 'status',
                header: t('status', 'Status')
            }
        ], [
        t
    ]);
    if (!patientUuid) return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tile */.FAs, {
        children: t('noPatient', 'No patient context')
    });
    if (error) return /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
        className: "img-error",
        children: t('imagingLoadFailed', 'Could not load imaging orders: {{err}}', {
            err: error
        })
    });
    if (orders === null) return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* InlineLoading */.OuH, {
        description: t('loadingImaging', 'Loading imaging orders…')
    });
    if (orders.length === 0) {
        return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
            className: "img-empty",
            children: [
                /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                    className: "img-empty-title",
                    children: t('noImagingForPatient', 'No imaging ordered for this patient')
                }),
                /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                    children: t('imagingOrderedFromForm', 'An ECG ordered from the Referral Response form appears here.')
                })
            ]
        });
    }
    const byId = Object.fromEntries(orders.map((o)=>[
            o.uuid,
            o
        ]));
    const rows = orders.map((o)=>({
            id: o.uuid,
            test: o.concept.display,
            orderNumber: o.orderNumber,
            ordered: new Date(o.dateActivated).toLocaleString(),
            orderedBy: o.ordererName ?? '',
            status: ''
        }));
    const statusTag = (o)=>{
        if (o.fulfillerStatus === 'COMPLETED') return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
            type: "green",
            children: t('statusReviewed', 'Reviewed')
        });
        if (o.fulfillerStatus === 'IN_PROGRESS') return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
            type: "blue",
            children: t('statusAwaitingReview', 'Awaiting review')
        });
        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
            type: "gray",
            children: t('statusWaitingUpload', 'Waiting for the result')
        });
    };
    return /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
        className: "img-chart",
        children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* DataTable */.bQt, {
            rows: rows,
            headers: headers,
            children: ({ rows: dtRows, headers: dtHeaders, getHeaderProps, getRowProps, getTableProps })=>/*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* Table */.XIK, {
                    ...getTableProps(),
                    children: [
                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableHead */.ndF, {
                            children: /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* TableRow */.Hjg, {
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableExpandHeader */.Uwq, {
                                        "aria-label": t('expandRow', 'Expand row')
                                    }),
                                    dtHeaders.map((h)=>/*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableHeader */.A0N, {
                                            ...getHeaderProps({
                                                header: h
                                            }),
                                            children: h.header
                                        }, h.key))
                                ]
                            })
                        }),
                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableBody */.BFY, {
                            children: dtRows.map((row)=>{
                                const o = byId[row.id];
                                if (!o) return null;
                                const isOpen = !!expanded?.has(row.id);
                                return /*#__PURE__*/ (0,jsx_runtime.jsxs)((consume_shared_module_default_react_singleton_default()).Fragment, {
                                    children: [
                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableExpandRow */.fZD, {
                                            ...getRowProps({
                                                row
                                            }),
                                            isExpanded: isOpen,
                                            onExpand: ()=>toggle(row.id),
                                            children: row.cells.map((cell)=>cell.info.header === 'status' ? /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableCell */.nA6, {
                                                    children: statusTag(o)
                                                }, cell.id) : /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableCell */.nA6, {
                                                    children: cell.value
                                                }, cell.id))
                                        }),
                                        isOpen && /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableExpandedRow */.cwJ, {
                                            colSpan: dtHeaders.length + 1,
                                            children: /*#__PURE__*/ (0,jsx_runtime.jsx)(imaging_result_component, {
                                                order: o,
                                                mode: "review",
                                                onCompleted: ()=>void load()
                                            })
                                        })
                                    ]
                                }, row.id);
                            })
                        })
                    ]
                })
        })
    });
};
/* harmony default export */ const imaging_results_component = (ImagingResults);

;// ./src/index.ts
/**
 * @openmrs/esm-referral-fulfillment-app
 *
 * Adds a "Record referral response" overflow-menu action to every Referral order
 * row in the patient-chart Orders widget. Clicking it launches the Referral
 * Response form workspace pre-bound to the clicked order, and on save closes the
 * order via POST /order/{uuid}/fulfillerdetails.
 */ 








const moduleName = '@openmrs/esm-referral-fulfillment-app';
const src_options = {
    featureName: 'referral-fulfillment',
    moduleName
};
const importTranslation = __webpack_require__(767);
function startupApp() {
    (0,esm_framework_singleton_.defineConfigSchema)(moduleName, configSchema);
}
const recordReferralResponseAction = (0,esm_framework_singleton_.getSyncLifecycle)(record_referral_response_component, src_options);
const referralsDashboardLink = (0,esm_framework_singleton_.getSyncLifecycle)(dashboard_link_component, src_options);
const referralsDashboard = (0,esm_framework_singleton_.getSyncLifecycle)(referrals_dashboard_component, src_options);
// Imaging page on the home screen (home/imaging): imaging orders such as the ECG, with result upload and the AI read
const imagingDashboardLink = (0,esm_framework_singleton_.getSyncLifecycle)(imaging_dashboard_link_component, src_options);
const imagingDashboard = (0,esm_framework_singleton_.getSyncLifecycle)(imaging_dashboard_component, src_options);
// Imaging results in the patient chart: the doctor reviews an uploaded result (AI read, assessment, Complete review)
const imagingResultsLink = (0,esm_framework_singleton_.getSyncLifecycle)(imaging_results_link_component, src_options);
const imagingResults = (0,esm_framework_singleton_.getSyncLifecycle)(imaging_results_component, src_options);


/***/ },

/***/ 767
(module, __unused_webpack_exports, __webpack_require__) {

var map = {
	"./en.json": [
		300,
		[
			300
		]
	]
};
function webpackAsyncContext(req) {
	try {
		if(!__webpack_require__.o(map, req)) {
			return Promise.resolve().then(() => {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
});
		}
	} catch(err) {
		return Promise.reject(err);
	}

	var ids = map[req], id = ids[0];
	return __webpack_require__.e(ids[1][0]).then(() => (__webpack_require__(id)));
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = 767;
module.exports = webpackAsyncContext;

/***/ }

}]);
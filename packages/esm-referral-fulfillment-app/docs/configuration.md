# Configuration Reference

All keys are declared in [`src/config-schema.ts`](../src/config-schema.ts) and
exposed under the module name `@openmrs/esm-referral-fulfillment-app`.

## Schema

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `formUuid` | UUID | `2dcc7696-66b4-42fd-95c0-50603e0e2f4e` | UUID of the **Referral Response** form rendered when the user clicks *Record referral response*. |
| `orderTypeUuid` | UUID | `778a9dc6-87d9-49c1-83d9-caa01041a8ad` | UUID of the **Referral OrderType**. Used to filter which order rows expose the action and which orders the dashboard lists. |
| `fulfillerComment` | String | `Closed by Referral Response form` | Default comment recorded on the order when it is closed via *Record referral response*. (Decline modal supplies its own comment.) |
| `encounterTypeUuid` | UUID | `479e4805-90d9-44f5-b252-333d8a687e52` | UUID of the **Referral Response** encounter type. Used by the polling fallback that detects form save when `closeWorkspaceWithSavedChanges` is unavailable. |
| `responseNotesConceptUuid` | UUID | `162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | Concept of the Referral Response form's *Clinical notes / addendum to send back to source* answer. Shown as *Clinical notes* in a referral in's details once it is answered. |
| `referralInEncounterTypeUuid` | UUID | `de0f5558-9813-4fa3-8613-467015f9fabd` | UUID of the **Referral In** encounter type the receiver adaptor files inbound referrals under. A Referral order in this encounter type shows as *Referral in*; any other shows as *Referral out* (the emitter's `referral-direction` uses the same rule). |
| `referralOutEncounterTypeUuid` | UUID | `7b3f4e2a-9c1d-4e8b-a6f0-2d5c8e1b9a47` | UUID of the **Referral Out** encounter type created for each referral raised with *New referral out*. |
| `referralOutOrderablesConceptSetUuid` | UUID | `3c1a7c1e-5a1d-4a52-9d55-4548a1c00003` | Concept set whose members are offered in *New referral out* (e.g. *Referral to primary health care (PHC)*). |
| `careSettingUuid` | UUID | `6f0c9a92-6f24-11e3-af88-005056821db0` | Care setting of referral out orders (Outpatient). |
| `clinicianEncounterRoleUuid` | UUID | `240b26f9-dd88-4172-823d-4a8bfeb7841f` | Encounter role recorded for the provider raising a referral out (Clinician). |
| `referralDestinationLocationTag` | String | `Referral Destination` | Location tag of the facilities offered in *Referred to*. Each such location carries its facility code in the *Facility code* location attribute. |
| `referralDestinationConceptUuid` | UUID | `5f8a2c6e-3b9d-4e1f-a7c4-0d6e9b2a8f15` | Text concept (*Referral destination facility*) recorded on the Referral Out encounter with the destination location uuid. The emitter sends that location as `ServiceRequest.performer`. |
| `referralOutReferencePrefix` | String | `RO` | Prefix of the reference number generated for a referral out (`RO-20261023-K7Q2`), saved as the order's accession number and sent as the ServiceRequest's `ACSN` identifier. |

### `imaging` — Imaging page

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `imaging.imagingOrderTypeUuid` | UUID | `5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e01` | *Imaging Order* order type listed on the Imaging page. Created by `scripts/imaging-orders-o3-setup.sh`. |
| `imaging.ecgConceptUuids` | ConceptUuid[] | `5333e05c-…` (*Electrocardiogram (ECG)*), `161157AAAA…` | Concepts treated as an ECG: due time, AI read and assessment. |
| `imaging.reviewConceptUuids.set` / `.finding` / `.diagnosis` / `.plan` | ConceptUuid | `5a7d2c3e-…7e03` / `…7e04` / `…7e05` / `…7e06` | The *Imaging review* obs group saved by Complete review and its three text members (created by the setup script). |
| `imaging.aiRead.enabled` / `imaging.aiRead.conceptUuid` | Boolean / ConceptUuid | `true` / `5a7d2c3e-…7e09` | AI read of an uploaded ECG by the `ecgai` backend module, and the *ECG AI interpretation* observation it saves. Off, or without an API key on the backend, the demo texts are shown. |
| `imaging.ecgAiInterpretation` | String | ST elevation in V1–V4, … | AI interpretation shown under an uploaded ECG (hardcoded until the AI read is connected). |
| `imaging.ecgAiFinding` | String | `ST elevation V1–V4` | Short AI finding for the notification and the pathway facts. |
| `imaging.suggestedDiagnosis` | String | `Suspected acute anterior STEMI (AI read)` | Working diagnosis suggested after the AI read. |
| `imaging.pciLimitMinutes` | Number | `120` | ECG-to-opened-artery limit deciding *Within / Beyond* and PCI vs fibrinolysis. |
| `imaging.cardiacCentresNote` | String | `service register, updated 08:30 today` | Source note above the centre list. |
| `imaging.cardiacCentres` | Object[] | the two centres of the reference demo | `{ name, distance, travel, cathLab, arteryOpenedMinutes, recommended }`. The recommended centre is chosen by default. |
| `imaging.giveNow` | String[] | Aspirin 300 mg, chewed, … | *Give now, tick as given* items. |

## TypeScript Type

```ts
// src/config-schema.ts
export interface ReferralFulfillmentConfig {
  formUuid: string;
  orderTypeUuid: string;
  fulfillerComment: string;
  encounterTypeUuid: string;
}
```

## Overriding at Runtime

The Reference Application loads its configuration from the JSON file
mounted at `/usr/share/nginx/html/config-core_demo.json` (see
[`docker-compose.override.yml`](../../../docker-compose.override.yml)).
Override one or more keys per deployment:

```jsonc
// frontend/config-core_demo.json
{
  "@openmrs/esm-referral-fulfillment-app": {
    "formUuid": "<your-form-uuid>",
    "orderTypeUuid": "<your-order-type-uuid>",
    "fulfillerComment": "Closed via SPICE referral response",
    "encounterTypeUuid": "<your-encounter-type-uuid>"
  }
}
```

After editing, restart the frontend container (no rebuild needed — the
file is bind-mounted read-only):

```bash
docker compose restart frontend
```

## Where Each Key Is Read

| Key | Read by | Effect |
| --- | --- | --- |
| `formUuid` | `record-referral-response.component.tsx`, `referrals-dashboard.component.tsx` | Passed to `launchWorkspace('patient-form-entry-workspace', { formInfo: { formUuid } })`. |
| `orderTypeUuid` | `record-referral-response.component.tsx`, `referrals-dashboard.component.tsx` | Filters `/ws/rest/v1/order?patient=` results down to Referral orders only. |
| `fulfillerComment` | `record-referral-response.component.tsx` | Sent as `fulfillerComment` on `POST /order/{uuid}/fulfillerdetails` when the form workspace closes after save. |
| `encounterTypeUuid` | (Fallback path; reserved) | Used if a future polling fallback needs to detect Encounter creation by type. |
| `responseNotesConceptUuid` | `referrals-dashboard.component.tsx` | Read from the obs of the Referral Response encounter the referral's DISCONTINUE order sits in. |
| `referralInEncounterTypeUuid` | `referrals-dashboard.component.tsx` | Decides the *Direction* tag and limits *Record referral response* / *Decline* to referrals in. |
| `referralOutEncounterTypeUuid`, `clinicianEncounterRoleUuid` | `create-referral-out.ts` | Encounter created in the active visit for a referral out. |
| `referralOutOrderablesConceptSetUuid` | `new-referral-out-modal.component.tsx` | Options of the *Referred for* dropdown. |
| `careSettingUuid` | `create-referral-out.ts` | `careSetting` of the referral out order. |

## Validating Active Configuration

From inside the running frontend container:

```bash
docker exec o3-frontend-1 cat /usr/share/nginx/html/config-core_demo.json \
  | python3 -c 'import json,sys; print(json.dumps(json.load(sys.stdin).get("@openmrs/esm-referral-fulfillment-app", {}), indent=2))'
```

In the browser DevTools console (with the chart open):

```js
// Inspect the resolved (defaults + overrides) config seen by the module
window.openmrsConfig?.['@openmrs/esm-referral-fulfillment-app']
```

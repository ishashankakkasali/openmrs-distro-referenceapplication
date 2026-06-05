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

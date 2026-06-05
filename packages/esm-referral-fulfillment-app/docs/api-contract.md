# API Contract

Endpoints consumed by `@openmrs/esm-referral-fulfillment-app` and the
exact payload shapes expected. All calls go through
`openmrsFetch(...)` from `@openmrs/esm-framework`, which transparently
attaches the session cookie and CSRF headers.

## 1. List patient orders (dashboard load)

```
GET /ws/rest/v1/order?patient={patientUuid}&v=full
```

**Used by**: [`referrals-dashboard.component.tsx`](../src/referrals-dashboard.component.tsx) → `loadOrders()`

**Response (excerpt)**:

```json
{
  "results": [
    {
      "uuid": "…",
      "orderNumber": "ORD-123",
      "display": "Refer to ENT clinic",
      "dateActivated": "2026-05-08T10:42:00.000+0000",
      "fulfillerStatus": null,
      "fulfillerComment": null,
      "instructions": "...",
      "commentToFulfiller": "...",
      "urgency": "ROUTINE",
      "action": "NEW",
      "concept":   { "uuid": "…", "display": "Refer to specialist" },
      "orderer":   { "uuid": "…", "display": "Dr. Jane Doe" },
      "encounter": { "uuid": "…", "display": "Visit Note 08/05/2026" },
      "careSetting": { "display": "Outpatient" },
      "orderType": { "uuid": "778a9dc6-87d9-49c1-83d9-caa01041a8ad", "name": "Referral order" }
    }
  ]
}
```

**Client-side filter**: `orderType.uuid === config.orderTypeUuid`.

## 2. Set fulfillerdetails (close / decline)

```
POST /ws/rest/v1/order/{orderUuid}/fulfillerdetails
Content-Type: application/json
```

**Body**:

```json
{
  "fulfillerStatus": "COMPLETED",
  "fulfillerComment": "Closed by Referral Response form | by: Dr. Jane Doe"
}
```

**Used by**:

- [`closeReferralOrder()`](../src/close-referral-order.ts) — `fulfillerStatus: "COMPLETED"`
- [`declineReferralOrder()`](../src/close-referral-order.ts) — `fulfillerStatus: "DECLINED"`

**`fulfillerStatus` enum** (verified against OpenMRS core):

| Value | Meaning |
| --- | --- |
| `null` | PENDING (initial state) |
| `RECEIVED` | Acknowledged at fulfilling facility |
| `IN_PROGRESS` | Work started |
| `EXCEPTION` | Problem encountered |
| `COMPLETED` | Fulfilled (referral closed) |
| `DECLINED` | Refused (this module's Decline action) |

**Important behaviors**:

- `auditInfo.changedBy` is **not** updated by this endpoint. The fulfiller's
  display name is therefore encoded in `fulfillerComment` via the
  ` | by: <name>` tag. The dashboard splits on this tag to render the
  **Fulfilled by** column.
- A subsequent POST overwrites both fields — there is no append.
- Returns `200 OK` with the updated order representation on success;
  `400` if the order is voided/discontinued; `404` for unknown UUIDs.

## 3. Launch the Referral Response form workspace

Not a REST call — a framework function:

```ts
launchWorkspace('patient-form-entry-workspace', {
  workspaceTitle: '…',
  formInfo: {
    formUuid: config.formUuid,
    encounterUuid: '',
    additionalProps: { orderUuid: order.uuid },
  },
  closeWorkspaceWithSavedChanges: () => closeReferralOrder({ ... }),
});
```

The actual encounter is persisted by the form engine via standard
OpenMRS encounter REST (`POST /ws/rest/v1/encounter`); this module does
not call that endpoint directly.

## 4. Session / current user

```ts
import { getSessionStore } from '@openmrs/esm-framework';
const session = getSessionStore().getState()?.session;
```

**Fields read** (in priority order, first non-empty wins):

1. `currentProvider.person.display`
2. `user.person.display`
3. `user.display`
4. `user.username`

Used to compose the ` | by: <name>` suffix on `fulfillerComment`.

## 5. (Reference) FHIR ServiceRequest

Not used by the current dashboard, but documented because cross-system
sync (SPICE) leans on it:

```
GET /ws/fhir2/R4/ServiceRequest?subject={patientUuid}&_lastUpdated=gt2026-05-01
```

**Caveats** for this module's purposes:

- The translator does **not** emit `accessionNumber` or `orderNumber`
  on the FHIR resource. We therefore use the REST endpoint for the
  in-chart dashboard.
- The REST endpoint does **not** support `_lastUpdated`; for delta
  sync use FHIR.

## 6. Error Handling Contract

All failed calls in this module:

1. Log the full error to `console.error` with a tagged prefix
   (`[esm-referral-fulfillment]` or `Failed to <verb> referral order`).
2. Surface a Carbon `showSnackbar({ kind: 'error', title, subtitle })`
   to the user — `subtitle` is `err.message` if available.
3. Do **not** retry automatically. The user can re-trigger the action.

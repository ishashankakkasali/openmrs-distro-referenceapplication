# `frontend/config-core_demo.json` — what each block does and why

This file is the **runtime SPA config** loaded by the OpenMRS O3 frontend on
every page load. The frontend container points at it via:

```yaml
# docker-compose.yml (frontend service)
environment:
  SPA_CONFIG_URLS: /openmrs/spa/config-core_demo.json
volumes:
  - ./frontend/config-core_demo.json:/usr/share/nginx/html/config-core_demo.json:ro
```

Each top-level key is a **micro-frontend module name**; each module reads its
own slice. Editing this file + restarting (or just reloading the browser)
updates the running app — no image rebuild required.

---

## Why a bind-mount instead of baking it into the image

The frontend `Dockerfile` does `COPY config-core_demo.json /usr/share/nginx/html`
— so the file is in the published image, but only as a default. We override it
at runtime with a bind-mount so:

- EC2 deploys with **only `docker compose up`** (no build pipeline) get our
  config.
- The repo file is the single source of truth (version controlled).
- A `docker compose down/up` or image repull does **not** lose our config.
- Hot-patching (`docker exec ... > config-core_demo.json`) is no longer needed
  as the durable mechanism — only useful as an emergency override.

---

## Block 1 — `@openmrs/esm-patient-orders-app`

```json
"@openmrs/esm-patient-orders-app": {
  "orderTypes": [
    { "orderTypeUuid": "778a9dc6-87d9-49c1-83d9-caa01041a8ad",
      "orderableConceptSets": [], "label": "Referral" }
  ]
}
```

### Why this block exists

The orders-app bundle (verified in the deployed `5937.js`) contains:

```js
config.orderTypes.find(e => e.orderTypeUuid === t).orderableConceptSets
```

If an order's `orderType.uuid` is **not** in this `orderTypes` array,
`.find(...)` returns `undefined` and `.orderableConceptSets` throws. Result:
**white screen on the patient chart Orders widget** the moment any such order
exists for the patient.

OpenMRS O3 splits order handling intentionally:

| OrderType | Owning module | UI |
|---|---|---|
| Drug Order | `esm-patient-medications-app` | Dedicated workspace `add-drug-order` |
| Test Order | `esm-patient-tests-app` | Dedicated workspace `add-lab-order`, "Add result" button |
| **Everything else** | `esm-patient-orders-app` | **Generic** UI — *only* if registered here |

So every non-drug, non-test OrderType used in this deployment must appear in
`orderTypes` or it crashes the chart.

### Per-field meaning

| Field | Purpose |
|---|---|
| `orderTypeUuid` | Matches the `order_type` table row. Lookup key that prevents the `.find()` crash. |
| `orderableConceptSets` | Concept-set UUIDs whose members appear in the Order Basket "what can I order" picker. Empty `[]` = no inline picker (acceptable when orders are created server-side by an adaptor; clinicians don't manually pick from a dropdown). |
| `label` | Display text in the Orders widget header and Order Basket tab. |

### Why the Referral OrderType is registered here

| OrderType | UUID | Origin |
|---|---|---|
| Referral | `778a9dc6-87d9-49c1-83d9-caa01041a8ad` | Stock O3 OrderType (created 2026-04-06). The actual trigger of the white-screen bug we hit on ORD-340/342 — latently broken since creation. |

> An earlier *External Referral* OrderType (`b93912b8-c96e-4453-b8ad-df090eb76e2f`) was retired on 2026-05-04. SPICE inbound referrals reuse the stock Referral type with `accessionNumber` carrying the SPICE assessment ID.

---

## Block 2 — `@openmrs/esm-service-queues-app`

```json
"@openmrs/esm-service-queues-app": {
  "statusConfigs": [
    { "conceptUuid": "51ae5e4d-b72b-4912-bf31-a17efb690aeb", "iconComponent": "InProgress" },
    { "conceptUuid": "ca7494ae-437f-4fd0-8aae-b88b9a2ba47d", "iconComponent": "Group" },
    { "conceptUuid": "b559fb77-4e1e-4285-b9b7-1d03e0ba983f", "iconComponent": "Group" }
  ],
  "concepts": {
    "defaultPriorityConceptUuid":   "f4620bfa-3625-4883-bd3f-84c2cce14470",
    "emergencyPriorityConceptUuid": "04f6f7e0-e3cb-4e13-a133-4479f759574e",
    "defaultStatusConceptUuid":     "51ae5e4d-b72b-4912-bf31-a17efb690aeb",
    "defaultTransitionStatus":      "ca7494ae-437f-4fd0-8aae-b88b9a2ba47d"
  },
  "visitQueueNumberAttributeUuid": "",
  "defaultFacilityUrl": ""
}
```

### Why this block exists

This block tells the Service Queues UI which **concept UUIDs in this
particular OpenMRS database** correspond to standard queue semantics
(Waiting / In Service / Finished, Routine / Emergency). Without it, the
queues app falls back to module defaults that don't know our concept set, so:

- Add-to-queue dialog can't pre-select a sensible status/priority.
- Status badges in the queue table render as plain text or wrong icons.
- "Call" / "Set Priority → Emergency" actions can't write the correct concept
  UUID back — buttons either no-op or error.

### Per-field meaning

| Field | Why it matters |
|---|---|
| `statusConfigs[]` | Maps each queue **status concept** to a Carbon icon component. `InProgress` for Waiting; `Group` for In Service / Finished. Drives the colored status indicators in the queue table. |
| `concepts.defaultPriorityConceptUuid` | Default when a clinician adds a patient to a queue without picking a priority. We use **Not Urgent / Routine** (`f4620bfa-…`) — safe baseline; only escalated when SPICE says `priority=urgent`. |
| `concepts.emergencyPriorityConceptUuid` | UUID the **Emergency** badge maps to and that the "Set Priority → Emergency" button writes. The adaptor passes this exact UUID when FHIR `ServiceRequest.priority = urgent`. |
| `concepts.defaultStatusConceptUuid` | New queue entries default to **Waiting** (`51ae5e4d-…`). Adaptor POSTs the patient as Waiting; the clinician transitions from there. |
| `concepts.defaultTransitionStatus` | When a clinician clicks **Call** on a waiting patient, the entry auto-transitions to this concept (**In Service**, `ca7494ae-…`). Without this, the Call button is a no-op or errors. |
| `visitQueueNumberAttributeUuid` | Empty = don't auto-assign visit-level queue numbers (e.g., "Patient #12 today"). |
| `defaultFacilityUrl` | Empty = use the user's **session location** (Outpatient Clinic for Dr John). Setting this would force a single facility regardless of session — wrong for multi-site EC2 deploys. |

---

## Other blocks already present (untouched, listed for context)

| Block | Purpose |
|---|---|
| `@openmrs/esm-patient-chart-app` | `restrictByVisitLocationTag: true` — chart only visible at locations tagged for the patient's visit. `showUpcomingAppointments: true`. Adds `order-basket-action-menu` to the chart's action menu slot. |
| `@openmrs/esm-ward-app` | Adds `order-basket-action-menu` to the ward patient action slot (so the order basket button shows in ward view too). |
| `@openmrs/esm-styleguide` | Brand color override (`#005d5d` — OpenMRS teal). |

---

## Verifying the config is being served

```bash
curl -s http://localhost:9096/openmrs/spa/config-core_demo.json \
  | python3 -m json.tool
```

Expected top-level keys (5):

```
@openmrs/esm-patient-chart-app
@openmrs/esm-ward-app
@openmrs/esm-styleguide
@openmrs/esm-patient-orders-app
@openmrs/esm-service-queues-app
```

Confirm the bind-mount is in effect:

```bash
docker inspect o3-frontend-1 --format '{{json .Mounts}}'
# Expect: a bind mount of frontend/config-core_demo.json -> /usr/share/nginx/html/config-core_demo.json (Mode: ro)
```

---

## Editing workflow

1. Edit `frontend/config-core_demo.json` in the repo.
2. `docker compose restart frontend` (optional — nginx re-reads the file on each
   request, so a hard browser refresh is usually enough).
3. Hard-refresh the browser (Ctrl+Shift+R) to bypass cached config.

## EC2 deploy (no build)

1. Copy `docker-compose.yml` and the `frontend/` directory (or at least
   `frontend/config-core_demo.json`) to EC2, preserving the path.
2. `docker compose up -d`.
3. To change config later: edit the JSON on EC2 → `docker compose restart frontend`.

---

## Reference UUIDs used in this config

| Name | UUID |
|---|---|
| OrderType — Referral | `778a9dc6-87d9-49c1-83d9-caa01041a8ad` |
| Status — Waiting | `51ae5e4d-b72b-4912-bf31-a17efb690aeb` |
| Status — In Service | `ca7494ae-437f-4fd0-8aae-b88b9a2ba47d` |
| Status — Finished | `b559fb77-4e1e-4285-b9b7-1d03e0ba983f` |
| Priority — Not Urgent / Routine | `f4620bfa-3625-4883-bd3f-84c2cce14470` |
| Priority — Emergency | `04f6f7e0-e3cb-4e13-a133-4479f759574e` |

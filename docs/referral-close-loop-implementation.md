# Referral Order — Close-the-Loop Implementation Plan

This document tracks the step-by-step implementation of the **Referral Order close-the-loop** workflow, mirroring the Lab Order pattern: clinician clicks the Referral order on the Orders widget → **Referral Response** form opens → on save, the order's `fulfillerStatus` flips to `COMPLETED`.

> Sister doc: [spice-referral-e2e.md](spice-referral-e2e.md) — manual end-to-end runbook this work replaces Step 8 of.

---

## Architecture (recommended approach: A + B)

```
Orders widget                 Form engine                Backend
─────────────                 ───────────                ────────
[Referral row]
  └─ Action menu
      └─ "Record response"  ──►  launches Referral Response form
                                 (workspace, with orderUuid in
                                  additionalProps)
                                          │
                                          ▼
                                 User fills + Saves
                                          │
                                          ▼
                                 postSubmissionActions:
                                   OrderStatusChangeAction  ───►  POST /order/{uuid}/fulfillerdetails
                                                                  { fulfillerStatus: "COMPLETED" }
                                          │
                                          ▼
                                 Encounter saved with
                                 encounterType = "Referral Response"
```

Three moving parts:

1. **Backend metadata** — new `Referral Response` EncounterType.
2. **Form schema** — points at the new EncounterType + declares `postSubmissionActions`.
3. **Frontend ESM** — adds an action on Referral order rows that launches the form pre-bound to `orderUuid`.

---

## Task list

| # | Task | Status | Owner | Notes / artifacts |
|---|------|--------|-------|-------------------|
| 1 | Create `Referral Response` EncounterType (Liquibase or REST) | ☑ Done | Copilot | UUID `479e4805-90d9-44f5-b252-333d8a687e52` (created via REST 2026-05-07; Liquibase back-port pending) |
| 2 | Update `Referral Response` form schema: set `encounterType` to new UUID + add `OrderStatusChangeAction` in `postSubmissionActions` | ☑ Done (revised) | Copilot | Form `2dcc7696-66b4-42fd-95c0-50603e0e2f4e` v6; resource `3087f5d2-bf15-42b1-990b-f7005c7314d3`; clob `9a29d200-5680-4479-9078-477240ba7e7a`. **`postSubmissionActions` was reverted to `[]`** — form-engine 12.1.0 ships only `MarkPatientAsDeceasedAction` and `ProgramEnrollmentSubmissionAction`; `OrderStatusChangeAction` is not registered. Closing logic moves to Step 3 ESM. |
| 3 | Scaffold ESM `esm-referral-fulfillment-app` contributing extension to slot `Referral-action-menu-items-slot` (per-orderType dynamic slot exposed by `esm-patient-orders-app` 12.1.0). Click → launches Referral Response form workspace with `orderUuid` in `additionalProps`. ESM also subscribes to workspace close/save and POSTs `/order/{uuid}/fulfillerdetails {fulfillerStatus:COMPLETED}`. | ☑ Done | Copilot | Built locally + spliced into running container via Plan B2 (volume-mounted custom-esms + boot-time importmap/routes splice). HTTP smoke: bundle 200, importmap entry present, extension registered. |
| 4 | Smoke-test end-to-end: seed referral (Steps 4–5 of runbook) → click order → fill form → verify `fulfillerStatus = COMPLETED` and Orders widget pill flips | ◐ In progress | User | Awaiting browser-side click test |
| 5 | (Optional) Create `OrderAttributeType` for `spiceExternalRef` so SPICE adaptor poll is O(1) | ☐ Not started | — | Closes runbook gap #5 |
| 6 | (Optional) Add gating "Did patient present?" Coded concept to form | ☐ Not started | — | Closes runbook gap #3 |

Legend: ☐ Not started · ◐ In progress · ☑ Done · ✗ Blocked

---

## Step 1 — Create `Referral Response` EncounterType

**Goal:** Have a dedicated EncounterType so the response encounter is filterable (the SPICE adaptor watches for it; the Orders widget can correlate too).

### Acceptance criteria

- New row in `encounter_type` with `name = "Referral Response"`.
- UUID is stable / committed to source control (Liquibase `<insert>` with explicit `uuid`).
- Visible via `GET /ws/rest/v1/encountertype?q=Referral+Response`.

### Implementation options

| Option | Pros | Cons |
|---|------|------|
| Liquibase changeset in distro | Reproducible across envs, idempotent | Requires distro rebuild + module deploy |
| One-off `POST /ws/rest/v1/encountertype` via curl | Fast, unblocks UI work today | Manual; must be repeated per environment |

**Plan:** do the curl now to unblock Step 2, then back-port a Liquibase changeset into the distro before merge.

### Curl (run now, then record UUID below)

```bash
curl -X POST 'http://localhost:9096/openmrs/ws/rest/v1/encountertype' \
  -u admin:Admin123 \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Referral Response",
    "description": "Encounter recorded by the clinician closing a referral loop"
  }'
```

### Captured artifact

- `Referral Response` EncounterType UUID: `479e4805-90d9-44f5-b252-333d8a687e52`
- Created: 2026-05-07 via REST `POST /ws/rest/v1/encountertype` against `http://localhost:9096/openmrs`
- TODO: back-port to a Liquibase changeset before merging to other environments

---

## Step 2 — Update form schema

**Goal:** Form save → encounter typed correctly + order auto-completed.

### Sub-tasks

1. Pull the current `Referral Response` form schema from the DB (`GET /ws/rest/v1/form/{uuid}` then `GET /ws/rest/v1/clobdata/{valueReference}`).
2. Edit two things:
   - `encounterType: "<uuid from Step 1>"`
   - Add `postSubmissionActions` block.
3. Re-upload schema (`POST /ws/rest/v1/clobdata` then PUT form resource), or just edit via Form Builder UI.

### Schema patch

```json
{
  "name": "Referral Response",
  "version": "1",
    "encounterType": "479e4805-90d9-44f5-b252-333d8a687e52",
  "processor": "EncounterFormProcessor",
  "postSubmissionActions": [
    {
      "actionId": "OrderStatusChangeAction",
      "config": {
        "orderTypeUuid": "778a9dc6-87d9-49c1-83d9-caa01041a8ad",
        "fulfillerStatus": "COMPLETED",
        "fulfillerComment": "Closed by Referral Response form"
      }
    }
  ],
  "pages": [ /* unchanged */ ]
}
```

### Acceptance criteria

- Saving the form with a Referral order on the visit closes that order (`fulfillerStatus = COMPLETED`) — verified via REST.
- Encounter row written with `encounterType = Referral Response` UUID.

---

## Step 3 — Frontend extension: "Record response" action on Referral order

**Goal:** Clinician sees a clickable affordance on each open Referral order in the patient chart Orders widget.

### Sub-tasks

1. Decide implementation surface:
   - **3a.** Config-only via `frontend/config-core_demo.json` if `@openmrs/esm-patient-orders-app` exposes an action slot per OrderType (verify against installed version first).
   - **3b.** New tiny ESM `esm-referral-fulfillment-app` registering an extension to `orders-action-menu-slot` filtered by `orderType.uuid = 778a9dc6-...`.
2. Action handler calls `launchPatientWorkspace('patient-form-entry-workspace', { formInfo: { formUuid: '<referral-response-form-uuid>', additionalProps: { orderUuid }}})`.
3. Wire build into `frontend/spa-assemble-config.json` so the new ESM ships in the SPA.

### Acceptance criteria

- On a patient with an open Referral order, the Orders widget row shows a "Record response" action.
- Clicking it opens the Referral Response form in the workspace.
- The form's order context is populated with `orderUuid` (visible later in obs/encounter linking if needed).

---

## Step 4 — End-to-end smoke test

Re-run the runbook with the new flow:

1. Steps 4–6 of [spice-referral-e2e.md](spice-referral-e2e.md) unchanged (seed visit, encounter, order, queue, vitals).
2. Replace Step 7 + 8 with: click "Record response" on the Referral order → fill form → save.
3. Verify:
   - `GET /order/{uuid}` shows `fulfillerStatus = COMPLETED`.
   - Orders widget pill = **Completed**.
   - Encounter `Referral Response` exists on the visit.

Update [spice-referral-e2e.md](spice-referral-e2e.md) Step 8 + gap #2 to mark as resolved.

---

## Step 5 (optional) — `spiceExternalRef` OrderAttributeType

Out of scope for the close-loop UX itself; tracked here so we don't lose it.

```bash
curl -X POST 'http://localhost:9096/openmrs/ws/rest/v1/orderattributetype' \
  -u admin:Admin123 \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "SPICE External Reference",
    "description": "Upstream SPICE ServiceRequest identifier",
    "datatypeClassname": "org.openmrs.customdatatype.datatype.FreeTextDatatype",
    "minOccurs": 0,
    "maxOccurs": 1
  }'
```

---

## Change log

| Date | Step | Change | Author |
|------|------|--------|--------|
| 2026-05-07 | — | Document created | Copilot |
| 2026-05-07 | 1 | Created `Referral Response` EncounterType via REST; UUID `479e4805-90d9-44f5-b252-333d8a687e52` | Copilot |
| 2026-05-07 | 2 | Patched `Referral Response` form to v5: encounterType -> Referral Response, added `OrderStatusChangeAction` post-submission. Verified persisted via REST. | Copilot |
| 2026-05-07 | 2 | **Reverted `postSubmissionActions` to `[]`** (form v6, resource `3087f5d2-bf15-42b1-990b-f7005c7314d3`). Discovered `OrderStatusChangeAction` is not registered in form-engine 12.1.0 (only `MarkPatientAsDeceasedAction`, `ProgramEnrollmentSubmissionAction` exist). Closing logic re-assigned to Step 3 ESM. | Copilot |
| 2026-05-07 | 3 | Confirmed orders widget exposes per-orderType slot `${orderItem.type}-action-menu-items-slot` (chunk `375.js`); for Referral that resolves to `Referral-action-menu-items-slot`. | Copilot |
| 2026-05-07 | 3 | Built `esm-referral-fulfillment-app` v1.0.0 (16KB main + 3 chunks) under `packages/`. Staged dist + `routes.registry.json` under `frontend/custom-esms/esm-referral-fulfillment-app/`. | Copilot |
| 2026-05-07 | 3 | Wrote idempotent boot-time splice script `frontend/40-merge-custom-esms.sh` (POSIX sh, awk-based). Reads `custom-esms/manifest.json`, injects entries into `importmap.json` + `routes.registry.json`. | Copilot |
| 2026-05-07 | 3 | Discovered official frontend image's CMD is `startup.sh`, not `nginx`, so `/docker-entrypoint.d/` hook never fires. Worked around by overriding `command:` in `docker-compose.override.yml` to wrap the splice script before exec'ing `startup.sh`. | Copilot |
| 2026-05-07 | 3 | Added 3 volume mounts to `docker-compose.override.yml` (local-only): `config-core_demo.json`, `custom-esms/`, splice script. Restarted `o3-frontend-1`. HTTP smoke through gateway: bundle 200/15691 bytes, importmap entry present, routes registry contains `record-referral-response-action` extension at `Referral-action-menu-items-slot`. | Copilot |

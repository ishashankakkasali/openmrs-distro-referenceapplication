# Changelog

All notable behavior changes to `@openmrs/esm-referral-fulfillment-app`.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] — 2026-05-08

### Added

- **Referrals chart tab** with a Carbon `DataTable` of all Referral
  orders for the patient, expandable detail rows (concept, orderer,
  encounter, instructions, fulfillerComment, fulfilledBy).
- **Side-nav link** with the styleguide referral icon, visually aligned
  with sibling chart-tab links via `cds--side-nav__icon`.
- **Record referral response** action that launches the Referral
  Response form workspace pre-bound to the clicked order, then closes
  the order on save (`fulfillerStatus: COMPLETED`).
- **Decline** action with a Carbon `Modal` containing:
  - structured `Dropdown` of 7 reasons (wrong patient, already seen
    elsewhere, refused care, out of scope, duplicate, insufficient
    info, other),
  - optional `TextArea` for additional notes (500-char counter),
  - red primary button enabled only when a reason is selected,
  - submits as `fulfillerStatus: DECLINED`.
- **Fulfilled by** column populated by encoding `<comment> | by: <name>`
  in `fulfillerComment` (works around the Order REST limitation that
  `auditInfo.changedBy` is not bumped by `/fulfillerdetails`).
- Status pill colors: green = `COMPLETED`, red = `DECLINED`, gray =
  pending / `null`.
- Configuration schema with four overridable keys
  (`formUuid`, `orderTypeUuid`, `fulfillerComment`, `encounterTypeUuid`).
- Side-loading deployment via `frontend/custom-esms/manifest.json` +
  `frontend/40-merge-custom-esms.sh` boot hook (idempotent splice into
  importmap and routes registry).

### Removed (during polish)

- Duplicate **Referrals** title bar above the dashboard table.
- **Refresh** button (table reloads on action completion).
- Per-row **Close referral** button (replaced by save-driven close
  through the Referral Response form workspace).
- The transitional `window.prompt`-based Decline dialog (replaced by
  the Carbon Modal described above).

### Known limitations

- Single-order operations only (no batch close/decline).
- Decline reason is stored as free text inside `fulfillerComment` —
  not as a coded concept. Migration to a CodedConcept-backed field is
  a future enhancement.
- No automated retry on REST failure; users re-trigger from the UI.

# Changelog

All notable behavior changes to `@openmrs/esm-referral-fulfillment-app`.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased] — 2026-10-23

### Added

- **New referral out** action on the Referrals tab (needs an active visit): pick what the patient is referred
  for (members of the referral-out orderables concept set), priority and instructions. It creates a **Referral
  Out** encounter in the active visit and a Referral `testorder` in it — the same shape the receiver adaptor
  creates for referrals in, so the FHIR module publishes it as a ServiceRequest and the emitter forwards it to
  OpenHIM with `referral-direction` = `outbound` (e.g. a back-referral to a PHC).
- **Direction** column: *Referral in* (blue) for orders in the Referral In encounter type, *Referral out*
  (purple) for any other.
- **Referred to** (required in *New referral out*): the facilities tagged *Referral Destination*. Recorded on the
  Referral Out encounter and shown as the last row of a referral out's details; the emitter sends it as
  `ServiceRequest.performer` and `locationReference`.
- **Reference number** generated for each referral out (`RO-<date>-<4 chars>`), saved as the order's accession
  number and sent as the ServiceRequest's `ACSN` identifier.
- **SENT** status for a referral out awaiting the receiving facility's response (a referral in shows PENDING).
- Configuration keys `referralDestinationLocationTag`, `referralDestinationConceptUuid`, `referralOutReferencePrefix`,
  `referralInEncounterTypeUuid`, `referralOutEncounterTypeUuid`,
  `referralOutOrderablesConceptSetUuid`, `careSettingUuid`, `clinicianEncounterRoleUuid`.

### Changed

- A referral in's details show **Clinical notes** (the *Clinical notes / addendum to send back to source* answer of
  its Referral Response form) in place of *Instructions*: CCE redacts free text, so a referral in arrives without
  instructions. A referral out still shows its instructions. New configuration key `responseNotesConceptUuid`.
- **New referral out** is a ghost button with a trailing add icon, in O3's widget-action style (as *Record
  vitals*), instead of a filled primary button.
- **Ordered by** shows the orderer's name only (e.g. *Sara Alqahtani*) instead of OpenMRS's provider display
  *identifier - name* (*phc-dr-sara - Sara Alqahtani*).
- *Record referral response* and *Decline* are offered only on referrals in; a referral out is answered by the
  facility it was sent to.
- The dashboard fetches orders with a custom representation that includes each order's encounter type.

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

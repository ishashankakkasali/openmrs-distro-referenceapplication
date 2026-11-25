# Changelog

All notable behavior changes to `@openmrs/esm-referral-fulfillment-app`.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased] — 2026-11-23

### Added

- **Referral for primary PCI**: in Imaging results, "Yes, refer for primary PCI" now raises a real referral out to the
  chosen cardiac centre (Referral order "Referral for primary PCI", STAT, in a Referral Out encounter whose destination
  is the centre's location; instructions carry the AI headline, the ECG order and the working diagnosis). The page shows
  "Referral ORD-… to <centre> raised", and the saved plan names the referral. On the Referrals page that referral
  (out) offers **Record PCI centre's response** (a hint explains the centre has no system here) and Decline: it opens the *PCI Referral Response* form (Stent
  procedure: Performed / Not performed); saving it closes the referral, and its answer shows on the referral.
  Metadata: `scripts/pci-referral-o3-setup.sh`.
- **Imaging** page on the home screen (left navigation, `home/imaging`), for imaging staff, laid out like the
  Laboratory page:
  - tiles *Imaging ordered* (not yet uploaded), *Uploaded* (awaiting the doctor's review) and *Results* (reviewed
    by the doctor). There is no overdue indicator: the "ECG not done in time" alert is CCE's (protocol step), sent to
    the OpenMRS notification bell and to SPICE;
  - *Ordered* / *Uploaded* tabs, date range (today by default), search by patient, identifier, order number or test;
  - one row per imaging order: patient (link to the chart), age, sex, test, order number, time ordered, orderer and
    status (*Ordered*, *Awaiting review*, *Reviewed*). Refreshes every 30 seconds.
  - Expanding an order offers **Upload ECG from the machine** (*Upload result* for other imaging), PNG, JPEG or PDF,
    saved as an attachment in the order's own encounter (captioned with the order number), so the emitted Observation
    carries the encounter's `source-referral-order` link; this does not change the encounter, so a Referral Response
    is not sent again. The order moves to *Uploaded* and shows **only the image**, with whether the doctor has reviewed it. A completed order never offers an upload.
- **Imaging results** in the patient chart (left navigation, next to Orders): where the doctor, back in
  consultation, reviews the patient's imaging. Orders awaiting review open automatically and show the image, the
  **AI interpretation** (hardcoded text for now) with *Agree with the AI read*, *Send to cardiologist for
  confirmatory interpretation* and *My reading differs*, and the **assessment**: suggested working diagnosis and the
  **STEMI pathway** (facts, cardiac centres with a cath lab hardcoded in config, *Within / Beyond 120 minutes*,
  *Choose*, *Give now, tick as given*, *Yes, refer for primary PCI / Not now*). A centre beyond 120 minutes switches
  the advice to fibrinolysis first; *My reading differs* pauses the pathway. Before the upload it says the result is
  awaited. The Orders widget has no extension point inside a test order's row, hence a chart tab of its own.
- *Send to cardiologist for confirmatory interpretation* replaces the AI-read buttons with "Sent to <cardiologist>,
  <facility>, at … · reply due by …" (as in the reference demo), the pathway facts then read "cardiologist
  confirmation pending", and the saved finding records the send. Cardiologist and reply time are config
  (`imaging.cardiologist`, default Dr S. Ahmed, SZMCH, 10 minutes); nothing is sent yet. *Yes, refer for primary PCI*
  shows its "Referral … accepted" status on the page without a notification.
- **AI read of the ECG** by the `ecgai` OpenMRS module (`modules/ecgai`, REST `/ws/rest/v1/ecgai`, LangChain4j): the
  upload starts it; the module reads the ECG with the user's privileges, sends it with the clinical team's
  cardiologist prompt (`modules/ecgai/src/main/resources/prompt.txt`) to the configured LLM (`ECG_AI_PROVIDER` = `anthropic`
  for Claude, or `gemini`), and saves the structured answer on the order as an *ECG AI interpretation* observation
  (JSON). Imaging results shows its three sections (ECG interpretation, disposition, next steps within / beyond 120
  minutes), loading the saved read or starting it and polling. The STEMI pathway opens only when the disposition is
  *Immediate cath lab referral*; otherwise a *No referral: serial ECG monitoring* note shows and no referral decision
  is needed. The headline and suggested diagnosis come from the AI read. Without an API key on the backend the
  page shows the config texts as a labelled *demo read*. Config: `imaging.aiRead.enabled`, `imaging.aiRead.conceptUuid`.
- The order's status follows the work: uploading sets **IN_PROGRESS** (the chart's Orders widget shows *In
  progress*); **Complete review** in Imaging results saves the review and sets **COMPLETED**. It is available once
  the AI read is agreed (with a referral decision: refer for PCI, or not now with a reason) or the clinician's
  reading differs; for other imaging, once a finding is written.
- The review is saved as the order's result: an **Imaging review** obs group (*Imaging finding*, *Imaging working
  diagnosis*, *Imaging plan*) linked to the order in its encounter, so the chart's Orders widget lists it under the
  order. Adding these obs does not change the encounter, so a Referral Response encounter is not sent again. A
  reviewed order shows its saved review read-only.
- Configuration object `imaging` (see configuration.md).
- Metadata script `scripts/imaging-orders-o3-setup.sh`:
  - **Imaging Order** order type (`org.openmrs.TestOrder`, still published as a FHIR ServiceRequest);
  - the ECG concepts (*Electrocardiogram (ECG)*, CIEL 161157) in the *Radiology/Imaging Procedure* class, mapped to
    Imaging Order with SQL (REST cannot set an order type's concept classes). The form engine orders a test without
    an order type, so OpenMRS picks it from the concept class: an ECG is now an Imaging order and no longer appears
    on the Laboratory page;
  - **Referral Response form**: *Chest pain* in the *Illness* dropdown, and *Order ECG* shown for *Heart disease* or
    *Chest pain* (the same form for every referral);
  - **Imaging review** concept set and its three text members, the result saved by Complete review.

### Not connected yet

- *Send to cardiologist* and *Yes, refer for primary PCI* only record the choice on the page; nothing is sent. Until Complete
  review the choices are kept in sessionStorage per order (lost if the browser session ends); the saved review keeps
  the outcome.
- The referral-acknowledgement SLA alert (4 hours, 1 minute for the demo) belongs to the CCE protocol and events.

## 2026-10-23

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

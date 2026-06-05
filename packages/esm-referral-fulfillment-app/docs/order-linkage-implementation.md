# Order Linkage: Encounter → Referral Order

This document describes how to persist the referral order UUID on the
Referral Response encounter so that the emitter adaptor can enrich
outbound FHIR resources with order details (instructions, reference
number, priority, referral type).

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│ ESM (record-referral-response / referrals-dashboard)                │
│  additionalProps: { orderUuid, orderNumber, orderInstructions, … }  │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │ passed to form engine
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Referral Response Form (form-engine)                                │
│  Hidden fields with calculate expressions:                          │
│    obs(concept=SOURCE_ORDER_UUID)   = additionalProps.orderUuid     │
│    obs(concept=ORDER_INSTRUCTIONS)  = additionalProps.orderInstructions │
│    obs(concept=ORDER_REFERENCE_NUM) = additionalProps.orderAccessionNumber │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │ encounter saved (POST /encounter)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ OpenMRS DB: encounter + obs rows                                    │
│  encounter_type = "Referral Response"                               │
│  obs: SOURCE_ORDER_UUID = "abc-123-..."                             │
│  obs: ORDER_INSTRUCTIONS = "High risk pregnant woman, ANC Visit 1"  │
│  obs: ORDER_REFERENCE_NUM = "502901"                                │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │ FHIR2 module emits Encounter+Obs
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ openmrs-emitter-adaptor                                             │
│  1. Detect encounterType = "Referral Response"                      │
│  2. Find obs with concept = SOURCE_ORDER_UUID → get order UUID      │
│  3. GET /ws/rest/v1/order/{uuid}?v=full → get instructions, etc.    │
│  4. Enrich outbound Encounter:                                      │
│       basedOn: [{ reference: "ServiceRequest/<order-uuid>" }]       │
│       extension: [{ orderInstructions, referenceNumber, urgency }]  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Create Concepts (one-time setup)

Create three Free Text concepts to hold the linkage data as obs:

```bash
# 1. Source Referral Order UUID
curl -X POST 'http://localhost:9096/openmrs/ws/rest/v1/concept' \
  -u admin:Admin123 -H 'Content-Type: application/json' \
  -d '{
    "names": [{ "name": "Source Referral Order UUID", "locale": "en", "conceptNameType": "FULLY_SPECIFIED" }],
    "datatype": "8d4a4ab4-c2cc-11de-8d13-0010c6dffd0f",
    "conceptClass": "8d491e50-c2cc-11de-8d13-0010c6dffd0f",
    "descriptions": [{ "description": "UUID of the referral order this response encounter is linked to", "locale": "en" }]
  }'
# → Record the returned UUID as CONCEPT_SOURCE_ORDER_UUID

# 2. Referral Order Instructions
curl -X POST 'http://localhost:9096/openmrs/ws/rest/v1/concept' \
  -u admin:Admin123 -H 'Content-Type: application/json' \
  -d '{
    "names": [{ "name": "Referral Order Instructions", "locale": "en", "conceptNameType": "FULLY_SPECIFIED" }],
    "datatype": "8d4a4ab4-c2cc-11de-8d13-0010c6dffd0f",
    "conceptClass": "8d491e50-c2cc-11de-8d13-0010c6dffd0f",
    "descriptions": [{ "description": "Instructions from the source referral order (e.g. ANC Visit 1)", "locale": "en" }]
  }'
# → Record UUID as CONCEPT_ORDER_INSTRUCTIONS

# 3. Referral Order Reference Number
curl -X POST 'http://localhost:9096/openmrs/ws/rest/v1/concept' \
  -u admin:Admin123 -H 'Content-Type: application/json' \
  -d '{
    "names": [{ "name": "Referral Order Reference Number", "locale": "en", "conceptNameType": "FULLY_SPECIFIED" }],
    "datatype": "8d4a4ab4-c2cc-11de-8d13-0010c6dffd0f",
    "conceptClass": "8d491e50-c2cc-11de-8d13-0010c6dffd0f",
    "descriptions": [{ "description": "External reference/accession number of the source referral order", "locale": "en" }]
  }'
# → Record UUID as CONCEPT_ORDER_REFERENCE_NUM
```

> **Note**: `8d4a4ab4-c2cc-11de-8d13-0010c6dffd0f` = "Text" datatype;
> `8d491e50-c2cc-11de-8d13-0010c6dffd0f` = "Misc" concept class.

---

## Step 2: Update Referral Response Form Schema

Edit the form schema (UUID `2dcc7696-66b4-42fd-95c0-50603e0e2f4e`) via
Form Builder or REST clobdata update. Add a hidden page/section with
three fields that auto-populate from `additionalProps`:

```json
{
  "label": "Order Linkage (hidden)",
  "isHidden": true,
  "sections": [
    {
      "label": "Referral Order Context",
      "isExpanded": false,
      "questions": [
        {
          "id": "sourceReferralOrderUuid",
          "label": "Source Referral Order UUID",
          "type": "obs",
          "questionOptions": {
            "rendering": "text",
            "concept": "<CONCEPT_SOURCE_ORDER_UUID>",
            "isHidden": true
          },
          "validators": [],
          "behaviours": [
            {
              "intent": "*",
              "required": "false",
              "hide": { "hideWhenExpression": "false" },
              "calculate": {
                "calculateExpression": "resolve(api.getAdditionalProp('orderUuid')) || ''"
              }
            }
          ]
        },
        {
          "id": "referralOrderInstructions",
          "label": "Referral Order Instructions",
          "type": "obs",
          "questionOptions": {
            "rendering": "text",
            "concept": "<CONCEPT_ORDER_INSTRUCTIONS>",
            "isHidden": true
          },
          "validators": [],
          "behaviours": [
            {
              "intent": "*",
              "required": "false",
              "hide": { "hideWhenExpression": "false" },
              "calculate": {
                "calculateExpression": "resolve(api.getAdditionalProp('orderInstructions')) || ''"
              }
            }
          ]
        },
        {
          "id": "referralOrderReferenceNumber",
          "label": "Referral Order Reference Number",
          "type": "obs",
          "questionOptions": {
            "rendering": "text",
            "concept": "<CONCEPT_ORDER_REFERENCE_NUM>",
            "isHidden": true
          },
          "validators": [],
          "behaviours": [
            {
              "intent": "*",
              "required": "false",
              "hide": { "hideWhenExpression": "false" },
              "calculate": {
                "calculateExpression": "resolve(api.getAdditionalProp('orderAccessionNumber')) || ''"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### Alternative: simpler calculate syntax

If your form-engine version doesn't support `api.getAdditionalProp()`,
use the expression context variable directly:

```json
"calculate": {
  "calculateExpression": "orderUuid"
}
```

The form engine injects all `additionalProps` keys as top-level
expression variables. Test by checking form-engine version ≥ 5.x.

---

## Step 3: Emitter Adaptor Enrichment (pseudo-code)

When the adaptor processes a FHIR Encounter of type "Referral Response":

```java
// In your encounter processor / transformer:

if (isReferralResponseEncounter(encounter)) {
    // 1. Find the source order UUID from obs
    String orderUuid = findObsValue(encounter, CONCEPT_SOURCE_ORDER_UUID);

    if (orderUuid != null) {
        // 2. Fetch order details from OpenMRS
        Order order = fetchOrder(orderUuid); // GET /ws/rest/v1/order/{uuid}?v=full

        // 3. Add basedOn reference (links to the ServiceRequest)
        encounter.addBasedOn(new Reference("ServiceRequest/" + orderUuid));

        // 4. Add extensions with order context
        encounter.addExtension(new Extension(
            "http://your-org.org/fhir/StructureDefinition/referral-instructions",
            new StringType(order.getInstructions())
        ));
        encounter.addExtension(new Extension(
            "http://your-org.org/fhir/StructureDefinition/referral-reference-number",
            new StringType(order.getAccessionNumber())
        ));
        encounter.addExtension(new Extension(
            "http://your-org.org/fhir/StructureDefinition/referral-urgency",
            new StringType(order.getUrgency())
        ));
        encounter.addExtension(new Extension(
            "http://your-org.org/fhir/StructureDefinition/referral-type",
            new StringType(order.getConcept().getDisplay())
        ));
    }
}
```

---

## Step 4: Expected Enriched Encounter Output

After adaptor enrichment, the outbound FHIR Encounter will look like:

```json
{
  "resourceType": "Encounter",
  "id": "ca7c3351-a903-470d-bc4a-6cd57729706d",
  "status": "unknown",
  "class": { "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB" },
  "type": [
    {
      "coding": [
        {
          "system": "http://fhir.openmrs.org/code-system/encounter-type",
          "code": "479e4805-90d9-44f5-b252-333d8a687e52",
          "display": "Referral Response"
        }
      ]
    }
  ],
  "basedOn": [
    {
      "reference": "ServiceRequest/<order-uuid>",
      "display": "RMNCH Referral - ORD-457"
    }
  ],
  "extension": [
    {
      "url": "http://your-org.org/fhir/StructureDefinition/referral-instructions",
      "valueString": "High risk pregnant woman, Gaps in ANC - ANC Visit 1"
    },
    {
      "url": "http://your-org.org/fhir/StructureDefinition/referral-reference-number",
      "valueString": "502901"
    },
    {
      "url": "http://your-org.org/fhir/StructureDefinition/referral-urgency",
      "valueString": "STAT"
    },
    {
      "url": "http://your-org.org/fhir/StructureDefinition/referral-type",
      "valueString": "RMNCH"
    }
  ],
  "subject": {
    "reference": "Patient/8d303032-67c7-4504-86e4-96cb42388054",
    "display": "Bisty Bisty"
  },
  "participant": [ ... ],
  "period": { "start": "2026-05-27T08:33:16+00:00" },
  "location": [ ... ],
  "partOf": { "reference": "Encounter/7dab24e1-280b-418c-9ee5-a16021e3ce8f" }
}
```

The downstream consumer can now:
- Follow `basedOn` → `ServiceRequest/<uuid>` to get the full referral order
- Read `extension[referral-instructions]` to identify "ANC Visit 1"
- Use `extension[referral-reference-number]` for correlation with SPICE

---

## Detection Logic for Emitter

To identify which encounters need enrichment:

```java
boolean isReferralResponseEncounter(Encounter enc) {
    return enc.getType().stream()
        .flatMap(t -> t.getCoding().stream())
        .anyMatch(c -> "479e4805-90d9-44f5-b252-333d8a687e52".equals(c.getCode()));
}
```

---

## Summary of Changes

| Layer | File/Artifact | Change |
|-------|--------------|--------|
| **ESM** | `record-referral-response.component.tsx` | Pass `orderInstructions`, `orderAccessionNumber`, `orderUrgency`, `orderConceptDisplay` in `additionalProps` |
| **ESM** | `referrals-dashboard.component.tsx` | Same — pass full order context in `additionalProps` |
| **Backend** | OpenMRS concepts (REST/Liquibase) | Create 3 concepts: Source Order UUID, Instructions, Reference Number |
| **Form** | Referral Response form schema (clobdata) | Add hidden page with 3 `calculate` fields mapped to the concepts |
| **Emitter** | openmrs-emitter-adaptor | For "Referral Response" encounters: read order UUID obs → fetch order → add `basedOn` + extensions |

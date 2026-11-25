#!/usr/bin/env bash
# O3 metadata for the referral to primary PCI raised from Imaging results ("Yes, refer for primary PCI"), and the
# PCI centre's response to it. Idempotent: every item has a fixed UUID (the referral-fulfillment ESM's config
# defaults) and is only created when missing, so it can be re-run against any environment.
#
#   OPENMRS_URL=http://localhost:9096/openmrs OPENMRS_AUTH=admin:Admin123 ./scripts/pci-referral-o3-setup.sh
#
# Needs the "New referral out" metadata of scripts/saudi-diabetes-o3-setup.sh (Referral Out encounter type,
# "Referral destination facility" concept): the PCI referral is raised the same way, as a referral out.
#
# 1. "Referral for primary PCI" (Misc Order): the concept of the Referral order.
# 2. The cardiac centres (imaging.cardiacCentres) as locations, so the referral records its destination (shown as
#    "Referred to", sent by the emitter as ServiceRequest.performer). A "Facility code" (placeholder) is set when
#    that attribute type exists.
# 3. "Stent procedure" (Coded: Performed / Not performed): the PCI centre's answer.
# 4. "PCI Referral Response" form: that one question. It is saved as a Referral Response encounter, so the
#    Referrals page closes the referral exactly as for the Referral Response form.
set -euo pipefail

URL=${OPENMRS_URL:-http://localhost:9096/openmrs}
AUTH=${OPENMRS_AUTH:-admin:Admin123}
API="$URL/ws/rest/v1"

PCI_REFERRAL=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0a
STENT_PROCEDURE=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0b
STENT_PERFORMED=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0c
STENT_NOT_PERFORMED=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0d
CENTRE_SZMCH=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0e
CENTRE_NICVD=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0f
PCI_RESPONSE_FORM=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e10

REFERRAL_RESPONSE_ENCOUNTER_TYPE=479e4805-90d9-44f5-b252-333d8a687e52
REFERRAL_OUT_ENCOUNTER_TYPE=7b3f4e2a-9c1d-4e8b-a6f0-2d5c8e1b9a47
REFERRAL_DESTINATION_CONCEPT=5f8a2c6e-3b9d-4e1f-a7c4-0d6e9b2a8f15
FACILITY_CODE_ATTRIBUTE_TYPE=9e2b7c40-5d1a-4f8e-b3c6-1a7d0e4f9c52

CLASS_MISC_ORDER=8d492ee0-c2cc-11de-8d13-0010c6dffd0f
CLASS_QUESTION=8d491e50-c2cc-11de-8d13-0010c6dffd0f
CLASS_MISC=8d492774-c2cc-11de-8d13-0010c6dffd0f
DATATYPE_TEXT=8d4a4ab4-c2cc-11de-8d13-0010c6dffd0f
DATATYPE_CODED=8d4a48b6-c2cc-11de-8d13-0010c6dffd0f
DATATYPE_NA=8d4a4c94-c2cc-11de-8d13-0010c6dffd0f

get()  { curl -s -u "$AUTH" "$API/$1"; }
post() { curl -s -u "$AUTH" -H 'Content-Type: application/json' -X POST "$API/$1" -d "$2"; }
exists() { [ "$(curl -s -o /dev/null -w '%{http_code}' -u "$AUTH" "$API/$1")" = 200 ]; }

for need in "encountertype/$REFERRAL_OUT_ENCOUNTER_TYPE" "concept/$REFERRAL_DESTINATION_CONCEPT" \
            "encountertype/$REFERRAL_RESPONSE_ENCOUNTER_TYPE"; do
  exists "$need" || { echo "Missing $need: run scripts/saudi-diabetes-o3-setup.sh first (New referral out)." >&2; exit 1; }
done

concept() { # uuid name class datatype description [answer-uuids json]
  local uuid=$1 name=$2 class=$3 datatype=$4 description=$5 answers=${6:-}
  if exists "concept/$uuid"; then echo "OK       concept $name"; return; fi
  post concept "{\"uuid\":\"$uuid\",\"names\":[{\"name\":\"$name\",\"locale\":\"en\",\"conceptNameType\":\"FULLY_SPECIFIED\",\"localePreferred\":true}],
    \"descriptions\":[{\"description\":\"$description\",\"locale\":\"en\"}],\"conceptClass\":\"$class\",\"datatype\":\"$datatype\"${answers:+,\"answers\":$answers}}" >/dev/null
  exists "concept/$uuid" && echo "CREATED  concept $name" || { echo "FAILED   concept $name" >&2; exit 1; }
}

# 1. Referral concept
concept "$PCI_REFERRAL" "Referral for primary PCI" "$CLASS_MISC_ORDER" "$DATATYPE_TEXT" \
  "Referral to a cardiac centre for primary PCI (raised from Imaging results after a STEMI ECG)"

# 2. Cardiac centres
centre() { # uuid name description facility-code
  local uuid=$1 name=$2 description=$3 code=$4
  if exists "location/$uuid"; then echo "OK       location $name"; return; fi
  local attrs=""
  exists "locationattributetype/$FACILITY_CODE_ATTRIBUTE_TYPE" \
    && attrs=",\"attributes\":[{\"attributeType\":\"$FACILITY_CODE_ATTRIBUTE_TYPE\",\"value\":\"$code\"}]"
  post location "{\"uuid\":\"$uuid\",\"name\":\"$name\",\"description\":\"$description\"$attrs}" >/dev/null
  exists "location/$uuid" && echo "CREATED  location $name" || { echo "FAILED   location $name" >&2; exit 1; }
}
centre "$CENTRE_SZMCH" "Shaheed Ziaur Rahman Medical College Hospital" "Cardiac centre with a cath lab (primary PCI)" TEST-PCI-001
centre "$CENTRE_NICVD" "National Institute of Cardiovascular Diseases, Dhaka" "Cardiac centre with a cath lab (primary PCI)" TEST-PCI-002

# 3. Stent procedure question and answers
concept "$STENT_PERFORMED" "Stent procedure performed" "$CLASS_MISC" "$DATATYPE_NA" "PCI with stent was performed"
concept "$STENT_NOT_PERFORMED" "Stent procedure not performed" "$CLASS_MISC" "$DATATYPE_NA" "PCI with stent was not performed"
concept "$STENT_PROCEDURE" "Stent procedure" "$CLASS_QUESTION" "$DATATYPE_CODED" \
  "Whether the PCI centre performed the stent procedure (PCI referral response)" "[\"$STENT_PERFORMED\",\"$STENT_NOT_PERFORMED\"]"

# 4. PCI Referral Response form
if exists "form/$PCI_RESPONSE_FORM"; then
  echo "OK       form PCI Referral Response"
else
  WORK=$(mktemp -d)
  trap 'rm -rf "$WORK"' EXIT
  cat > "$WORK/schema.json" <<JSON
{
  "name": "PCI Referral Response",
  "version": "1",
  "processor": "EncounterFormProcessor",
  "encounterType": "$REFERRAL_RESPONSE_ENCOUNTER_TYPE",
  "referencedForms": [],
  "uuid": "$PCI_RESPONSE_FORM",
  "pages": [{
    "label": "PCI referral response",
    "sections": [{
      "label": "Primary PCI",
      "isExpanded": "true",
      "questions": [{
        "id": "stentProcedure",
        "label": "Stent procedure",
        "type": "obs",
        "required": true,
        "questionOptions": {
          "rendering": "radio",
          "concept": "$STENT_PROCEDURE",
          "answers": [
            {"concept": "$STENT_PERFORMED", "label": "Performed"},
            {"concept": "$STENT_NOT_PERFORMED", "label": "Not performed"}
          ]
        }
      }]
    }]
  }]
}
JSON
  post form "{\"uuid\":\"$PCI_RESPONSE_FORM\",\"name\":\"PCI Referral Response\",\"version\":\"1\",\"published\":true,
    \"encounterType\":\"$REFERRAL_RESPONSE_ENCOUNTER_TYPE\",\"description\":\"The PCI centre's response to a referral for primary PCI\"}" >/dev/null
  CLOB=$(curl -s -u "$AUTH" -X POST "$API/clobdata" -F "file=@$WORK/schema.json;type=application/json")
  post "form/$PCI_RESPONSE_FORM/resource" "{\"name\":\"JSON schema\",\"dataType\":\"AmpathJsonSchema\",\"valueReference\":\"$CLOB\"}" >/dev/null
  exists "form/$PCI_RESPONSE_FORM" && echo "CREATED  form PCI Referral Response" || { echo "FAILED   form" >&2; exit 1; }
fi
echo "Form: $(get "form/$PCI_RESPONSE_FORM?v=custom:(name,published,encounterType:(display),resources:(name))")"

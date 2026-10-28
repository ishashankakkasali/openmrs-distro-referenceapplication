#!/usr/bin/env bash
# O3 metadata for the Saudi diabetes journey (Stage 3, cluster hospital). Idempotent: every item has a
# fixed UUID and is only created when missing, so it can be re-run against any environment.
#
#   OPENMRS_URL=http://localhost:9096/openmrs OPENMRS_AUTH=admin:Admin123 ./scripts/saudi-diabetes-o3-setup.sh
#
# 1. LOINC 4548-4 (HbA1c) SAME-AS mapping on CIEL 159644, so the HbA1c result reaches CCE with a LOINC code
#    (Serum glucose, CIEL 887, already carries LOINC 2345-7).
# 2. "Referral to primary health care (PHC)" order concept in a "Referral orderables" set — the set is what
#    frontend/config-core_demo.json offers in the order basket for the Referral order type (downward referral).
# 3. "Diabetes Triage" form (Vitals encounter): random blood glucose at triage, which the vitals widget lacks.
# 4. "Referral Intake" visit type: the receiver adaptor files an inbound referral in a closed visit of this type
#    (OPENMRS_REFERRAL_INTAKE_VISIT_TYPE_UUID), so the referral order has a visit (the O3 Orders widget needs
#    one) while the OPD visit is still started by the clerk when the patient arrives.
set -euo pipefail

URL=${OPENMRS_URL:-http://localhost:9096/openmrs}
AUTH=${OPENMRS_AUTH:-admin:Admin123}
API="$URL/ws/rest/v1"

LOINC_SOURCE=6ADDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
SAME_AS=35543629-7d8c-11e1-909d-c80aa9edcf4e
HBA1C=159644AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
SERUM_GLUCOSE=887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
CLASS_MISC_ORDER=8d492ee0-c2cc-11de-8d13-0010c6dffd0f
CLASS_CONVSET=8d492594-c2cc-11de-8d13-0010c6dffd0f
DATATYPE_NA=8d4a4c94-c2cc-11de-8d13-0010c6dffd0f
ENCOUNTER_TYPE_VITALS=67a71486-1a54-468f-ac3e-7091a9a79584

LOINC_HBA1C_TERM=3c1a7c1e-5a1d-4a52-9d55-4548a1c00001
PHC_REFERRAL_CONCEPT=3c1a7c1e-5a1d-4a52-9d55-4548a1c00002
REFERRAL_ORDERABLES_SET=3c1a7c1e-5a1d-4a52-9d55-4548a1c00003
TRIAGE_FORM=3c1a7c1e-5a1d-4a52-9d55-4548a1c00004
REFERRAL_INTAKE_VISIT_TYPE=3c1a7c1e-5a1d-4a52-9d55-4548a1c00005

get()  { curl -s -u "$AUTH" "$API/$1"; }
post() { curl -s -u "$AUTH" -H 'Content-Type: application/json' -X POST "$API/$1" -d "$2"; }
exists() { [ "$(curl -s -o /dev/null -w '%{http_code}' -u "$AUTH" "$API/$1")" = 200 ]; }

# 1. LOINC 4548-4 on HbA1c
if ! exists "conceptreferenceterm/$LOINC_HBA1C_TERM"; then
  post conceptreferenceterm "{\"uuid\":\"$LOINC_HBA1C_TERM\",\"code\":\"4548-4\",\"name\":\"Hemoglobin A1c/Hemoglobin.total in Blood\",\"conceptSource\":\"$LOINC_SOURCE\"}" >/dev/null
fi
if ! get "concept/$HBA1C?v=custom:(mappings:(conceptReferenceTerm:(uuid)))" | grep -q "$LOINC_HBA1C_TERM"; then
  post "concept/$HBA1C/mapping" "{\"conceptReferenceTerm\":\"$LOINC_HBA1C_TERM\",\"conceptMapType\":\"$SAME_AS\"}" >/dev/null
fi
echo "HbA1c LOINC mapping: $(get "concept/$HBA1C?v=custom:(mappings:(display))" | grep -o 'LOINC: [0-9-]*')"

# 2. Downward-referral order concept and the set the order basket offers
if ! exists "concept/$PHC_REFERRAL_CONCEPT"; then
  post concept "{\"uuid\":\"$PHC_REFERRAL_CONCEPT\",\"names\":[{\"name\":\"Referral to primary health care (PHC)\",\"locale\":\"en\",\"conceptNameType\":\"FULLY_SPECIFIED\",\"localePreferred\":true}],\"descriptions\":[{\"description\":\"Downward referral: hand the patient back to their PHC for ongoing care\",\"locale\":\"en\"}],\"conceptClass\":\"$CLASS_MISC_ORDER\",\"datatype\":\"$DATATYPE_NA\"}" >/dev/null
fi
if ! exists "concept/$REFERRAL_ORDERABLES_SET"; then
  post concept "{\"uuid\":\"$REFERRAL_ORDERABLES_SET\",\"names\":[{\"name\":\"Referral orderables\",\"locale\":\"en\",\"conceptNameType\":\"FULLY_SPECIFIED\",\"localePreferred\":true}],\"conceptClass\":\"$CLASS_CONVSET\",\"datatype\":\"$DATATYPE_NA\",\"set\":true,\"setMembers\":[\"$PHC_REFERRAL_CONCEPT\"]}" >/dev/null
fi
echo "Referral orderables: $(get "concept/$REFERRAL_ORDERABLES_SET?v=custom:(setMembers:(display))" | grep -o '"display":"[^"]*"' | tr '\n' ' ')"

# 3. Diabetes Triage form
if ! exists "form/$TRIAGE_FORM"; then
  post form "{\"uuid\":\"$TRIAGE_FORM\",\"name\":\"Diabetes Triage\",\"version\":\"1.0\",\"description\":\"Random blood glucose recorded at triage\",\"encounterType\":\"$ENCOUNTER_TYPE_VITALS\",\"published\":true}" >/dev/null
  schema=$(mktemp)
  cat > "$schema" <<EOF
{
  "uuid": "$TRIAGE_FORM",
  "name": "Diabetes Triage",
  "version": "1.0",
  "description": "Random blood glucose recorded at triage",
  "encounterType": "$ENCOUNTER_TYPE_VITALS",
  "encounter": "Vitals",
  "processor": "EncounterFormProcessor",
  "published": true,
  "retired": false,
  "referencedForms": [],
  "pages": [
    {
      "label": "Triage",
      "sections": [
        {
          "label": "Blood sugar",
          "isExpanded": "true",
          "questions": [
            {
              "id": "randomBloodGlucose",
              "label": "Random blood glucose (mg/dL)",
              "type": "obs",
              "required": true,
              "questionOptions": { "rendering": "number", "concept": "$SERUM_GLUCOSE", "min": "0", "max": "1000" }
            }
          ]
        }
      ]
    }
  ]
}
EOF
  clob=$(curl -s -u "$AUTH" -X POST "$API/clobdata" -F "file=@$schema;type=application/json")
  rm -f "$schema"
  post "form/$TRIAGE_FORM/resource" "{\"name\":\"JSON schema\",\"dataType\":\"AmpathJsonSchema\",\"valueReference\":\"$clob\"}" >/dev/null
fi
echo "Triage form: $(get "form/$TRIAGE_FORM?v=custom:(display,published,resources:(name))")"

# 4. Referral Intake visit type
if ! exists "visittype/$REFERRAL_INTAKE_VISIT_TYPE"; then
  post visittype "{\"uuid\":\"$REFERRAL_INTAKE_VISIT_TYPE\",\"name\":\"Referral Intake\",\"description\":\"Closed visit holding an inbound referral until the patient arrives and an OPD visit is started\"}" >/dev/null
fi
# Retired: only the receiver adaptor uses it (OpenMRS still accepts a retired visit type on new visits),
# and retiring keeps it out of the Start a visit picker so a clerk cannot check a patient in with it.
if get "visittype/$REFERRAL_INTAKE_VISIT_TYPE?v=custom:(retired)" | grep -q '"retired":false'; then
  curl -s -o /dev/null -u "$AUTH" -X DELETE "$API/visittype/$REFERRAL_INTAKE_VISIT_TYPE?reason=Receiver-only+visit+type"
fi
echo "Visit type: $(get "visittype/$REFERRAL_INTAKE_VISIT_TYPE?v=custom:(display,retired)")"

# 5. Referral Response form: "Final diagnosis" saved with certainty CONFIRMED (form-engine
#    questionOptions.diagnosis.isConfirmed) — the hospital's answer to the referral confirms the diagnosis it
#    was referred for. (The journey step "diagnosis confirmed" is the condition the doctor records as Active
#    on the Conditions page after the results; the referral response comes at the end of the visit.)
REFERRAL_RESPONSE_FORM=2dcc7696-66b4-42fd-95c0-50603e0e2f4e
if exists "form/$REFERRAL_RESPONSE_FORM"; then
  resource=$(get "form/$REFERRAL_RESPONSE_FORM?v=custom:(resources:(uuid,name,valueReference))")
  resource_uuid=$(echo "$resource" | python3 -I -c 'import json,sys;r=[x for x in json.load(sys.stdin)["resources"] if x["name"]=="JSON schema"][0];print(r["uuid"])')
  clob=$(echo "$resource" | python3 -I -c 'import json,sys;r=[x for x in json.load(sys.stdin)["resources"] if x["name"]=="JSON schema"][0];print(r["valueReference"])')
  schema=$(mktemp)
  if get "clobdata/$clob" | python3 -I -c '
import json, sys
form = json.load(sys.stdin); changed = False
def walk(questions):
    global changed
    for q in questions:
        if q.get("id") == "finalDiagnosis":
            d = q.setdefault("questionOptions", {}).setdefault("diagnosis", {})
            if d.get("isConfirmed") is not True:
                d["isConfirmed"] = True; changed = True
        walk(q.get("questions", []))
for page in form["pages"]:
    for section in page["sections"]:
        walk(section["questions"])
json.dump(form, open(sys.argv[1], "w"), indent=2)
sys.exit(0 if changed else 1)' "$schema"; then
    new_clob=$(curl -s -u "$AUTH" -X POST "$API/clobdata" -F "file=@$schema;type=application/json")
    # The REST form resource update rejects the AmpathJsonSchema datatype, so replace the resource instead
    curl -s -o /dev/null -u "$AUTH" -X DELETE "$API/form/$REFERRAL_RESPONSE_FORM/resource/$resource_uuid?purge=true"
    post "form/$REFERRAL_RESPONSE_FORM/resource" "{\"name\":\"JSON schema\",\"dataType\":\"AmpathJsonSchema\",\"valueReference\":\"$new_clob\"}" >/dev/null
  fi
  rm -f "$schema"
  echo "Referral Response final diagnosis confirmed: $(get "clobdata/$(get "form/$REFERRAL_RESPONSE_FORM?v=custom:(resources:(valueReference))" | python3 -I -c 'import json,sys;print(json.load(sys.stdin)["resources"][0]["valueReference"])')" | grep -c '"isConfirmed": *true')"
fi

# 6. HbA1c orderable: the order basket offers only members of the "Tests Orderability" set
#    (esm-patient-tests-app orders.labOrderableConcepts), and the reference content leaves HbA1c out.
TESTS_ORDERABILITY=1748a953-d12e-4be1-914c-f6b096c6cdef
if exists "concept/$TESTS_ORDERABILITY"; then
  members=$(get "concept/$TESTS_ORDERABILITY?v=custom:(setMembers:(uuid))" | python3 -I -c 'import json,sys;print(" ".join(m["uuid"] for m in json.load(sys.stdin)["setMembers"]))')
  case " $members " in
    *" $HBA1C "*) ;;
    *) post "concept/$TESTS_ORDERABILITY" "{\"setMembers\":$(python3 -I -c 'import json,sys;print(json.dumps(sys.argv[1].split()+[sys.argv[2]]))' "$members" "$HBA1C")}" >/dev/null ;;
  esac
  echo "HbA1c orderable: $(get "concept/$TESTS_ORDERABILITY?v=custom:(setMembers:(uuid))" | grep -c "$HBA1C")"
fi

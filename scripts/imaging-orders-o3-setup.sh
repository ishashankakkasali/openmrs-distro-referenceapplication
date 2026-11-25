#!/usr/bin/env bash
# O3 metadata for imaging orders: the ECG ordered from the Referral Response form becomes an Imaging
# order (listed on the Imaging page, not the Laboratory page). Idempotent: every item has a fixed UUID and is only
# created or changed when needed, so it can be re-run against any environment.
#
#   OPENMRS_URL=http://localhost:9096/openmrs OPENMRS_AUTH=admin:Admin123 \
#   MYSQL_CMD="docker exec -i o3-db-1 sh -c 'mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" openmrs'" \
#     ./scripts/imaging-orders-o3-setup.sh
#
#   On k3s (AIIMS): MYSQL_CMD="sudo k3s kubectl -n openmrs exec -i deploy/openmrs-db -- sh -c 'mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" openmrs'"
#
# 1. "Imaging Order" order type (Java class org.openmrs.TestOrder, so the FHIR module still publishes it as a
#    ServiceRequest).
# 2. The ECG concepts — "Electrocardiogram (ECG)" (the Referral Response form's answer; created when missing) and
#    CIEL 161157 "12-lead electrocardiogram" — in the "Radiology/Imaging Procedure" class, and that class mapped to
#    the Imaging Order type. The form engine posts a test order without an order type, so OpenMRS picks the type
#    from the concept's class: before this mapping an ECG fell back to "Test Order" and showed in the lab worklist.
#    OrderType.conceptClasses cannot be set over REST, so the mapping is inserted with SQL (MYSQL_CMD).
# 3. "Imaging orderables" concept set holding the ECG concepts.
# 3b. "ECG AI interpretation" (Text): the AI read of an uploaded ECG, saved on the order by the ecgai module (modules/ecgai).
#    "Imaging review" concept set (Imaging finding, Imaging working diagnosis, Imaging plan; Text): the result
#    saved by the Imaging page's Complete review, shown as the order's result rows in the chart's Orders widget.
# 3c. Referral program concepts: see scripts/referral-program-concepts-o3-setup.sh (run separately, before Spice
#    sends the program in serviceCategory).
# 4. Referral Response form: "Chest pain" in the Illness dropdown, and the "Order ECG" radio shown for Heart
#    disease or Chest pain. A form without the Illness / Order ECG questions gets them after Final diagnosis.
set -euo pipefail

URL=${OPENMRS_URL:-http://localhost:9096/openmrs}
AUTH=${OPENMRS_AUTH:-admin:Admin123}
API="$URL/ws/rest/v1"
MYSQL_CMD=${MYSQL_CMD:-}

CLASS_CONVSET=8d492594-c2cc-11de-8d13-0010c6dffd0f
CLASS_IMAGING=8caa332c-efe4-4025-8b18-3398328e1323   # Radiology/Imaging Procedure
DATATYPE_NA=8d4a4c94-c2cc-11de-8d13-0010c6dffd0f
ECG_12_LEAD=161157AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
ECG_FORM_ANSWER=5333e05c-de05-4719-87a1-31d1f3d48023  # "Electrocardiogram (ECG)", the form's Order ECG answer
REFERRAL_RESPONSE_FORM=2dcc7696-66b4-42fd-95c0-50603e0e2f4e

CLASS_FINDING=8d491a9a-c2cc-11de-8d13-0010c6dffd0f
DATATYPE_TEXT=8d4a4ab4-c2cc-11de-8d13-0010c6dffd0f

IMAGING_ORDER_TYPE=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e01
IMAGING_ORDERABLES_SET=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e02
REVIEW_SET=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e03
REVIEW_FINDING=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e04
REVIEW_DIAGNOSIS=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e05
REVIEW_PLAN=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e06
AI_READ=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e09

get()  { curl -s -u "$AUTH" "$API/$1"; }
post() { curl -s -u "$AUTH" -H 'Content-Type: application/json' -X POST "$API/$1" -d "$2"; }
exists() { [ "$(curl -s -o /dev/null -w '%{http_code}' -u "$AUTH" "$API/$1")" = 200 ]; }

if ! exists "concept/$ECG_12_LEAD"; then
  echo "Concept 12-lead electrocardiogram (CIEL 161157) is missing; load CIEL first." >&2
  exit 1
fi

# 1. Imaging order type
if ! exists "ordertype/$IMAGING_ORDER_TYPE"; then
  post ordertype "{\"uuid\":\"$IMAGING_ORDER_TYPE\",\"name\":\"Imaging Order\",\"description\":\"Imaging and cardiac investigations, e.g. ECG\",\"javaClassName\":\"org.openmrs.TestOrder\"}" >/dev/null
fi

# 2. ECG concepts in the imaging class, and the class mapped to the Imaging Order type
if ! exists "concept/$ECG_FORM_ANSWER"; then
  post concept "{\"uuid\":\"$ECG_FORM_ANSWER\",\"names\":[{\"name\":\"Electrocardiogram (ECG)\",\"locale\":\"en\",\"conceptNameType\":\"FULLY_SPECIFIED\",\"localePreferred\":true}],\"conceptClass\":\"$CLASS_IMAGING\",\"datatype\":\"$DATATYPE_NA\"}" >/dev/null
fi
for c in "$ECG_FORM_ANSWER" "$ECG_12_LEAD"; do
  if ! get "concept/$c?v=custom:(conceptClass:(uuid))" | grep -q "$CLASS_IMAGING"; then
    post "concept/$c" "{\"conceptClass\":\"$CLASS_IMAGING\"}" >/dev/null
  fi
  echo "Concept $(get "concept/$c?v=custom:(display,conceptClass:(display))")"
done

if ! get "ordertype/$IMAGING_ORDER_TYPE?v=custom:(conceptClasses:(uuid))" | grep -q "$CLASS_IMAGING"; then
  SQL="insert ignore into order_type_class_map (order_type_id, concept_class_id)
       select ot.order_type_id, cc.concept_class_id from order_type ot, concept_class cc
       where ot.uuid = '$IMAGING_ORDER_TYPE' and cc.uuid = '$CLASS_IMAGING';"
  if [ -n "$MYSQL_CMD" ]; then
    echo "$SQL" | eval "$MYSQL_CMD"
  else
    echo "MYSQL_CMD is not set: run this SQL on the OpenMRS database, then re-run the script:" >&2
    echo "$SQL" >&2
  fi
fi
echo "Order type: $(get "ordertype/$IMAGING_ORDER_TYPE?v=custom:(name,javaClassName,conceptClasses:(display))")"

# 3. Imaging orderables set
if ! exists "concept/$IMAGING_ORDERABLES_SET"; then
  post concept "{\"uuid\":\"$IMAGING_ORDERABLES_SET\",\"names\":[{\"name\":\"Imaging orderables\",\"locale\":\"en\",\"conceptNameType\":\"FULLY_SPECIFIED\",\"localePreferred\":true}],\"conceptClass\":\"$CLASS_CONVSET\",\"datatype\":\"$DATATYPE_NA\",\"set\":true,\"setMembers\":[\"$ECG_FORM_ANSWER\",\"$ECG_12_LEAD\"]}" >/dev/null
elif ! get "concept/$IMAGING_ORDERABLES_SET?v=custom:(setMembers:(uuid))" | grep -q "$ECG_FORM_ANSWER"; then
  post "concept/$IMAGING_ORDERABLES_SET" "{\"setMembers\":[\"$ECG_FORM_ANSWER\",\"$ECG_12_LEAD\"]}" >/dev/null
fi
echo "Imaging orderables: $(get "concept/$IMAGING_ORDERABLES_SET?v=custom:(setMembers:(display))")"

# 3b. "Imaging review" result: an obs group (Finding, Working diagnosis, Plan) linked to the order, saved by the
#     Imaging page's "Complete review". The patient chart's Orders widget lists it as the order's result rows.
create_text_concept() { # uuid name description
  if ! exists "concept/$1"; then
    post concept "{\"uuid\":\"$1\",\"names\":[{\"name\":\"$2\",\"locale\":\"en\",\"conceptNameType\":\"FULLY_SPECIFIED\",\"localePreferred\":true}],\"descriptions\":[{\"description\":\"$3\",\"locale\":\"en\"}],\"conceptClass\":\"$CLASS_FINDING\",\"datatype\":\"$DATATYPE_TEXT\"}" >/dev/null
  fi
}
create_text_concept "$REVIEW_FINDING" "Imaging finding" "Finding of an imaging result as reviewed, e.g. the ECG read and whether the clinician agreed with the AI read"
create_text_concept "$REVIEW_DIAGNOSIS" "Imaging working diagnosis" "Working diagnosis recorded when the imaging result was reviewed"
create_text_concept "$REVIEW_PLAN" "Imaging plan" "Plan decided on the imaging result, e.g. refer for primary PCI and treatment given"
create_text_concept "$AI_READ" "ECG AI interpretation" "AI read of an uploaded ECG (JSON: interpretation, disposition, next steps), saved by the ecgai module"
if ! exists "concept/$REVIEW_SET"; then
  post concept "{\"uuid\":\"$REVIEW_SET\",\"names\":[{\"name\":\"Imaging review\",\"locale\":\"en\",\"conceptNameType\":\"FULLY_SPECIFIED\",\"localePreferred\":true}],\"conceptClass\":\"$CLASS_CONVSET\",\"datatype\":\"$DATATYPE_NA\",\"set\":true,\"setMembers\":[\"$REVIEW_FINDING\",\"$REVIEW_DIAGNOSIS\",\"$REVIEW_PLAN\"]}" >/dev/null
fi
echo "Imaging review: $(get "concept/$REVIEW_SET?v=custom:(display,setMembers:(display))")"


# 4. Referral Response form: Chest pain enables Order ECG
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
get "form/$REFERRAL_RESPONSE_FORM?v=custom:(version,resources:(uuid,name,valueReference))" > "$WORK/form.json"
RESOURCE=$(python3 -c "import json,sys;r=[x for x in json.load(open(sys.argv[1]))['resources'] if x['name']=='JSON schema'];print(r[0]['uuid']+' '+r[0]['valueReference'] if r else '')" "$WORK/form.json")
if [ -z "$RESOURCE" ]; then
  echo "Referral Response form has no JSON schema resource; skipping the form change." >&2
  exit 0
fi
read -r RESOURCE_UUID CLOB_UUID <<< "$RESOURCE"
get "clobdata/$CLOB_UUID" > "$WORK/schema.json"

if python3 - "$WORK/schema.json" "$WORK/schema.new.json" <<'PY'
import json, sys
src, dst = sys.argv[1], sys.argv[2]
form = json.load(open(src))
HEART, CHEST = '139071AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '120749AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
ILLNESS = {
    'id': 'illness', 'label': 'Illness', 'type': 'obs', 'required': False,
    'questionOptions': {'rendering': 'select', 'concept': '6042AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'answers': [
        {'concept': HEART, 'label': 'Heart disease'},
        {'concept': '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'label': 'Hypertension'},
        {'concept': '119481AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'label': 'Diabetes mellitus'}]}}
ECG = {
    'id': 'ecgOrder', 'label': 'Order ECG', 'type': 'testOrder',
    'questionOptions': {'rendering': 'radio', 'orderType': 'testorder',
                        'orderSettingUuid': '6f0c9a92-6f24-11e3-af88-005056821db0',
                        'answers': [{'concept': '5333e05c-de05-4719-87a1-31d1f3d48023', 'label': 'ECG'}]}}
HIDE = f"illness !== '{HEART}' && illness !== '{CHEST}'"

sections = [s for p in form['pages'] for s in p['sections']]
# The form laid out by scripts/referral-response-form-o3-setup.sh orders the ECG in its own section, driven by the
# chief complaint: leave it as it is.
if len(sections) > 1 and any(q.get('id') == 'ecgOrder' for s in sections for q in s['questions']):
    sys.exit(1)
questions = sections[0]['questions']
ids = [q.get('id') for q in questions]
changed = False
if 'illness' not in ids:
    at = ids.index('finalDiagnosis') + 1 if 'finalDiagnosis' in ids else 0
    questions[at:at] = [ILLNESS, ECG]
    changed = True
elif 'ecgOrder' not in ids:
    questions.insert(ids.index('illness') + 1, ECG)
    changed = True
illness = next(q for q in questions if q.get('id') == 'illness')
answers = illness['questionOptions']['answers']
if not any(a.get('concept') == CHEST for a in answers):
    answers.insert(0, {'concept': CHEST, 'label': 'Chest pain'})
    changed = True
ecg = next(q for q in questions if q.get('id') == 'ecgOrder')
if ecg.get('hide', {}).get('hideWhenExpression') != HIDE:
    ecg['hide'] = {'hideWhenExpression': HIDE}
    changed = True
if not changed:
    sys.exit(1)
try:
    form['version'] = str(int(str(form.get('version', '0')).split('.')[0]) + 1)
except ValueError:
    pass
json.dump(form, open(dst, 'w'), ensure_ascii=False, indent=2)
PY
then
  NEW_CLOB=$(curl -s -u "$AUTH" -X POST "$API/clobdata" -F "file=@$WORK/schema.new.json;type=application/json")
  curl -s -u "$AUTH" -X DELETE "$API/form/$REFERRAL_RESPONSE_FORM/resource/$RESOURCE_UUID" >/dev/null
  post "form/$REFERRAL_RESPONSE_FORM/resource" "{\"name\":\"JSON schema\",\"dataType\":\"AmpathJsonSchema\",\"valueReference\":\"$NEW_CLOB\"}" >/dev/null
  NEW_VERSION=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['version'])" "$WORK/schema.new.json")
  post "form/$REFERRAL_RESPONSE_FORM" "{\"version\":\"$NEW_VERSION\"}" >/dev/null
  echo "Referral Response form updated to version $NEW_VERSION (Chest pain enables Order ECG)"
else
  echo "Referral Response form already has Chest pain enabling Order ECG"
fi

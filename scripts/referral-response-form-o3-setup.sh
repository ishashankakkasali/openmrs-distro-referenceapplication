#!/usr/bin/env bash
# Metadata for the referral response, laid out like the UHC decision-support prototype: the presenting complaint
# (triage note, chief complaint, when it started), the vitals and the ECG order. The Referrals page answers a referral
# in with its own response form (esm-referral-fulfillment-app, config responseForm); this script creates what that
# form saves, and lays out the O3 Referral Response form the same way for when responseForm is off. Idempotent: the
# concepts have fixed UUIDs and are only created or renamed when needed; the form schema is replaced only when it
# differs.
#
#   OPENMRS_URL=http://localhost:9096/openmrs OPENMRS_AUTH=admin:Admin123 ./scripts/referral-response-form-o3-setup.sh
#
# Run after scripts/imaging-orders-o3-setup.sh, which creates the ECG concept the order uses.
#
# 1. "Symptom onset" (Coded) with the prototype's choices, "Routine NCD review" (a chief complaint with no CIEL
#    concept) and "Echocardiogram" (an imaging procedure offered in "Add an order", with no CIEL concept here; it
#    joins the Imaging orderables set). The other orders (bedside troponin, serum glucose, serum creatinine) are CIEL
#    lab tests already in the dictionary.
# 2. The O3 Referral Response form (used when responseForm is off), three sections:
#    - Presenting complaint: chief complaint, symptom onset, and a prompt to consider an ECG when the complaint can be
#      cardiac (chest pain, upper abdominal pain, breathlessness on exertion).
#    - Vitals: BP, pulse, oxygen saturation, breaths per minute, temperature.
#    - Orders: Order ECG (an imaging order, picked up by the Imaging page).
set -euo pipefail

URL=${OPENMRS_URL:-http://localhost:9096/openmrs}
AUTH=${OPENMRS_AUTH:-admin:Admin123}
API="$URL/ws/rest/v1"

REFERRAL_RESPONSE_FORM=2dcc7696-66b4-42fd-95c0-50603e0e2f4e
ECG_CONCEPT=5333e05c-de05-4719-87a1-31d1f3d48023

SYMPTOM_ONSET=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e11
ONSET_1H=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e12
ONSET_4H=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e13
ONSET_LAST_NIGHT=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e14
ONSET_RETIRED=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e15 # "12 to 24 hours ago", from an earlier layout
ONSET_DAYS=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e16
ONSET_WEEKS=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e17
ROUTINE_NCD_REVIEW=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e18
ECHOCARDIOGRAM=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e19
IMAGING_ORDERABLES_SET=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e02
CLASS_IMAGING=8caa332c-efe4-4025-8b18-3398328e1323 # Radiology/Imaging Procedure

CLASS_QUESTION=8d491e50-c2cc-11de-8d13-0010c6dffd0f
CLASS_MISC=8d492774-c2cc-11de-8d13-0010c6dffd0f
DATATYPE_CODED=8d4a48b6-c2cc-11de-8d13-0010c6dffd0f
DATATYPE_NA=8d4a4c94-c2cc-11de-8d13-0010c6dffd0f

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

get()  { curl -s -u "$AUTH" "$API/$1"; }
post() { curl -s -u "$AUTH" -H 'Content-Type: application/json' -X POST "$API/$1" -d "$2"; }
exists() { [ "$(curl -s -o /dev/null -w '%{http_code}' -u "$AUTH" "$API/$1")" = 200 ]; }

for need in "form/$REFERRAL_RESPONSE_FORM" "concept/$ECG_CONCEPT"; do
  exists "$need" || { echo "Missing $need: run scripts/imaging-orders-o3-setup.sh first." >&2; exit 1; }
done

concept() { # uuid name class datatype description [answer-uuids json]
  local uuid=$1 name=$2 class=$3 datatype=$4 description=$5 answers=${6:-}
  if exists "concept/$uuid"; then echo "OK       concept $name"; return; fi
  post concept "{\"uuid\":\"$uuid\",\"names\":[{\"name\":\"$name\",\"locale\":\"en\",\"conceptNameType\":\"FULLY_SPECIFIED\",\"localePreferred\":true}],
    \"descriptions\":[{\"description\":\"$description\",\"locale\":\"en\"}],\"conceptClass\":\"$class\",\"datatype\":\"$datatype\"${answers:+,\"answers\":$answers}}" >/dev/null
  exists "concept/$uuid" && echo "CREATED  concept $name" || { echo "FAILED   concept $name" >&2; exit 1; }
}

# Renames a concept's fully specified English name, for a choice whose wording changed.
rename() { # uuid name
  local uuid=$1 name=$2 current
  current=$(get "concept/$uuid?v=custom:(names:(uuid,name,locale,conceptNameType))" | python3 -c "
import json, sys
n = [x for x in json.load(sys.stdin)['names'] if x['locale'] == 'en' and x['conceptNameType'] == 'FULLY_SPECIFIED']
print(n[0]['uuid'] + '|' + n[0]['name'] if n else '')")
  [ -z "$current" ] || [ "${current#*|}" = "$name" ] && return 0
  post "concept/$uuid/name/${current%%|*}" "{\"name\":\"$name\"}" >/dev/null
  echo "RENAMED  concept ${current#*|} -> $name"
}

# 1. Symptom onset, with the prototype's choices
onset() { concept "$1" "$2" "$CLASS_MISC" "$DATATYPE_NA" "$3"; rename "$1" "$2"; }
onset "$ONSET_1H"         "About 1 hour ago"               "Symptoms started about 1 hour ago"
onset "$ONSET_4H"         "About 4 hours ago"              "Symptoms started about 4 hours ago"
onset "$ONSET_LAST_NIGHT" "Last night, about 14 hours ago" "Symptoms started last night"
onset "$ONSET_DAYS"       "Several days, on and off"       "Symptoms on and off for several days"
onset "$ONSET_WEEKS"      "Weeks, on and off"              "Symptoms on and off for weeks"
ONSET_ANSWERS="[\"$ONSET_1H\",\"$ONSET_4H\",\"$ONSET_LAST_NIGHT\",\"$ONSET_DAYS\",\"$ONSET_WEEKS\"]"
concept "$SYMPTOM_ONSET" "Symptom onset" "$CLASS_QUESTION" "$DATATYPE_CODED" "When the presenting symptoms started" "$ONSET_ANSWERS"
if exists "concept/$ONSET_RETIRED"; then
  if get "concept/$SYMPTOM_ONSET?v=custom:(answers:(uuid))" | grep -q "$ONSET_RETIRED"; then
    post "concept/$SYMPTOM_ONSET" "{\"answers\":$ONSET_ANSWERS}" >/dev/null
    echo "UPDATED  Symptom onset answers"
  fi
  if [ "$(get "concept/$ONSET_RETIRED?v=custom:(retired)" | python3 -c "import json,sys;print(json.load(sys.stdin)['retired'])")" = False ]; then
    # Obs already saved with it keep their value
    curl -s -u "$AUTH" -X DELETE "$API/concept/$ONSET_RETIRED?reason=No%20longer%20a%20choice" >/dev/null
    echo "RETIRED  concept $ONSET_RETIRED (12 to 24 hours ago)"
  fi
fi
concept "$ROUTINE_NCD_REVIEW" "Routine NCD review" "$CLASS_MISC" "$DATATYPE_NA" "Chief complaint: a routine NCD review visit"
concept "$ECHOCARDIOGRAM" "Echocardiogram" "$CLASS_IMAGING" "$DATATYPE_NA" "Echocardiogram (echo), ordered as an imaging order"
if exists "concept/$IMAGING_ORDERABLES_SET" && ! get "concept/$IMAGING_ORDERABLES_SET?v=custom:(setMembers:(uuid))" | grep -q "$ECHOCARDIOGRAM"; then
  MEMBERS=$(get "concept/$IMAGING_ORDERABLES_SET?v=custom:(setMembers:(uuid))" | python3 -c "import json,sys;print(json.dumps([m['uuid'] for m in json.load(sys.stdin)['setMembers']]+[sys.argv[1]]))" "$ECHOCARDIOGRAM")
  post "concept/$IMAGING_ORDERABLES_SET" "{\"setMembers\":$MEMBERS}" >/dev/null
  echo "UPDATED  Imaging orderables: + Echocardiogram"
fi

# 2. The O3 Referral Response form
get "form/$REFERRAL_RESPONSE_FORM?v=custom:(version,resources:(uuid,name,valueReference))" > "$WORK/form.json"
read -r RESOURCE_UUID CLOB_UUID < <(python3 -c "import json,sys;r=[x for x in json.load(open(sys.argv[1]))['resources'] if x['name']=='JSON schema'];print(r[0]['uuid']+' '+r[0]['valueReference'] if r else '')" "$WORK/form.json") || true
[ -n "${CLOB_UUID:-}" ] || { echo "Referral Response form has no JSON schema resource." >&2; exit 1; }
get "clobdata/$CLOB_UUID" > "$WORK/schema.json"

if python3 - "$WORK/schema.json" "$WORK/schema.new.json" "$SYMPTOM_ONSET" "$ONSET_1H" "$ONSET_4H" "$ONSET_LAST_NIGHT" \
             "$ONSET_DAYS" "$ONSET_WEEKS" "$ROUTINE_NCD_REVIEW" "$ECG_CONCEPT" <<'PY'
import json, sys
src, dst, onset, o1, o4, olast, odays, oweeks, routine, ecg_concept = sys.argv[1:]
old = json.load(open(src))

def ciel(n): return f'{n}' + 'A' * (36 - len(f'{n}'))
CHEST, EPIGASTRIC, EXERTIONAL_DYSPNEA = ciel(120749), ciel(141128), ciel(141599)

def obs(qid, label, concept, rendering, required=False, **opts):
    return {'id': qid, 'label': label, 'type': 'obs', 'required': required,
            'questionOptions': {'rendering': rendering, 'concept': concept, **opts}}

def answers(*pairs): return [{'concept': c, 'label': l} for c, l in pairs]

def number(qid, label, concept, lo, hi, decimals=False):
    q = obs(qid, label, concept, 'number', min=str(lo), max=str(hi))
    if not decimals:
        q['questionOptions']['disallowDecimals'] = True
    return q

def prompt(qid, when, lines):
    # Shown only for the complaints in `when`.
    cond = ' && '.join(f"chiefComplaint !== '{c}'" for c in when)
    return {'id': qid, 'type': 'markdown', 'questionOptions': {'rendering': 'markdown'},
            'value': lines, 'hide': {'hideWhenExpression': cond}}

# The prototype's chief complaints and onset choices
presenting = [
    obs('chiefComplaint', 'Chief complaint', ciel(5219), 'select', required=True, answers=answers(
        (CHEST, 'Chest pain'), (EPIGASTRIC, 'Upper abdominal pain'), (EXERTIONAL_DYSPNEA, 'Breathlessness on exertion'),
        (routine, 'Routine NCD review'), (ciel(124601), 'Tooth pain'), (ciel(140238), 'Fever'),
        (ciel(143264), 'Cough'), (ciel(139084), 'Headache'))),
    obs('symptomOnset', 'Symptoms started', onset, 'select', answers=answers(
        (o1, 'About 1 hour ago'), (o4, 'About 4 hours ago'), (olast, 'Last night, about 14 hours ago'),
        (odays, 'Several days, on and off'), (oweeks, 'Weeks, on and off'))),
    prompt('ecgPromptChest', [CHEST], [
        '**Consider doing an ECG within 10 minutes**',
        'Any adult with chest pain, whether or not hypertension is on record. Order it under Orders below.']),
    prompt('ecgPromptAbdominal', [EPIGASTRIC], [
        '**Consider doing an ECG**',
        'Upper abdominal pain in an adult over 40 with diabetes, hypertension or a raised BP today can be a heart '
        'attack. Rule out the heart before treating it as gastritis.']),
    prompt('ecgPromptBreath', [EXERTIONAL_DYSPNEA], [
        '**Consider an ECG**',
        'New breathlessness on effort can be the only sign of angina or heart failure.']),
]

vitals = [
    number('systolicBp', 'Systolic BP (mmHg)', ciel(5085), 50, 300),
    number('diastolicBp', 'Diastolic BP (mmHg)', ciel(5086), 30, 200),
    number('pulse', 'Pulse (/min)', ciel(5087), 20, 250),
    number('oxygenSaturation', 'Oxygen saturation (%)', ciel(5092), 50, 100),
    number('respiratoryRate', 'Breaths (/min)', ciel(5242), 5, 80),
    number('temperature', 'Temperature (°C)', ciel(5088), 25, 45, decimals=True),
]

orders = [{
    'id': 'ecgOrder', 'label': 'Order ECG', 'type': 'testOrder',
    'questionOptions': {'rendering': 'radio', 'orderType': 'testorder',
                        'orderSettingUuid': '6f0c9a92-6f24-11e3-af88-005056821db0',
                        'answers': [{'concept': ecg_concept, 'label': '12-lead ECG'}]}},
    {'id': 'ordersHint', 'type': 'markdown', 'questionOptions': {'rendering': 'markdown'},
     'value': ['The ECG goes to the Imaging page. Upload the tracing there; the AI read and the cardiologist '
               'review follow from it.']},
]

new = {k: v for k, v in old.items() if k != 'pages'}
new['pages'] = [{'label': 'Referral response', 'sections': [
    {'label': 'Presenting complaint', 'isExpanded': 'true', 'questions': presenting},
    {'label': 'Vitals', 'isExpanded': 'true', 'questions': vitals},
    {'label': 'Orders', 'isExpanded': 'true', 'questions': orders},
]}]

if json.dumps(old['pages'], sort_keys=True) == json.dumps(new['pages'], sort_keys=True):
    sys.exit(1)
try:
    new['version'] = str(int(str(old.get('version', '0')).split('.')[0]) + 1)
except ValueError:
    pass
json.dump(new, open(dst, 'w'), ensure_ascii=False, indent=2)
PY
then
  NEW_VERSION=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1])).get('version',''))" "$WORK/schema.new.json")
  NEW_CLOB=$(curl -s -u "$AUTH" -X POST "$API/clobdata" -F "file=@$WORK/schema.new.json;type=application/json")
  [ -n "$NEW_CLOB" ] || { echo "FAILED   upload of the new form schema" >&2; exit 1; }
  curl -s -u "$AUTH" -X DELETE "$API/form/$REFERRAL_RESPONSE_FORM/resource/$RESOURCE_UUID" >/dev/null
  post "form/$REFERRAL_RESPONSE_FORM/resource" "{\"name\":\"JSON schema\",\"dataType\":\"AmpathJsonSchema\",\"valueReference\":\"$NEW_CLOB\"}" >/dev/null
  [ -n "$NEW_VERSION" ] && post "form/$REFERRAL_RESPONSE_FORM" "{\"version\":\"$NEW_VERSION\"}" >/dev/null
  echo "UPDATED  Referral Response form, version $NEW_VERSION (previous schema: clobdata $CLOB_UUID)"
else
  echo "OK       Referral Response form already has this layout"
fi

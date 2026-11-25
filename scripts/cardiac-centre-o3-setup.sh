#!/usr/bin/env bash
# The cardiac centre as its own place in the demo: a referral for primary PCI is raised at the UHC and answered at the
# cardiac centre, both in this one OpenMRS. The cardiac centres become locations one can log in at, and a "cathlab"
# user logs in at one. The referral-fulfillment ESM then shows a PCI referral as incoming only to a user logged in at
# its destination centre (home screen Referrals, and its response in the patient's Referrals). Idempotent.
#
#   OPENMRS_URL=http://localhost:9096/openmrs OPENMRS_AUTH=admin:Admin123 CATHLAB_PASSWORD='…' \
#     ./scripts/cardiac-centre-o3-setup.sh
#
# CATHLAB_PASSWORD is needed only when the user is created; it is never stored here. Run after
# scripts/pci-referral-o3-setup.sh, which creates the cardiac centre locations.
#
# 1. The cardiac centres (SZMCH, NICVD) tagged "Login Location" and "Visit Location".
# 2. User "cathlab" (Cath Lab, Organizational: Doctor, a provider), with no default login location, so O3 asks where
#    the user is logging in (pick the cardiac centre).
# 3. Only with TRIM_DEMO_LOGIN_SITES=1: the reference application's placeholder locations "Site 1" … "Site 50" are no
#    longer offered at login (their "Login Location" tag is removed; the locations stay). O3's location picker lists
#    login locations in the order they were created and cannot sort them, so without this the cardiac centres come
#    after the 50 sites. The frontend config shows 10 locations (@openmrs/esm-login-app chooseLocation.numberToShow).
set -euo pipefail

URL=${OPENMRS_URL:-http://localhost:9096/openmrs}
AUTH=${OPENMRS_AUTH:-admin:Admin123}
API="$URL/ws/rest/v1"

CENTRE_SZMCH=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0e
CENTRE_NICVD=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e0f
USERNAME=cathlab
ROLE="Organizational: Doctor"

get()  { curl -s -u "$AUTH" "$API/$1"; }
post() { curl -s -u "$AUTH" -H 'Content-Type: application/json' -X POST "$API/$1" -d "$2"; }
exists() { [ "$(curl -s -o /dev/null -w '%{http_code}' -u "$AUTH" "$API/$1")" = 200 ]; }
json() { python3 -c "import json,sys; d=json.load(sys.stdin); print($1)"; }

for c in "$CENTRE_SZMCH" "$CENTRE_NICVD"; do
  exists "location/$c" || { echo "Missing location $c: run scripts/pci-referral-o3-setup.sh first." >&2; exit 1; }
done

# 1. Login and visit locations
tag_uuid() { get "locationtag?q=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$1")&v=custom:(uuid,display)" \
  | python3 -c "import json,sys; r=[t['uuid'] for t in json.load(sys.stdin)['results'] if t['display']==sys.argv[1]]; print(r[0] if r else '')" "$1"; }
LOGIN_TAG=$(tag_uuid "Login Location"); VISIT_TAG=$(tag_uuid "Visit Location")
[ -n "$LOGIN_TAG" ] && [ -n "$VISIT_TAG" ] || { echo "Location tags Login Location / Visit Location not found." >&2; exit 1; }
for c in "$CENTRE_SZMCH" "$CENTRE_NICVD"; do
  current=$(get "location/$c?v=custom:(display,tags:(uuid))")
  name=$(echo "$current" | json "d['display']")
  have=$(echo "$current" | json "' '.join(t['uuid'] for t in d['tags'])")
  if [[ " $have " == *" $LOGIN_TAG "* && " $have " == *" $VISIT_TAG "* ]]; then echo "OK       location $name is a login and visit location"; continue; fi
  tags=$(python3 -c "import json,sys; print(json.dumps(sorted(set(sys.argv[1].split()) | {sys.argv[2], sys.argv[3]})))" "$have" "$LOGIN_TAG" "$VISIT_TAG")
  post "location/$c" "{\"tags\":$tags}" >/dev/null
  echo "UPDATED  location $name: + Login Location, Visit Location"
done

# 2. The cath lab user
ROLE_UUID=$(get "role?v=custom:(uuid,display)&limit=100" | python3 -c "import json,sys; r=[x['uuid'] for x in json.load(sys.stdin)['results'] if x['display']==sys.argv[1]]; print(r[0] if r else '')" "$ROLE")
[ -n "$ROLE_UUID" ] || { echo "Role $ROLE not found." >&2; exit 1; }
USER_UUID=$(get "user?username=$USERNAME&v=custom:(uuid,username)" | json "next((u['uuid'] for u in d['results'] if u['username']=='$USERNAME'), '')")
if [ -z "$USER_UUID" ]; then
  [ -n "${CATHLAB_PASSWORD:-}" ] || { echo "Set CATHLAB_PASSWORD to create the $USERNAME user." >&2; exit 1; }
  BODY=$(python3 - "$USERNAME" "$CATHLAB_PASSWORD" "$ROLE_UUID" <<'PY'
import json, sys
username, password, role = sys.argv[1:]
print(json.dumps({
    'username': username, 'password': password,
    'person': {'names': [{'givenName': 'Cath', 'familyName': 'Lab'}], 'gender': 'U'},
    'roles': [role],
}))
PY
)
  RES=$(post user "$BODY")
  USER_UUID=$(echo "$RES" | json "d.get('uuid','')")
  [ -n "$USER_UUID" ] || { echo "FAILED   user $USERNAME: $(echo "$RES" | head -c 300)" >&2; exit 1; }
  echo "CREATED  user $USERNAME (Cath Lab)"
else
  echo "OK       user $USERNAME"
fi
PERSON_UUID=$(get "user/$USER_UUID?v=custom:(person:(uuid))" | json "d['person']['uuid']")
if [ -n "$(get "provider?user=$USER_UUID&v=custom:(uuid)" | json "d['results'][0]['uuid'] if d['results'] else ''")" ]; then
  echo "OK       provider for $USERNAME"
else
  post provider "{\"person\":\"$PERSON_UUID\",\"identifier\":\"CATHLAB\"}" >/dev/null
  echo "CREATED  provider for $USERNAME"
fi

# 3. Placeholder sites off the login list (opt-in)
if [ "${TRIM_DEMO_LOGIN_SITES:-}" = 1 ]; then
  TAG_Q=$(python3 -c 'import urllib.parse;print(urllib.parse.quote("Login Location"))')
  for start in 0 100 200; do
    get "location?tag=$TAG_Q&v=custom:(uuid,display,tags:(uuid))&limit=100&startIndex=$start"
    echo
  done | python3 -c "
import json, re, sys
tag = sys.argv[1]
for line in sys.stdin:
    if not line.strip():
        continue
    for l in json.loads(line).get('results', []):
        if re.fullmatch(r'Site \d+', l['display']):
            print(l['uuid'] + '\t' + l['display'] + '\t' + json.dumps([t['uuid'] for t in l['tags'] if t['uuid'] != tag]))
" "$LOGIN_TAG" | while IFS=$'\t' read -r uuid name tags; do
      post "location/$uuid" "{\"tags\":$tags}" >/dev/null
      echo "UPDATED  location $name: no longer a login location"
    done
fi

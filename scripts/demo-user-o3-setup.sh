#!/usr/bin/env bash
# A demo login: an OpenMRS user who is also a provider, so what they record (referral responses, orders, uploads) is
# attributed to them, and CCE / Insights show them as the practitioner instead of "Super User". No default location:
# O3 asks where the user is logging in. Idempotent: an existing user is left as it is (its password is not changed).
#
#   OPENMRS_URL=http://localhost:9096/openmrs OPENMRS_AUTH=admin:Admin123 DEMO_USER_PASSWORD='…' \
#     ./scripts/demo-user-o3-setup.sh uhc "UHC" "Medical Officer"
#
# Arguments: username, given name, family name, and optionally the role (default "Organizational: Doctor").
# DEMO_USER_PASSWORD is needed only when the user is created; it is never stored here.
# The cath lab user is made by scripts/cardiac-centre-o3-setup.sh.
set -euo pipefail

URL=${OPENMRS_URL:-http://localhost:9096/openmrs}
AUTH=${OPENMRS_AUTH:-admin:Admin123}
API="$URL/ws/rest/v1"

USERNAME=${1:?username}
GIVEN=${2:?given name}
FAMILY=${3:?family name}
ROLE=${4:-Organizational: Doctor}

get()  { curl -s -u "$AUTH" "$API/$1"; }
post() { curl -s -u "$AUTH" -H 'Content-Type: application/json' -X POST "$API/$1" -d "$2"; }
json() { python3 -c "import json,sys; d=json.load(sys.stdin); print($1)"; }

ROLE_UUID=$(get "role?v=custom:(uuid,display)&limit=100" | python3 -c "import json,sys; r=[x['uuid'] for x in json.load(sys.stdin)['results'] if x['display']==sys.argv[1]]; print(r[0] if r else '')" "$ROLE")
[ -n "$ROLE_UUID" ] || { echo "Role $ROLE not found." >&2; exit 1; }

USER_UUID=$(get "user?username=$USERNAME&v=custom:(uuid,username)" | json "next((u['uuid'] for u in d['results'] if u['username']=='$USERNAME'), '')")
if [ -z "$USER_UUID" ]; then
  [ -n "${DEMO_USER_PASSWORD:-}" ] || { echo "Set DEMO_USER_PASSWORD to create the $USERNAME user." >&2; exit 1; }
  BODY=$(python3 - "$USERNAME" "$DEMO_USER_PASSWORD" "$ROLE_UUID" "$GIVEN" "$FAMILY" <<'PY'
import json, sys
username, password, role, given, family = sys.argv[1:]
print(json.dumps({
    'username': username, 'password': password,
    'person': {'names': [{'givenName': given, 'familyName': family}], 'gender': 'U'},
    'roles': [role],
}))
PY
)
  RES=$(post user "$BODY")
  USER_UUID=$(echo "$RES" | json "d.get('uuid','')")
  [ -n "$USER_UUID" ] || { echo "FAILED   user $USERNAME: $(echo "$RES" | head -c 300)" >&2; exit 1; }
  echo "CREATED  user $USERNAME ($GIVEN $FAMILY, $ROLE)"
else
  echo "OK       user $USERNAME"
fi

PERSON_UUID=$(get "user/$USER_UUID?v=custom:(person:(uuid))" | json "d['person']['uuid']")
if [ -n "$(get "provider?user=$USER_UUID&v=custom:(uuid)" | json "d['results'][0]['uuid'] if d['results'] else ''")" ]; then
  echo "OK       provider for $USERNAME"
else
  post provider "{\"person\":\"$PERSON_UUID\",\"identifier\":\"$(echo "$USERNAME" | tr '[:lower:]' '[:upper:]')\"}" >/dev/null
  echo "CREATED  provider for $USERNAME"
fi

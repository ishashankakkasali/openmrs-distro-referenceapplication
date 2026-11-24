#!/usr/bin/env bash
# Referral program concepts with fixed UUIDs: "NCD Referral" and "ANC Referral". Idempotent.
#
#   OPENMRS_URL=http://localhost:9096/openmrs OPENMRS_AUTH=admin:Admin123 ./scripts/referral-program-concepts-o3-setup.sh
#
# Spice sends the referral program in the Beckn health referral (contractAttributes.targetCriteria.serviceCategory,
# display "NCD Referral" or "ANC Referral"). The receiver adaptor names the referral order's concept after that display:
# it reuses a concept with exactly that name (case-insensitive) and otherwise creates one with a random UUID. Created
# here first, each concept has the same UUID on every server, so CCE protocols can filter on it: the referral's
# ServiceRequest.code and source-referral-order.concept on every event of the referral.
#
# Independent of the other O3 changes: it only takes effect once Spice sends these names, so it can run before them.
# Run it before Spice's change reaches the server. If the receiver already created a concept with one of these names,
# the script does not create a duplicate: it reports the existing UUID and exits 2.
set -euo pipefail

URL=${OPENMRS_URL:-http://localhost:9096/openmrs}
AUTH=${OPENMRS_AUTH:-admin:Admin123}
API="$URL/ws/rest/v1"

CLASS_MISC_ORDER=8d492ee0-c2cc-11de-8d13-0010c6dffd0f   # as the receiver creates referral concepts
DATATYPE_TEXT=8d4a4ab4-c2cc-11de-8d13-0010c6dffd0f

NCD_REFERRAL=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e07
ANC_REFERRAL=5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e08

exists() { [ "$(curl -s -o /dev/null -w '%{http_code}' -u "$AUTH" "$API/$1")" = 200 ]; }

# UUID of a concept whose name is exactly $1 (case-insensitive), as the receiver's lookup finds it; empty if none
uuid_by_name() {
  curl -s -u "$AUTH" -G "$API/concept" --data-urlencode "q=$1" --data-urlencode "v=custom:(uuid,display)" \
    | python3 -c "import json,sys;n=sys.argv[1].lower();print(next((r['uuid'] for r in json.load(sys.stdin).get('results',[]) if r['display'].lower()==n),''))" "$1"
}

conflicts=0
create() { # uuid name description
  local uuid=$1 name=$2 description=$3
  if exists "concept/$uuid"; then
    echo "OK      $name  $uuid (already there)"
    return
  fi
  local other
  other=$(uuid_by_name "$name")
  if [ -n "$other" ]; then
    echo "CONFLICT $name already exists with UUID $other (likely auto-created by the receiver): not creating a duplicate." >&2
    conflicts=1
    return
  fi
  curl -s -u "$AUTH" -H 'Content-Type: application/json' -X POST "$API/concept" -d "{
    \"uuid\": \"$uuid\",
    \"names\": [{\"name\": \"$name\", \"locale\": \"en\", \"conceptNameType\": \"FULLY_SPECIFIED\", \"localePreferred\": true}],
    \"descriptions\": [{\"description\": \"$description\", \"locale\": \"en\"}],
    \"conceptClass\": \"$CLASS_MISC_ORDER\", \"datatype\": \"$DATATYPE_TEXT\"}" >/dev/null
  if exists "concept/$uuid"; then echo "CREATED $name  $uuid"; else echo "FAILED  $name  $uuid" >&2; conflicts=1; fi
}

create "$NCD_REFERRAL" "NCD Referral" "Referral for non-communicable disease care (Spice serviceCategory NCD)"
create "$ANC_REFERRAL" "ANC Referral" "Referral for antenatal care (Spice serviceCategory ANC)"
[ "$conflicts" = 0 ] || exit 2

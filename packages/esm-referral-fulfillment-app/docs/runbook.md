# Operations Runbook

Day-2 procedures for the **referral fulfillment** ESM running inside the
`o3-frontend-1` container.

## 1. Health Checks

| Check | Command | Expected |
| --- | --- | --- |
| Frontend container up | `docker ps --filter name=o3-frontend-1 --format '{{.Status}}'` | `Up …` |
| Bundle present in container | `docker exec o3-frontend-1 ls /usr/share/nginx/html/custom-esms/esm-referral-fulfillment-app/` | `openmrs-esm-referral-fulfillment-app.js` |
| Importmap entry present | `docker exec o3-frontend-1 grep -o '"@openmrs/esm-referral-fulfillment-app"' /usr/share/nginx/html/importmap.json` | one match |
| Routes registry entry present | `docker exec o3-frontend-1 grep -o '"@openmrs/esm-referral-fulfillment-app"' /usr/share/nginx/html/routes.registry.json` | one match |
| Backend Order REST reachable | `curl -fsS -u admin:Admin123 http://localhost:8080/openmrs/ws/rest/v1/order?patient=<uuid>\&v=default \| head -c 200` | JSON `results` array |
| Boot-hook log success | `docker logs o3-frontend-1 2>&1 \| grep 40-merge-custom-esms` | `spliced … into importmap` |

## 2. Common Failure Modes

### 2.1 "Referrals" tab missing from chart left-nav

**Cause candidates** (in order):

1. Bundle file missing from container — re-run the deploy pipeline
   ([deployment §2](deployment.md#2-local-build--deploy-one-shot)).
2. Splice script failed — check
   `docker logs o3-frontend-1 2>&1 | grep -E '40-merge|WARN|ERROR'`.
3. Browser cached the old importmap — hard-refresh (`Ctrl-Shift-R`) or
   open DevTools → Network → "Disable cache" and reload.
4. `manifest.json` missing the module entry — see [deployment §3](deployment.md#3-manifest-registration).

### 2.2 Dashboard loads but shows "No referrals"

1. Wrong `orderTypeUuid` in config — check actual order's
   `orderType.uuid` via
   `curl -u admin:Admin123 http://localhost:8080/openmrs/ws/rest/v1/order/<uuid>?v=full | jq .orderType.uuid`
   and compare to
   `window.openmrsConfig?.['@openmrs/esm-referral-fulfillment-app']?.orderTypeUuid`.
2. Patient has no Referral orders yet (expected).
3. Backend returned an error — check the DevTools Network panel for
   `/ws/rest/v1/order?patient=…` status; non-200 indicates session/auth
   trouble (try logging out and back in).

### 2.3 "Record referral response" launches workspace but the order is not closed

1. The form workspace's `closeWorkspaceWithSavedChanges` callback is
   only fired on **save → close**. If the user closes without saving,
   the order is intentionally left open.
2. Check DevTools Network for `POST /ws/rest/v1/order/<uuid>/fulfillerdetails`.
   - 4xx `Order is already completed` → already closed by another user.
   - 401/403 → session expired; re-login.
   - 5xx → backend issue; capture `docker logs o3-backend-1 --tail 200`.
3. Manually close the order if needed:
   ```bash
   curl -u admin:Admin123 -H 'Content-Type: application/json' \
     -X POST http://localhost:8080/openmrs/ws/rest/v1/order/<uuid>/fulfillerdetails \
     -d '{"fulfillerStatus":"COMPLETED","fulfillerComment":"manual ops close"}'
   ```

### 2.4 Decline modal opens but Submit does nothing

1. Check the **Reason** dropdown is selected — Submit is disabled until
   a reason is chosen (this is by design).
2. Check DevTools Console for an exception in `declineReferralOrder`.
3. Check Network for the same `POST /fulfillerdetails` call as above
   but with `fulfillerStatus: "DECLINED"`.

### 2.5 "Fulfilled by" column shows `—` even after save

The fulfiller name is encoded inside `fulfillerComment` as
`<comment> | by: <user>`. If the order was closed by an upstream tool
(e.g. raw curl) without that suffix, no name can be shown. This is
**expected** and not a bug.

### 2.6 Side-nav link icon missing or broken

Confirm the OpenMRS styleguide SVG sprite is loaded — the icon uses
`<use href="#omrs-icon-referral-order" />`. In DevTools Console:

```js
document.getElementById('omrs-icon-referral-order')
// → should return an <symbol> element
```

If `null`, the styleguide sprite was not injected by the page; the link
will still navigate but render without an icon.

## 3. Log Queries

```bash
# Tail frontend container logs
docker logs -f o3-frontend-1

# Splice hook only
docker logs o3-frontend-1 2>&1 | grep '\[40-merge-custom-esms\]'

# Errors / warnings only
docker logs o3-frontend-1 2>&1 | grep -E 'WARN|ERROR'

# Backend Order REST traffic (requires backend logging at INFO)
docker logs o3-backend-1 2>&1 | grep -i 'fulfillerdetails'
```

For richer dashboards, the repo includes a Grafana stack —
[`docker-compose.grafana.yml`](../../../docker-compose.grafana.yml) plus
[`monitoring/dashboards/`](../../../monitoring/dashboards/). Enable with:

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml -f docker-compose.grafana.yml up -d
```

…and open http://localhost:3000 (`admin/admin` by default).

## 4. Routine Operations

### 4.1 Restart the frontend (no rebuild)

```bash
docker compose restart frontend
```

### 4.2 Re-run the splice without restarting

```bash
docker exec o3-frontend-1 sh /docker-entrypoint.d/40-merge-custom-esms.sh
```

(Idempotent — already-spliced modules are skipped.)

### 4.3 Inspect a single order's fulfiller state

```bash
ORDER=<uuid>
curl -s -u admin:Admin123 \
  "http://localhost:8080/openmrs/ws/rest/v1/order/$ORDER?v=full" \
  | python3 -c 'import json,sys;d=json.load(sys.stdin);print({k:d.get(k) for k in ("uuid","orderNumber","fulfillerStatus","fulfillerComment","dateActivated")})'
```

### 4.4 Reset a stuck order to PENDING

```bash
curl -u admin:Admin123 -H 'Content-Type: application/json' \
  -X POST http://localhost:8080/openmrs/ws/rest/v1/order/<uuid>/fulfillerdetails \
  -d '{"fulfillerStatus":null,"fulfillerComment":""}'
```

> Use sparingly — clinical audit policies may require a higher-trust
> path for status reversal.

## 5. Rollback

See [deployment §7](deployment.md#7-rollback). Removing the bundle file
and restarting the frontend cleanly disables the module.

## 6. Escalation

| Symptom | Owner | Notes |
| --- | --- | --- |
| Frontend container won't start | Platform / DevOps | Check `docker logs o3-frontend-1`; revert recent override compose changes. |
| Backend Order REST returning 5xx | OpenMRS Backend team | Capture backend logs and an example failing request. |
| SPICE-side referral mirroring failing | SPICE integration team | Out of scope for this module; see `docs/spice-referral-e2e.md` at repo root. |
| Form Engine fails to render Referral Response form | Forms team | Confirm `formUuid` exists and is published in the form library. |

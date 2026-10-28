# Custom ESM — EC2 Deployment Guide

End-to-end procedure for shipping a new custom OpenMRS O3 microfrontend
(ESM) to an EC2 host that runs the **official** O3 reference-application
image (`openmrs/openmrs-reference-application-3-frontend:<tag>`). There
is no repo clone on EC2 — the host just runs `docker compose up` against
the published image and adds bind-mounts for the custom bits.

The pipeline is: **build locally → copy 3 things to EC2
(bundle dir, boot hook, manifest) → add 2 bind-mounts +
`command:` override in `docker-compose.yml` → recreate the frontend
container**. The boot hook splices the bundle into the container's
importmap and routes registry on startup.

> Worked example throughout this doc:
> `@openmrs/esm-referral-fulfillment-app`. Substitute your own
> package/dir name where applicable.

---

## 0. EC2 layout assumed

This doc assumes the host you're running on, where the deployment lives
under `/opt/`:

```
/opt/openmrs/                      ← config + backups (already present)
├── backups/
└── config-core_demo.json          ← bind-mounted to /usr/share/nginx/html/config-core_demo.json
/opt/deployment/                   ← compose files (already present)
└── docker-compose.yml             ← uses image: openmrs/openmrs-reference-application-3-frontend:<tag>
```

We will introduce **two** new things under `/opt/openmrs/`:

```
/opt/openmrs/
├── config-core_demo.json
├── backups/
├── custom-esms/                   ← NEW — your ESM drop-zones live here
│   ├── manifest.json              ← lists every custom ESM
│   └── esm-<feature>-app/         ← one folder per ESM
│       ├── openmrs-esm-<feature>-app.js
│       ├── <chunk>.js …
│       └── routes.registry.json
└── 40-merge-custom-esms.sh        ← NEW — boot hook copied in once
```

No repo clone, no source code on EC2 — only built artifacts plus two
plumbing files.

---

## 1. Prerequisites

On your **laptop**:

- Docker (the build runs in `node:20-alpine`; no host Node required).
- This repo cloned anywhere; commands assume the repo root.
- ESM source under `packages/<your-esm-name>/`.

On **EC2**:

- The reference-application stack is already running (you should see
  `o3-frontend-1` in `docker ps`).
- You can `sudo` (`/opt/openmrs` and `/opt/deployment` are usually
  root-owned).
- `scp` reaches the host.

Sanity-check on EC2:

```bash
ssh ubuntu@<ec2-host>
ls /opt/openmrs/ /opt/deployment/
docker ps --format '{{.Names}}'
```

You should see at least `o3-frontend-1` (and `o3-backend-1`,
`o3-db-1`, …).

---

## 2. One-time bootstrap on EC2

Do these steps **the first time** you ever ship a custom ESM to this
host. They wire `/opt/openmrs/custom-esms/` and the boot hook into the
running frontend container. After this, deploying any future ESM is
just steps 3–7.

### 2.1 Create the custom-esms folder + empty manifest

```bash
sudo mkdir -p /opt/openmrs/custom-esms
sudo tee /opt/openmrs/custom-esms/manifest.json >/dev/null <<'JSON'
{
  "modules": []
}
JSON
```

### 2.2 Copy the boot hook to EC2

From your **laptop**, in this repo's root:

```bash
EC2=ubuntu@<ec2-host>

scp frontend/40-merge-custom-esms.sh "$EC2:/tmp/40-merge-custom-esms.sh"

ssh "$EC2" "sudo install -o root -g root -m 0755 \
    /tmp/40-merge-custom-esms.sh /opt/openmrs/40-merge-custom-esms.sh"
```

### 2.3 Patch `/opt/deployment/docker-compose.yml`

Add **two** bind-mounts to the `frontend` service and override its
`command` so the boot hook runs before nginx starts.

```bash
sudo cp /opt/deployment/docker-compose.yml /opt/deployment/docker-compose.yml.bak
sudo nano /opt/deployment/docker-compose.yml
```

The `frontend:` block should end up looking like this. Lines tagged
`# NEW` are the only additions; do **not** change `image:` or anything
else:

```yaml
  frontend:
    image: openmrs/openmrs-reference-application-3-frontend:3.6.0
    restart: "unless-stopped"
    # NEW — wrap upstream startup so the splice runs first
    command: ["sh", "-c", "/docker-entrypoint.d/40-merge-custom-esms.sh; exec /usr/local/bin/startup.sh"]
    environment:
      SPA_PATH: /openmrs/spa
      API_URL: /openmrs
      SPA_CONFIG_URLS: /openmrs/spa/config-core_demo.json
      SPA_DEFAULT_LOCALE:
    volumes:
      - /opt/openmrs/config-core_demo.json:/usr/share/nginx/html/config-core_demo.json:ro
      # NEW — custom ESM bundles + manifest
      - /opt/openmrs/custom-esms:/usr/share/nginx/html/custom-esms:ro
      # NEW — boot hook spliced into the standard entrypoint dir
      - /opt/openmrs/40-merge-custom-esms.sh:/docker-entrypoint.d/40-merge-custom-esms.sh:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      timeout: 5s
    depends_on:
      - backend
    deploy:
      resources:
        limits:
          memory: 128m
          cpus: '0.25'
    networks:
      - cce-net
```

> **Why `command:` is needed.** The official frontend image's `CMD` is
> `startup.sh`, which `exec`s `nginx` directly — it does **not** scan
> `/docker-entrypoint.d/`. The wrapper above runs the splice script
> first, then hands off to the upstream startup unchanged.

Apply the change:

```bash
cd /opt/deployment
docker compose up -d --force-recreate frontend
docker logs o3-frontend-1 --tail 30 | grep '\[40-merge-custom-esms\]'
```

Expected with an empty manifest:

```
[40-merge-custom-esms] done
```

That completes the bootstrap. From here on, deploying a custom ESM is
just steps 3–7.

---

## 2.4 One-time DB change for FHIR ServiceRequest visibility (Referral OrderType only)

> **Skip this section unless you are deploying
> `esm-referral-fulfillment-app`.** It is required only for that ESM
> because it relies on the OpenMRS FHIR module exposing referral orders
> as `ServiceRequest`. Other custom ESMs do not need it.

### Why

The OpenMRS `fhir2` module only translates these Order subclasses:

| OpenMRS Java class       | FHIR resource       |
| ------------------------ | ------------------- |
| `org.openmrs.TestOrder`  | `ServiceRequest`    |
| `org.openmrs.DrugOrder`  | `MedicationRequest` |
| `org.openmrs.Order`      | **(not exposed)**   |

The stock Referral OrderType ships with `javaClassName = org.openmrs.Order`,
so referral orders are invisible to `/fhir2/R4/ServiceRequest` and to any
downstream consumer polling `?_lastUpdated=gt<X>`. The
`esm-referral-fulfillment-app` close-the-loop flow (`Record referral
response` and `Decline`) emits a `DISCONTINUE` order alongside the
`fulfillerStatus` flip so terminal events are visible to that polling
surface — but only if the OrderType is backed by `TestOrder`.

### Apply

On the EC2 host, against the OpenMRS DB used by the backend container.
Replace `<DB-CREDS>` with the credentials you actually use (root/openmrs/…):

```bash
docker exec -i o3-db-1 mariadb -u<user> -p<password> openmrs <<'SQL'
-- 1) Switch the Referral OrderType to TestOrder so FHIR exposes it.
UPDATE order_type
   SET java_class_name = 'org.openmrs.TestOrder'
 WHERE uuid = '778a9dc6-87d9-49c1-83d9-caa01041a8ad';

-- 2) Backfill empty test_order child rows for any referrals already in the
--    DB. Without this, FHIR reads on those historical referrals will 404
--    (Hibernate's join against test_order finds no row and skips them).
INSERT INTO test_order (order_id, specimen_source, laterality, clinical_history,
                        frequency, number_of_repeats)
SELECT o.order_id, NULL, NULL, NULL, NULL, NULL
FROM   orders o
LEFT JOIN test_order t ON t.order_id = o.order_id
WHERE  o.order_type_id = (SELECT order_type_id FROM order_type
                          WHERE uuid = '778a9dc6-87d9-49c1-83d9-caa01041a8ad')
  AND  t.order_id IS NULL;

-- 3) Sanity check
SELECT order_type_id, uuid, name, java_class_name
  FROM order_type WHERE uuid = '778a9dc6-87d9-49c1-83d9-caa01041a8ad';
SELECT COUNT(*) AS total_referrals,
       SUM(t.order_id IS NOT NULL) AS with_test_row
FROM   orders o
LEFT JOIN test_order t ON t.order_id = o.order_id
WHERE  o.order_type_id = (SELECT order_type_id FROM order_type
                          WHERE uuid = '778a9dc6-87d9-49c1-83d9-caa01041a8ad');
SQL
```

The output of step 3 should show:

```
java_class_name              = org.openmrs.TestOrder
total_referrals == with_test_row    (every referral has a child row)
```

### Restart the backend so the OrderType cache picks up the new class

```bash
cd /opt/deployment
docker compose restart backend
```

> **Why a restart, not just clear-cache.** OpenMRS caches the
> OrderType→class mapping per JVM at first use; a backend restart is the
> simplest way to invalidate it on a running stack. There's no user
> downtime beyond the backend's own warm-up (typically <1 min on this
> image).

### Verify

```bash
# Pick any existing Referral order UUID (or place a fresh one).
ORDER_UUID=<uuid>

# Should now return HTTP 200 with a ServiceRequest body.
curl -sI -u admin:<pwd> \
  "https://<your-domain>/openmrs/ws/fhir2/R4/ServiceRequest/$ORDER_UUID" \
  | head -1

# Patient-scoped list — referrals should now appear alongside lab orders.
curl -s -u admin:<pwd> \
  "https://<your-domain>/openmrs/ws/fhir2/R4/ServiceRequest?patient=<patient-uuid>&_sort=-_lastUpdated&_count=10"
```

### Rollback

```sql
UPDATE order_type SET java_class_name = 'org.openmrs.Order'
 WHERE uuid = '778a9dc6-87d9-49c1-83d9-caa01041a8ad';
DELETE t FROM test_order t
JOIN orders o ON o.order_id = t.order_id
WHERE o.order_type_id = (SELECT order_type_id FROM order_type
                         WHERE uuid='778a9dc6-87d9-49c1-83d9-caa01041a8ad');
```

Then `docker compose restart backend`. Existing referral records remain
intact; only the FHIR exposure and the close-the-loop DISCONTINUE flow
revert.

---

## 3. Layout & conventions for your ESM

| Path on laptop | Role |
| --- | --- |
| `packages/<esm-name>/` | Source. |
| `packages/<esm-name>/dist/` | Webpack output (build artifact). |
| `packages/<esm-name>/routes.registry.json` | Registry blob the boot hook splices in (only changes when extensions change). |

Naming convention used so far:

- Package name: `@openmrs/esm-<feature>-app`
- Bundle file: `openmrs-esm-<feature>-app.js`
- Drop-zone dir on EC2: `/opt/openmrs/custom-esms/esm-<feature>-app/`

---

## 4. Build the bundle locally

Run from the repo root on your laptop:

```bash
DIR=esm-referral-fulfillment-app

# 4.1 — webpack inside node:20-alpine (deterministic, no host node)
docker run --rm \
  -v "$PWD/packages/$DIR:/app" \
  -w /app node:20-alpine \
  sh -c 'npx webpack --mode production'

# 4.2 — fix dist/ ownership (root → host user) so you can scp/cp
docker run --rm \
  -v "$PWD/packages/$DIR/dist:/d" \
  alpine chown -R "$(id -u):$(id -g)" /d

ls -la packages/$DIR/dist/
```

`dist/` will contain the entry bundle plus lazy chunks. Only the
`.js` files are needed in production (skip `.map`).

---

## 5. Copy artifacts to EC2

From your laptop, repo root:

```bash
EC2=ubuntu@<ec2-host>
DIR=esm-referral-fulfillment-app

# 5.1 — destination
ssh "$EC2" "sudo mkdir -p /opt/openmrs/custom-esms/$DIR \
            && sudo chown -R \$(id -u):\$(id -g) /opt/openmrs/custom-esms/$DIR"

# 5.2 — push every .js (entry + lazy chunks)
scp packages/$DIR/dist/*.js "$EC2:/opt/openmrs/custom-esms/$DIR/"

# 5.3 — first deploy / when extensions change: stage the registry blob
scp packages/$DIR/routes.registry.json \
    "$EC2:/opt/openmrs/custom-esms/$DIR/"

# 5.4 — restore root ownership (optional; the bind is read-only anyway)
ssh "$EC2" "sudo chown -R root:root /opt/openmrs/custom-esms/$DIR"
```

> **Tip — redeploys:** prefer
> `rsync -avz --delete --exclude=routes.registry.json packages/$DIR/dist/ "$EC2:/opt/openmrs/custom-esms/$DIR/"`
> so stale chunks are removed when webpack stops emitting them.
> `--exclude=routes.registry.json` keeps your manually-staged registry
> blob intact.

---

## 6. Register the ESM in `manifest.json` (first deploy only)

On EC2, edit `/opt/openmrs/custom-esms/manifest.json`:

```bash
sudo nano /opt/openmrs/custom-esms/manifest.json
```

```json
{
  "modules": [
    {
      "name": "@openmrs/esm-referral-fulfillment-app",
      "dir":  "esm-referral-fulfillment-app",
      "entry": "openmrs-esm-referral-fulfillment-app.js"
    }
  ]
}
```

Rules:

- `name` must match the package name your bundle declares
  (`moduleName` in `src/index.ts`).
- `dir` is the directory under `/opt/openmrs/custom-esms/`.
- `entry` is the entry-bundle filename inside that directory.
- The boot hook is **idempotent** — already-spliced modules are
  skipped on subsequent boots.

---

## 7. Restart the frontend container

```bash
cd /opt/deployment
docker compose up -d --force-recreate frontend
```

`--force-recreate` is required when you only changed bundle files
(otherwise the boot hook does not re-run).

Watch the splice:

```bash
docker logs o3-frontend-1 --tail 40 | grep '\[40-merge-custom-esms\]'
```

You should see lines like:

```
[40-merge-custom-esms] spliced @openmrs/esm-referral-fulfillment-app into importmap
[40-merge-custom-esms] spliced @openmrs/esm-referral-fulfillment-app into routes registry
[40-merge-custom-esms] done
```

If you see `WARN bundle missing for <name>` → step 5 didn't land or the
`entry` filename in `manifest.json` doesn't match.
If you see `ERROR upstream JSON is multi-line` → the upstream image
shipped a non-minified `importmap.json` (rare on stable tags); pin a
known-good tag.

---

## 8. Verify

```bash
DOMAIN=https://<your-domain>

# Bundle reachable through nginx
curl -sI "$DOMAIN/openmrs/spa/custom-esms/esm-referral-fulfillment-app/openmrs-esm-referral-fulfillment-app.js" \
  | head -1
# → HTTP/1.1 200 OK

# Module appears in the importmap
curl -s "$DOMAIN/openmrs/spa/importmap.json" \
  | python3 -c 'import json,sys;d=json.load(sys.stdin);print({k:v for k,v in d["imports"].items() if "referral-fulfillment" in k})'

# Routes registered
curl -s "$DOMAIN/openmrs/spa/routes.registry.json" \
  | python3 -c 'import json,sys;d=json.load(sys.stdin);print(json.dumps(d.get("@openmrs/esm-referral-fulfillment-app",{}),indent=2))'
```

In the browser:

1. Hard-refresh (`Ctrl-Shift-R`) to bypass the SPA cache.
2. DevTools → Application → Service Workers → if one is active, click
   **Unregister** and reload (the SPA worker can pin an older
   importmap).
3. Confirm the new feature renders (e.g. *Referrals* tab in the chart
   left-nav).

---

## 9. Subsequent deploys (code-only changes)

```bash
# laptop
DIR=esm-referral-fulfillment-app
docker run --rm -v "$PWD/packages/$DIR:/app" -w /app node:20-alpine \
  sh -c 'npx webpack --mode production'
docker run --rm -v "$PWD/packages/$DIR/dist:/d" alpine \
  chown -R "$(id -u):$(id -g)" /d
rsync -avz --exclude=routes.registry.json --delete \
  packages/$DIR/dist/ "$EC2:/opt/openmrs/custom-esms/$DIR/"

# ec2
ssh "$EC2" "cd /opt/deployment && docker compose up -d --force-recreate frontend"
```

If you **added/removed** an extension, page, or modal (i.e. the source
`routes.json` shape changed), also re-stage `routes.registry.json` and
force a re-splice of that module:

```bash
scp packages/$DIR/routes.registry.json "$EC2:/opt/openmrs/custom-esms/$DIR/"

ssh "$EC2" 'docker exec o3-frontend-1 sh -c "
  for f in /usr/share/nginx/html/importmap.json /usr/share/nginx/html/routes.registry.json; do
    sed -i.bak \"s|\\\"@openmrs/esm-referral-fulfillment-app\\\":[^,}]*,*||\" \"\$f\";
  done
"'
ssh "$EC2" "cd /opt/deployment && docker compose up -d --force-recreate frontend"
```

> The `.bak` files inside the container give a one-step undo. They live
> only inside the container and disappear on the next recreate.

---

## 10. Rollback

The fastest rollback is to remove the bundle and recreate — the boot
hook tolerates a missing bundle (warns and continues).

```bash
ssh "$EC2"
sudo rm -f /opt/openmrs/custom-esms/esm-referral-fulfillment-app/*.js
cd /opt/deployment
docker compose up -d --force-recreate frontend
```

To roll back to a **previous** bundle, keep a copy before each deploy:

```bash
# Before deploying a new build (on EC2):
sudo cp /opt/openmrs/custom-esms/esm-referral-fulfillment-app/openmrs-esm-referral-fulfillment-app.js \
        /opt/openmrs/custom-esms/esm-referral-fulfillment-app/openmrs-esm-referral-fulfillment-app.js.prev
# To restore:
sudo mv /opt/openmrs/custom-esms/esm-referral-fulfillment-app/openmrs-esm-referral-fulfillment-app.js.prev \
        /opt/openmrs/custom-esms/esm-referral-fulfillment-app/openmrs-esm-referral-fulfillment-app.js
docker compose up -d --force-recreate frontend
```

To **fully unregister** the module, remove its entry from
`/opt/openmrs/custom-esms/manifest.json`, then recreate.

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Browser shows the old UI after deploy | SPA service worker pinned the old importmap | DevTools → Application → Service Workers → Unregister → reload |
| `[40-merge-custom-esms] no /usr/share/nginx/html/custom-esms; nothing to merge` | Volume bind not present in compose | Re-check step 2.3, recreate the container |
| `[40-merge-custom-esms] WARN bundle missing for <name>` | scp didn't land, or wrong filename | Re-`scp`; ensure `entry` in `manifest.json` matches the actual file |
| `[40-merge-custom-esms] WARN failed to splice <name> into importmap` | upstream `importmap.json` shipped multi-line on this image tag | Pre-merge a custom `importmap.json` and bind-mount it; or pin a known-good tag |
| Importmap shows the module but feature is missing | Bundle threw on mount, or registry didn't get the new extension | Open DevTools console; verify `routes.registry.json` has the extension server-side; re-stage `routes.registry.json` and redeploy |
| `Could not find the package …` in console | Module name mismatch between `index.ts` `moduleName` and `manifest.json` `name` | Make them identical |
| `single-spa minified message #31` repeating | A parcel keeps failing on update — usually a child-component throw | Inspect un-minified args from `single-spa.js.org/error/?code=31&…` for parcel name + lifecycle stage |
| 401/403 on REST calls from the bundle | Session cookie not attached | Use `openmrsFetch` from `@openmrs/esm-framework`, never raw `fetch` |
| Translations missing | `translations/en.json` not bundled / `importTranslation` line missing | Confirm `require.context('../translations', ...)` in `src/index.ts` |
| `command: ["sh", "-c", …]` change appears ignored | Container restarted instead of recreated | Use `docker compose up -d --force-recreate frontend` |

---

## 12. Reference: file mapping

```
EC2 host                                              Container path
────────                                              ──────────────
/opt/deployment/
└── docker-compose.yml          (defines binds + command override)

/opt/openmrs/
├── config-core_demo.json   ──► /usr/share/nginx/html/config-core_demo.json
├── 40-merge-custom-esms.sh ──► /docker-entrypoint.d/40-merge-custom-esms.sh
└── custom-esms/            ──► /usr/share/nginx/html/custom-esms/
    ├── manifest.json
    └── esm-referral-fulfillment-app/
        ├── openmrs-esm-referral-fulfillment-app.js
        ├── <chunk>.js …
        └── routes.registry.json
```

After splice, the boot hook edits these files **inside the container
only** (the host bind-mounts are read-only):

```
/usr/share/nginx/html/importmap.json          adds  "<name>": "./custom-esms/<dir>/<entry>"
/usr/share/nginx/html/routes.registry.json    adds  "<name>": <routes object>
```

That's the entire mechanism.

### Branding (optional)

`custom-esms/branding/` is not an ESM (it is not in `manifest.json`); it holds files the config and the boot hook
point at:

| File | Used by |
| --- | --- |
| `epic-logo.svg` | `config-core_demo.json` → `@openmrs/esm-primary-navigation-app.logo.src` (header) |
| `epic-logo-color.svg` | `config-core_demo.json` → `@openmrs/esm-login-app.logo.src` (login page) |
| `title.txt` | boot hook: its first line replaces `<title>` in `index.html` (browser tab) |

Copy the folder with the ESMs (`rsync … frontend/custom-esms/branding/ "$EC2:<custom-esms dir>/branding/"`) and
recreate the frontend; the boot hook logs `browser tab title set to '…'`.

---

## 13. Checklist (printable)

**Bootstrap (one-time per host):**

- [ ] `/opt/openmrs/custom-esms/` exists with an empty `manifest.json`.
- [ ] `/opt/openmrs/40-merge-custom-esms.sh` copied and executable.
- [ ] `/opt/deployment/docker-compose.yml` has the 2 bind-mounts and the
      `command` wrapper on the `frontend` service.
- [ ] `docker compose up -d --force-recreate frontend` ran cleanly.
- [ ] `docker logs o3-frontend-1 | grep 40-merge-custom-esms` shows
      `done` (or "nothing to merge").
- [ ] **(`esm-referral-fulfillment-app` only)** Section 2.4 SQL applied;
      Referral OrderType now has `java_class_name = org.openmrs.TestOrder`;
      every existing referral has a `test_order` child row; backend
      restarted; FHIR `GET /ServiceRequest/<referral-uuid>` returns 200.

**Per-ESM deploy:**

- [ ] Source change complete on laptop.
- [ ] `webpack --mode production` ran cleanly.
- [ ] `dist/` ownership fixed (`chown` step).
- [ ] `dist/*.js` copied to `/opt/openmrs/custom-esms/<dir>/` on EC2.
- [ ] `manifest.json` includes the module (first deploy only).
- [ ] `routes.registry.json` updated (only if extensions changed).
- [ ] `docker compose up -d --force-recreate frontend` ran.
- [ ] Boot-hook log shows the module spliced into importmap + routes.
- [ ] Bundle URL returns 200; importmap & routes registry show the module.
- [ ] Hard-refresh in browser; service worker re-registered.
- [ ] Feature visible and functional.

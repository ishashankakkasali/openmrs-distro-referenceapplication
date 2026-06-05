# Developer Guide

## 1. Prerequisites

- Docker + Docker Compose v2 (no host Node required — builds run in
  `node:20-alpine`).
- The full repo cloned at
  `openmrs-distro-referenceapplication/`.
- The reference-app stack running at least once (`docker compose up -d`)
  so the upstream importmap and routes registry exist inside
  `o3-frontend-1`.

## 2. Project Layout

```
src/
├── index.ts                        ← lifecycle exports + module name
├── routes.json                     ← extension declarations (slot wiring)
├── config-schema.ts                ← Type.* schema + TS interface
├── declarations.d.ts               ← stub types (svg, etc.)
├── close-referral-order.ts         ← REST helpers (close + decline)
├── dashboard-link.component.tsx    ← left-nav entry (icon + label)
├── referrals-dashboard.component.tsx  ← main dashboard (DataTable, Modal)
└── record-referral-response.component.tsx ← Orders-widget action button
translations/
└── en.json                         ← i18n strings (keys must match t('key'))
```

## 3. Edit → Build → Deploy Loop

```bash
# 1. Edit source files under packages/esm-referral-fulfillment-app/src/

# 2. Build + splice + restart (one shell block)
cd /path/to/openmrs-distro-referenceapplication
docker run --rm -v "$PWD/packages/esm-referral-fulfillment-app:/app" \
  -w /app node:20-alpine sh -c 'npx webpack --mode production'
docker run --rm -v "$PWD/packages/esm-referral-fulfillment-app/dist:/d" \
  alpine chown -R "$(id -u):$(id -g)" /d
rm -f frontend/custom-esms/esm-referral-fulfillment-app/*.js
cp packages/esm-referral-fulfillment-app/dist/*.js \
   frontend/custom-esms/esm-referral-fulfillment-app/
docker compose up -d --no-build --force-recreate frontend

# 3. Hard-refresh the browser
```

Wrap as a script if you iterate often:

```bash
# scripts/redeploy-referral-esm.sh
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
docker run --rm -v "$PWD/packages/esm-referral-fulfillment-app:/app" \
  -w /app node:20-alpine sh -c 'npx webpack --mode production'
docker run --rm -v "$PWD/packages/esm-referral-fulfillment-app/dist:/d" \
  alpine chown -R "$(id -u):$(id -g)" /d
rm -f frontend/custom-esms/esm-referral-fulfillment-app/*.js
cp packages/esm-referral-fulfillment-app/dist/*.js \
   frontend/custom-esms/esm-referral-fulfillment-app/
docker compose up -d --no-build --force-recreate frontend
echo "✓ deployed — hard-refresh the browser"
```

## 4. Conventions

### 4.1 i18n

- Every user-visible string goes through `t('key', 'English fallback')`.
- Add the canonical English entry to
  [`translations/en.json`](../translations/en.json) — keys must match
  what is passed to `t()`.
- For interpolation use `t('key', 'Hello {{name}}', { name })`.

### 4.2 REST calls

- **Always** use `openmrsFetch` (never raw `fetch`). It picks up
  the OpenMRS session cookie + CSRF and auto-prefixes the API base.
- Errors must `console.error(...)` and `showSnackbar({ kind: 'error', ... })`.
- Never silently swallow.

### 4.3 Carbon usage

- Import from `@carbon/react`, not `carbon-components-react`.
- Modal sizes: prefer `size="sm"` for confirm-style dialogs.
- Buttons: `kind="primary" | "tertiary" | "ghost" | "danger" | "danger--ghost"`.
- Status pills: `<Tag type="green|red|gray|cool-gray|magenta">`.

### 4.4 Workspace launches

- Use `launchWorkspace('patient-form-entry-workspace', { ... })` from
  `@openmrs/esm-framework`. The `closeWorkspaceWithSavedChanges`
  callback is the canonical hook for "user saved and closed".

### 4.5 Configuration

- Add new keys to [`config-schema.ts`](../src/config-schema.ts) with a
  `_default` and a clear `_description` — both are surfaced in the
  Implementer Tools UI.
- Read with `useConfig<ReferralFulfillmentConfig>()` inside components.
- Never hard-code UUIDs in components.

### 4.6 Filename / Component naming

- Component file: `kebab-case.component.tsx` exporting a default named
  in `PascalCase`.
- Helpers: `kebab-case.ts`.
- Lifecycle export name in `index.ts`: `camelCase`, matching the
  `component` field of the corresponding entry in `routes.json`.

## 5. Adding a New Extension

1. Create the React component under `src/`.
2. Export a lifecycle from `src/index.ts`:
   ```ts
   export const myNewExtension = getSyncLifecycle(MyNewExtension, options);
   ```
3. Add to `src/routes.json` under `"extensions"`:
   ```json
   { "name": "my-new-extension", "component": "myNewExtension", "slot": "<some-slot>" }
   ```
4. **Mirror** the same JSON entry into
   `frontend/custom-esms/esm-referral-fulfillment-app/routes.registry.json`
   so the boot-hook splice surfaces it without the framework needing to
   load the bundle eagerly.
5. Rebuild + deploy ([§3](#3-edit--build--deploy-loop)).

## 6. Testing

This package currently passes `--passWithNoTests`. Suggested next
additions when you need coverage:

- Unit-test `closeReferralOrder` / `declineReferralOrder` by mocking
  `openmrsFetch` from `@openmrs/esm-framework`.
- Component-test `ReferralsDashboard` with React Testing Library +
  `swr` cache mocks.

```bash
docker run --rm -v "$PWD/packages/esm-referral-fulfillment-app:/app" \
  -w /app node:20-alpine sh -c 'npm ci && npm test'
```

## 7. Type-checking & Lint

```bash
docker run --rm -v "$PWD/packages/esm-referral-fulfillment-app:/app" \
  -w /app node:20-alpine sh -c 'npm ci && npm run typescript && npm run lint'
```

## 8. Debugging Tips

- The bundle is **not** sourcemap-served by default in production mode.
  For debugging, build with `--mode development` instead of `production`.
- Add the prefix `[esm-referral-fulfillment]` to all `console.log`
  noise so it's grep-able in the browser console.
- DevTools → Application → Service Workers: unregister and reload if
  the importmap appears stale even after restart.
- DevTools → Network → filter `fulfillerdetails` to watch the close /
  decline traffic in real time.

## 9. Pitfalls Encountered (and how to avoid)

| Pitfall | Avoidance |
| --- | --- |
| `DashboardExtension` import broke nav | Use plain `ConfigurableLink` with manual SVG — verified path. |
| Empty `<svg>` symbol → invisible icon | Reference an existing styleguide sprite (`#omrs-icon-referral-order`) and wrap in `cds--side-nav__icon`. |
| `auditInfo.changedBy` not bumped on `/fulfillerdetails` | Encode user in `fulfillerComment` via ` \| by: <name>`. |
| FHIR translator omits orderNumber | Use REST `GET /order?patient=` for in-chart UI. |
| `window.prompt` decline UX looked janky | Replaced with Carbon Modal + Dropdown + TextArea. |
| Builds with host node version drift | Always build inside `node:20-alpine`. |

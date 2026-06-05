# `@openmrs/esm-referral-fulfillment-app` — Documentation Index

Custom OpenMRS O3 microfrontend that adds a **Referrals** chart tab plus
inline actions for **fulfilling** (closing) and **declining** Referral
orders. It plugs into the upstream Reference Application **without forking**
any upstream package — bundle is dropped under `frontend/custom-esms/` and
spliced into the importmap at container boot.

## Documents

| Doc | Purpose |
| --- | --- |
| [Architecture](architecture.md) | Module layout, extensions, data flow, sequence diagrams |
| [Configuration Reference](configuration.md) | `config-schema.ts` keys, defaults, override mechanics |
| [Deployment Guide](deployment.md) | Build → splice → run pipeline (local Docker + EC2) |
| [Operations Runbook](runbook.md) | Health checks, common failure modes, rollback, log queries |
| [API Contract](api-contract.md) | OpenMRS REST/FHIR endpoints consumed, payloads, status enum |
| [Developer Guide](developer-guide.md) | Local dev loop, project layout, conventions, testing |
| [Release Notes / Changelog](changelog.md) | Notable behavior changes per build |

## At a glance

- **Bundle name**: `openmrs-esm-referral-fulfillment-app.js`
- **Module name**: `@openmrs/esm-referral-fulfillment-app`
- **Mount point**: `frontend/custom-esms/esm-referral-fulfillment-app/` (host) → `/usr/share/nginx/html/custom-esms/esm-referral-fulfillment-app/` (container)
- **Container**: `o3-frontend-1` (service `frontend` in `docker-compose.yml`)
- **UI URL**: `http://localhost:9096/openmrs/spa/patient/{patientUuid}/chart/Referrals`

## Quick links

- Source: [packages/esm-referral-fulfillment-app/src](../src)
- Manifest entry: [frontend/custom-esms/manifest.json](../../../frontend/custom-esms/manifest.json)
- Splice script: [frontend/40-merge-custom-esms.sh](../../../frontend/40-merge-custom-esms.sh)
- Override compose: [docker-compose.override.yml](../../../docker-compose.override.yml)

# ecgai — AI read of an uploaded ECG (OpenMRS module)

Used by the Imaging flow of the referral-fulfillment ESM. When an ECG is uploaded on an ECG order, the ESM asks this
module to read it. The module sends the ECG and the clinical team's cardiologist prompt to an LLM, then saves the
answer on the order. LLM calls go through [LangChain4j](https://docs.langchain4j.dev), so the provider is a setting:
**Claude** (`anthropic`) or **Gemini** (`gemini`).

## REST API (`/ws/rest/v1/ecgai`, OpenMRS session required)

| Call | |
|---|---|
| `POST interpret` `{orderUuid, attachmentUuid}` | starts the read and returns at once: `running`, or `not_configured` when there is no API key |
| `GET status/{orderUuid}` | `idle` / `running` / `done` (+ `obsUuid`) / `failed` (+ `error`) / `not_configured` |
| `GET health` | `provider`, `model`, `configured` (never the key) |

How a read runs:

1. The ECG file (PNG, JPEG, GIF, WebP or PDF) is read in the caller's request, with the caller's privileges. The
   attachment must belong to the order's patient. The patient and the encounter come from the order.
2. A worker thread sends the file with `src/main/resources/prompt.txt` (the prompt, verbatim) and
   `output-guide.txt` (how its three sections map onto JSON fields) to the model, with a JSON schema for the answer.
3. The answer is checked: every field is present, the types are right, and the disposition is
   `IMMEDIATE_CATH_LAB_REFERRAL` or `NO_REFERRAL_SERIAL_ECG_MONITORING`. It is saved as an **ECG AI interpretation**
   obs (concept `5a7d2c3e-…7e09`, from `scripts/imaging-orders-o3-setup.sh`) on the order, in the order's encounter.
   The OpenMRS daemon user saves it, and the JSON records `requestedBy`, `provider`, `model` and `generatedAt`.

Job status is kept in memory, so it clears on restart. The saved obs is what the UI shows.

## Settings

The settings are provider-neutral: pick the provider, then give its model and API key. Environment variables win over
the global property; the API key comes **only** from the environment.

| Env | Global property | Default |
|---|---|---|
| `ECG_AI_PROVIDER` | `ecgai.provider` | `gemini` (`gemini` or `anthropic`) |
| `ECG_AI_API_KEY` | — | — (the chosen provider's key) |
| `ECG_AI_MODEL` | `ecgai.model` | the provider's default: `gemini-3.1-pro-preview` / `claude-opus-5-5` |
| `ECG_AI_PROMPT_FILE` | — | the bundled `prompt.txt`. A file that replaces the clinical prompt when it exists; it is re-read on every read, so edits apply without a restart. Missing: the bundled prompt is used |
| `ECG_AI_CONCEPT_UUID` | `ecgai.resultConceptUuid` | `5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e09` |
| `ECG_AI_BASE_URL` | — | the provider's API (set for a proxy or a test stub) |

Switching provider = change `ECG_AI_PROVIDER`, `ECG_AI_API_KEY` and (optionally) `ECG_AI_MODEL`; nothing else.

Claude runs with adaptive thinking, `max_tokens` 16000 and a 4-minute timeout. Without a key the module answers
`not_configured`, and the page shows the demo read from the ESM config.

## Build and run locally

```bash
cd modules/ecgai && mvn -q package          # -> target/ecgai-1.0.0.omod (bundles LangChain4j; Jackson comes from OpenMRS)
cp .env.example .env                         # git-ignored; put the API key here
cd ../.. && docker compose -p o3 -f docker-compose.yml -f docker-compose.override.yml up -d --no-build backend
```

`docker-compose.override.yml` mounts the omod into `/openmrs/distribution/openmrs_modules` (startup copies it into
the active modules) and loads `modules/ecgai/.env`.

- After a **rebuild** of the omod: `docker restart o3-backend-1`.
- After a **`.env` change**: run `up -d` again. A restart keeps the old environment.

Check it with `curl -u <user>:<password> http://localhost:9096/openmrs/ws/rest/v1/ecgai/health`.

## Getting a Claude API key

API keys come from the **Claude Console**. A claude.ai chat subscription does not include API access; the Console is
billed separately.

1. Sign in at https://platform.claude.com with your work account or organization.
2. Make sure the organization has credits or a payment method: **Settings → Billing**.
3. **Settings → API keys → Create key**. Pick the workspace, name the key (e.g. `ecgai-local`) and copy it: it is
   shown only once.
4. In `modules/ecgai/.env`: `ECG_AI_PROVIDER=anthropic`, `ECG_AI_API_KEY=sk-ant-…`, `ECG_AI_MODEL=` (empty = default). Never commit it.
5. `up -d` the backend (see above). `health` should then show `"configured": true`.

## On the k3s installs (AIIMS): deploy-scripts

The Beckn OpenMRS manifest in deploy-scripts (`k8s/beckn/openmrs/openmrs.yaml`) runs this module the same way the
frontend runs its custom ESMs: site files on the node, copied by hand, none of them in deploy-scripts.

| What | Where | After a change |
|---|---|---|
| Module | `/opt/openmrs/backend/modules/ecgai-<version>.omod` on the node (copied into the backend at each start; the previous copy is removed, so an upgrade leaves no old version behind) | `kubectl -n openmrs rollout restart deploy/openmrs-backend` |
| Prompt | `/opt/openmrs/backend/ecgai/prompt.txt` on the node (optional: without it the bundled prompt is used) | nothing: read on every ECG read |
| Provider, model, API key | Infisical `/beckn`: `OPENMRS_ECG_AI_PROVIDER`, `OPENMRS_ECG_AI_MODEL`, `OPENMRS_ECG_AI_API_KEY` -> Secret `openmrs-backend-env` | `install-beckn.sh --config … --only openmrs` (rolls the backend only when one of these changed) |

The prompt must keep the three sections: the appended JSON field guide (`output-guide.txt`) expects them. The concept
`…7e09` comes from `scripts/imaging-orders-o3-setup.sh`. Check with `GET /ws/rest/v1/ecgai/health`: provider, model,
`configured` (key set) and the prompt file in use.

## Gemini

Get a key from Google AI Studio (https://aistudio.google.com/apikey): `ECG_AI_PROVIDER=gemini`, `ECG_AI_API_KEY=…`.
Use a **pro** model: in a test on a normal and a STEMI ECG, the flash models (`gemini-2.5-flash`, `gemini-3.8-flash`)
sent the normal ECG to the cath lab; `gemini-3.1-pro-preview` and `gemini-pro-latest` read both correctly.
`gemini-2.5-pro` is no longer offered to new keys.

# DEPLOY.md — Backup local OpenMRS, restore to EC2

Minimal runbook: take volume backups from your local docker-compose stack, restore them on a fresh EC2 instance, and point the official compose file at them.

---

## 1 · Backup both volumes from local

Run on your **local** machine where the stack is currently running.

Our `docker-compose.yml` pins absolute volume names via `external: true name: o3_db-data` / `o3_openmrs-data`, so the volumes are always called `o3_db-data` and `o3_openmrs-data` regardless of the host directory.

```bash
cd /path/to/openmrs-distro-referenceapplication

# Confirm the volumes exist
docker volume ls | grep -E 'o3_(db|openmrs)-data'

# Stop containers for a clean snapshot
docker compose stop

# Tar both volumes into ./backups/
mkdir -p ./backups
docker run --rm \
  -v o3_db-data:/src/db:ro \
  -v o3_openmrs-data:/src/omrs:ro \
  -v "$PWD/backups:/dst" \
  alpine sh -c "cd /src && tar czf /dst/openmrs-volumes-$(date +%F).tgz db omrs"

# Start the stack again
docker compose up -d

ls -lh ./backups/
# openmrs-volumes-2026-05-04.tgz   ← copy this to EC2
```

---

## 2 · Create volumes & restore on the EC2 server

SSH into the EC2 instance, install Docker, then restore.

```bash
# --- on EC2 ---
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER && newgrp docker

# Choose a working directory
sudo mkdir -p /opt/openmrs/{frontend,backups}
sudo chown -R $USER /opt/openmrs
cd /opt/openmrs

# Copy backup tar from local to EC2 (run this FROM your local machine):
#   scp ./backups/openmrs-volumes-2026-05-04.tgz ec2-user@<ec2-host>:/opt/openmrs/backups/

# Pre-create the named volumes with the EXACT names the compose file expects
# (compose has `external: true name: o3_*` so it will NOT auto-create them).
docker volume create o3_db-data
docker volume create o3_openmrs-data

# Restore both volumes from the tar
docker run --rm \
  -v o3_db-data:/dst/db \
  -v o3_openmrs-data:/dst/omrs \
  -v "$PWD/backups:/src:ro" \
  alpine sh -c "cd /dst && tar xzf /src/openmrs-volumes-2026-05-04.tgz"

# Verify
docker run --rm -v o3_db-data:/v alpine ls /v | head
docker run --rm -v o3_openmrs-data:/v alpine ls /v | head
```

---

## 3 · docker-compose.yml — nothing to edit on EC2

The compose file is already EC2-ready. Just `scp` it from local to `/opt/openmrs/docker-compose.yml`.

It has two design choices that make this work without a `.env` file:

1. **`name: o3` at the top** — pins the compose project name so containers and the network are always called `o3-backend-1`, `o3-db-1`, `o3_default`, etc., regardless of which host directory you run it from.
2. **`${VAR:-default}` placeholders with sensible defaults** for `TAG`, `OMRS_DB_USER`, `OMRS_DB_PASSWORD`, `MYSQL_ROOT_PASSWORD` — all default to values that match the local stack (`qa`, `openmrs`, `openmrs`, `openmrs`). No `.env` needed; just `docker compose up -d`.
3. **`external: true name: o3_*`** on both volumes — compose will not auto-create them; it attaches to the volumes you pre-created in §2.

> ⚠️ **DB credentials must match the source local server.** The MariaDB datafiles in the backup were initialised with `openmrs / openmrs / openmrs`. If you ever change those defaults, override consistently on **both** local and EC2 before taking/restoring backups, otherwise the restored DB will reject connections.

### Optional — override defaults via `.env`

Only needed if you want different values from the defaults baked into the placeholders:

```bash
cat > /opt/openmrs/.env <<'EOF'
TAG=qa
MYSQL_ROOT_PASSWORD=openmrs
OMRS_DB_USER=openmrs
OMRS_DB_PASSWORD=openmrs
EOF
chmod 600 /opt/openmrs/.env
```

**EC2 security group:** allow inbound TCP **9096** (or 443 if you front it with SSL/ALB).

---

## 4 · `config-core_demo.json` — copy to EC2 + compose mount

The frontend's runtime config (orderTypes whitelist, queues, etc.) is **bind-mounted** from the host into the frontend container. The default compose already mounts it; you just need to put the file at the expected path.

### 4a — Copy from local

```bash
# from local
scp frontend/config-core_demo.json \
    ec2-user@<ec2-host>:/opt/openmrs/frontend/config-core_demo.json
```

### 4b — Confirm the compose mount line (no edit needed by default)

In `/opt/openmrs/docker-compose.yml`, the `frontend` service already contains:

```yaml
frontend:
  image: openmrs/openmrs-reference-application-3-frontend:${TAG:-qa}
  ...
  volumes:
    - ./frontend/config-core_demo.json:/usr/share/nginx/html/config-core_demo.json:ro
```

The host path `./frontend/config-core_demo.json` is **relative to the compose file's directory** (`/opt/openmrs/`), so it picks up the file you just scp'd. **No edit required.**

If you stored the config under a different path (e.g. `/opt/openmrs/config/`), change only the host side of the bind:

```yaml
volumes:
  - ./config/config-core_demo.json:/usr/share/nginx/html/config-core_demo.json:ro
```

### 4c — Boot & smoke test

```bash
cd /opt/openmrs
docker compose up -d
docker compose logs -f backend     # wait for "Application Started", Ctrl+C

# Verify the Referral In EncounterType from local resolves on EC2:
curl -s -u admin:<password-from-local> \
  http://<ec2-host>:9096/openmrs/ws/rest/v1/encountertype/de0f5558-9813-4fa3-8613-467015f9fabd \
  | python3 -m json.tool

# UI:  http://<ec2-host>:9096/openmrs/spa/
```

If the curl returns the EncounterType JSON, every UUID, patient, encounter, order, visit, and queue entry is identical to your local server.

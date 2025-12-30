# Airr Model Routing & Cost Controller (POC)

## What this project is

- Proof of Concept for **Lane N — Model Routing & Cost Controller**
- Demonstrates **AI systems thinking**, not a chat app
- Focuses on:

  - model routing (cost / latency / priority)
  - auditability of AI decisions
  - cost per successful task
  - production-ready deployment

---

## What the system does

- Accepts AI tasks:

  - task type (summarization, rewrite, etc.)
  - priority (low / medium / high)
  - cost target (low / balanced / high accuracy)
  - input text

- Routes tasks to a **model tier** using rules
- Logs:

  - chosen model
  - routing reasons
  - estimated cost
  - success / failure

- Stores all data in **Supabase**
- Shows everything on a **dashboard**
- Supports execution via:

  - UI (manual input)
  - API
  - n8n workflow

---

## Tech stack

- Next.js (App Router)
- Supabase (Postgres + RLS)
- Supabase CLI (migrations)
- Docker
- n8n (Docker)
- Coolify-ready deployment

---

## Repo structure

- `app/`

  - `api/execute` – run task
  - `api/tasks` – list tasks
  - `api/stats` – cost & usage stats
  - `api/health` – health check
  - `dashboard/` – UI + manual input popover

- `src/lib/supabaseAdmin.ts` – server-side Supabase client
- `supabase/migrations/` – schema + seed data
- `infra/n8n/` – n8n workflow exports
- `Dockerfile`, `.dockerignore`, `.env.example`

---

## Prerequisites (install once)

- Node.js **18+**
- Docker Desktop
- Supabase account
- Supabase CLI

### Install Supabase CLI (macOS)

```bash
brew install supabase/tap/supabase
```

---

## Phase 0 — Clone & run locally

- Clone repo

```bash
git clone <REPO_URL>
cd airr-router-poc
```

- Install dependencies

```bash
npm install
```

- Start dev server

```bash
npm run dev
```

- Open dashboard
  [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## Phase 1 — Supabase setup

- Create Supabase project:

  - name: `airr-router-poc`
  - save DB password

- Copy **Project ID**
- Supabase URL format:

  ```
  https://<PROJECT_ID>.supabase.co
  ```

### Link Supabase project

```bash
supabase login
supabase link --project-ref <PROJECT_ID>
```

### Apply migrations

```bash
supabase db push
```

### Create `.env.local` (DO NOT COMMIT)

```env
SUPABASE_URL=https://<PROJECT_ID>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxx
NEXT_PUBLIC_N8N_WEBHOOK_URL=
```

Restart dev server after this.

---

## Phase 2 — Core APIs

- Execute task

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "summarization",
    "priority": "high",
    "cost_target": "balanced",
    "input_text": "Transcript imports failing."
  }'
```

- List tasks

```bash
curl http://localhost:3000/api/tasks
```

- View stats

```bash
curl http://localhost:3000/api/stats
```

---

## Phase 3 — n8n orchestration

- Run n8n via Docker

```bash
docker run -it --rm \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

- Open n8n UI
  [http://localhost:5678](http://localhost:5678)

- Create workflow:

  - Manual Trigger
  - HTTP Request node

### HTTP Request config

- Method: POST
- URL:

  ```
  http://host.docker.internal:3000/api/execute
  ```

- Header:

  ```
  Content-Type: application/json
  ```

- Body:

```json
{
  "task_type": "summarization",
  "priority": "high",
  "cost_target": "balanced",
  "input_text": "Customer: ASU. Transcript imports failing."
}
```

---

## Phase 4 — Dashboard UI

- Open dashboard:

  ```
  http://localhost:3000/dashboard
  ```

### Dashboard features

- Execution stats
- Cost per successful task
- Model usage
- Recent tasks
- **Run manual task** popover:

  - select task type
  - select priority
  - select cost target
  - paste input text
  - submit → dashboard refreshes

---

## Phase 5 — Docker (production)

- Build image

```bash
docker build -t airr-router-poc .
```

- Run container

```bash
docker run --rm -p 3000:3000 \
  -e SUPABASE_URL=https://<PROJECT_ID>.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxx \
  airr-router-poc
```

- Open dashboard
  [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## Deploy on Coolify (NAS)

- New Application
- Source: Git repo
- Build: Dockerfile
- Expose port: `3000`
- Healthcheck: `/api/health`
- Env vars:

  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY (mark secret)

---

## AI systems thinking (why this matters)

- Models are treated as **execution units**
- Routing is policy-driven (cost / latency / priority)
- Every decision is logged and auditable
- Cost per success is measurable
- UI is thin; intelligence lives in routing + control plane

---

## Demo flow (recommended)

- Open dashboard
- Run manual task (high priority)
- Show chosen model + cost
- Change cost target → rerun
- Show stats updating
- Trigger same task via n8n

---

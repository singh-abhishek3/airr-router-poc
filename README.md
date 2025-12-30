Below is a **complete, clean `README.md` file** you can copy-paste directly into your repo.
It is written so **anyone can clone the repo and get to Phase 1 successfully** without you present.

---

````md
# Airr Model Routing & Cost Controller (POC)

This repository contains a runnable Proof of Concept for **Lane N: Model Routing & Cost Controller** for Airr 3.0.

The goal of this POC is to demonstrate:

- How AI tasks can be routed to different models based on cost, latency, and accuracy constraints
- How every routing decision is logged for auditability and cost control
- A repo-first, reproducible setup that anyone can clone and run

This README currently covers **Phase 0 (Scaffold)** and **Phase 1 (Supabase schema + migrations)**.

---

## What this POC will do (once complete)

- Accept AI tasks (summarize, classify, extract, rewrite)
- Route tasks to an optimal model based on simple rules
- Track cost, latency, and success/failure per task
- Store all data in Supabase with RLS enabled
- Expose APIs and dashboards (Phase 2+)

---

## Tech stack

- **Next.js (App Router)** – UI + API routes
- **Supabase** – Postgres database, RLS, migrations
- **Supabase CLI** – reproducible database setup
- **n8n** – orchestration workflows (later phase)

---

## Prerequisites

- Node.js **18+**
- npm
- Supabase account (free tier is fine)
- Supabase CLI

### Install Supabase CLI (macOS)

```bash
brew install supabase/tap/supabase
supabase --version
```
````

---

## Phase 0 — Local scaffold setup

### 1) Clone the repository

```bash
git clone <REPO_URL>
cd airr-router-poc
```

### 2) Install dependencies

```bash
npm install
```

### 3) Start the dev server

```bash
npm run dev
```

### 4) Verify local routes

- UI page: [http://localhost:3000/run](http://localhost:3000/run)
- Health API: [http://localhost:3000/api/health](http://localhost:3000/api/health)

If both load successfully, Phase 0 is complete.

---

## Phase 1 — Database setup (Supabase schema + migrations)

This project uses **Supabase CLI migrations**, committed to the repo, so database setup is reproducible.

### 1) Create a Supabase project (cloud)

Go to the Supabase Dashboard and create a new project:

- Project name: `airr-router-poc`
- Choose a region
- Set a database password (save it)

After creation, note the **Project ID (ref)**:

- Supabase Dashboard → Project Settings → General → **Project ID**

Your Supabase URL will be:

```
https://<PROJECT_ID>.supabase.co
```

---

### 2) Login to Supabase CLI (one-time per machine)

```bash
supabase login
```

This opens a browser window to authenticate your Supabase account.

---

### 3) Link this repo to your Supabase project

Run from the repo root:

```bash
supabase link --project-ref <PROJECT_ID>
```

Example:

```bash
supabase link --project-ref ktlosobescedbldzcfru
```

You will be prompted for the **database password** you set when creating the project.

---

### 4) Apply database migrations

```bash
supabase db push
```

This applies the following migrations from `supabase/migrations/`:

- `001_init.sql` – core tables and indexes
- `002_rls.sql` – Row Level Security (read-only policies)
- `003_seed.sql` – seed data (models + sample tasks)

> Note: `supabase db diff` may require Docker. It is optional and not required.

---

### 5) Verify database setup

In the Supabase Dashboard → **Table Editor**, confirm:

- Tables exist:

  - `models`
  - `tasks`
  - `routing_decisions`
  - `task_outputs`

- `models` table has **4 seeded rows**
- `tasks` table has **2 seeded rows**
- **RLS is enabled** on all tables

---

## Environment variables

Create a local `.env.local` file (do **NOT** commit this):

```env
SUPABASE_URL=https://<PROJECT_ID>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_XXXXXXXXXXXXXXXX
NEXT_PUBLIC_N8N_WEBHOOK_URL=
```

### Where to get the Service Role / Secret key

- Supabase Dashboard → **Project Settings → API Keys**
- Scroll to **Secret keys**
- Copy the key starting with `sb_secret_`

> The service role key bypasses RLS.
> It must be used **server-side only**.

Restart the dev server after setting env vars:

```bash
npm run dev
```

---

## Repo structure (current)

```
app/
  api/
    health/
      route.ts
  run/
    page.tsx

supabase/
  migrations/
    001_init.sql
    002_rls.sql
    003_seed.sql

infra/
  n8n/               # n8n workflow exports (later phase)

.env.example
README.md
```

---

## Phase status

- ✅ Phase 0: Next.js scaffold running locally
- ✅ Phase 1: Supabase schema, RLS, and seed data applied via CLI
- ⏭️ Phase 2: Next.js API routes + model routing logic
- ⏭️ Phase 3: n8n workflow orchestration
- ⏭️ Phase 4: UI dashboards + analytics
- ⏭️ Phase 5: Docker + Coolify deployment

---

## Notes

- This repo is intentionally scoped for fast iteration.
- Real LLM calls are deferred; routing and logging are the focus.
- All schema changes are tracked via migrations to keep the setup reproducible.

---

## Next step

Proceed to **Phase 2** to:

- Add a server-side Supabase client
- Implement `POST /api/execute`
- Insert tasks, routing decisions, and outputs in one flow

```

---

If you want, next I can:
- Tighten this README for **executive reviewers**
- Add a **“15-minute setup”** quickstart section
- Or move straight into **Phase 2** with the same step-by-step discipline
```

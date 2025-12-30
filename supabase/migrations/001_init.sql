-- 001_init.sql
-- Airr Router POC: core schema

create extension if not exists pgcrypto;

-- 1) models: catalog of available model options
create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  tier text not null check (tier in ('cheap', 'balanced', 'premium', 'fallback')),
  provider text not null default 'mock',
  cost_per_1k_tokens numeric(12,6) not null default 0,
  avg_latency_ms integer not null default 0,
  max_context_tokens integer not null default 8192,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) tasks: incoming requests
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  task_type text not null check (task_type in ('summarization','classification','extraction','rewrite')),
  priority text not null default 'low' check (priority in ('low','medium','high')),
  cost_target text not null default 'balanced' check (cost_target in ('low','balanced','high_accuracy')),
  input_text text not null,
  input_chars integer not null,
  created_at timestamptz not null default now()
);

create index if not exists tasks_created_at_idx on public.tasks(created_at desc);
create index if not exists tasks_task_type_idx on public.tasks(task_type);

-- 3) routing_decisions: router output + execution metadata
create table if not exists public.routing_decisions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  model_chosen text not null, -- store model name for simplicity (joins easy too)
  route_version text not null default 'v1',
  reason_json jsonb not null default '[]'::jsonb,
  estimated_input_tokens integer not null default 0,
  estimated_cost_usd numeric(12,6) not null default 0,
  latency_ms integer,
  success boolean not null default true,
  error_category text,
  created_at timestamptz not null default now()
);

create index if not exists routing_task_id_idx on public.routing_decisions(task_id);
create index if not exists routing_model_chosen_idx on public.routing_decisions(model_chosen);
create index if not exists routing_created_at_idx on public.routing_decisions(created_at desc);

-- 4) task_outputs: final output text
create table if not exists public.task_outputs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  output_type text not null default 'text',
  output_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists outputs_task_id_idx on public.task_outputs(task_id);

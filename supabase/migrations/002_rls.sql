-- 002_rls.sql
-- Enable Row Level Security (RLS)
alter table public.models enable row level security;
alter table public.tasks enable row level security;
alter table public.routing_decisions enable row level security;
alter table public.task_outputs enable row level security;

-- READ policies: allow read for anon/authenticated (demo-friendly)
drop policy if exists "read_models" on public.models;
create policy "read_models"
on public.models for select
to anon, authenticated
using (true);

drop policy if exists "read_tasks" on public.tasks;
create policy "read_tasks"
on public.tasks for select
to anon, authenticated
using (true);

drop policy if exists "read_routing_decisions" on public.routing_decisions;
create policy "read_routing_decisions"
on public.routing_decisions for select
to anon, authenticated
using (true);

drop policy if exists "read_task_outputs" on public.task_outputs;
create policy "read_task_outputs"
on public.task_outputs for select
to anon, authenticated
using (true);

-- NOTE:
-- No INSERT/UPDATE/DELETE policies on purpose.
-- Your Next.js API will use SUPABASE_SERVICE_ROLE_KEY.
-- Service role bypasses RLS and can write safely server-side.

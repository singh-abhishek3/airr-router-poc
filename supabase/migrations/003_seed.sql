-- 003_seed.sql
-- Seed model catalog (example pricing is illustrative)

insert into public.models (name, tier, provider, cost_per_1k_tokens, avg_latency_ms, max_context_tokens, is_active)
values
  ('cheap-fast', 'cheap', 'mock', 0.050000, 500, 8192, true),
  ('balanced-core', 'balanced', 'mock', 0.150000, 1200, 16384, true),
  ('premium-accurate', 'premium', 'mock', 0.600000, 2200, 32768, true),
  ('fallback-safe', 'fallback', 'mock', 0.200000, 900, 8192, true)
on conflict (name) do nothing;

-- Optional: a couple of example tasks (good for demo)
insert into public.tasks (task_type, priority, cost_target, input_text, input_chars)
values
  ('summarization','high','balanced','Customer: ASU. Transcript imports failing for 18% of Banner files since Dec 26. Error INVALID_TERM_CODE. Go-live in 10 days.', 140),
  ('rewrite','low','low','Please send the update by EOD.', 28)
on conflict do nothing;

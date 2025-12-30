import { NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select(
      `
      id,
      task_type,
      priority,
      cost_target,
      input_chars,
      created_at,
      routing_decisions (
        model_chosen,
        estimated_cost_usd,
        latency_ms,
        success,
        created_at
      ),
      task_outputs (
        output_text,
        created_at
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, items: data ?? [] });
}

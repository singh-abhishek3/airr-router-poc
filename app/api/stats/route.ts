import { NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  // Pull last N routing decisions and compute stats in code (simple for POC)
  const { data, error } = await supabaseAdmin
    .from('routing_decisions')
    .select('model_chosen, success, estimated_cost_usd, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  const rows = data ?? [];
  const modelUsage: Record<string, number> = {};
  let totalCost = 0;
  let successCount = 0;

  for (const r of rows) {
    modelUsage[r.model_chosen] = (modelUsage[r.model_chosen] ?? 0) + 1;
    totalCost += Number(r.estimated_cost_usd ?? 0);
    if (r.success) successCount += 1;
  }

  return NextResponse.json({
    ok: true,
    total: rows.length,
    successRate: rows.length ? successCount / rows.length : 0,
    totalCostUsd: totalCost,
    avgCostUsd: rows.length ? totalCost / rows.length : 0,
    modelUsage,
  });
}

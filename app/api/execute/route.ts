import { NextResponse } from 'next/server';
import { z } from 'zod';
import { routeModel, estimateTokens, TaskType } from '@/lib/modelRouter';
import { executeMockTask } from '@/lib/mockExecutor';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const ExecuteSchema = z.object({
  task_type: z.enum([
    'summarization',
    'classification',
    'extraction',
    'rewrite',
  ]),
  priority: z.enum(['low', 'medium', 'high']).default('low'),
  cost_target: z.enum(['low', 'balanced', 'high_accuracy']).default('balanced'),
  input_text: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = ExecuteSchema.parse(await req.json());

    const supabaseAdmin = getSupabaseAdmin();

    const inputChars = body.input_text.length;

    /* 1) Create task */
    const { data: taskRows, error: taskErr } = await supabaseAdmin
      .from('tasks')
      .insert({
        task_type: body.task_type,
        priority: body.priority,
        cost_target: body.cost_target,
        input_text: body.input_text,
        input_chars: inputChars,
      })
      .select('id')
      .limit(1);

    if (taskErr || !taskRows?.[0]) {
      throw new Error(taskErr?.message ?? 'Failed to create task');
    }

    const taskId = taskRows[0].id as string;

    /* 2) Route model */
    const routing = routeModel({
      taskType: body.task_type as TaskType,
      priority: body.priority,
      costTarget: body.cost_target,
      inputChars,
    });

    const estimatedTokens = estimateTokens(body.input_text);

    const estimatedCostUsd =
      routing.model === 'cheap-fast'
        ? estimatedTokens * 0.00005
        : routing.model === 'balanced-core'
        ? estimatedTokens * 0.00015
        : estimatedTokens * 0.0006;

    /* 3) Execute (mock) */
    const start = Date.now();
    const outputText = executeMockTask(
      body.task_type as TaskType,
      body.input_text
    );
    const latencyMs = Date.now() - start;

    /* 4) Log routing decision */
    const { error: routingErr } = await supabaseAdmin
      .from('routing_decisions')
      .insert({
        task_id: taskId,
        model_chosen: routing.model,
        route_version: routing.routeVersion,
        reason_json: routing.reasons,
        estimated_input_tokens: estimatedTokens,
        estimated_cost_usd: estimatedCostUsd,
        latency_ms: latencyMs,
        success: true,
      });

    if (routingErr) {
      throw new Error(routingErr.message);
    }

    /* 5) Store output */
    const { error: outputErr } = await supabaseAdmin
      .from('task_outputs')
      .insert({
        task_id: taskId,
        output_type: 'text',
        output_text: outputText,
      });

    if (outputErr) {
      throw new Error(outputErr.message);
    }

    return NextResponse.json({
      ok: true,
      task_id: taskId,
      model_chosen: routing.model,
      reasons: routing.reasons,
      estimated_tokens: estimatedTokens,
      estimated_cost_usd: estimatedCostUsd,
      latency_ms: latencyMs,
      output_text: outputText,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}

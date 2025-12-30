export type TaskType =
  | 'summarization'
  | 'classification'
  | 'extraction'
  | 'rewrite';

export type Priority = 'low' | 'medium' | 'high';
export type CostTarget = 'low' | 'balanced' | 'high_accuracy';

export function estimateTokens(text: string): number {
  // very rough but acceptable for POC
  return Math.max(1, Math.ceil(text.length / 4));
}

export function routeModel(params: {
  taskType: TaskType;
  priority: Priority;
  costTarget: CostTarget;
  inputChars: number;
}) {
  const reasons: string[] = [];

  const { taskType, priority, costTarget, inputChars } = params;

  if (priority === 'high') {
    reasons.push('priority=high → avoid cheap models');
  }

  if (inputChars > 4000) {
    reasons.push('long input → require larger context');
  }

  if (costTarget === 'high_accuracy') {
    reasons.push('high_accuracy requested');
  }

  if (costTarget === 'low') {
    reasons.push('cost_target=low');
  }

  let model = 'balanced-core';

  if (priority === 'high' || costTarget === 'high_accuracy') {
    model = 'premium-accurate';
  } else if (
    costTarget === 'low' &&
    taskType !== 'extraction' &&
    inputChars < 2000
  ) {
    model = 'cheap-fast';
  } else if (inputChars > 6000) {
    model = 'premium-accurate';
  }

  reasons.push(`chosen_model=${model}`);

  return {
    model,
    reasons,
    routeVersion: 'v1',
  };
}

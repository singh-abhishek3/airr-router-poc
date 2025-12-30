import { TaskType } from './modelRouter';

export function executeMockTask(taskType: TaskType, inputText: string): string {
  switch (taskType) {
    case 'summarization':
      return `Summary: ${inputText.slice(0, 120)}...`;

    case 'classification':
      return 'Classification: support_issue';

    case 'extraction':
      return JSON.stringify(
        {
          customer: 'Arizona State University',
          error: 'INVALID_TERM_CODE',
        },
        null,
        2
      );

    case 'rewrite':
      return `Rewrite (polite): ${inputText}`;

    default:
      return 'Unsupported task';
  }
}

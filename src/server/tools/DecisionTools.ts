import { ProgressTracker } from '../../core/ProgressTracker.js';

/**
 * Definition of Memory Bank decision tools
 */
export const decisionTools = [
  {
    name: 'log_decision',
    description: 'Log a decision in the decision log',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Decision title',
        },
        context: {
          type: 'string',
          description: 'Decision context',
        },
        decision: {
          type: 'string',
          description: 'The decision made',
        },
        alternatives: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Alternatives considered',
        },
        consequences: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Consequences of the decision',
        },
      },
      required: ['title', 'context', 'decision'],
    },
  },
];

/**
 * Processa a ferramenta log_decision
 * @param progressTracker ProgressTracker
 * @param decision Decisão a ser registrada
 * @returns Resultado da operação
 */
export async function handleLogDecision(
  progressTracker: ProgressTracker,
  decision: {
    title: string;
    context: string;
    decision: string;
    alternatives?: string[] | string;
    consequences?: string[] | string;
  }
) {
  try {
    await progressTracker.logDecision(decision);

    // Também rastreia isso como progresso
    await progressTracker.trackProgress('Decision Made', {
      description: decision.title,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Decision logged: ${decision.title}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error logging decision: ${error}`,
        },
      ],
      isError: true,
    };
  }
}
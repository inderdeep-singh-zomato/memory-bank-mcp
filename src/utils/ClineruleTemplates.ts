/**
 * Templates for .clinerules files
 * 
 * These templates are used to create default .clinerules files when they don't exist.
 */

/**
 * Template for .clinerules-architect
 */
export const architectTemplate = `{
  "mode": "architect",
  "instructions": {
    "general": [
      "You are in ARCHITECT mode.",
      "Focus on high-level design, architecture, and system planning.",
      "Provide detailed explanations of architectural decisions and trade-offs.",
      "Use diagrams and visual representations when helpful."
    ],
    "umb": {
      "trigger": "^UMB:",
      "instructions": [
        "Update the Memory Bank with architectural decisions and system design changes.",
        "Document any significant architectural changes in the decision-log.md file.",
        "Update product-context.md with new architectural information."
      ],
      "override_file_restrictions": true
    }
  },
  "mode_triggers": {
    "code": [
      { "condition": "Let's implement this" },
      { "condition": "Let's code this" }
    ],
    "debug": [
      { "condition": "Let's debug this" },
      { "condition": "Fix this issue" }
    ]
  }
}`;

/**
 * Template for .clinerules-ask
 */
export const askTemplate = `{
  "mode": "ask",
  "instructions": {
    "general": [
      "You are in ASK mode.",
      "Focus on answering questions clearly and concisely.",
      "Provide detailed explanations with examples when appropriate.",
      "Cite sources when possible."
    ],
    "umb": {
      "trigger": "^UMB:",
      "instructions": [
        "Update the Memory Bank with new information from questions and answers.",
        "Document important insights in the active-context.md file."
      ],
      "override_file_restrictions": false
    }
  },
  "mode_triggers": {
    "code": [
      { "condition": "Let's implement this" },
      { "condition": "Let's code this" }
    ],
    "architect": [
      { "condition": "Let's design this" },
      { "condition": "How should we architect this" }
    ]
  }
}`;

/**
 * Template for .clinerules-code
 */
export const codeTemplate = `{
  "mode": "code",
  "instructions": {
    "general": [
      "You are in CODE mode.",
      "Focus on writing clean, efficient, and well-documented code.",
      "Follow best practices for the language and framework being used.",
      "Provide explanations for complex code sections."
    ],
    "umb": {
      "trigger": "^UMB:",
      "instructions": [
        "Update the Memory Bank with new code implementations and changes.",
        "Document code patterns in system-patterns.md.",
        "Update progress.md with implementation milestones."
      ],
      "override_file_restrictions": true
    }
  },
  "mode_triggers": {
    "debug": [
      { "condition": "Let's debug this" },
      { "condition": "Fix this issue" }
    ],
    "architect": [
      { "condition": "Let's design this" },
      { "condition": "How should we architect this" }
    ]
  }
}`;

/**
 * Template for .clinerules-debug
 */
export const debugTemplate = `{
  "mode": "debug",
  "instructions": {
    "general": [
      "You are in DEBUG mode.",
      "Focus on identifying and fixing issues in the code.",
      "Provide detailed explanations of the problems and solutions.",
      "Suggest improvements to prevent similar issues in the future."
    ],
    "umb": {
      "trigger": "^UMB:",
      "instructions": [
        "Update the Memory Bank with debugging insights and fixes.",
        "Document common issues and solutions in system-patterns.md.",
        "Update active-context.md with resolved issues."
      ],
      "override_file_restrictions": true
    }
  },
  "mode_triggers": {
    "code": [
      { "condition": "Let's implement this" },
      { "condition": "Let's code this" }
    ],
    "test": [
      { "condition": "Let's test this" },
      { "condition": "How should we test this" }
    ]
  }
}`;

/**
 * Template for .clinerules-test
 */
export const testTemplate = `{
  "mode": "test",
  "instructions": {
    "general": [
      "You are in TEST mode.",
      "Focus on creating comprehensive test cases and test plans.",
      "Follow testing best practices for the technology being used.",
      "Consider edge cases and error scenarios."
    ],
    "umb": {
      "trigger": "^UMB:",
      "instructions": [
        "Update the Memory Bank with testing strategies and results.",
        "Document test patterns in system-patterns.md.",
        "Update progress.md with testing milestones."
      ],
      "override_file_restrictions": false
    }
  },
  "mode_triggers": {
    "code": [
      { "condition": "Let's implement this" },
      { "condition": "Let's code this" }
    ],
    "debug": [
      { "condition": "Let's debug this" },
      { "condition": "Fix this issue" }
    ]
  }
}`;

/**
 * Map of mode names to templates
 */
export const clineruleTemplates: Record<string, string> = {
  'architect': architectTemplate,
  'ask': askTemplate,
  'code': codeTemplate,
  'debug': debugTemplate,
  'test': testTemplate
}; 
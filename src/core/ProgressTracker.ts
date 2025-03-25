import path from 'path';
import { FileUtils } from '../utils/FileUtils.js';
import { StorageProvider } from './storage/StorageProvider.js';

/**
 * Interface for progress tracking details
 */
export interface ProgressDetails {
  /** Description of the progress or action */
  description: string;
  /** Optional filename related to the action */
  filename?: string;
  /** Optional path related to the action */
  path?: string;
  /** Optional status of the action (success, error, warning) */
  status?: 'success' | 'error' | 'warning';
  /** Optional timestamp of the action */
  timestamp?: Date;
  /** Optional additional metadata as key-value pairs */
  metadata?: Record<string, string | number | boolean>;
  /** Optional GitHub profile URL of who performed the action */
  userId?: string;
  /** 
   * Any additional properties
   * @deprecated Use metadata for additional properties instead
   */
  [key: string]: unknown;
}

/**
 * Interface for decision logging
 */
export interface Decision {
  /** Title of the decision */
  title: string;
  /** Context or background information for the decision */
  context: string;
  /** The actual decision that was made */
  decision: string;
  /** Alternatives that were considered (string or array of strings) */
  alternatives?: string[] | string;
  /** Consequences of the decision (string or array of strings) */
  consequences?: string[] | string;
  /** Optional date when the decision was made (defaults to current date) */
  date?: Date;
  /** Optional tags to categorize the decision */
  tags?: string[];
  /** Optional GitHub profile URL of who made the decision */
  userId?: string;
}

/**
 * Interface for active context updates
 */
export interface ActiveContext {
  /** List of ongoing tasks */
  tasks?: string[];
  /** List of known issues */
  issues?: string[];
  /** List of next steps */
  nextSteps?: string[];
  /** Optional project state description */
  projectState?: string;
  /** Optional session notes */
  sessionNotes?: string[];
}

/**
 * Class for tracking progress and logging decisions
 * 
 * This class handles all operations related to tracking progress, logging decisions,
 * and updating the active context in the Memory Bank.
 */
export class ProgressTracker {
  private userId: string;

  /**
   * Creates a new ProgressTracker instance
   * 
   * @param memoryBankDir - Directory of the Memory Bank
   * @param userId - GitHub profile URL for tracking changes
   * @param storageProvider - Storage provider for file operations
   */
  constructor(
    private memoryBankDir: string,
    userId?: string,
    private storageProvider?: StorageProvider
  ) {
    // Use provided userId or "Unknown User" as default
    this.userId = userId || "Unknown User";
  }

  /**
   * Formats the GitHub profile URL for display in markdown
   * 
   * If the userId is a GitHub URL, it will be formatted as [@username](url)
   * 
   * @param userId - The GitHub profile URL
   * @returns Formatted GitHub profile URL string
   * @private
   */
  private formatUserId(userId: string): string {
    // Check if the userId is a GitHub URL
    if (userId.includes('github.com/')) {
      try {
        // Extract the username from the URL
        const url = new URL(userId);
        const pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          const username = pathParts[pathParts.length - 1];
          return `[@${username}](${userId})`;
        }
      } catch (error) {
        // If URL parsing fails, just use the original userId
        console.error(`Error parsing GitHub URL: ${error}`);
      }
    }
    
    // Return the original userId if it's not a valid GitHub URL
    return userId;
  }

  /**
   * Tracks progress by adding an entry to the progress file
   * 
   * Note: All progress entries are stored in English regardless of the system locale or user settings.
   * 
   * @param action - Action performed (e.g., 'Implemented feature', 'Fixed bug')
   * @param details - Details of the progress
   * @returns The updated progress content
   */
  async trackProgress(action: string, details: ProgressDetails): Promise<string> {
    try {
      // Add GitHub profile URL to details if not already present
      if (!details.userId) {
        details.userId = this.userId;
      }
      
      // Update the progress file
      const updatedContent = await this.updateProgressFile(action, details);
      
      // Update the active context file
      await this.updateActiveContextFile(action, details);
      
      // Return the updated progress content
      return updatedContent;
    } catch (error) {
      console.error(`Error tracking progress: ${error}`);
      throw new Error(`Failed to track progress: ${error}`);
    }
  }

  /**
   * Updates the progress file
   * 
   * @param action - Action performed
   * @param details - Details of the action
   * @private
   */
  private async updateProgressFile(action: string, details: ProgressDetails): Promise<string> {
    const progressPath = path.join(this.memoryBankDir, 'progress.md');
    
    try {
      let progressContent = this.storageProvider
        ? await this.storageProvider.readFile(progressPath)
        : await FileUtils.readFile(progressPath);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const time = new Date().toLocaleTimeString();
      const userId = details.userId || this.userId;
      const formattedUserId = this.formatUserId(userId);
      const newEntry = `- [${timestamp} ${time}] [${formattedUserId}] - ${action}: ${details.description}`;
      
      // Add the entry to the update history section
      const updateHistoryRegex = /## Update History\s+/;
      if (updateHistoryRegex.test(progressContent)) {
        progressContent = progressContent.replace(
          updateHistoryRegex,
          `## Update History\n\n${newEntry}\n`
        );
      } else {
        // If the section doesn't exist, add it
        progressContent += `\n\n## Update History\n\n${newEntry}\n`;
      }
      
      if (this.storageProvider) {
        await this.storageProvider.writeFile(progressPath, progressContent);
      } else {
        await FileUtils.writeFile(progressPath, progressContent);
      }
      
      // Return the updated progress content
      return progressContent;
    } catch (error) {
      console.error(`Error updating progress file: ${error}`);
      throw new Error(`Failed to update progress file: ${error}`);
    }
  }

  /**
   * Updates the active context file
   * 
   * @param action - Action performed
   * @param details - Details of the action
   * @private
   */
  private async updateActiveContextFile(action: string, details: ProgressDetails): Promise<void> {
    const contextPath = path.join(this.memoryBankDir, 'active-context.md');
    
    try {
      let contextContent = this.storageProvider
        ? await this.storageProvider.readFile(contextPath)
        : await FileUtils.readFile(contextPath);
      
      // Add the entry to the current session notes section
      const sessionNotesRegex = /## Current Session Notes\s+/;
      const time = new Date().toLocaleTimeString();
      const userId = details.userId || this.userId;
      const formattedUserId = this.formatUserId(userId);
      const newNote = `- [${time}] [${formattedUserId}] ${action}: ${details.description}`;
      
      if (sessionNotesRegex.test(contextContent)) {
        contextContent = contextContent.replace(
          sessionNotesRegex,
          `## Current Session Notes\n\n${newNote}\n`
        );
      } else {
        // If the section doesn't exist, add it
        contextContent += `\n\n## Current Session Notes\n\n${newNote}\n`;
      }
      
      if (this.storageProvider) {
        await this.storageProvider.writeFile(contextPath, contextContent);
      } else {
        await FileUtils.writeFile(contextPath, contextContent);
      }
    } catch (error) {
      console.error(`Error updating active context file: ${error}`);
      throw new Error(`Failed to update active context file: ${error}`);
    }
  }

  /**
   * Updates the active context
   * 
   * Note: All content is stored in English regardless of the system locale or user settings.
   * 
   * @param context - Context to update
   * @throws Error if update fails
   */
  async updateActiveContext(context: {
    tasks?: string[];
    issues?: string[];
    nextSteps?: string[];
  }): Promise<void> {
    const contextPath = path.join(this.memoryBankDir, 'active-context.md');
    
    try {
      let contextContent = this.storageProvider
        ? await this.storageProvider.readFile(contextPath)
        : await FileUtils.readFile(contextPath);
      
      // Update ongoing tasks
      if (context.tasks && context.tasks.length > 0) {
        const tasksSection = `## Ongoing Tasks\n\n${context.tasks.map(task => `- ${task}`).join('\n')}\n`;
        
        if (/## Ongoing Tasks\s+([^#]*)/s.test(contextContent)) {
          contextContent = contextContent.replace(/## Ongoing Tasks\s+([^#]*)/s, tasksSection);
        } else {
          // If the section doesn't exist, add it
          contextContent += `\n\n${tasksSection}`;
        }
      }
      
      // Update known issues
      if (context.issues && context.issues.length > 0) {
        const issuesSection = `## Known Issues\n\n${context.issues.map(issue => `- ${issue}`).join('\n')}\n`;
        
        if (/## Known Issues\s+([^#]*)/s.test(contextContent)) {
          contextContent = contextContent.replace(/## Known Issues\s+([^#]*)/s, issuesSection);
        } else {
          // If the section doesn't exist, add it
          contextContent += `\n\n${issuesSection}`;
        }
      }
      
      // Update next steps
      if (context.nextSteps && context.nextSteps.length > 0) {
        const nextStepsSection = `## Next Steps\n\n${context.nextSteps.map(step => `- ${step}`).join('\n')}\n`;
        
        if (/## Next Steps\s+([^#]*)/s.test(contextContent)) {
          contextContent = contextContent.replace(/## Next Steps\s+([^#]*)/s, nextStepsSection);
        } else {
          // If the section doesn't exist, add it
          contextContent += `\n\n${nextStepsSection}`;
        }
      }
      
      if (this.storageProvider) {
        await this.storageProvider.writeFile(contextPath, contextContent);
      } else {
        await FileUtils.writeFile(contextPath, contextContent);
      }
    } catch (error) {
      console.error(`Error updating active context: ${error}`);
      throw new Error(`Failed to update active context: ${error}`);
    }
  }
  
  /**
   * Clears the current session notes
   * 
   * @throws Error if clearing fails
   */
  async clearSessionNotes(): Promise<void> {
    const contextPath = path.join(this.memoryBankDir, 'active-context.md');
    
    try {
      let contextContent = this.storageProvider
        ? await this.storageProvider.readFile(contextPath)
        : await FileUtils.readFile(contextPath);
      
      // Replace the current session notes with an empty section
      const sessionNotesRegex = /## Current Session Notes\s+([^#]*)/s;
      if (sessionNotesRegex.test(contextContent)) {
        contextContent = contextContent.replace(
          sessionNotesRegex,
          `## Current Session Notes\n\n`
        );
        
        if (this.storageProvider) {
          await this.storageProvider.writeFile(contextPath, contextContent);
        } else {
          await FileUtils.writeFile(contextPath, contextContent);
        }
      }
    } catch (error) {
      console.error(`Error clearing session notes: ${error}`);
      throw new Error(`Failed to clear session notes: ${error}`);
    }
  }

  /**
   * Logs a decision in the decision log
   * 
   * Note: All decision entries are stored in English regardless of the system locale or user settings.
   * 
   * @param decision - Decision to log
   * @throws Error if logging fails
   */
  async logDecision(decision: Decision): Promise<void> {
    const decisionLogPath = path.join(this.memoryBankDir, 'decision-log.md');
    
    try {
      let decisionLogContent = this.storageProvider
        ? await this.storageProvider.readFile(decisionLogPath)
        : await FileUtils.readFile(decisionLogPath);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const time = new Date().toLocaleTimeString();
      const userId = decision.userId || this.userId;
      const formattedUserId = this.formatUserId(userId);
      
      // Format alternatives and consequences
      const alternatives = Array.isArray(decision.alternatives) 
        ? decision.alternatives.map(alt => `  - ${alt}`).join('\n') 
        : decision.alternatives || 'None';
        
      const consequences = Array.isArray(decision.consequences) 
        ? decision.consequences.map(cons => `  - ${cons}`).join('\n') 
        : decision.consequences || 'None';
      
      const newDecision = `
## ${decision.title}
- **Date:** ${timestamp} ${time}
- **Author:** ${formattedUserId}
- **Context:** ${decision.context}
- **Decision:** ${decision.decision}
- **Alternatives Considered:** 
${Array.isArray(decision.alternatives) ? alternatives : `  - ${alternatives}`}
- **Consequences:** 
${Array.isArray(decision.consequences) ? consequences : `  - ${consequences}`}
`;
      
      // Add the new decision to the end of the file
      decisionLogContent += newDecision;
      
      if (this.storageProvider) {
        await this.storageProvider.writeFile(decisionLogPath, decisionLogContent);
      } else {
        await FileUtils.writeFile(decisionLogPath, decisionLogContent);
      }
    } catch (error) {
      console.error(`Error logging decision: ${error}`);
      throw new Error(`Failed to log decision: ${error}`);
    }
  }
}
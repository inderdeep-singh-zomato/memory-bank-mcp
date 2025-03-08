import fs from 'fs-extra';
import path from 'path';
import { EventEmitter } from 'events';

/**
 * Interface to represent the basic structure of rules
 */
export interface ClineruleBase {
  mode: string;
  instructions: {
    general: string[];
    umb?: {
      trigger: string;
      instructions: string[];
      override_file_restrictions: boolean;
    };
    memory_bank?: Record<string, any>;
  };
  mode_triggers?: Record<string, Array<{ condition: string }>>;
}

/**
 * Class responsible for loading and monitoring external .clinerules files
 */
export class ExternalRulesLoader extends EventEmitter {
  private projectDir: string;
  private rules: Map<string, ClineruleBase> = new Map();
  private watchers: fs.FSWatcher[] = [];
  
  /**
   * Creates a new instance of the external rules loader
   * @param projectDir Project directory (default: current directory)
   */
  constructor(projectDir?: string) {
    super();
    this.projectDir = projectDir || process.cwd();
  }

  /**
   * Detects and loads all .clinerules files in the project directory
   */
  async detectAndLoadRules(): Promise<Map<string, ClineruleBase>> {
    const modes = ['architect', 'ask', 'code', 'debug', 'test'];
    
    // Clear existing watchers
    this.stopWatching();
    
    // Clear existing rules
    this.rules.clear();
    
    for (const mode of modes) {
      const filename = `.clinerules-${mode}`;
      const filePath = path.join(this.projectDir, filename);
      
      try {
        if (await fs.pathExists(filePath)) {
          const content = await fs.readFile(filePath, 'utf8');
          const rule = this.parseRuleContent(content);
          
          if (rule && rule.mode === mode) {
            this.rules.set(mode, rule);
            console.error(`Loaded ${filename} rules`);
            
            // Set up watcher for this file
            this.watchRuleFile(filePath, mode);
          } else {
            console.error(`Invalid rule format in ${filename}`);
          }
        }
      } catch (error) {
        console.error(`Error loading ${filename}:`, error);
      }
    }
    
    return this.rules;
  }
  
  /**
   * Parses the content of a rule file
   * @param content File content
   * @returns Parsed rule object or null if invalid
   */
  private parseRuleContent(content: string): ClineruleBase | null {
    try {
      // Simple format for initial parsing
      // Can be expanded to support YAML or other formats
      const rule = JSON.parse(content);
      
      // Basic validation
      if (!rule.mode || !rule.instructions || !Array.isArray(rule.instructions.general)) {
        return null;
      }
      
      return rule;
    } catch (error) {
      // If not valid JSON, try to parse as YAML or other format
      // For now, just return null
      return null;
    }
  }
  
  /**
   * Sets up a watcher for a rule file
   * @param filePath File path
   * @param mode Mode associated with the file
   */
  private watchRuleFile(filePath: string, mode: string): void {
    const watcher = fs.watch(filePath, async (eventType) => {
      if (eventType === 'change') {
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const rule = this.parseRuleContent(content);
          
          if (rule && rule.mode === mode) {
            this.rules.set(mode, rule);
            this.emit('ruleChanged', mode, rule);
            console.error(`Updated ${path.basename(filePath)} rules`);
          }
        } catch (error) {
          console.error(`Error updating ${path.basename(filePath)}:`, error);
        }
      }
    });
    
    this.watchers.push(watcher);
  }
  
  /**
   * Stops watching all rule files
   */
  stopWatching(): void {
    for (const watcher of this.watchers) {
      watcher.close();
    }
    this.watchers = [];
  }
  
  /**
   * Gets the rules for a specific mode
   * @param mode Mode name
   * @returns Rules for the specified mode or null if not found
   */
  getRulesForMode(mode: string): ClineruleBase | null {
    return this.rules.get(mode) || null;
  }
  
  /**
   * Checks if a specific mode is available
   * @param mode Mode name
   * @returns true if the mode is available, false otherwise
   */
  hasModeRules(mode: string): boolean {
    return this.rules.has(mode);
  }
  
  /**
   * Gets all available modes
   * @returns Array with the names of available modes
   */
  getAvailableModes(): string[] {
    return Array.from(this.rules.keys());
  }
  
  /**
   * Cleans up all resources
   */
  dispose(): void {
    this.stopWatching();
    this.removeAllListeners();
    this.rules.clear();
  }
} 
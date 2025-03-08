import path from 'path';
import { FileUtils } from '../utils/FileUtils.js';
import { coreTemplates } from './templates/index.js';
import { ProgressTracker } from './ProgressTracker.js';
import { ModeManager } from '../utils/ModeManager.js';
import { ExternalRulesLoader } from '../utils/ExternalRulesLoader.js';
import fs from 'fs';

/**
 * Class responsible for managing Memory Bank operations
 * 
 * This class handles all operations related to Memory Bank directories,
 * including initialization, file operations, and status tracking.
 */
export class MemoryBankManager {
  private memoryBankDir: string | null = null;
  private customPath: string | null = null;
  private progressTracker: ProgressTracker | null = null;
  private modeManager: ModeManager | null = null;
  private rulesLoader: ExternalRulesLoader | null = null;
  private projectPath: string | null = null;
  
  // Language is always set to English
  private language: string = 'en';

  /**
   * Creates a new MemoryBankManager instance
   * 
   * @param projectPath Optional project path to use instead of current directory
   */
  constructor(projectPath?: string) {
    // Ensure language is always English
    this.language = 'en';
    
    if (projectPath) {
      this.projectPath = projectPath;
      console.error(`MemoryBankManager initialized with project path: ${projectPath}`);
    } else {
      this.projectPath = process.cwd();
      console.error(`MemoryBankManager initialized with current directory: ${this.projectPath}`);
    }
    
    console.error(`Memory Bank language is set to English (${this.language})`);
  }

  /**
   * Gets the language used for the Memory Bank
   * 
   * @returns The language code (always 'en' for English)
   */
  getLanguage(): string {
    return this.language;
  }

  /**
   * Sets the language for the Memory Bank
   * 
   * Note: This method is provided for API consistency, but the Memory Bank
   * will always use English (en) regardless of the language parameter.
   * 
   * @param language - Language code (ignored, always sets to 'en')
   */
  setLanguage(language: string): void {
    // Always use English regardless of the parameter
    this.language = 'en';
    console.warn('Memory Bank language is always set to English (en) regardless of the requested language.');
  }

  /**
   * Gets the project path
   * 
   * @returns The project path
   */
  getProjectPath(): string {
    return this.projectPath || process.cwd();
  }

  /**
   * Finds a Memory Bank directory
   * 
   * Always uses the current directory as the root and checks for a 'memory-bank' subdirectory.
   * If a custom path is provided, it will be ignored as we always use the current directory.
   * 
   * @param startDir - Starting directory for the search (current directory)
   * @param customPath - Optional custom path (ignored in this implementation)
   * @returns Path to the Memory Bank directory or null if not found
   */
  async findMemoryBankDir(startDir: string, customPath?: string): Promise<string | null> {
    // Always use the provided directory as the root
    const mbDir = path.join(startDir, 'memory-bank');
    
    // Check if the memory-bank directory exists in the provided directory
    if (await FileUtils.fileExists(mbDir) && await FileUtils.isDirectory(mbDir)) {
      // Check if it's a valid Memory Bank or just a directory
      const files = await FileUtils.listFiles(mbDir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      if (mdFiles.length > 0) {
        return mbDir;
      }
    }
    
    // If memory-bank directory doesn't exist or is not a valid Memory Bank, return null
    return null;
  }

  /**
   * Checks if a directory is a valid Memory Bank
   * 
   * @param dirPath - Directory path to check
   * @returns True if it's a valid Memory Bank, false otherwise
   */
  async isMemoryBank(dirPath: string): Promise<boolean> {
    try {
      if (!await FileUtils.isDirectory(dirPath)) return false;

      // Check if at least one of the core files exists
      const files = await FileUtils.listFiles(dirPath);
      
      // Support both camelCase and kebab-case during transition
      const coreFiles = [
        // Kebab-case (new format)
        'product-context.md',
        'active-context.md',
        'progress.md',
        'decision-log.md',
        'system-patterns.md',
        
        // CamelCase (old format)
        'productContext.md',
        'activeContext.md',
        'progress.md',
        'decisionLog.md',
        'systemPatterns.md'
      ];
      
      return coreFiles.some(file => files.includes(file));
    } catch (error) {
      console.error(`Error checking if ${dirPath} is a Memory Bank:`, error);
      return false;
    }
  }

  /**
   * Validates if all required .clinerules files exist in the project root
   * 
   * @param projectDir - Project directory to check
   * @returns Object with validation results
   */
  async validateClinerules(projectDir: string): Promise<{
    valid: boolean;
    missingFiles: string[];
    existingFiles: string[];
  }> {
    const requiredFiles = [
      '.clinerules-architect',
      '.clinerules-ask',
      '.clinerules-code',
      '.clinerules-debug',
      '.clinerules-test'
    ];
    
    const missingFiles: string[] = [];
    const existingFiles: string[] = [];
    
    for (const file of requiredFiles) {
      const filePath = path.join(projectDir, file);
      if (await FileUtils.fileExists(filePath)) {
        existingFiles.push(file);
      } else {
        missingFiles.push(file);
      }
    }
    
    return {
      valid: missingFiles.length === 0,
      missingFiles,
      existingFiles
    };
  }

  /**
   * Initializes a new Memory Bank
   * 
   * Creates a new Memory Bank directory with all required template files.
   * All templates are in English regardless of the system locale.
   * Also validates that all required .clinerules files exist in the project root.
   * 
   * @param dirPath - Directory path where the Memory Bank will be created
   * @throws Error if initialization fails or required .clinerules files are missing
   */
  async initializeMemoryBank(dirPath: string): Promise<void> {
    try {
      // Ensure language is always English
      this.language = 'en';
      
      // First, validate that all required .clinerules files exist
      const projectRoot = dirPath;
      
      // Create the ExternalRulesLoader to handle .clinerules files
      try {
        this.rulesLoader = new ExternalRulesLoader(projectRoot);
        
        // Validate and create missing .clinerules files
        try {
          const validation = await this.rulesLoader.validateRequiredFiles();
          if (!validation.valid) {
            console.warn(`Warning: Some .clinerules files could not be created: ${validation.missingFiles.join(', ')}`);
            console.warn('Continuing with Memory Bank initialization despite missing .clinerules files.');
          }
        } catch (validationError) {
          console.warn('Error validating .clinerules files:', validationError);
          console.warn('Continuing with Memory Bank initialization despite validation errors.');
        }
      } catch (rulesLoaderError) {
        console.warn('Error creating ExternalRulesLoader:', rulesLoaderError);
        console.warn('Continuing with Memory Bank initialization without rules loader.');
      }
      
      // Create the memory-bank directory in the provided directory
      const memoryBankPath = path.join(dirPath, 'memory-bank');
      try {
        await FileUtils.ensureDirectory(memoryBankPath);
      } catch (dirError) {
        console.error('Failed to create memory-bank directory:', dirError);
        throw new Error(`Failed to create memory-bank directory: ${dirError instanceof Error ? dirError.message : String(dirError)}`);
      }
      
      // Create all template files in English
      let templateErrors = [];
      for (const template of coreTemplates) {
        const filePath = path.join(memoryBankPath, template.name);
        if (!(await FileUtils.fileExists(filePath))) {
          try {
            await FileUtils.writeFile(filePath, template.content);
          } catch (writeError) {
            console.warn(`Failed to create template file ${template.name}:`, writeError);
            templateErrors.push(template.name);
          }
        }
      }
      
      if (templateErrors.length > 0) {
        console.warn(`Failed to create the following template files: ${templateErrors.join(', ')}`);
        console.warn('Continuing with Memory Bank initialization despite template creation errors.');
      }

      this.memoryBankDir = memoryBankPath;
      
      try {
        this.progressTracker = new ProgressTracker(memoryBankPath);
      } catch (progressTrackerError) {
        console.warn('Error creating ProgressTracker:', progressTrackerError);
        console.warn('Progress tracking may not be available.');
      }
      
      console.error(`Memory Bank initialized at ${memoryBankPath} (language: ${this.language})`);
    } catch (error) {
      console.error(`Failed to initialize Memory Bank:`, error);
      throw new Error(`Failed to initialize Memory Bank: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Reads a file from the Memory Bank
   * 
   * @param filename - Name of the file to read
   * @returns Content of the file
   * @throws Error if the Memory Bank directory is not set or the file doesn't exist
   */
  async readFile(filename: string): Promise<string> {
    try {
      if (!this.memoryBankDir) {
        throw new Error('Memory Bank directory not set');
      }
      
      const filePath = path.join(this.memoryBankDir, filename);
      if (!await FileUtils.fileExists(filePath)) {
        throw new Error(`File ${filename} not found in Memory Bank`);
      }
      
      return await FileUtils.readFile(filePath);
    } catch (error) {
      console.error(`Error reading file ${filename} from Memory Bank:`, error);
      throw new Error(`Error reading file ${filename} from Memory Bank: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Writes content to a file in the Memory Bank
   * 
   * @param filename - Name of the file to write
   * @param content - Content to write
   * @throws Error if the Memory Bank directory is not set
   */
  async writeFile(filename: string, content: string): Promise<void> {
    try {
      if (!this.memoryBankDir) {
        throw new Error('Memory Bank directory not set');
      }
      
      const filePath = path.join(this.memoryBankDir, filename);
      await FileUtils.writeFile(filePath, content);
      
      // Track progress if ProgressTracker is available
      if (this.progressTracker) {
        try {
          await this.progressTracker.trackProgress('File Update', {
            description: `Updated ${filename}`,
            filename,
          });
        } catch (progressError) {
          console.warn(`Failed to track progress for file update ${filename}:`, progressError);
          // Continue despite progress tracking error
        }
      }
    } catch (error) {
      console.error(`Error writing to file ${filename} in Memory Bank:`, error);
      throw new Error(`Error writing to file ${filename} in Memory Bank: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Lists files in the Memory Bank
   * 
   * @returns List of files
   * @throws Error if the Memory Bank directory is not set
   */
  async listFiles(): Promise<string[]> {
    try {
      if (!this.memoryBankDir) {
        throw new Error('Memory Bank directory not set');
      }
      
      const files = await FileUtils.listFiles(this.memoryBankDir);
      return files.filter(file => file.endsWith('.md'));
    } catch (error) {
      console.error('Error listing files in Memory Bank:', error);
      throw new Error(`Error listing files in Memory Bank: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets the status of the Memory Bank
   * 
   * @returns Status object with information about the Memory Bank
   * @throws Error if the Memory Bank directory is not set
   */
  async getStatus(): Promise<{
    path: string;
    files: string[];
    coreFilesPresent: string[];
    missingCoreFiles: string[];
    isComplete: boolean;
    language: string;
    lastUpdated?: Date;
  }> {
    try {
      if (!this.memoryBankDir) {
        throw new Error('Memory Bank directory not set');
      }
      
      const files = await this.listFiles();
      const coreFiles = coreTemplates.map(template => template.name);
      const missingCoreFiles = coreFiles.filter(file => !files.includes(file));
      
      // Get last update time
      let lastUpdated: Date | undefined;
      try {
        if (files.length > 0) {
          const stats = await Promise.all(
            files.map(async file => {
              try {
                const filePath = path.join(this.memoryBankDir!, file);
                return await FileUtils.getFileStats(filePath);
              } catch (statError) {
                console.warn(`Error getting stats for file ${file}:`, statError);
                // Return a default stat object with current time
                return {
                  mtimeMs: Date.now(),
                } as fs.Stats;
              }
            })
          );
          
          const latestMtime = Math.max(...stats.map(stat => stat.mtimeMs));
          lastUpdated = new Date(latestMtime);
        }
      } catch (statsError) {
        console.error('Error getting file stats:', statsError);
        // Continue without lastUpdated information
      }
      
      return {
        path: this.memoryBankDir,
        files,
        coreFilesPresent: coreFiles.filter(file => files.includes(file)),
        missingCoreFiles,
        isComplete: missingCoreFiles.length === 0,
        language: this.language,
        lastUpdated,
      };
    } catch (error) {
      console.error('Error getting Memory Bank status:', error);
      throw new Error(`Error getting Memory Bank status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Sets a custom path for the Memory Bank
   * 
   * If no path is provided, it will use the project path or current directory.
   * 
   * @param customPath - Custom path (optional)
   */
  setCustomPath(customPath?: string): void {
    this.customPath = customPath || this.getProjectPath();
  }

  /**
   * Gets the custom path for the Memory Bank
   * 
   * @returns Custom path or null if not set
   */
  getCustomPath(): string | null {
    return this.customPath;
  }

  /**
   * Gets the Memory Bank directory
   * 
   * @returns Memory Bank directory or null if not set
   */
  getMemoryBankDir(): string | null {
    return this.memoryBankDir;
  }

  /**
   * Sets the Memory Bank directory
   * 
   * @param dir - Memory Bank directory
   */
  setMemoryBankDir(dir: string): void {
    this.memoryBankDir = dir;
    this.progressTracker = new ProgressTracker(dir);
    
    // Ensure language is always English
    this.language = 'en';
    
    this.updateMemoryBankStatus();
  }

  /**
   * Gets the ProgressTracker
   * 
   * @returns ProgressTracker or null if not available
   */
  getProgressTracker(): ProgressTracker | null {
    return this.progressTracker;
  }
  
  /**
   * Creates a backup of the Memory Bank
   * 
   * @param backupDir - Directory where the backup will be stored
   * @returns Path to the backup directory
   * @throws Error if the Memory Bank directory is not set or backup fails
   */
  async createBackup(backupDir?: string): Promise<string> {
    if (!this.memoryBankDir) {
      throw new Error('Memory Bank directory not set');
    }
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = backupDir 
        ? path.join(backupDir, `memory-bank-backup-${timestamp}`)
        : path.join(path.dirname(this.memoryBankDir), `memory-bank-backup-${timestamp}`);
      
      await FileUtils.ensureDirectory(backupPath);
      
      const files = await this.listFiles();
      for (const file of files) {
        const content = await this.readFile(file);
        await FileUtils.writeFile(path.join(backupPath, file), content);
      }
      
      console.error(`Memory Bank backup created at ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('Error creating Memory Bank backup:', error);
      throw new Error(`Failed to create Memory Bank backup: ${error}`);
    }
  }

  /**
   * Initializes the mode manager
   * 
   * @param initialMode Initial mode to set (optional)
   * @returns Promise that resolves when initialization is complete
   */
  async initializeModeManager(initialMode?: string): Promise<void> {
    if (this.modeManager) {
      return; // Already initialized
    }
    
    try {
      // Load external rules
      const projectRoot = this.getProjectPath();
      this.rulesLoader = new ExternalRulesLoader(projectRoot);
      
      // Validate and create missing .clinerules files
      try {
        const validation = await this.rulesLoader.validateRequiredFiles();
        if (!validation.valid) {
          console.warn(`Warning: Some .clinerules files could not be created: ${validation.missingFiles.join(', ')}`);
          console.warn('Continuing with mode manager initialization despite missing .clinerules files.');
        }
      } catch (validationError) {
        console.warn('Error validating .clinerules files:', validationError);
        console.warn('Continuing with mode manager initialization despite validation errors.');
      }
      
      try {
        await this.rulesLoader.detectAndLoadRules();
      } catch (loadError) {
        console.warn('Error loading .clinerules files:', loadError);
        console.warn('Continuing with mode manager initialization despite loading errors.');
      }
      
      // Create mode manager
      this.modeManager = new ModeManager(this.rulesLoader);
      
      try {
        await this.modeManager.initialize(initialMode);
      } catch (modeError) {
        console.warn('Error initializing mode manager:', modeError);
        console.warn('Mode manager may not be fully functional.');
      }
      
      // Update Memory Bank status
      await this.updateMemoryBankStatus();
    } catch (error) {
      console.error('Error initializing mode manager:', error);
      console.warn('Continuing without mode manager functionality.');
      // Don't throw the error, just log it and continue
    }
  }

  /**
   * Gets the mode manager
   * 
   * @returns Mode manager or null if not initialized
   */
  getModeManager(): ModeManager | null {
    return this.modeManager;
  }

  /**
   * Updates the Memory Bank status in the mode manager
   */
  async updateMemoryBankStatus(): Promise<void> {
    if (this.modeManager) {
      let status: 'ACTIVE' | 'INACTIVE' = 'INACTIVE';
      
      if (this.memoryBankDir) {
        // Check if the directory is a valid Memory Bank
        const isValid = await this.isMemoryBank(this.memoryBankDir);
        if (isValid) {
          status = 'ACTIVE';
        }
      }
      
      this.modeManager.setMemoryBankStatus(status);
    }
  }

  /**
   * Gets the status prefix for responses
   * @returns Status prefix
   */
  getStatusPrefix(): string {
    if (this.modeManager) {
      return this.modeManager.getStatusPrefix();
    }
    return `[MEMORY BANK: ${this.memoryBankDir ? 'ACTIVE' : 'INACTIVE'}]`;
  }

  /**
   * Checks if a text matches the UMB trigger
   * @param text Text to be checked
   * @returns true if the text matches the UMB trigger, false otherwise
   */
  checkUmbTrigger(text: string): boolean {
    if (this.modeManager) {
      return this.modeManager.checkUmbTrigger(text);
    }
    return false;
  }

  /**
   * Activates UMB mode
   * 
   * @returns true if UMB mode was activated, false otherwise
   */
  activateUmbMode(): boolean {
    if (this.modeManager) {
      return this.modeManager.activateUmb();
    }
    return false;
  }

  /**
   * Deactivates UMB mode
   * 
   * @returns true if UMB mode was deactivated, false otherwise
   */
  async completeUmbMode(): Promise<boolean> {
    if (this.modeManager) {
      this.modeManager.deactivateUmb();
      return true;
    }
    return false;
  }

  /**
   * Checks if UMB mode is active
   * @returns true if UMB mode is active, false otherwise
   */
  isUmbModeActive(): boolean {
    if (this.modeManager) {
      return this.modeManager.isUmbModeActive();
    }
    return false;
  }

  /**
   * Alterna para um modo específico
   * @param mode Nome do modo
   * @returns true se a mudança foi bem-sucedida, false caso contrário
   */
  switchMode(mode: string): boolean {
    if (this.modeManager) {
      return this.modeManager.switchMode(mode);
    }
    return false;
  }

  /**
   * Checks if a text matches any mode trigger
   * @param text Text to be checked
   * @returns Array with modes corresponding to the triggers found
   */
  checkModeTriggers(text: string): string[] {
    if (this.modeManager) {
      return this.modeManager.checkModeTriggers(text);
    }
    return [];
  }

  /**
   * Detects mode triggers in a message
   * @param message Message to check for triggers
   * @returns Array with modes corresponding to the triggers found
   */
  detectModeTriggers(message: string): string[] {
    if (this.modeManager) {
      return this.modeManager.checkModeTriggers(message);
    }
    return [];
  }
}
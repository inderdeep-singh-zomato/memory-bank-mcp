import path from 'path';
import { FileUtils } from '../utils/FileUtils.js';
import { coreTemplates } from './templates/index.js';
import { ProgressTracker } from './ProgressTracker.js';
import { ModeManager } from '../utils/ModeManager.js';
import { ExternalRulesLoader } from '../utils/ExternalRulesLoader.js';

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

  /**
   * Creates a new MemoryBankManager instance
   */
  constructor() {}

  /**
   * Finds a Memory Bank directory
   * 
   * Searches for a Memory Bank directory starting from the specified directory.
   * If a custom path is provided, it will check that path first.
   * 
   * @param startDir - Starting directory for the search
   * @param customPath - Optional custom path to check
   * @returns Path to the Memory Bank directory or null if not found
   */
  async findMemoryBankDir(startDir: string, customPath?: string): Promise<string | null> {
    // If a custom path is provided, check if it's a valid Memory Bank
    if (customPath) {
      const fullPath = path.resolve(startDir, customPath);
      if (await FileUtils.fileExists(fullPath) && await this.isMemoryBank(fullPath)) {
        return fullPath;
      }
      
      // If the custom path is not a Memory Bank, check if it contains a memory-bank subdirectory
      if (await FileUtils.fileExists(fullPath) && await FileUtils.isDirectory(fullPath)) {
        const mbSubDir = path.join(fullPath, 'memory-bank');
        if (await FileUtils.fileExists(mbSubDir) && await this.isMemoryBank(mbSubDir)) {
          return mbSubDir;
        }
      }
    }

    // Check if the current directory contains a Memory Bank
    const mbDir = path.join(startDir, 'memory-bank');
    if (await FileUtils.fileExists(mbDir) && await this.isMemoryBank(mbDir)) {
      return mbDir;
    }

    // Check if any subdirectory contains a Memory Bank
    try {
      const entries = await FileUtils.listFiles(startDir);
      for (const entry of entries) {
        const subDir = path.join(startDir, entry);
        if (
          await FileUtils.isDirectory(subDir) &&
          !entry.startsWith('.') &&
          entry !== 'node_modules'
        ) {
          const mbSubDir = path.join(subDir, 'memory-bank');
          if (await FileUtils.fileExists(mbSubDir) && await this.isMemoryBank(mbSubDir)) {
            return mbSubDir;
          }
        }
      }
    } catch (error) {
      console.error('Error searching for Memory Bank:', error);
    }

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
      const coreFiles = [
        'productContext.md',
        'activeContext.md',
        'progress.md',
        'decisionLog.md',
      ];
      return coreFiles.some(file => files.includes(file));
    } catch (error) {
      console.error(`Error checking if ${dirPath} is a Memory Bank:`, error);
      return false;
    }
  }

  /**
   * Initializes a new Memory Bank
   * 
   * Creates a new Memory Bank directory with all required template files.
   * 
   * @param dirPath - Directory path where the Memory Bank will be created
   * @throws Error if initialization fails
   */
  async initializeMemoryBank(dirPath: string): Promise<void> {
    try {
      await FileUtils.ensureDirectory(dirPath);
      
      for (const template of coreTemplates) {
        const filePath = path.join(dirPath, template.name);
        if (!(await FileUtils.fileExists(filePath))) {
          await FileUtils.writeFile(filePath, template.content);
        }
      }

      this.memoryBankDir = dirPath;
      this.progressTracker = new ProgressTracker(dirPath);
      
      console.error(`Memory Bank initialized at ${dirPath}`);
    } catch (error) {
      console.error(`Failed to initialize Memory Bank at ${dirPath}:`, error);
      throw new Error(`Failed to initialize Memory Bank: ${error}`);
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
    if (!this.memoryBankDir) {
      throw new Error('Memory Bank directory not set');
    }
    
    const filePath = path.join(this.memoryBankDir, filename);
    if (!await FileUtils.fileExists(filePath)) {
      throw new Error(`File ${filename} not found in Memory Bank`);
    }
    
    return FileUtils.readFile(filePath);
  }

  /**
   * Writes content to a file in the Memory Bank
   * 
   * @param filename - Name of the file to write
   * @param content - Content to write
   * @throws Error if the Memory Bank directory is not set
   */
  async writeFile(filename: string, content: string): Promise<void> {
    if (!this.memoryBankDir) {
      throw new Error('Memory Bank directory not set');
    }
    
    const filePath = path.join(this.memoryBankDir, filename);
    await FileUtils.writeFile(filePath, content);
    
    // Track progress if ProgressTracker is available
    if (this.progressTracker) {
      await this.progressTracker.trackProgress('File Update', {
        description: `Updated ${filename}`,
      });
    }
  }

  /**
   * Lists files in the Memory Bank
   * 
   * @returns List of files
   * @throws Error if the Memory Bank directory is not set
   */
  async listFiles(): Promise<string[]> {
    if (!this.memoryBankDir) {
      throw new Error('Memory Bank directory not set');
    }
    
    const files = await FileUtils.listFiles(this.memoryBankDir);
    return files.filter(file => file.endsWith('.md'));
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
    lastUpdated?: Date;
  }> {
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
            const filePath = path.join(this.memoryBankDir!, file);
            return await FileUtils.getFileStats(filePath);
          })
        );
        
        const latestMtime = Math.max(...stats.map(stat => stat.mtimeMs));
        lastUpdated = new Date(latestMtime);
      }
    } catch (error) {
      console.error('Error getting file stats:', error);
    }
    
    return {
      path: this.memoryBankDir,
      files,
      coreFilesPresent: coreFiles.filter(file => files.includes(file)),
      missingCoreFiles,
      isComplete: missingCoreFiles.length === 0,
      lastUpdated,
    };
  }

  /**
   * Sets a custom path for the Memory Bank
   * 
   * @param customPath - Custom path
   */
  setCustomPath(customPath: string): void {
    this.customPath = customPath;
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
   * Inicializa o gerenciador de modos
   * @param initialMode Modo inicial (opcional)
   */
  async initializeModeManager(initialMode?: string): Promise<void> {
    if (!this.rulesLoader) {
      this.rulesLoader = new ExternalRulesLoader(process.cwd());
    }
    
    if (!this.modeManager) {
      this.modeManager = new ModeManager(this.rulesLoader);
    }
    
    await this.modeManager.initialize(initialMode);
    
    // Atualizar o status do Memory Bank
    this.updateMemoryBankStatus();
  }

  /**
   * Obtém o gerenciador de modos
   * @returns Gerenciador de modos ou null se não inicializado
   */
  getModeManager(): ModeManager | null {
    return this.modeManager;
  }

  /**
   * Atualiza o status do Memory Bank no gerenciador de modos
   */
  updateMemoryBankStatus(): void {
    if (this.modeManager) {
      const status = this.memoryBankDir ? 'ACTIVE' : 'INACTIVE';
      this.modeManager.setMemoryBankStatus(status);
    }
  }

  /**
   * Obtém o prefixo de status para respostas
   * @returns Prefixo de status
   */
  getStatusPrefix(): string {
    if (this.modeManager) {
      return this.modeManager.getStatusPrefix();
    }
    return `[MEMORY BANK: ${this.memoryBankDir ? 'ACTIVE' : 'INACTIVE'}]`;
  }

  /**
   * Verifica se um texto corresponde ao gatilho UMB
   * @param text Texto a ser verificado
   * @returns true se o texto corresponder ao gatilho UMB, false caso contrário
   */
  checkUmbTrigger(text: string): boolean {
    if (this.modeManager) {
      return this.modeManager.checkUmbTrigger(text);
    }
    return false;
  }

  /**
   * Ativa o modo UMB
   * @returns true se a ativação foi bem-sucedida, false caso contrário
   */
  activateUmb(): boolean {
    if (this.modeManager) {
      return this.modeManager.activateUmb();
    }
    return false;
  }

  /**
   * Desativa o modo UMB
   */
  deactivateUmb(): void {
    if (this.modeManager) {
      this.modeManager.deactivateUmb();
    }
  }

  /**
   * Verifica se o modo UMB está ativo
   * @returns true se o modo UMB estiver ativo, false caso contrário
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
   * Verifica se um texto corresponde a algum gatilho de modo
   * @param text Texto a ser verificado
   * @returns Array com os modos correspondentes aos gatilhos encontrados
   */
  checkModeTriggers(text: string): string[] {
    if (this.modeManager) {
      return this.modeManager.checkModeTriggers(text);
    }
    return [];
  }
}
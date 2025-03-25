import { MemoryBankStatus } from '../../types/index.js';

/**
 * Interface for storage providers
 * This abstracts the storage operations to support different storage backends
 */
export interface StorageProvider {
  /**
   * Initialize the storage provider
   * @param config Configuration object for the storage provider
   */
  initialize(config: any): Promise<void>;

  /**
   * Check if a path exists
   * @param path Path to check
   */
  exists(path: string): Promise<boolean>;

  /**
   * Create a directory
   * @param path Path to create
   */
  createDirectory(path: string): Promise<void>;

  /**
   * Read a file
   * @param path Path to read
   */
  readFile(path: string): Promise<string>;

  /**
   * Write a file
   * @param path Path to write
   * @param content Content to write
   */
  writeFile(path: string, content: string): Promise<void>;

  /**
   * List files in a directory
   * @param path Path to list
   */
  listFiles(path: string): Promise<string[]>;

  /**
   * Get file stats
   * @param path Path to get stats for
   */
  getFileStats(path: string): Promise<{ mtimeMs: number }>;

  /**
   * Get Memory Bank status
   * @param path Path to Memory Bank
   */
  getStatus(path: string): Promise<MemoryBankStatus>;

  /**
   * Create a backup
   * @param sourcePath Source path to backup
   * @param backupPath Path to store backup
   */
  createBackup(sourcePath: string, backupPath: string): Promise<void>;
} 
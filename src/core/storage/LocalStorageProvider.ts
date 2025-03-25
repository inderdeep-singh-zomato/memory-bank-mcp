import { StorageProvider } from './StorageProvider.js';
import { MemoryBankStatus } from '../../types/index.js';
import { FileUtils } from '../../utils/FileUtils.js';
import { logger } from '../../utils/LogManager.js';
import fs from 'fs';
import path from 'path';

export class LocalStorageProvider implements StorageProvider {
  async initialize(config: any): Promise<void> {
    // No initialization needed for local storage
  }

  async exists(path: string): Promise<boolean> {
    try {
      return await FileUtils.fileExists(path);
    } catch (error) {
      logger.error('LocalStorageProvider', `Error checking if path exists: ${error}`);
      return false;
    }
  }

  async createDirectory(path: string): Promise<void> {
    try {
      await FileUtils.ensureDirectory(path);
      logger.debug('LocalStorageProvider', `Created directory: ${path}`);
    } catch (error) {
      logger.error('LocalStorageProvider', `Error creating directory: ${error}`);
      throw error;
    }
  }

  async readFile(path: string): Promise<string> {
    try {
      return await FileUtils.readFile(path);
    } catch (error) {
      logger.error('LocalStorageProvider', `Error reading file: ${error}`);
      throw error;
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    try {
      await FileUtils.writeFile(path, content);
      logger.debug('LocalStorageProvider', `Wrote file: ${path}`);
    } catch (error) {
      logger.error('LocalStorageProvider', `Error writing file: ${error}`);
      throw error;
    }
  }

  async listFiles(path: string): Promise<string[]> {
    try {
      return await FileUtils.listFiles(path);
    } catch (error) {
      logger.error('LocalStorageProvider', `Error listing files: ${error}`);
      throw error;
    }
  }

  async getFileStats(path: string): Promise<{ mtimeMs: number }> {
    try {
      const stats = await FileUtils.getFileStats(path);
      return { mtimeMs: stats.mtimeMs };
    } catch (error) {
      logger.error('LocalStorageProvider', `Error getting file stats: ${error}`);
      throw error;
    }
  }

  async getStatus(path: string): Promise<MemoryBankStatus> {
    try {
      const files = await this.listFiles(path);
      const coreFiles = [
        'product-context.md',
        'active-context.md',
        'progress.md',
        'decision-log.md',
        'system-patterns.md'
      ];
      
      const missingCoreFiles = coreFiles.filter(file => !files.includes(file));
      const coreFilesPresent = coreFiles.filter(file => files.includes(file));
      
      let lastUpdated: Date | undefined;
      if (files.length > 0) {
        const stats = await Promise.all(
          files.map(file => this.getFileStats(path + '/' + file))
        );
        const latestMtime = Math.max(...stats.map(stat => stat.mtimeMs));
        lastUpdated = new Date(latestMtime);
      }

      return {
        path,
        files,
        coreFilesPresent,
        missingCoreFiles,
        isComplete: missingCoreFiles.length === 0,
        language: 'en',
        lastUpdated
      };
    } catch (error) {
      logger.error('LocalStorageProvider', `Error getting status: ${error}`);
      throw error;
    }
  }

  async createBackup(sourcePath: string, backupPath: string): Promise<void> {
    try {
      await this.createDirectory(backupPath);
      
      const files = await this.listFiles(sourcePath);
      for (const file of files) {
        const content = await this.readFile(path.join(sourcePath, file));
        await this.writeFile(path.join(backupPath, file), content);
      }
      
      logger.debug('LocalStorageProvider', `Created backup at: ${backupPath}`);
    } catch (error) {
      logger.error('LocalStorageProvider', `Error creating backup: ${error}`);
      throw error;
    }
  }
} 
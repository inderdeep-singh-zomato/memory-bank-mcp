import Client from 'ssh2-sftp-client';
import { StorageProvider } from './StorageProvider.js';
import { MemoryBankStatus } from '../../types/index.js';
import { logger } from '../../utils/LogManager.js';

export interface SftpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  basePath: string;
}

export class SftpStorageProvider implements StorageProvider {
  private client: Client;
  private config: SftpConfig;
  private connected: boolean = false;

  constructor(config: SftpConfig) {
    this.config = config;
    this.client = new Client();
  }

  async initialize(config: SftpConfig): Promise<void> {
    this.config = config;
    await this.ensureConnection();
  }

  private async ensureConnection(): Promise<void> {
    if (!this.connected) {
      try {
        await this.client.connect({
          host: this.config.host,
          port: this.config.port,
          username: this.config.username,
          password: this.config.password,
        });
        this.connected = true;
        logger.debug('SftpStorageProvider', 'Connected to SFTP server');
      } catch (error) {
        logger.error('SftpStorageProvider', `Failed to connect to SFTP server: ${error}`);
        throw error;
      }
    }
  }

  private getSftpPath(localPath: string): string {
    // If the path starts with the base path, use it as is
    if (localPath.startsWith(this.config.basePath)) {
      return localPath;
    }

    // If the path contains the base path, extract everything after it
    const basePathIndex = localPath.indexOf(this.config.basePath);
    if (basePathIndex !== -1) {
      return localPath.substring(basePathIndex);
    }

    // Otherwise, just use the base path
    return this.config.basePath;
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      const sftpPath = this.getSftpPath(path);
      return await this.client.exists(sftpPath);
    } catch (error) {
      logger.error('SftpStorageProvider', `Error checking if path exists: ${error}`);
      throw error;
    }
  }

  async createDirectory(path: string): Promise<void> {
    try {
      await this.ensureConnection();
      const sftpPath = this.getSftpPath(path);
      await this.client.mkdir(sftpPath, true);
      logger.debug('SftpStorageProvider', `Created directory: ${sftpPath}`);
    } catch (error) {
      logger.error('SftpStorageProvider', `Error creating directory: ${error}`);
      throw error;
    }
  }

  async readFile(path: string): Promise<string> {
    try {
      await this.ensureConnection();
      const sftpPath = this.getSftpPath(path);
      const buffer = await this.client.get(sftpPath);
      return buffer.toString('utf-8');
    } catch (error) {
      logger.error('SftpStorageProvider', `Error reading file: ${error}`);
      throw error;
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    try {
      await this.ensureConnection();
      const sftpPath = this.getSftpPath(path);
      const buffer = Buffer.from(content, 'utf-8');
      await this.client.put(buffer, sftpPath);
      logger.debug('SftpStorageProvider', `Wrote file: ${sftpPath}`);
    } catch (error) {
      logger.error('SftpStorageProvider', `Error writing file: ${error}`);
      throw error;
    }
  }

  async listFiles(path: string): Promise<string[]> {
    try {
      await this.ensureConnection();
      const sftpPath = this.getSftpPath(path);
      const list = await this.client.list(sftpPath);
      return list.map((item: { name: string }) => item.name);
    } catch (error) {
      logger.error('SftpStorageProvider', `Error listing files: ${error}`);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      await this.ensureConnection();
      const sftpPath = this.getSftpPath(path);
      await this.client.delete(sftpPath);
      logger.debug('SftpStorageProvider', `Deleted file: ${sftpPath}`);
    } catch (error) {
      logger.error('SftpStorageProvider', `Error deleting file: ${error}`);
      throw error;
    }
  }

  async deleteDirectory(path: string): Promise<void> {
    try {
      await this.ensureConnection();
      const sftpPath = this.getSftpPath(path);
      await this.client.rmdir(sftpPath, true);
      logger.debug('SftpStorageProvider', `Deleted directory: ${sftpPath}`);
    } catch (error) {
      logger.error('SftpStorageProvider', `Error deleting directory: ${error}`);
      throw error;
    }
  }

  async getFileStats(path: string): Promise<{ mtimeMs: number }> {
    try {
      await this.ensureConnection();
      const sftpPath = this.getSftpPath(path);
      const stats = await this.client.stat(sftpPath);
      return { mtimeMs: stats.mtime * 1000 };
    } catch (error) {
      logger.error('SftpStorageProvider', `Error getting file stats: ${error}`);
      throw error;
    }
  }

  async getStatus(path: string): Promise<MemoryBankStatus> {
    try {
      await this.ensureConnection();
      const sftpPath = this.getSftpPath(path);
      const files = await this.listFiles(sftpPath);
      
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
        const stats = await this.client.stat(sftpPath);
        lastUpdated = new Date(stats.mtime * 1000);
      }

      return {
        path: sftpPath,
        files,
        coreFilesPresent,
        missingCoreFiles,
        isComplete: missingCoreFiles.length === 0,
        language: 'en',
        lastUpdated
      };
    } catch (error) {
      logger.error('SftpStorageProvider', `Error getting status: ${error}`);
      throw error;
    }
  }

  async createBackup(sourcePath: string, backupPath: string): Promise<void> {
    try {
      await this.ensureConnection();
      const sourceSftpPath = this.getSftpPath(sourcePath);
      const backupSftpPath = this.getSftpPath(backupPath);

      // Create backup directory
      await this.client.mkdir(backupSftpPath, true);

      // List all files in source directory
      const files = await this.client.list(sourceSftpPath);

      // Copy each file
      for (const file of files) {
        const sourceFile = `${sourceSftpPath}/${file.name}`;
        const backupFile = `${backupSftpPath}/${file.name}`;

        if (file.type === 'd') {
          // Recursively backup directories
          await this.createBackup(sourceFile, backupFile);
        } else {
          // Copy files
          const buffer = await this.client.get(sourceFile);
          await this.client.put(buffer, backupFile);
        }
      }

      logger.debug('SftpStorageProvider', `Created backup at: ${backupSftpPath}`);
    } catch (error) {
      logger.error('SftpStorageProvider', `Error creating backup: ${error}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      try {
        await this.client.end();
        this.connected = false;
        logger.debug('SftpStorageProvider', 'Disconnected from SFTP server');
      } catch (error) {
        logger.error('SftpStorageProvider', `Error disconnecting from SFTP server: ${error}`);
        throw error;
      }
    }
  }
} 
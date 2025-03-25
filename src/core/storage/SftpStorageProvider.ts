import SftpClient from 'ssh2-sftp-client';
import { StorageProvider } from './StorageProvider.js';
import { MemoryBankStatus } from '../../types/index.js';
import { logger } from '../../utils/LogManager.js';

interface SftpConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  basePath: string;
}

export class SftpStorageProvider implements StorageProvider {
  private client: SftpClient;
  private config: SftpConfig;
  private connected: boolean = false;

  constructor(config: SftpConfig) {
    this.client = new SftpClient();
    this.config = config;
  }

  async initialize(config: SftpConfig): Promise<void> {
    this.config = config;
    await this.connect();
  }

  private async connect(): Promise<void> {
    if (this.connected) return;

    try {
      await this.client.connect({
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
        password: this.config.password,
        privateKey: this.config.privateKey,
      });
      this.connected = true;
      logger.debug('SftpStorageProvider', 'Connected to SFTP server');
    } catch (error) {
      logger.error('SftpStorageProvider', `Failed to connect to SFTP server: ${error}`);
      throw error;
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }
  }

  async exists(path: string): Promise<boolean> {
    await this.ensureConnected();
    try {
      const fullPath = this.getFullPath(path);
      const stats = await this.client.stat(fullPath);
      return stats !== null;
    } catch (error) {
      return false;
    }
  }

  async createDirectory(path: string): Promise<void> {
    await this.ensureConnected();
    try {
      const fullPath = this.getFullPath(path);
      await this.client.mkdir(fullPath, true);
      logger.debug('SftpStorageProvider', `Created directory: ${fullPath}`);
    } catch (error) {
      logger.error('SftpStorageProvider', `Failed to create directory: ${error}`);
      throw error;
    }
  }

  async readFile(path: string): Promise<string> {
    await this.ensureConnected();
    try {
      const fullPath = this.getFullPath(path);
      const buffer = await this.client.get(fullPath);
      return buffer.toString('utf-8');
    } catch (error) {
      logger.error('SftpStorageProvider', `Failed to read file: ${error}`);
      throw error;
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    await this.ensureConnected();
    try {
      const fullPath = this.getFullPath(path);
      await this.client.put(Buffer.from(content, 'utf-8'), fullPath);
      logger.debug('SftpStorageProvider', `Wrote file: ${fullPath}`);
    } catch (error) {
      logger.error('SftpStorageProvider', `Failed to write file: ${error}`);
      throw error;
    }
  }

  async listFiles(path: string): Promise<string[]> {
    await this.ensureConnected();
    try {
      const fullPath = this.getFullPath(path);
      const list = await this.client.list(fullPath);
      return list.map(item => item.name);
    } catch (error) {
      logger.error('SftpStorageProvider', `Failed to list files: ${error}`);
      throw error;
    }
  }

  async getFileStats(path: string): Promise<{ mtimeMs: number }> {
    await this.ensureConnected();
    try {
      const fullPath = this.getFullPath(path);
      const stats = await this.client.stat(fullPath);
      return { mtimeMs: stats.mtime * 1000 };
    } catch (error) {
      logger.error('SftpStorageProvider', `Failed to get file stats: ${error}`);
      throw error;
    }
  }

  async getStatus(path: string): Promise<MemoryBankStatus> {
    try {
      await this.ensureConnected();
      const fullPath = this.getFullPath(path);
      const files = await this.listFiles(fullPath);
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
        const stats = await this.client.stat(fullPath);
        lastUpdated = new Date(stats.modifyTime || 0);
      }

      return {
        path: fullPath,
        files,
        coreFilesPresent,
        missingCoreFiles,
        isComplete: missingCoreFiles.length === 0,
        language: 'en',
        lastUpdated
      };
    } catch (error) {
      logger.error('SftpStorageProvider', `Failed to get status: ${error}`);
      throw error;
    }
  }

  async createBackup(sourcePath: string, backupPath: string): Promise<void> {
    await this.ensureConnected();
    try {
      const fullSourcePath = this.getFullPath(sourcePath);
      const fullBackupPath = this.getFullPath(backupPath);
      
      // Create backup directory
      await this.createDirectory(fullBackupPath);
      
      // Copy all files from source to backup
      const files = await this.listFiles(fullSourcePath);
      for (const file of files) {
        const sourceFile = `${fullSourcePath}/${file}`;
        const backupFile = `${fullBackupPath}/${file}`;
        const content = await this.readFile(sourceFile);
        await this.writeFile(backupFile, content);
      }
      
      logger.debug('SftpStorageProvider', `Created backup at: ${fullBackupPath}`);
    } catch (error) {
      logger.error('SftpStorageProvider', `Failed to create backup: ${error}`);
      throw error;
    }
  }

  private getFullPath(path: string): string {
    const cleanBasePath = this.config.basePath.replace(/^\/+|\/+$/g, '');
    const cleanPath = path.replace(/^\/+|\/+$/g, '');

    // If the path is empty, return just the base path
    if (!cleanPath) {
      return `/${cleanBasePath}`;
    }

    // If the path already starts with the base path, don't add it again
    if (cleanPath.startsWith(cleanBasePath)) {
      return `/${cleanPath}`;
    }

    // Combine the paths
    return `/${cleanBasePath}/${cleanPath}`;
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.end();
      this.connected = false;
      logger.debug('SftpStorageProvider', 'Disconnected from SFTP server');
    }
  }
} 
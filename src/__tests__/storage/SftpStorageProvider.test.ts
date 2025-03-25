import { SftpStorageProvider } from '../../core/storage/SftpStorageProvider.js';
import Client from 'ssh2-sftp-client';
import { expect, test, describe, beforeEach, mock } from 'bun:test';

describe('SftpStorageProvider Tests', () => {
  let sftpProvider: SftpStorageProvider;
  let mockClient: any;

  beforeEach(() => {
    // Mock the SFTP client
    mockClient = {
      exists: mock(() => Promise.resolve(false)),
      list: mock(() => Promise.resolve([])),
      get: mock(() => Promise.resolve(Buffer.from('test'))),
      put: mock(() => Promise.resolve()),
      mkdir: mock(() => Promise.resolve()),
      rmdir: mock(() => Promise.resolve()),
      delete: mock(() => Promise.resolve()),
      end: mock(() => Promise.resolve()),
      connect: mock(() => Promise.resolve()),
      stat: mock(() => Promise.resolve({ size: 0, mtime: new Date() })),
    };

    mock.module('ssh2-sftp-client', () => ({
      default: () => mockClient
    }));

    sftpProvider = new SftpStorageProvider({
      host: 'test-host',
      port: 22,
      username: 'test-user',
      password: 'test-password',
      basePath: 'sftp/memory-bank'
    });
  });

  describe('Path Handling', () => {
    test('should handle paths correctly for SFTP server', async () => {
      const localPath = '/Users/theidsingh/Documents/ZomatoProject/zomato-ios/memory-bank';
      const expectedSftpPath = 'sftp/memory-bank';

      // Test directory creation
      await sftpProvider.createDirectory(expectedSftpPath);
      expect(mockClient.mkdir.mock.calls[0][0]).toBe(expectedSftpPath);

      // Test file operations
      const testFile = 'test.md';
      const testContent = 'Test content';
      const expectedFilePath = `${expectedSftpPath}/${testFile}`;

      await sftpProvider.writeFile(expectedFilePath, testContent);
      expect(mockClient.put.mock.calls[0][1]).toBe(expectedFilePath);

      await sftpProvider.readFile(expectedFilePath);
      expect(mockClient.get.mock.calls[0][0]).toBe(expectedFilePath);

      // Test listing files
      await sftpProvider.listFiles(expectedSftpPath);
      expect(mockClient.list.mock.calls[0][0]).toBe(expectedSftpPath);
    });

    test('should not include local project path in SFTP paths', async () => {
      const localProjectPath = '/Users/theidsingh/Documents/ZomatoProject/zomato-ios';
      const expectedSftpPath = 'sftp/memory-bank';

      // Test that the path is not affected by local project path
      await sftpProvider.createDirectory(expectedSftpPath);
      expect(mockClient.mkdir.mock.calls[0][0]).toBe(expectedSftpPath);

      // Test file operations with local project path
      const testFile = 'test.md';
      const testContent = 'Test content';
      const filePathWithLocalPath = `${localProjectPath}/${expectedSftpPath}/${testFile}`;
      const expectedFilePath = `${expectedSftpPath}/${testFile}`;

      await sftpProvider.writeFile(filePathWithLocalPath, testContent);
      expect(mockClient.put.mock.calls[0][1]).toBe(expectedFilePath);

      await sftpProvider.readFile(filePathWithLocalPath);
      expect(mockClient.get.mock.calls[0][0]).toBe(expectedFilePath);
    });

    test('should handle backup paths correctly', async () => {
      const sourcePath = '/Users/theidsingh/Documents/ZomatoProject/zomato-ios/memory-bank';
      const backupPath = '/Users/theidsingh/Documents/ZomatoProject/zomato-ios/memory-bank-backup';
      const expectedSourcePath = 'sftp/memory-bank';
      const expectedBackupPath = 'sftp/memory-bank-backup';

      // Test backup creation
      await sftpProvider.createBackup(sourcePath, backupPath);
      expect(mockClient.mkdir.mock.calls[0][0]).toBe(expectedBackupPath);
      expect(mockClient.list.mock.calls[0][0]).toBe(expectedSourcePath);
    });
  });
}); 
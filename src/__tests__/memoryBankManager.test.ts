import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { MemoryBankManager } from '../core/MemoryBankManager.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('MemoryBankManager Tests', () => {
  const tempDir = path.join(__dirname, 'temp-memorybank-test-dir');
  const memoryBankDir = path.join(tempDir, 'memory-bank');
  let memoryBankManager: MemoryBankManager;
  
  beforeEach(async () => {
    // Create temporary directory
    await fs.ensureDir(tempDir);
    
    // Create a new MemoryBankManager for each test
    memoryBankManager = new MemoryBankManager();
  });
  
  afterEach(async () => {
    // Clean up
    await fs.remove(tempDir);
  });
  
  test('Should set and get Memory Bank directory', () => {
    // Set Memory Bank directory
    memoryBankManager.setMemoryBankDir(memoryBankDir);
    
    // Get Memory Bank directory
    const dir = memoryBankManager.getMemoryBankDir();
    
    // Verify
    expect(dir).toBe(memoryBankDir);
  });
  
  test('Should set and get custom path', () => {
    // Set custom path
    const customPath = path.join(tempDir, 'custom-path');
    memoryBankManager.setCustomPath(customPath);
    
    // Get custom path
    const customPathResult = memoryBankManager.getCustomPath();
    
    // Verify
    expect(customPathResult).toBe(customPath);
  });
  
  test('Should check if directory is a Memory Bank', async () => {
    // Create Memory Bank directory
    await fs.ensureDir(memoryBankDir);
    
    // Create core files
    await fs.writeFile(path.join(memoryBankDir, 'product-context.md'), '# Product Context');
    await fs.writeFile(path.join(memoryBankDir, 'active-context.md'), '# Active Context');
    await fs.writeFile(path.join(memoryBankDir, 'progress.md'), '# Progress');
    await fs.writeFile(path.join(memoryBankDir, 'decision-log.md'), '# Decision Log');
    await fs.writeFile(path.join(memoryBankDir, 'system-patterns.md'), '# System Patterns');
    
    // Check if directory is a Memory Bank
    const isMemoryBank = await memoryBankManager.isMemoryBank(memoryBankDir);
    
    // Verify
    expect(isMemoryBank).toBe(true);
    
    // Check if non-Memory Bank directory is not a Memory Bank
    const nonMemoryBankDir = path.join(tempDir, 'non-memory-bank');
    await fs.ensureDir(nonMemoryBankDir);
    
    const isNonMemoryBank = await memoryBankManager.isMemoryBank(nonMemoryBankDir);
    
    // Verify
    expect(isNonMemoryBank).toBe(false);
  });
  
  test('Should find Memory Bank directory', async () => {
    // Create Memory Bank directory
    await fs.ensureDir(memoryBankDir);
    
    // Create core files
    await fs.writeFile(path.join(memoryBankDir, 'product-context.md'), '# Product Context');
    await fs.writeFile(path.join(memoryBankDir, 'active-context.md'), '# Active Context');
    await fs.writeFile(path.join(memoryBankDir, 'progress.md'), '# Progress');
    await fs.writeFile(path.join(memoryBankDir, 'decision-log.md'), '# Decision Log');
    await fs.writeFile(path.join(memoryBankDir, 'system-patterns.md'), '# System Patterns');
    
    // Find Memory Bank directory
    const foundDir = await memoryBankManager.findMemoryBankDir(tempDir);
    
    // Verify
    expect(foundDir).toBe(memoryBankDir);
    
    // Try to find Memory Bank directory in a directory without a Memory Bank
    const nonMemoryBankDir = path.join(tempDir, 'non-memory-bank');
    await fs.ensureDir(nonMemoryBankDir);
    
    const notFoundDir = await memoryBankManager.findMemoryBankDir(nonMemoryBankDir);
    
    // Verify
    expect(notFoundDir).toBeNull();
  });
  
  test('Should initialize Memory Bank', async () => {
    // Initialize Memory Bank
    await memoryBankManager.initializeMemoryBank(memoryBankDir);
    
    // Verify Memory Bank directory was created
    const dirExists = await fs.pathExists(memoryBankDir);
    expect(dirExists).toBe(true);
    
    // Verify core files were created
    const productContextExists = await fs.pathExists(path.join(memoryBankDir, 'product-context.md'));
    expect(productContextExists).toBe(true);
    
    const activeContextExists = await fs.pathExists(path.join(memoryBankDir, 'active-context.md'));
    expect(activeContextExists).toBe(true);
    
    const progressExists = await fs.pathExists(path.join(memoryBankDir, 'progress.md'));
    expect(progressExists).toBe(true);
    
    const decisionLogExists = await fs.pathExists(path.join(memoryBankDir, 'decision-log.md'));
    expect(decisionLogExists).toBe(true);
    
    const systemPatternsExists = await fs.pathExists(path.join(memoryBankDir, 'system-patterns.md'));
    expect(systemPatternsExists).toBe(true);
    
    // Verify Memory Bank directory was set
    const dir = memoryBankManager.getMemoryBankDir();
    expect(dir).toBe(memoryBankDir);
    
    // Verify ProgressTracker was created
    const progressTracker = memoryBankManager.getProgressTracker();
    expect(progressTracker).not.toBeNull();
  });
  
  test('Should read file from Memory Bank', async () => {
    // Create Memory Bank directory
    await fs.ensureDir(memoryBankDir);
    
    // Set Memory Bank directory
    memoryBankManager.setMemoryBankDir(memoryBankDir);
    
    // Create a test file
    const testContent = '# Test Content';
    const testFileName = 'test-file.md';
    await fs.writeFile(path.join(memoryBankDir, testFileName), testContent);
    
    // Read file
    const content = await memoryBankManager.readFile(testFileName);
    
    // Verify
    expect(content).toBe(testContent);
  });
  
  test('Should write file to Memory Bank', async () => {
    // Create Memory Bank directory with required files
    await fs.ensureDir(memoryBankDir);
    await fs.writeFile(path.join(memoryBankDir, 'progress.md'), '# Progress');
    await fs.writeFile(path.join(memoryBankDir, 'active-context.md'), '# Active Context');
    
    // Set Memory Bank directory
    memoryBankManager.setMemoryBankDir(memoryBankDir);
    
    // Write file
    const testContent = '# Test Content';
    const testFileName = 'test-file.md';
    await memoryBankManager.writeFile(testFileName, testContent);
    
    // Verify file was written
    const filePath = path.join(memoryBankDir, testFileName);
    const exists = await fs.pathExists(filePath);
    expect(exists).toBe(true);
    
    // Verify content
    const content = await fs.readFile(filePath, 'utf8');
    expect(content).toBe(testContent);
  });
  
  test('Should list files in Memory Bank', async () => {
    // Create Memory Bank directory
    await fs.ensureDir(memoryBankDir);
    
    // Set Memory Bank directory
    memoryBankManager.setMemoryBankDir(memoryBankDir);
    
    // Create test files
    await fs.writeFile(path.join(memoryBankDir, 'file1.md'), 'Content 1');
    await fs.writeFile(path.join(memoryBankDir, 'file2.md'), 'Content 2');
    await fs.writeFile(path.join(memoryBankDir, 'file3.md'), 'Content 3');
    
    // List files
    const files = await memoryBankManager.listFiles();
    
    // Verify
    expect(files.length).toBe(3);
    expect(files).toContain('file1.md');
    expect(files).toContain('file2.md');
    expect(files).toContain('file3.md');
  });
  
  test('Should get Memory Bank status', async () => {
    // Create Memory Bank directory
    await fs.ensureDir(memoryBankDir);
    
    // Create core files
    await fs.writeFile(path.join(memoryBankDir, 'product-context.md'), '# Product Context');
    await fs.writeFile(path.join(memoryBankDir, 'active-context.md'), '# Active Context');
    await fs.writeFile(path.join(memoryBankDir, 'progress.md'), '# Progress');
    await fs.writeFile(path.join(memoryBankDir, 'decision-log.md'), '# Decision Log');
    await fs.writeFile(path.join(memoryBankDir, 'system-patterns.md'), '# System Patterns');
    
    // Set Memory Bank directory
    memoryBankManager.setMemoryBankDir(memoryBankDir);
    
    // Get status
    const status = await memoryBankManager.getStatus();
    
    // Verify
    expect(status.path).toBe(memoryBankDir);
    expect(status.files.length).toBeGreaterThanOrEqual(4);
    expect(status.coreFilesPresent.length).toBeGreaterThanOrEqual(4);
    // The missing core files might vary depending on the implementation
    // so we don't make assumptions about it
    expect(status.isComplete).toBe(true);
  });
  
  test('Should create backup of Memory Bank', async () => {
    // Create Memory Bank directory
    await fs.ensureDir(memoryBankDir);
    
    // Create test files
    await fs.writeFile(path.join(memoryBankDir, 'file1.md'), 'Content 1');
    await fs.writeFile(path.join(memoryBankDir, 'file2.md'), 'Content 2');
    
    // Set Memory Bank directory
    memoryBankManager.setMemoryBankDir(memoryBankDir);
    
    // Create backup
    const backupDir = path.join(tempDir, 'backup');
    const backupPath = await memoryBankManager.createBackup(backupDir);
    
    // Verify backup directory exists
    const backupExists = await fs.pathExists(backupPath);
    expect(backupExists).toBe(true);
    
    // Verify files were copied
    const file1Exists = await fs.pathExists(path.join(backupPath, 'file1.md'));
    expect(file1Exists).toBe(true);
    
    const file2Exists = await fs.pathExists(path.join(backupPath, 'file2.md'));
    expect(file2Exists).toBe(true);
  });
}); 
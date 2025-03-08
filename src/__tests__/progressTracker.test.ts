import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProgressTracker } from '../core/ProgressTracker.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ProgressTracker Tests', () => {
  const tempDir = path.join(__dirname, 'temp-progress-test-dir');
  const memoryBankDir = path.join(tempDir, 'memory-bank');
  let progressTracker: ProgressTracker;
  
  beforeEach(async () => {
    // Create temporary directory and Memory Bank directory
    await fs.ensureDir(memoryBankDir);
    
    // Create core files
    await fs.writeFile(path.join(memoryBankDir, 'productContext.md'), '# Product Context');
    await fs.writeFile(path.join(memoryBankDir, 'activeContext.md'), '# Active Context');
    await fs.writeFile(path.join(memoryBankDir, 'progress.md'), '# Progress');
    await fs.writeFile(path.join(memoryBankDir, 'decisionLog.md'), '# Decision Log');
    
    // Create a new ProgressTracker for each test
    progressTracker = new ProgressTracker(memoryBankDir);
  });
  
  afterEach(async () => {
    // Clean up
    await fs.remove(tempDir);
  });
  
  test('Should track progress', async () => {
    // Track progress
    const action = 'test-action';
    const details = { description: 'Test description' };
    await progressTracker.trackProgress(action, details);
    
    // Verify progress.md was updated
    const progressContent = await fs.readFile(path.join(memoryBankDir, 'progress.md'), 'utf8');
    
    // Check if progress.md contains the action and description
    expect(progressContent).toContain(action);
    expect(progressContent).toContain(details.description);
  });
  
  test('Should update active context', async () => {
    // Update active context
    const tasks = ['Task 1', 'Task 2'];
    const issues = ['Issue 1', 'Issue 2'];
    const nextSteps = ['Step 1', 'Step 2'];
    
    await progressTracker.updateActiveContext({
      tasks,
      issues,
      nextSteps
    });
    
    // Verify activeContext.md was updated
    const activeContextContent = await fs.readFile(path.join(memoryBankDir, 'activeContext.md'), 'utf8');
    
    // Check if activeContext.md contains the tasks, issues, and next steps
    for (const task of tasks) {
      expect(activeContextContent).toContain(task);
    }
    
    for (const issue of issues) {
      expect(activeContextContent).toContain(issue);
    }
    
    for (const step of nextSteps) {
      expect(activeContextContent).toContain(step);
    }
  });
  
  test('Should log decision', async () => {
    // Log decision
    const title = 'Test Decision';
    const context = 'Test Context';
    const decision = 'Test Decision Text';
    const alternatives = ['Alternative 1', 'Alternative 2'];
    const consequences = ['Consequence 1', 'Consequence 2'];
    
    await progressTracker.logDecision({
      title,
      context,
      decision,
      alternatives,
      consequences
    });
    
    // Verify decisionLog.md was updated
    const decisionLogContent = await fs.readFile(path.join(memoryBankDir, 'decisionLog.md'), 'utf8');
    
    // Check if decisionLog.md contains the decision details
    expect(decisionLogContent).toContain(title);
    expect(decisionLogContent).toContain(context);
    expect(decisionLogContent).toContain(decision);
    
    for (const alternative of alternatives) {
      expect(decisionLogContent).toContain(alternative);
    }
    
    for (const consequence of consequences) {
      expect(decisionLogContent).toContain(consequence);
    }
  });
  
  test('Should clear session notes', async () => {
    // Write test active context with session notes
    const activeContextContent = `
# Active Context

## Current Project State

Test project state

## Current Session Notes

- [12:00:00] Note 1
- [12:30:00] Note 2

## Ongoing Tasks

- Task 1
- Task 2

## Known Issues

- Issue 1
- Issue 2

## Next Steps

- Step 1
- Step 2
`;
    
    await fs.writeFile(path.join(memoryBankDir, 'activeContext.md'), activeContextContent);
    
    // Clear session notes
    await progressTracker.clearSessionNotes();
    
    // Verify activeContext.md was updated
    const updatedContent = await fs.readFile(path.join(memoryBankDir, 'activeContext.md'), 'utf8');
    
    // Check if session notes were cleared
    expect(updatedContent).toContain('## Current Session Notes');
    expect(updatedContent).not.toContain('[12:00:00] Note 1');
    expect(updatedContent).not.toContain('[12:30:00] Note 2');
    
    // Check if other sections were preserved
    expect(updatedContent).toContain('Test project state');
    expect(updatedContent).toContain('Task 1');
    expect(updatedContent).toContain('Issue 1');
    expect(updatedContent).toContain('Step 1');
  });
}); 
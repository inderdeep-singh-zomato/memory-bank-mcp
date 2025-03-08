/**
 * Type definitions for Memory Bank MCP
 * 
 * This file exports all the interfaces used in the Memory Bank MCP project.
 */

// Re-export interfaces from ProgressTracker
export { ProgressDetails, Decision, ActiveContext } from '../core/ProgressTracker.js';

// Re-export interfaces from ExternalRulesLoader
export { ClineruleBase, MemoryBankConfig } from '../utils/ExternalRulesLoader.js';

/**
 * Interface for Memory Bank status
 */
export interface MemoryBankStatus {
  /** Path to the Memory Bank directory */
  path: string;
  /** List of files in the Memory Bank */
  files: string[];
  /** List of core files present in the Memory Bank */
  coreFilesPresent: string[];
  /** List of core files missing from the Memory Bank */
  missingCoreFiles: string[];
  /** Whether the Memory Bank is complete (all core files present) */
  isComplete: boolean;
  /** Language of the Memory Bank (always 'en' for English) */
  language: string;
  /** Last update time of the Memory Bank */
  lastUpdated?: Date;
}

/**
 * Interface for mode state
 */
export interface ModeState {
  /** Name of the current mode */
  name: string;
  /** Status of the Memory Bank */
  memoryBankStatus: 'ACTIVE' | 'INACTIVE';
  /** Whether UMB mode is active */
  isUmbActive?: boolean;
  /** Rules for the current mode */
  rules?: any | null;
}

/**
 * Interface for validation result
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** List of missing files */
  missingFiles: string[];
  /** List of existing files */
  existingFiles: string[];
} 
#!/usr/bin/env node
import { MemoryBankServer } from './server/MemoryBankServer.js';

/**
 * Processes command line arguments
 * @returns Object with processed options
 */
function processArgs() {
  const args = process.argv.slice(2);
  const options: { mode?: string } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--mode' || arg === '-m') {
      options.mode = args[++i];
    }
  }

  return options;
}

/**
 * Main entry point for the Memory Bank Server
 * 
 * This script initializes and runs the Memory Bank Server,
 * which provides MCP (Model Context Protocol) tools and resources
 * for managing memory banks.
 */
async function main() {
  try {
    const options = processArgs();
    
    console.error('Starting Memory Bank Server...');
    if (options.mode) {
      console.error(`Using mode: ${options.mode}`);
    }
    
    const server = new MemoryBankServer(options.mode);
    await server.run();
    console.error('Memory Bank Server started successfully');
  } catch (error) {
    console.error('Error starting Memory Bank server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
main().catch(error => {
  console.error('Fatal error in Memory Bank Server:', error);
  process.exit(1);
});

#!/usr/bin/env node
import { MemoryBankServer } from './server/MemoryBankServer.js';

/**
 * Display program help
 */
function showHelp() {
  console.log(`
Memory Bank MCP - MCP Server for managing Memory Bank

Usage: memory-bank-mcp [options]

Options:
  --mode, -m <mode>    Set execution mode (code, ask, architect, etc.)
  --help, -h           Display this help
  
Examples:
  memory-bank-mcp
  memory-bank-mcp --mode code
  
For more information, visit: https://github.com/movibe/memory-bank-server
`);
  process.exit(0);
}

/**
 * Process command line arguments
 * @returns Object with processed options
 */
function processArgs() {
  const args = process.argv.slice(2);
  const options: { mode?: string } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--mode' || arg === '-m') {
      options.mode = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
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

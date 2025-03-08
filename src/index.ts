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
  --path, -p <path>    Set project path (default: current directory)
  --folder, -f <folder> Set Memory Bank folder name (default: memory-bank)
  --user, -u <user>    Set user ID for tracking changes
  --help, -h           Display this help
  
Environment Variables (deprecated, use command line arguments instead):
  MEMORY_BANK_PROJECT_PATH  Set project path (fallback if --path not provided)
  MEMORY_BANK_FOLDER_NAME   Set Memory Bank folder name (fallback if --folder not provided)
  MEMORY_BANK_MODE          Set execution mode (fallback if --mode not provided)
  MEMORY_BANK_USER_ID       Set user ID for tracking changes (fallback if --user not provided)
  
Examples:
  memory-bank-mcp
  memory-bank-mcp --mode code
  memory-bank-mcp --path /path/to/project
  memory-bank-mcp --folder custom-memory-bank
  memory-bank-mcp --user "John Doe"
  
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
  const options: { mode?: string; projectPath?: string; folderName?: string; userId?: string } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--mode' || arg === '-m') {
      options.mode = args[++i];
    } else if (arg === '--path' || arg === '-p') {
      options.projectPath = args[++i];
    } else if (arg === '--folder' || arg === '-f') {
      options.folderName = args[++i];
    } else if (arg === '--user' || arg === '-u') {
      options.userId = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
    }
  }

  // Environment variables are used as fallback if command line arguments are not provided
  if (!options.mode && process.env.MEMORY_BANK_MODE) {
    options.mode = process.env.MEMORY_BANK_MODE;
  }
  
  if (!options.projectPath && process.env.MEMORY_BANK_PROJECT_PATH) {
    options.projectPath = process.env.MEMORY_BANK_PROJECT_PATH;
  }
  
  if (!options.folderName && process.env.MEMORY_BANK_FOLDER_NAME) {
    options.folderName = process.env.MEMORY_BANK_FOLDER_NAME;
  }
  
  if (!options.userId && process.env.MEMORY_BANK_USER_ID) {
    options.userId = process.env.MEMORY_BANK_USER_ID;
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
    if (options.projectPath) {
      console.error(`Using project path: ${options.projectPath}`);
    }
    if (options.folderName) {
      console.error(`Using Memory Bank folder name: ${options.folderName}`);
    }
    if (options.userId) {
      console.error(`Using user ID: ${options.userId}`);
    }
    
    const server = new MemoryBankServer(options.mode, options.projectPath, options.userId, options.folderName);
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

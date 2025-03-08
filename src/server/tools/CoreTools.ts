import path from 'path';
import { MemoryBankManager } from '../../core/MemoryBankManager.js';
import { MigrationUtils } from '../../utils/MigrationUtils.js';
import { FileUtils } from '../../utils/FileUtils.js';
import os from 'os';

/**
 * Definition of the main Memory Bank tools
 */
export const coreTools = [
  {
    name: 'initialize_memory_bank',
    description: 'Initialize a Memory Bank in the specified directory',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path where the Memory Bank will be initialized',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'set_memory_bank_path',
    description: 'Set a custom path for the Memory Bank',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Custom path for the Memory Bank. If not provided, the current directory will be used.',
        },
      },
      required: [],
    },
  },
  {
    name: 'read_memory_bank_file',
    description: 'Read a file from the Memory Bank',
    inputSchema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Name of the file to read',
        },
      },
      required: ['filename'],
    },
  },
  {
    name: 'write_memory_bank_file',
    description: 'Write to a Memory Bank file',
    inputSchema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Name of the file to write',
        },
        content: {
          type: 'string',
          description: 'Content to write to the file',
        },
      },
      required: ['filename', 'content'],
    },
  },
  {
    name: 'list_memory_bank_files',
    description: 'List Memory Bank files',
    inputSchema: {
      type: 'object',
      properties: {
        random_string: {
          type: 'string',
          description: 'Dummy parameter for no-parameter tools',
        },
      },
      required: ['random_string'],
    },
  },
  {
    name: 'get_memory_bank_status',
    description: 'Check Memory Bank status',
    inputSchema: {
      type: 'object',
      properties: {
        random_string: {
          type: 'string',
          description: 'Dummy parameter for no-parameter tools',
        },
      },
      required: ['random_string'],
    },
  },
  {
    name: 'migrate_file_naming',
    description: 'Migrate Memory Bank files from camelCase to kebab-case naming convention',
    inputSchema: {
      type: 'object',
      properties: {
        random_string: {
          type: 'string',
          description: 'Dummy parameter for no-parameter tools',
        },
      },
      required: ['random_string'],
    },
  },
  {
    name: 'set_environment_variable',
    description: 'Set an environment variable for the Memory Bank server',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the environment variable',
        },
        value: {
          type: 'string',
          description: 'Value of the environment variable',
        },
      },
      required: ['name', 'value'],
    },
  },
];

/**
 * Processes the set_memory_bank_path tool
 * @param memoryBankManager Memory Bank Manager
 * @param customPath Custom path for the Memory Bank
 * @returns Operation result
 */
export async function handleSetMemoryBankPath(
  memoryBankManager: MemoryBankManager,
  customPath?: string
) {
  // Use the provided path, project path, or the current directory
  const basePath = customPath || memoryBankManager.getProjectPath();
  
  // Ensure the path is absolute
  const absolutePath = path.isAbsolute(basePath) ? basePath : path.resolve(process.cwd(), basePath);
  console.error('Using absolute path for Memory Bank:', absolutePath);
  
  // Set the custom path and check for a memory-bank directory
  await memoryBankManager.setCustomPath(absolutePath);
  
  // Check if a memory-bank directory was found
  const memoryBankDir = memoryBankManager.getMemoryBankDir();
  if (memoryBankDir) {
    return {
      content: [
        {
          type: 'text',
          text: `Memory Bank path set to ${memoryBankDir}`,
        },
      ],
    };
  }
  
  // If we get here, no valid Memory Bank was found
  return {
    content: [
      {
        type: 'text',
        text: `Memory Bank not found in the provided directory. Use initialize_memory_bank to create one.`,
      },
    ],
  };
}

/**
 * Processes the initialize_memory_bank tool
 * @param memoryBankManager Memory Bank Manager
 * @param dirPath Directory path where the Memory Bank will be initialized
 * @returns Operation result
 */
export async function handleInitializeMemoryBank(
  memoryBankManager: MemoryBankManager,
  dirPath: string
) {
  try {
    // If dirPath is not provided, use the project path
    const basePath = dirPath || memoryBankManager.getProjectPath();
    
    // Ensure the path is absolute
    const absolutePath = path.isAbsolute(basePath) ? basePath : path.resolve(process.cwd(), basePath);
    console.error('Using absolute path:', absolutePath);
    
    try {
      // Initialize the Memory Bank in the provided directory
      await memoryBankManager.initializeMemoryBank(absolutePath);
      
      // Get the Memory Bank directory
      const memoryBankDir = memoryBankManager.getMemoryBankDir();
      
      return {
        content: [
          {
            type: 'text',
            text: `Memory Bank initialized at ${memoryBankDir}`,
          },
        ],
      };
    } catch (initError) {
      // Check if the error is related to .clinerules files
      const errorMessage = String(initError);
      if (errorMessage.includes('.clinerules')) {
        console.warn('Warning: Error related to .clinerules files:', initError);
        console.warn('Continuing with Memory Bank initialization despite .clinerules issues.');
        
        // Use the provided path directly as the memory bank directory
        const memoryBankDir = absolutePath;
        try {
          await FileUtils.ensureDirectory(memoryBankDir);
          memoryBankManager.setMemoryBankDir(memoryBankDir);
          
          return {
            content: [
              {
                type: 'text',
                text: `Memory Bank initialized at ${memoryBankDir} (with warnings about .clinerules files)`,
              },
            ],
          };
        } catch (dirError) {
          console.error('Failed to create memory-bank directory:', dirError);
          
          // Try to use an existing memory-bank directory if it exists
          if (await FileUtils.fileExists(memoryBankDir) && await FileUtils.isDirectory(memoryBankDir)) {
            memoryBankManager.setMemoryBankDir(memoryBankDir);
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Memory Bank initialized at ${memoryBankDir} (with warnings)`,
                },
              ],
            };
          }
          
          // If we can't create or find a memory-bank directory, return an error
          return {
            content: [
              {
                type: 'text',
                text: `Failed to initialize Memory Bank: ${dirError}`,
              },
            ],
          };
        }
      }
      
      // For other errors, return the error message
      return {
        content: [
          {
            type: 'text',
            text: `Failed to initialize Memory Bank: ${initError}`,
          },
        ],
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error initializing Memory Bank: ${error}`,
        },
      ],
    };
  }
}

/**
 * Processes the read_memory_bank_file tool
 * @param memoryBankManager Memory Bank Manager
 * @param filename Name of the file to read
 * @returns Operation result
 */
export async function handleReadMemoryBankFile(
  memoryBankManager: MemoryBankManager,
  filename: string
) {
  try {
    const content = await memoryBankManager.readFile(filename);

    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error reading file ${filename}: ${error}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Processes the write_memory_bank_file tool
 * @param memoryBankManager Memory Bank Manager
 * @param filename Name of the file to write
 * @param content Content to write to the file
 * @returns Operation result
 */
export async function handleWriteMemoryBankFile(
  memoryBankManager: MemoryBankManager,
  filename: string,
  content: string
) {
  try {
    await memoryBankManager.writeFile(filename, content);

    return {
      content: [
        {
          type: 'text',
          text: `File ${filename} successfully written to Memory Bank`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error writing file ${filename}: ${error}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Processes the list_memory_bank_files tool
 * @param memoryBankManager Memory Bank Manager
 * @returns Operation result
 */
export async function handleListMemoryBankFiles(
  memoryBankManager: MemoryBankManager
) {
  try {
    const files = await memoryBankManager.listFiles();

    return {
      content: [
        {
          type: 'text',
          text: `Files in Memory Bank:\n${files.join('\n')}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error listing Memory Bank files: ${error}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Processes the get_memory_bank_status tool
 * @param memoryBankManager Memory Bank Manager
 * @returns Operation result
 */
export async function handleGetMemoryBankStatus(
  memoryBankManager: MemoryBankManager
) {
  try {
    const status = await memoryBankManager.getStatus();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error checking Memory Bank status: ${error}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handles the migrate_file_naming tool
 * @param memoryBankManager Memory Bank Manager
 * @returns Result of the migration
 */
export async function handleMigrateFileNaming(
  memoryBankManager: MemoryBankManager
) {
  try {
    const memoryBankDir = memoryBankManager.getMemoryBankDir();
    if (!memoryBankDir) {
      return {
        content: [
          {
            type: 'text',
            text: 'Memory Bank directory not found. Use initialize_memory_bank or set_memory_bank_path first.',
          },
        ],
        isError: true,
      };
    }

    const result = await MigrationUtils.migrateFileNamingConvention(memoryBankDir);

    if (result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Migration completed successfully. Migrated files: ${result.migratedFiles.join(', ')}`,
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Migration completed with errors: ${result.errors.join(', ')}. Migrated files: ${result.migratedFiles.join(', ')}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error during migration: ${error}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Processes the set_environment_variable tool
 * @param name Name of the environment variable
 * @param value Value of the environment variable
 * @returns Operation result
 */
export function handleSetEnvironmentVariable(name: string, value: string) {
  // Only allow setting specific environment variables for security
  const allowedEnvVars = [
    'MEMORY_BANK_USER_ID',
    'MEMORY_BANK_MODE',
    'MEMORY_BANK_PROJECT_PATH',
    'MEMORY_BANK_FOLDER_NAME'
  ];
  
  if (!allowedEnvVars.includes(name)) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: Cannot set environment variable ${name}. Only the following variables are allowed: ${allowedEnvVars.join(', ')}`,
        },
      ],
      isError: true,
    };
  }
  
  // Set the environment variable
  process.env[name] = value;
  
  return {
    content: [
      {
        type: 'text',
        text: `Environment variable ${name} set to ${value}`,
      },
    ],
  };
}
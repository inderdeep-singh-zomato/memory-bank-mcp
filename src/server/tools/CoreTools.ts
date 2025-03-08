import path from 'path';
import { MemoryBankManager } from '../../core/MemoryBankManager.js';
import { MigrationUtils } from '../../utils/MigrationUtils.js';

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
          description: 'Custom path for the Memory Bank',
        },
      },
      required: ['path'],
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
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_memory_bank_status',
    description: 'Check Memory Bank status',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
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
];

/**
 * Processes the set_memory_bank_path tool
 * @param memoryBankManager Memory Bank Manager
 * @param customPath Custom path for the Memory Bank
 * @returns Operation result
 */
export async function handleSetMemoryBankPath(
  memoryBankManager: MemoryBankManager,
  customPath: string
) {
  memoryBankManager.setCustomPath(customPath);
  const CWD = process.cwd();
  const memoryBankDir = await memoryBankManager.findMemoryBankDir(CWD, customPath);
  
  if (memoryBankDir) {
    memoryBankManager.setMemoryBankDir(memoryBankDir);
    
    return {
      content: [
        {
          type: 'text',
          text: `Memory Bank path set to ${memoryBankDir}`,
        },
      ],
    };
  } else {
    return {
      content: [
        {
          type: 'text',
          text: `Memory Bank not found at ${customPath}. The path will be used when initializing a new Memory Bank.`,
        },
      ],
    };
  }
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
  // Usa o caminho personalizado se definido, caso contrário usa o padrão
  const customPath = memoryBankManager.getCustomPath();
  const basePath = customPath || dirPath;
  const CWD = process.cwd();
  const fullPath = path.resolve(CWD, basePath, 'memory-bank');

  try {
    await memoryBankManager.initializeMemoryBank(fullPath);

    return {
      content: [
        {
          type: 'text',
          text: `Memory Bank successfully initialized at ${fullPath}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error initializing Memory Bank: ${error}`,
        },
      ],
      isError: true,
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
import path from 'path';
import { MemoryBankManager } from '../../core/MemoryBankManager.js';

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
];

/**
 * Processa a ferramenta set_memory_bank_path
 * @param memoryBankManager Gerenciador do Memory Bank
 * @param customPath Caminho personalizado
 * @returns Resultado da operação
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
 * Processa a ferramenta initialize_memory_bank
 * @param memoryBankManager Gerenciador do Memory Bank
 * @param dirPath Caminho do diretório
 * @returns Resultado da operação
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
 * Processa a ferramenta read_memory_bank_file
 * @param memoryBankManager Gerenciador do Memory Bank
 * @param filename Nome do arquivo
 * @returns Resultado da operação
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
 * Processa a ferramenta write_memory_bank_file
 * @param memoryBankManager Gerenciador do Memory Bank
 * @param filename Nome do arquivo
 * @param content Conteúdo a ser escrito
 * @returns Resultado da operação
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
 * Processa a ferramenta list_memory_bank_files
 * @param memoryBankManager Gerenciador do Memory Bank
 * @returns Resultado da operação
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
 * Processa a ferramenta get_memory_bank_status
 * @param memoryBankManager Gerenciador do Memory Bank
 * @returns Resultado da operação
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
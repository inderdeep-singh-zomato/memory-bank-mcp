import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ErrorCode, ListResourcesRequestSchema, McpError, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { MemoryBankManager } from '../../core/MemoryBankManager.js';
import path from 'path';

/**
 * Configura os recursos do Memory Bank para o servidor MCP
 * @param server Servidor MCP
 * @param memoryBankManager Gerenciador do Memory Bank
 */
export function setupMemoryBankResources(
  server: Server,
  memoryBankManager: MemoryBankManager
) {
  // Define os recursos disponíveis
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: `memory-bank://product-context`,
        name: `Product Context`,
        mimeType: 'text/markdown',
        description: 'Project overview and context',
      },
      {
        uri: `memory-bank://active-context`,
        name: `Active Context`,
        mimeType: 'text/markdown',
        description: 'Current project context and tasks',
      },
      {
        uri: `memory-bank://progress`,
        name: `Progress`,
        mimeType: 'text/markdown',
        description: 'Project progress and milestones',
      },
      {
        uri: `memory-bank://decision-log`,
        name: `Decision Log`,
        mimeType: 'text/markdown',
        description: 'Project decisions and rationale',
      },
      {
        uri: `memory-bank://system-patterns`,
        name: `System Patterns`,
        mimeType: 'text/markdown',
        description: 'System patterns and architecture',
      },
    ],
  }));

  // Implementa o handler para leitura de recursos
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    // Encontra o diretório do Memory Bank se ainda não foi encontrado
    const memoryBankDir = memoryBankManager.getMemoryBankDir();
    if (!memoryBankDir) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "Memory Bank not found. Use initialize_memory_bank to create one."
      );
    }

    let filename: string;
    
    // Mapeia o URI para o nome do arquivo
    switch (request.params.uri) {
      case "memory-bank://product-context":
        filename = "productContext.md";
        break;
      case "memory-bank://active-context":
        filename = "activeContext.md";
        break;
      case "memory-bank://progress":
        filename = "progress.md";
        break;
      case "memory-bank://decision-log":
        filename = "decisionLog.md";
        break;
      case "memory-bank://system-patterns":
        filename = "systemPatterns.md";
        break;
      default:
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Invalid URI: ${request.params.uri}`
        );
    }

    try {
      // Lê o conteúdo do arquivo
      const content = await memoryBankManager.readFile(filename);

      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "text/markdown",
            text: content,
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Error reading file ${filename}: ${error}`
      );
    }
  });
}
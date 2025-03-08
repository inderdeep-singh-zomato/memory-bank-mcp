import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { MemoryBankManager } from '../../core/MemoryBankManager.js';
import { setupMemoryBankResources } from './MemoryBankResources.js';

/**
 * Configura todos os handlers de recursos para o servidor MCP
 * @param server Servidor MCP
 * @param memoryBankManager Gerenciador do Memory Bank
 */
export function setupResourceHandlers(
  server: Server,
  memoryBankManager: MemoryBankManager
) {
  setupMemoryBankResources(server, memoryBankManager);
}
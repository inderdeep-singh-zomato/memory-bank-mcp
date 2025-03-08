import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { MemoryBankManager } from '../core/MemoryBankManager.js';
import { ProgressTracker } from '../core/ProgressTracker.js';
import { setupToolHandlers } from './tools/index.js';
import { setupResourceHandlers } from './resources/index.js';
import { ModeManagerEvent } from '../utils/ModeManager.js';

/**
 * Main MCP server class for Memory Bank
 * 
 * This class is responsible for setting up and running the MCP server
 * that provides tools and resources for managing memory banks.
 */
export class MemoryBankServer {
  private server: Server;
  private memoryBankManager: MemoryBankManager;
  private isRunning: boolean = false;

  /**
   * Creates a new MemoryBankServer instance
   * 
   * Initializes the MCP server with the necessary handlers for tools and resources.
   * @param initialMode Modo inicial (opcional)
   */
  constructor(initialMode?: string) {
    this.memoryBankManager = new MemoryBankManager();
    
    this.server = new Server(
      {
        name: '@movibe/memory-bank-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // Set up tool and resource handlers
    setupToolHandlers(
      this.server, 
      this.memoryBankManager, 
      () => this.memoryBankManager.getProgressTracker()
    );
    setupResourceHandlers(this.server, this.memoryBankManager);

    // Inicializar o gerenciador de modos
    this.memoryBankManager.initializeModeManager(initialMode).catch(error => {
      console.error('Erro ao inicializar o gerenciador de modos:', error);
    });

    // Configurar listeners para eventos do gerenciador de modos
    const modeManager = this.memoryBankManager.getModeManager();
    if (modeManager) {
      modeManager.on(ModeManagerEvent.MODE_CHANGED, (modeState) => {
        console.error(`Modo alterado para: ${modeState.name}`);
        console.error(`Status do Memory Bank: ${modeState.memoryBankStatus}`);
      });

      modeManager.on(ModeManagerEvent.MODE_TRIGGER_DETECTED, (triggeredModes) => {
        console.error(`Gatilhos de modo detectados: ${triggeredModes.join(', ')}`);
      });

      modeManager.on(ModeManagerEvent.UMB_TRIGGERED, () => {
        console.error('Modo UMB ativado');
      });

      modeManager.on(ModeManagerEvent.UMB_COMPLETED, () => {
        console.error('Modo UMB desativado');
      });
    }

    // Error handling
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
      // Log additional details if available
      if (error instanceof Error && error.stack) {
        console.error('[MCP Error Stack]', error.stack);
      }
    };

    // Handle process termination
    process.on('SIGINT', async () => {
      await this.shutdown();
    });
    
    process.on('SIGTERM', async () => {
      await this.shutdown();
    });
  }

  /**
   * Starts the MCP server
   * 
   * Connects the server to the stdio transport and begins listening for requests.
   */
  async run() {
    if (this.isRunning) {
      console.error('Server is already running');
      return;
    }

    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      this.isRunning = true;
      console.error('Memory Bank MCP server running on stdio');
      
      // Exibir informações sobre os modos disponíveis
      const modeManager = this.memoryBankManager.getModeManager();
      if (modeManager) {
        const availableModes = modeManager.getCurrentModeState();
        console.error(`Modo atual: ${availableModes.name}`);
        console.error(`Status do Memory Bank: ${availableModes.memoryBankStatus}`);
      }
    } catch (error) {
      console.error('Failed to start Memory Bank server:', error);
      throw error;
    }
  }

  /**
   * Gracefully shuts down the server
   */
  async shutdown() {
    if (!this.isRunning) {
      return;
    }
    
    console.error('Shutting down Memory Bank server...');
    try {
      // Limpar recursos do gerenciador de modos
      const modeManager = this.memoryBankManager.getModeManager();
      if (modeManager) {
        modeManager.dispose();
      }
      
      await this.server.close();
      this.isRunning = false;
      console.error('Memory Bank server shut down successfully');
    } catch (error) {
      console.error('Error during shutdown:', error);
    } finally {
      process.exit(0);
    }
  }
}
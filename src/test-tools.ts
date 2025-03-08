#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  // Inicia o servidor MCP
  const serverProcess = spawn('node', [path.join(__dirname, '../build/index.js')], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  // Aguarda um pouco para o servidor iniciar
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Configura o transporte do cliente
  const transport = new StdioClientTransport({
    command: 'node',
    args: [path.join(__dirname, '../build/index.js')]
  });

  // Cria o cliente MCP
  const client = new Client(
    { name: 'memory-bank-test-client', version: '1.0.0' },
    { capabilities: { tools: {}, resources: {} } }
  );

  try {
    // Conecta ao servidor
    await client.connect(transport);
    console.log('Conectado ao servidor MCP');

    // Lista as ferramentas disponíveis
    try {
      const tools = await client.listTools();
      console.log('Ferramentas disponíveis:');
      console.log(JSON.stringify(tools, null, 2));
    } catch (error) {
      console.error('Erro ao listar ferramentas:', error);
    }

  } catch (error) {
    console.error('Erro ao conectar ao servidor:', error);
  } finally {
    // Encerra o servidor
    serverProcess.kill();
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Erro no script de teste:', error);
  process.exit(1);
}); 
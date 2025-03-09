# Documentação do Processo de Inicialização do Memory Bank MCP

Este documento descreve o processo de inicialização do servidor Memory Bank MCP, detalhando cada etapa desde a execução do comando até o servidor estar pronto para receber solicitações.

## Comando de Inicialização

O Memory Bank MCP é iniciado através do comando `memory-bank-mcp`, que é configurado como um binário no `package.json`:

```json
"bin": {
  "memory-bank-mcp": "build/index.js"
}
```

## Opções de Linha de Comando

O comando aceita as seguintes opções:

| Opção | Forma curta | Descrição |
|-------|------------|-----------|
| `--mode` | `-m` | Define o modo de execução (code, ask, architect, etc.) |
| `--path` | `-p` | Define o caminho do projeto (padrão: diretório atual) |
| `--folder` | `-f` | Define o nome da pasta do Memory Bank (padrão: memory-bank) |
| `--user` | `-u` | Define o ID do usuário para rastreamento de alterações |
| `--help` | `-h` | Exibe a ajuda do programa |

## Processo de Inicialização Passo a Passo

### 1. Entrada do Programa (`index.ts`)

1. O script começa com o shebang `#!/usr/bin/env node` para permitir a execução direta.
2. A função `processArgs()` analisa os argumentos da linha de comando.
3. A função `main()` é chamada para iniciar o servidor.

### 2. Criação do Servidor (`main()`)

1. Processa os argumentos da linha de comando.
2. Exibe mensagens informativas sobre as opções utilizadas.
3. Cria uma nova instância de `MemoryBankServer` com as opções fornecidas.
4. Chama o método `run()` para iniciar o servidor.
5. Configura manipuladores para rejeições de promessas não tratadas.

### 3. Inicialização do Servidor (`MemoryBankServer.constructor()`)

1. Cria uma instância de `MemoryBankManager` com as opções fornecidas.
2. Combina todas as ferramentas disponíveis (core, progress, context, decision, mode).
3. Cria uma instância do servidor MCP com as ferramentas combinadas.
4. Configura os manipuladores de ferramentas e recursos.
5. Inicializa o gerenciador de modo com o modo inicial.
6. Configura ouvintes para eventos do gerenciador de modo.
7. Configura o manipulador de erros do servidor.
8. Configura manipuladores para sinais de terminação do processo (SIGINT, SIGTERM).

### 4. Execução do Servidor (`MemoryBankServer.run()`)

1. Verifica se o servidor já está em execução.
2. Cria um transporte de servidor stdio.
3. Conecta o servidor ao transporte.
4. Define a flag `isRunning` como verdadeira.
5. Exibe informações sobre o modo atual e o status do Memory Bank.

### 5. Inicialização do Memory Bank Manager

Durante a criação do `MemoryBankManager`:

1. Define o idioma como inglês.
2. Configura o caminho do projeto (fornecido ou diretório atual).
3. Configura o ID do usuário (fornecido ou "Unknown User").
4. Configura o nome da pasta do Memory Bank (fornecido ou "memory-bank").
5. Verifica a existência de um diretório memory-bank no caminho do projeto.

### 6. Configuração do Gerenciador de Modo

Durante a inicialização do gerenciador de modo:

1. Carrega as regras externas para cada modo (architect, ask, code, debug, test).
2. Define o modo inicial (fornecido ou "code").
3. Configura ouvintes para eventos de mudança de modo.

## Fluxo de Comunicação

Após a inicialização, o servidor:

1. Escuta solicitações através do transporte stdio.
2. Recebe comandos de ferramentas MCP.
3. Encaminha os comandos para os manipuladores apropriados.
4. Retorna os resultados para o cliente.

## Encerramento do Servidor

O servidor pode ser encerrado:

1. Recebendo um sinal SIGINT ou SIGTERM.
2. Chamando o método `shutdown()`.

Durante o encerramento:

1. Libera os recursos do gerenciador de modo.
2. Fecha o servidor MCP.
3. Define a flag `isRunning` como falsa.
4. Encerra o processo.

## Diagrama de Sequência

```
┌─────────┐          ┌──────────────────┐          ┌───────────────────┐          ┌─────────────────┐
│ Comando │          │ MemoryBankServer │          │ MemoryBankManager │          │ ModeManager     │
└────┬────┘          └────────┬─────────┘          └─────────┬─────────┘          └────────┬────────┘
     │                        │                              │                             │
     │ memory-bank-mcp        │                              │                             │
     │───────────────────────>│                              │                             │
     │                        │                              │                             │
     │                        │ new MemoryBankManager()      │                             │
     │                        │─────────────────────────────>│                             │
     │                        │                              │                             │
     │                        │                              │ setCustomPath()             │
     │                        │                              │────────────────────────────>│
     │                        │                              │                             │
     │                        │ initializeModeManager()      │                             │
     │                        │─────────────────────────────>│                             │
     │                        │                              │                             │
     │                        │                              │ new ModeManager()           │
     │                        │                              │────────────────────────────>│
     │                        │                              │                             │
     │                        │ run()                        │                             │
     │                        │◀───────────────────────────┐ │                             │
     │                        │  Servidor iniciado         │ │                             │
     │                        │                            │ │                             │
     │                        │◀─────────────────────────────┤                             │
     │                        │                              │                             │
     │ Servidor pronto        │                              │                             │
     │◀───────────────────────│                              │                             │
     │                        │                              │                             │
```

## Considerações Importantes

1. O servidor utiliza o protocolo MCP (Model Context Protocol) para comunicação.
2. O Memory Bank é sempre inicializado em inglês, independentemente da configuração do sistema.
3. O servidor suporta diferentes modos de operação (code, ask, architect, debug, test).
4. O servidor pode detectar automaticamente gatilhos para mudança de modo.
5. O servidor suporta o modo UMB (Update Memory Bank) para atualização do Memory Bank.
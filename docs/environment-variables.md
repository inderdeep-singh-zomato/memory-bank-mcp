# Environment Variables in Memory Bank MCP

## Overview

Memory Bank MCP supports configuration through environment variables, allowing you to customize its behavior without modifying command-line arguments. This is particularly useful in environments like Roo Code or when running in containers.

## Available Environment Variables

| Variable                   | Description             | Default                             |
| -------------------------- | ----------------------- | ----------------------------------- |
| `MEMORY_BANK_PROJECT_PATH` | Sets the project path   | Current directory (`process.cwd()`) |
| `MEMORY_BANK_MODE`         | Sets the execution mode | `code`                              |

## Using Environment Variables

### Setting the Project Path

The `MEMORY_BANK_PROJECT_PATH` environment variable allows you to specify the directory where Memory Bank MCP will look for or create the Memory Bank files. This is particularly useful in environments with read-only file systems like Roo Code.

```bash
# Set the project path to a specific directory
export MEMORY_BANK_PROJECT_PATH=/path/to/your/project

# Run Memory Bank MCP
memory-bank-mcp
```

Or in a single command:

```bash
MEMORY_BANK_PROJECT_PATH=/path/to/your/project memory-bank-mcp
```

### Setting the Mode

The `MEMORY_BANK_MODE` environment variable allows you to specify the execution mode:

```bash
# Set the mode to architect
export MEMORY_BANK_MODE=architect

# Run Memory Bank MCP
memory-bank-mcp
```

Or in a single command:

```bash
MEMORY_BANK_MODE=architect memory-bank-mcp
```

## Priority Order

When both environment variables and command-line arguments are provided, the environment variables take precedence:

1. Environment variables (`MEMORY_BANK_PROJECT_PATH`, `MEMORY_BANK_MODE`)
2. Command-line arguments (`--path`, `--mode`)
3. Default values (current directory, `code` mode)

## Example: Using in Roo Code

When using Memory Bank MCP in Roo Code, you can set the project path to a writable directory:

```bash
MEMORY_BANK_PROJECT_PATH=/tmp/memory-bank memory-bank-mcp
```

This will ensure that Memory Bank MCP uses `/tmp/memory-bank` as the project directory, avoiding issues with read-only file systems.

## Example: Using in Docker

When running Memory Bank MCP in a Docker container, you can set the environment variables in your Dockerfile or when running the container:

```dockerfile
FROM node:18

# Set environment variables
ENV MEMORY_BANK_PROJECT_PATH=/app/data
ENV MEMORY_BANK_MODE=code

# Install Memory Bank MCP
RUN npm install -g @movibe/memory-bank-mcp

# Run Memory Bank MCP
CMD ["memory-bank-mcp"]
```

Or when running the container:

```bash
docker run -e MEMORY_BANK_PROJECT_PATH=/app/data -e MEMORY_BANK_MODE=architect memory-bank-mcp
```

## Troubleshooting

If you're experiencing issues with the project path:

1. Check that the specified directory exists and is writable
2. Verify that the environment variable is correctly set
3. Look for log messages indicating the actual path being used

You can verify the environment variables are being correctly read by checking the startup logs:

```
Starting Memory Bank Server...
Using mode: code
Using project path: /path/to/your/project
MemoryBankManager initialized with project path: /path/to/your/project
ExternalRulesLoader initialized with project directory: /path/to/your/project
```

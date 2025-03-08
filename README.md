# Memory Bank MCP

A Model Context Protocol (MCP) server for managing Memory Banks, allowing AI assistants to store and retrieve information across sessions.

## Overview

Memory Bank Server provides a set of tools and resources for AI assistants to interact with Memory Banks. Memory Banks are structured repositories of information that help maintain context and track progress across multiple sessions.

## Features

- **Memory Bank Management**: Initialize, find, and manage Memory Banks
- **File Operations**: Read and write files in Memory Banks
- **Progress Tracking**: Track progress and update Memory Bank files
- **Decision Logging**: Log important decisions with context and alternatives
- **Active Context Management**: Maintain and update active context information
- **Mode Support**: Detect and use .clinerules files for mode-specific behavior
- **UMB Command**: Update Memory Bank files temporarily with the UMB command

## Installation

```bash
# Install from npm
npm install @movibe/memory-bank-mcp

# Or install globally
npm install -g @movibe/memory-bank-mcp

# Or use Bun
bun install @movibe/memory-bank-mcp
```

## Usage

### As a Command Line Tool

```bash
# Initialize a Memory Bank in the current directory
memory-bank-mcp init

# Start the Memory Bank Server
memory-bank-mcp start

# Start with a specific mode
memory-bank-mcp start --mode architect
```

### As a Library

```typescript
import { MemoryBankServer } from "@movibe/memory-bank-mcp";

async function main() {
  // Optional: specify an initial mode
  const server = new MemoryBankServer("code");
  await server.run();
}

main().catch(console.error);
```

## Memory Bank Structure

A Memory Bank is a directory containing the following files:

- `productContext.md`: Information about the product or project
- `activeContext.md`: Current context and session notes
- `progress.md`: Progress tracking and update history
- `decisionLog.md`: Log of important decisions
- `systemPatterns.md`: System patterns and architectural decisions

## Mode Support

Memory Bank Server can detect and use `.clinerules` files in the project directory to provide mode-specific behavior. The following modes are supported:

- **architect**: Design and architecture focus
- **ask**: Question answering focus
- **code**: Implementation focus
- **debug**: Debugging focus
- **test**: Testing focus

For more information about mode support, see [Clinerules Integration](docs/clinerules-integration.md).

## Development

### Prerequisites

- Node.js 16+ or [Bun](https://bun.sh/)
- npm, yarn, or bun

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/memory-bank-mcp.git
cd memory-bank-mcp

# Install dependencies
npm install
# or
bun install

# Build the project
npm run build
# or
bun run build

# Run the server
npm start
# or
bun run start

# Development mode with hot reloading
bun run dev

# Run tests
bun test
```

For more information about building with Bun, see [Building with Bun](docs/build-with-bun.md).

For more information about testing with Bun, see [Testing with Bun](docs/testing.md).

### Project Structure

- `src/core/`: Core functionality for Memory Bank management
- `src/server/`: MCP server implementation
- `src/utils/`: Utility functions
- `src/index.ts`: Main entry point
- `src/__tests__/`: Test files

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

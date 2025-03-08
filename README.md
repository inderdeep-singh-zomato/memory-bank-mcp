# Memory Bank MCP

[![NPM Version](https://img.shields.io/npm/v/@movibe/memory-bank-mcp.svg)](https://www.npmjs.com/package/@movibe/memory-bank-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/movibe/memory-bank-server/actions/workflows/test.yml/badge.svg)](https://github.com/movibe/memory-bank-server/actions/workflows/test.yml)

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

# Or run directly with npx (no installation required)
npx @movibe/memory-bank-mcp
```

## Usage with npx

You can run Memory Bank MCP directly without installation using npx:

```bash
# Run with default settings
npx @movibe/memory-bank-mcp

# Run with specific mode
npx @movibe/memory-bank-mcp --mode code

# Show help
npx @movibe/memory-bank-mcp --help
```

For more detailed information about using npx, see [npx-usage.md](docs/npx-usage.md).

## Usage

### As a Command Line Tool

```

```

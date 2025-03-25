# Memory Bank MCP 🧠

[![NPM Version](https://img.shields.io/npm/v/@movibe/memory-bank-mcp.svg)](https://www.npmjs.com/package/@movibe/memory-bank-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/movibe/memory-bank-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/movibe/memory-bank-mcp/actions/workflows/test.yml)

A Model Context Protocol (MCP) server for managing Memory Banks, supporting both local and SFTP storage.

<a href="https://glama.ai/mcp/servers/riei9a6dhx">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/riei9a6dhx/badge" alt="Memory Bank MCP server" />
</a>

## Features ✨

- **Local and SFTP storage support**: Store and retrieve Memory Banks from local file system or SFTP server
- **Memory Bank management tools**: Initialize, find, and manage Memory Banks
- **Progress tracking**: Track progress and update Memory Bank files
- **Context management**: Maintain and update active context information
- **Decision logging**: Log important decisions with context and alternatives
Memory Bank Server provides a set of tools and resources for AI assistants to interact with Memory Banks. Memory Banks are structured repositories of information that help maintain context and track progress across multiple sessions.

## Features ✨

- **Memory Bank Management**: Initialize, find, and manage Memory Banks
- **File Operations**: Read and write files in Memory Banks
- **Progress Tracking**: Track progress and update Memory Bank files
- **Decision Logging**: Log important decisions with context and alternatives
- **Active Context Management**: Maintain and update active context information
- **Mode Support**: Detect and use .clinerules files for mode-specific behavior
- **UMB Command**: Update Memory Bank files temporarily with the UMB command
- **Robust Error Handling**: Gracefully handle errors and continue operation when possible
- **Status Prefix System**: Immediate visibility into Memory Bank operational state

## Directory Structure 📁

By default, Memory Bank uses a `memory-bank` directory in the root of your project. When you specify a project path using the `--path` option, the Memory Bank will be created or accessed at `<project_path>/memory-bank`.

You can customize the name of the Memory Bank folder using the `--folder` option. For example, if you set `--folder custom-memory`, the Memory Bank will be created or accessed at `<project_path>/custom-memory`.

For more details on customizing the folder name, see [Custom Memory Bank Folder Name](docs/custom-folder-name.md).

## Recent Improvements 🛠️

- **Customizable Folder Name**: You can now specify a custom folder name for the Memory Bank
- **Consistent Directory Structure**: Memory Bank now always uses the configured folder name in the project root
- **Enhanced Initialization**: Memory Bank now works even when .clinerules files don't exist
- **Better Path Handling**: Improved handling of absolute and relative paths
- **Improved Directory Detection**: Better detection of existing memory-bank directories
- **More Robust Error Handling**: Graceful handling of errors related to .clinerules files

For more details, see [Memory Bank Bug Fixes](docs/memory-bank-bug-fixes.md).

## Installation 🚀

```bash
# Install from npm
npm install @movibe/memory-bank-mcp

# Or install globally
npm install -g @movibe/memory-bank-mcp

# Or run directly with npx (no installation required)
npx @movibe/memory-bank-mcp
```

## SFTP Setup and Configuration 🔐

Memory Bank MCP supports storing Memory Banks on SFTP servers. Here's how to set it up:

### Prerequisites

1. An SFTP server with:
   - Valid hostname/IP address
   - Port number (default: 22)
   - Username and password, or SSH key authentication
   - Sufficient permissions to read/write files

2. Required npm package:
   ```bash
   npm install ssh2-sftp-client
   ```

### Configuration Options

When using SFTP storage, you can configure the connection using these options:

```bash
--sftp-host <host>     # SFTP server hostname or IP
--sftp-port <port>     # SFTP server port (default: 22)
--sftp-user <user>     # SFTP username
--sftp-pass <pass>     # SFTP password (if using password auth)
--sftp-key <path>      # Path to private key file (if using key auth)
--sftp-base <path>     # Base path on SFTP server for Memory Bank storage
```

### Usage Examples

1. **Using Password Authentication**:
   ```bash
   memory-bank-mcp --sftp-host example.com \
                   --sftp-user myuser \
                   --sftp-pass mypassword \
                   --sftp-base /path/to/memory-bank
   ```

2. **Using SSH Key Authentication**:
   ```bash
   memory-bank-mcp --sftp-host example.com \
                   --sftp-user myuser \
                   --sftp-key ~/.ssh/id_rsa \
                   --sftp-base /path/to/memory-bank
   ```

3. **With Custom Port**:
   ```bash
   memory-bank-mcp --sftp-host example.com \
                   --sftp-port 2222 \
                   --sftp-user myuser \
                   --sftp-pass mypassword \
                   --sftp-base /path/to/memory-bank
   ```

## Usage with npx 💻

You can run Memory Bank MCP directly without installation using npx:

```bash
# Run with default settings
npx @movibe/memory-bank-mcp

# Run with specific mode
npx @movibe/memory-bank-mcp --mode code

# Run with custom project path
npx @movibe/memory-bank-mcp --path /path/to/project

# Run with custom folder name
npx @movibe/memory-bank-mcp --folder custom-memory-bank

# Show help
npx @movibe/memory-bank-mcp --help
```

For more detailed information about using npx, see [npx-usage.md](docs/npx-usage.md).

## Configuring in Cursor 🖱️

Cursor is an AI-powered code editor that supports the Model Context Protocol (MCP). To configure Memory Bank MCP in Cursor:

1. **Use Memory Bank MCP with npx**:

   No need to install the package globally. You can use npx directly:

   ```bash
   # Verify npx is working correctly
   npx @movibe/memory-bank-mcp --help
   ```

2. **Open Cursor Settings**:

   - Go to Settings (⚙️) > Extensions > MCP
   - Click on "Add MCP Server"

3. **Configure the MCP Server**:

   - **Name**: Memory Bank MCP
   - **Command**: npx
   - **Arguments**: `@movibe/memory-bank-mcp --mode code` (or other mode as needed)

4. **Save and Activate**:

   - Click "Save"
   - Enable the MCP server by toggling it on

5. **Verify Connection**:
   - Open a project in Cursor
   - The Memory Bank MCP should now be active and available in your AI interactions

For detailed instructions and advanced usage with Cursor, see [cursor-integration.md](docs/cursor-integration.md).

### Using with Cursor 🤖

Once configured, you can interact with Memory Bank MCP in Cursor through AI commands:

- **Initialize a Memory Bank**: `/mcp memory-bank-mcp initialize_memory_bank path=./memory-bank`
- **Track Progress**: `/mcp memory-bank-mcp track_progress action="Feature Implementation" description="Implemented feature X"`
- **Log Decision**: `/mcp memory-bank-mcp log_decision title="API Design" context="..." decision="..."`
- **Switch Mode**: `/mcp memory-bank-mcp switch_mode mode=code`

## MCP Modes and Their Usage 🔄

Memory Bank MCP supports different operational modes to optimize AI interactions for specific tasks:

### Available Modes

1. **Code Mode** 👨‍💻

   - Focus: Code implementation and development
   - Usage: `npx @movibe/memory-bank-mcp --mode code`
   - Best for: Writing, refactoring, and optimizing code

2. **Architect Mode** 🏗️

   - Focus: System design and architecture
   - Usage: `npx @movibe/memory-bank-mcp --mode architect`
   - Best for: Planning project structure, designing components, and making architectural decisions

3. **Ask Mode** ❓

   - Focus: Answering questions and providing information
   - Usage: `npx @movibe/memory-bank-mcp --mode ask`
   - Best for: Getting explanations, clarifications, and information

4. **Debug Mode** 🐛

   - Focus: Troubleshooting and problem-solving
   - Usage: `npx @movibe/memory-bank-mcp --mode debug`
   - Best for: Finding and fixing bugs, analyzing issues

5. **Test Mode** ✅
   - Focus: Testing and quality assurance
   - Usage: `npx @movibe/memory-bank-mcp --mode test`
   - Best for: Writing tests, test-driven development

### Switching Modes

You can switch modes in several ways:

1. **When starting the server**:

   ```bash
   npx @movibe/memory-bank-mcp --mode architect
   ```

2. **During a session**:

   ```bash
   memory-bank-mcp switch_mode mode=debug
   ```
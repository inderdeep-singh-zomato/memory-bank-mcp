# Memory Bank MCP - Documentation

## Overview

This directory contains the documentation for Memory Bank MCP, an MCP (Model Context Protocol) server that provides tools and resources for managing memory banks. Memory Bank MCP allows AI assistants to store and retrieve information across sessions.

## Documentation Files

### Core Documentation

- [**productContext.md**](../productContext.md) - Project overview, key features, and architecture
- [**activeContext.md**](../activeContext.md) - Current project state, ongoing tasks, and next steps
- [**progress.md**](../progress.md) - Progress history and project updates
- [**decisionLog.md**](../decisionLog.md) - Record of important decisions made during development
- [**systemPatterns.md**](../systemPatterns.md) - System patterns and architecture

### Usage Documentation

- [**usage-modes.md**](./usage-modes.md) - Detailed descriptions of each mode and usage examples
- [**rule-examples.md**](./rule-examples.md) - Complete examples of rule files in JSON, YAML, and TOML
- [**roo-code-integration.md**](./roo-code-integration.md) - Explanation of the relationship with Roo Code Memory Bank
- [**rule-formats.md**](./rule-formats.md) - Documentation on supported file formats for rules

## Supported Modes

Memory Bank MCP supports the following operation modes:

1. **Architect Mode** - For high-level planning and system design
2. **Code Mode** - For implementation and development
3. **Ask Mode** - For providing information and explanations
4. **Debug Mode** - For problem-solving and troubleshooting
5. **Test Mode** - For test-driven development and quality assurance

Each mode is configured through rule files (`.clinerules-[mode]`) that can be written in JSON, YAML, or TOML.

## Supported File Formats

Memory Bank MCP supports the following formats for rule files:

- **JSON** (JavaScript Object Notation)
- **YAML** (YAML Ain't Markup Language)
- **TOML** (Tom's Obvious, Minimal Language)

## Inspiration

Memory Bank MCP was inspired by [Roo Code Memory Bank](https://github.com/GreatScottyMac/roo-code-memory-bank) developed by Scott MacKenzie.

## How to Use

For more information on how to use Memory Bank MCP, refer to the specific documentation mentioned above.

---

*Memory Bank MCP - Maintaining context and memory across sessions*
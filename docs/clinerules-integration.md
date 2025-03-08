# Clinerules Integration

This document describes how the Memory Bank Server integrates with `.clinerules` files to provide mode-specific functionality.

## Overview

The `.clinerules` files are configuration files that define rules and behaviors for different modes of interaction with an AI assistant. The Memory Bank Server can detect and use these files when present in the project directory.

## Supported Files

The Memory Bank Server supports the following `.clinerules` files:

- `.clinerules-architect`: Rules for the Architect mode, focused on design and architecture
- `.clinerules-ask`: Rules for the Ask mode, focused on answering questions
- `.clinerules-code`: Rules for the Code mode, focused on code implementation
- `.clinerules-debug`: Rules for the Debug mode, focused on debugging
- `.clinerules-test`: Rules for the Test mode, focused on testing

## Structure of .clinerules Files

Each `.clinerules` file must follow a specific structure:

```json
{
  "mode": "mode_name",
  "instructions": {
    "general": ["Instruction 1", "Instruction 2", "..."],
    "umb": {
      "trigger": "^(Update Memory Bank|UMB)$",
      "instructions": ["UMB Instruction 1", "UMB Instruction 2", "..."],
      "override_file_restrictions": true
    },
    "memory_bank": {}
  },
  "mode_triggers": {
    "other_mode": [{ "condition": "trigger_for_other_mode" }]
  }
}
```

## Supported Features

### 1. Modes

The Memory Bank Server supports switching between different modes based on the available `.clinerules` files. Each mode can have specific behaviors and rules.

### 2. Status Prefix

All server responses include a status prefix that indicates whether the Memory Bank is active or inactive:

- `[MEMORY BANK: ACTIVE]`: Indicates that a Memory Bank was found and is being used
- `[MEMORY BANK: INACTIVE]`: Indicates that no Memory Bank was found

### 3. UMB Command (Update Memory Bank)

The UMB command allows temporarily updating Memory Bank files, even in modes that normally don't allow file modifications.

To use the UMB command:

1. Send the command "Update Memory Bank" or "UMB"
2. The server will enter UMB mode, allowing temporary updates
3. After completing the updates, the server will return to normal mode

### 4. Mode Triggers

Mode triggers allow automatic detection of situations that may require a mode change. When a trigger is detected, the server suggests switching to the corresponding mode.

## Command Line Usage

You can specify the initial mode when starting the server:

```bash
memory-bank-mcp --mode architect
# or
memory-bank-mcp -m code
```

## Additional MCP Tools

The integration with `.clinerules` files adds the following MCP tools:

### switch_mode

Switches to a specific mode.

```json
{
  "name": "switch_mode",
  "arguments": {
    "mode": "architect"
  }
}
```

### get_current_mode

Gets information about the current mode.

```json
{
  "name": "get_current_mode",
  "arguments": {
    "random_string": "dummy"
  }
}
```

### process_umb_command

Processes the Update Memory Bank (UMB) command.

```json
{
  "name": "process_umb_command",
  "arguments": {
    "command": "Update Memory Bank"
  }
}
```

## Workflow Example

1. Start the server with a specific mode:

   ```bash
   memory-bank-mcp --mode architect
   ```

2. The server detects the `.clinerules` files in the project directory

3. The server applies the rules of the specified mode

4. When needed, use the UMB command to update the Memory Bank:

   ```json
   {
     "name": "process_umb_command",
     "arguments": {
       "command": "Update Memory Bank"
     }
   }
   ```

5. Switch between modes as needed:

   ```json
   {
     "name": "switch_mode",
     "arguments": {
       "mode": "code"
     }
   }
   ```

## Security Considerations

- UMB mode allows temporary file modifications, but only for files within the Memory Bank
- File restrictions are applied based on the current mode
- Only modes with corresponding `.clinerules` files are available

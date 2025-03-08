# Memory Bank File Naming Convention

## Overview

This document describes the file naming convention used in the Memory Bank system. Consistent file naming is important for maintainability, code clarity, and reducing the complexity of file path handling.

## Naming Pattern

Memory Bank uses **kebab-case** for all file names, which means:

- All lowercase letters
- Words separated by hyphens (`-`)
- No spaces or special characters
- File extension is `.md` for all Memory Bank files

## Core Memory Bank Files

The following core files are used in every Memory Bank:

| File Name            | Description                       | URI                             |
| -------------------- | --------------------------------- | ------------------------------- |
| `product-context.md` | Project overview and context      | `memory-bank://product-context` |
| `active-context.md`  | Current project context and tasks | `memory-bank://active-context`  |
| `progress.md`        | Project progress and milestones   | `memory-bank://progress`        |
| `decision-log.md`    | Project decisions and rationale   | `memory-bank://decision-log`    |
| `system-patterns.md` | System patterns and architecture  | `memory-bank://system-patterns` |

## URI to Filename Mapping

The Memory Bank system uses a simple and consistent mapping between URIs and filenames:

1. URIs use the format `memory-bank://<name>`
2. Filenames are derived directly from the URI path by adding the `.md` extension
3. For example, `memory-bank://active-context` maps to `active-context.md`

This direct mapping eliminates the need for complex switch statements or mapping tables in the code.

## Benefits

- **Consistency**: All files follow the same naming pattern
- **Simplicity**: Direct mapping between URIs and filenames
- **Maintainability**: Easier to add new files without changing mapping code
- **Readability**: File names clearly indicate their purpose

## Migration

When migrating from the previous naming convention (camelCase), the following files need to be renamed:

- `productContext.md` → `product-context.md`
- `activeContext.md` → `active-context.md`
- `decisionLog.md` → `decision-log.md`
- `systemPatterns.md` → `system-patterns.md`

The code has been updated to use the new naming convention, but existing Memory Banks will need to have their files renamed manually.

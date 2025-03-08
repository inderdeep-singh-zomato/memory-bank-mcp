# Using Memory Bank MCP via npx

Memory Bank MCP can be easily executed via npx without prior installation.

## Basic Usage

```bash
npx @movibe/memory-bank-mcp
```

## Available Options

### Execution Mode

You can specify a specific execution mode:

```bash
npx @movibe/memory-bank-mcp --mode code
```

## Global Installation

If you prefer, you can also install the package globally:

```bash
npm install -g @movibe/memory-bank-mcp
```

And then run it directly:

```bash
memory-bank-mcp
```

## Installation Verification

To verify if the package is working correctly after installation, run:

```bash
npx @movibe/memory-bank-mcp --help
```

## Important Notes

1. Memory Bank MCP requires Node.js version 18 or higher.
2. When running via npx, the package will be temporarily downloaded and executed without permanent installation.
3. The first execution may be a bit slower due to the package download.

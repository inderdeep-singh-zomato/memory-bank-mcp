# Decision Log

This document tracks important decisions made during the development of the Memory Bank MCP.

## Approach for Type Safety Improvements

- **Date:** 2025-03-08
- **Context:** We needed to improve type safety in the Memory Bank MCP project, especially in the test-tools.ts script used to test server functionality.
- **Decision:** Implement strongly typed interfaces and types for all data structures used in the project, including configurations, tool parameters, and results. Add runtime type validation using type guards.
- **Alternatives Considered:** Using any for complex types, Ignoring linter errors related to types, Using less specific generic types
- **Consequences:** Better error detection at compile time, Better code documentation through types, Increased code reliability, Easier long-term maintenance

## Automated NPM Publication

- **Date:** 2025-03-08
- **Context:** The project requires manual version bumping and tag creation to trigger NPM publication, which can lead to delays in releasing updates and potential human errors.
- **Decision:** Modify the GitHub Actions workflow to automatically publish a new version to NPM whenever there's a merge to the main branch, with automatic patch version increments.
- **Alternatives Considered:** Keeping the manual tag-based release process, Using a separate release management tool, Implementing a scheduled release cycle
- **Consequences:** Faster and more consistent release cycle, Reduced manual intervention, Automatic version management, Potential for more frequent releases

## Memory Bank Recognition Investigation

- **Date:** 2025-03-08
- **Context:** The Memory Bank MCP tools are having trouble recognizing the existing Memory Bank directory, which prevents proper updating and management of the Memory Bank files.
- **Decision:** Investigate the root cause of the recognition issues and implement a fix to ensure the Memory Bank tools can properly recognize and interact with the existing Memory Bank directory.
- **Alternatives Considered:** Creating a new Memory Bank directory, Manually updating Memory Bank files without using the tools
- **Consequences:** Improved reliability of Memory Bank tools, Better user experience when managing Memory Bank files, Consistent behavior across different environments

## Configuration for npx usage

- **Date:** 2025-03-08
- **Context:** The project needs to be configured to be executed via npx after publication on npm.
- **Decision:** Implement the necessary configurations to allow execution via npx, including bin configuration in package.json, shebang verification, and appropriate documentation.
- **Alternatives Considered:** Not offering npx support and focusing only on global installation, Creating a separate script for npx execution
- **Consequences:** Ease of use without installation required, Better experience for users who prefer to test before installing, Clearer documentation about usage options

## Memory Bank Path Configuration

- **Date:** 2025-03-08 1:56:18 AM
- **Context:** The Memory Bank was not being correctly recognized by the MCP. We needed to configure the correct path for the Memory Bank.
- **Decision:** We configured the Memory Bank path to /Users/movibe/Documents/Cline/MCP/memory-bank-server/memory-bank using the mcp\_\_set_memory_bank_path command.
- **Alternatives Considered:**
  - Initialize a new Memory Bank
  - Migrate existing files to a new directory
  - Modify the code to recognize the existing directory
- **Consequences:**
  - The Memory Bank is now correctly recognized by the MCP
  - All existing files are available and working
  - No need to create or migrate files
  - Resolved the Memory Bank recognition issue listed in known issues

## Using Current Directory as Default for Memory Bank

- **Date:** 2025-03-08 2:04:16 AM
- **Context:** When the user doesn't specify a path for the Memory Bank, the system needs to decide which directory to use as default.
- **Decision:** We modified the project to use the current directory (process.cwd()) as default when no path is specified for the Memory Bank.
- **Alternatives Considered:**
  - Use a fixed directory as default
  - Require the user to always specify a path
  - Use the user's home directory as default
- **Consequences:**
  - Greater ease of use, as the user doesn't need to specify a path
  - More intuitive behavior, as the Memory Bank is created in the current directory
  - Compatibility with previous behavior, as the path parameter is still accepted
  - Better experience for new users who are experimenting with the system

## English Language Standardization for Memory Bank

- **Date:** 2025-03-08 2:04:23 AM
- **Context:** The Memory Bank needs to have a standard language to ensure consistency across different environments and for different users.
- **Decision:** We modified the project to always generate the Memory Bank in English, regardless of the system locale.
- **Alternatives Considered:**
  - Use the operating system language
  - Allow the user to choose the language
  - Automatically detect the language based on existing content
- **Consequences:**
  - Greater consistency across different environments
  - Ease of collaboration between users from different countries
  - Compatibility with tools and systems that expect English content
  - Simplification of code, as there's no need to handle multiple languages

## Implementation of Semantic Versioning with Changelog Generation

- **Date:** 2025-03-08 2:10:24 AM
- **Context:** The project needed a standardized approach to versioning and a way to automatically generate a changelog based on commit messages.
- **Decision:** Implemented Semantic Versioning with automatic changelog generation using standard-version in the GitHub Actions workflow for npm publish.
- **Alternatives Considered:**
  - Manual version management
  - Using a different versioning tool like semantic-release
  - Not using automatic versioning at all
- **Consequences:**
  - Automatic version bumping based on commit message types
  - Standardized changelog generation
  - Better documentation of changes for users
  - Enforced commit message format for contributors
  - Simplified release process

## Roo Code Integration Strategy

- **Date:** 2025-03-08 10:42:38 AM
- **Context:** When running Memory Bank MCP in Roo Code environments, the system was encountering errors because it was trying to create .clinerules files in the root directory (/), which is a read-only file system. This prevented the Memory Bank from initializing properly.
- **Decision:** Implemented a fallback directory strategy that uses alternative writable directories (home directory or temporary directory) when the project directory is read-only. Enhanced error handling throughout the codebase to continue operation despite non-critical errors.
- **Alternatives Considered:**
  - Require users to manually create .clinerules files in a writable location
  - Disable .clinerules functionality in read-only environments
  - Store .clinerules content in memory without writing to disk
- **Consequences:**
  - Memory Bank MCP now works correctly in Roo Code environments
  - The system is more robust when running in environments with file system restrictions
  - Users don't need to manually configure anything for read-only environments
  - The codebase is more resilient to errors in general

## Environment Variables Configuration Support

- **Date:** 2025-03-08 10:48:08 AM
- **Context:** When running Memory Bank MCP in environments like Roo Code with read-only file systems, users were encountering errors because the system was trying to create files in directories that weren't writable. While we implemented fallback directory strategies, users needed a way to explicitly specify a writable project directory without modifying the code.
- **Decision:** Implemented support for environment variables (MEMORY_BANK_PROJECT_PATH and MEMORY_BANK_MODE) to allow users to configure Memory Bank MCP without modifying command-line arguments. Modified the codebase to consistently use the project path throughout the application.
- **Alternatives Considered:**
  - Add a configuration file option
  - Only support command-line arguments
  - Automatically detect writable directories without user input
- **Consequences:**
  - Users can now easily configure Memory Bank MCP in environments with read-only file systems
  - The system is more flexible and can be configured in containerized environments
  - Environment variables take precedence over command-line arguments, providing a clear priority order
  - Added documentation makes it easy for users to understand how to use the environment variables

## Memory Bank Location

- **Date:** 2025-03-08 10:59:25 AM
- **Context:** Needed to determine where to store the Memory Bank files for the project
- **Decision:** Initialized Memory Bank in /Users/movibe/Documents/Cline/MCP/memory-bank-server
- **Alternatives Considered:**
  - Use default location
  - Create a separate repository for Memory Bank
- **Consequences:**
  - Memory Bank files will be stored alongside the server code
  - Easier access to project documentation
  - Version control will include Memory Bank updates

## Clinerule Templates Format Standardization

- **Date:** 2025-03-08 11:05:55 AM
- **Context:** The templates in ClineruleTemplates.ts were using JSON format, while the actual .clinerules files in the project were using YAML format. This inconsistency could lead to problems when creating new .clinerules files.
- **Decision:** Updated all templates in ClineruleTemplates.ts to use YAML format that matches the existing .clinerules files in the project.
- **Alternatives Considered:**
  - Keep JSON format and convert existing files
  - Create a conversion utility to handle both formats
  - Support both formats in the codebase
- **Consequences:**
  - Consistent format across all .clinerules files
  - New files will match existing ones in format and functionality
  - Improved readability of template files
  - No need for format conversion when creating new files

## Documentation of Memory Bank Status Prefix System

- **Date:** 2025-03-08 11:16:45 AM
- **Context:** The Memory Bank status prefix system ([MEMORY BANK: ACTIVE], [MEMORY BANK: INACTIVE], [MEMORY BANK: UPDATING]) is a key feature of the project, but was not properly documented. Users needed clear information about what these status indicators mean and how they work.
- **Decision:** Created comprehensive documentation about the Memory Bank status prefix system, including a dedicated documentation file, updates to the README, and integration with the usage modes documentation.
- **Alternatives Considered:**
  - Add minimal documentation only in the README
  - Document only in code comments
  - Create a separate repository wiki page
- **Consequences:**
  - Users now have clear information about what the status prefixes mean
  - Improved troubleshooting guidance for when Memory Bank is inactive
  - Better integration of status system with overall documentation
  - Enhanced understanding of the Memory Bank operational states

## Memory Bank Update Strategy
- **Date:** 2025-03-08 5:06:53 PM
- **Author:** @movibe
- **Context:** The Memory Bank needed to be updated to reflect the current state of the project, ensuring all files are in English and contain comprehensive information.
- **Decision:** Update the Memory Bank with the latest project status, verifying all files are in English and properly documenting recent improvements including type safety enhancements, documentation updates, and bug fixes.
- **Alternatives Considered:** 
  - Create new Memory Bank files from scratch
  - Only update specific files that need changes
  - Automate the update process with a script
- **Consequences:** 
  - All Memory Bank files are now up-to-date and in English
  - The project history and context are preserved
  - Recent improvements are properly documented
  - The Memory Bank is ready for future updates

## Removal of Environment Variables Support
- **Date:** 2025-03-08 5:19:03 PM
- **Author:** @movibe
- **Context:** The project was using environment variables (MEMORY_BANK_PROJECT_PATH, MEMORY_BANK_FOLDER_NAME, MEMORY_BANK_MODE, MEMORY_BANK_USER_ID) as an alternative way to configure the Memory Bank MCP. This approach was adding complexity to the codebase and documentation.
- **Decision:** Remove all support for environment variables from the codebase and documentation, focusing exclusively on command-line arguments for configuration.
- **Alternatives Considered:** 
  - Keep environment variables support but mark as deprecated
  - Keep environment variables support only for specific use cases
  - Replace environment variables with a configuration file
- **Consequences:** 
  - Simplified codebase with fewer configuration options
  - More consistent configuration approach
  - Clearer documentation
  - Reduced maintenance burden
  - Users who were relying on environment variables will need to switch to command-line arguments

## Memory Bank Directory Structure Simplification
- **Date:** 2025-03-08 5:23:30 PM
- **Author:** @movibe
- **Context:** The Memory Bank initialization was creating unnecessary subdirectories (progress, decisions, context, templates, backups, modes) and placing files in those subdirectories, but the rest of the codebase expected the files to be in the root directory of the Memory Bank. This was causing confusion and potential issues with file access.
- **Decision:** Simplify the Memory Bank directory structure by removing the creation of subdirectories and placing all core files directly in the root directory of the Memory Bank.
- **Alternatives Considered:** 
  - Keep the subdirectory structure but modify all file access code to look in subdirectories
  - Create a hybrid approach with some files in subdirectories and some in the root
  - Add symbolic links from the root to files in subdirectories
- **Consequences:** 
  - Simpler and more consistent directory structure
  - Better alignment with how files are accessed throughout the codebase
  - Easier maintenance and debugging
  - Reduced risk of file access errors
  - Cleaner user experience

## Correção do caminho do Memory Bank para usar folderName
- **Date:** 2025-03-09 6:13:29 PM
- **Author:** @movibe
- **Context:** O Memory Bank estava sendo criado e atualizado na raiz do projeto, em vez de usar o diretório + nome da pasta recebida via argumentos ou definida no prompt. Isso ocorria porque o código não estava usando o folderName corretamente.
- **Decision:** Modificar os métodos setCustomPath, findMemoryBankDir e initializeMemoryBank para combinar o caminho base com o folderName, garantindo que o Memory Bank seja criado e acessado no diretório correto.
- **Alternatives Considered:** 
  - Manter o comportamento atual e documentar que o Memory Bank é sempre criado na raiz
  - Adicionar uma opção de configuração para escolher entre usar o folderName ou não
  - Criar uma estrutura de diretórios mais complexa com subdiretórios para diferentes tipos de arquivos
- **Consequences:** 
  - Os arquivos do Memory Bank serão criados no diretório correto (projectPath/folderName)
  - Melhor organização dos arquivos do projeto
  - Compatibilidade com a documentação e expectativas do usuário
  - Possível necessidade de migrar Memory Banks existentes para a nova estrutura

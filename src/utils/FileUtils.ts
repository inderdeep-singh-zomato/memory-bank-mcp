import fs from 'fs-extra';
import path from 'path';

/**
 * Utility class for file operations
 * 
 * Provides methods for common file system operations with proper error handling.
 */
export class FileUtils {
  /**
   * Ensures a directory exists, creating it if necessary
   * 
   * @param dirPath - Path to the directory
   * @throws Error if directory creation fails
   */
  static async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.ensureDir(dirPath);
    } catch (error) {
      throw new Error(`Failed to create directory ${dirPath}: ${error}`);
    }
  }

  /**
   * Checks if a file or directory exists
   * 
   * @param filePath - Path to check
   * @returns True if the path exists, false otherwise
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      return fs.pathExists(filePath);
    } catch (error) {
      console.error(`Error checking if path exists ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Reads a file's contents
   * 
   * @param filePath - Path to the file
   * @returns The file contents as a string
   * @throws Error if file reading fails
   */
  static async readFile(filePath: string): Promise<string> {
    try {
      return fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  /**
   * Writes content to a file
   * 
   * @param filePath - Path to the file
   * @param content - Content to write
   * @throws Error if file writing fails
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.writeFile(filePath, content);
    } catch (error) {
      throw new Error(`Failed to write to file ${filePath}: ${error}`);
    }
  }

  /**
   * Lists files in a directory
   * 
   * @param dirPath - Path to the directory
   * @returns Array of file names
   * @throws Error if directory reading fails
   */
  static async listFiles(dirPath: string): Promise<string[]> {
    try {
      return fs.readdir(dirPath);
    } catch (error) {
      throw new Error(`Failed to list files in directory ${dirPath}: ${error}`);
    }
  }

  /**
   * Gets file statistics
   * 
   * @param filePath - Path to the file
   * @returns File statistics
   * @throws Error if stat operation fails
   */
  static async getFileStats(filePath: string): Promise<fs.Stats> {
    try {
      return fs.stat(filePath);
    } catch (error) {
      throw new Error(`Failed to get file stats for ${filePath}: ${error}`);
    }
  }

  /**
   * Checks if a path is a directory
   * 
   * @param dirPath - Path to check
   * @returns True if the path is a directory, false otherwise
   */
  static async isDirectory(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * Deletes a file or directory
   * 
   * @param targetPath - Path to delete
   * @throws Error if deletion fails
   */
  static async delete(targetPath: string): Promise<void> {
    try {
      await fs.remove(targetPath);
    } catch (error) {
      throw new Error(`Failed to delete ${targetPath}: ${error}`);
    }
  }

  /**
   * Copies a file or directory
   * 
   * @param sourcePath - Source path
   * @param destPath - Destination path
   * @throws Error if copy operation fails
   */
  static async copy(sourcePath: string, destPath: string): Promise<void> {
    try {
      await fs.copy(sourcePath, destPath);
    } catch (error) {
      throw new Error(`Failed to copy from ${sourcePath} to ${destPath}: ${error}`);
    }
  }

  /**
   * Joins path segments
   * 
   * @param paths - Path segments to join
   * @returns Joined path
   */
  static joinPath(...paths: string[]): string {
    return path.join(...paths);
  }

  /**
   * Deletes a file
   * 
   * @param filePath - Path to the file to delete
   * @throws Error if file deletion fails
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.remove(filePath);
    } catch (error) {
      throw new Error(`Failed to delete file ${filePath}: ${error}`);
    }
  }
}
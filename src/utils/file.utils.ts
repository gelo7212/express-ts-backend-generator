import * as fs from 'fs';
import * as path from 'path';

/**
 * Check if a directory exists
 */
export function directoryExists(dirPath: string): boolean {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * Create directory recursively if it doesn't exist
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!directoryExists(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get the relative path from source to target
 */
export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}

/**
 * Join paths in a cross-platform way
 */
export function joinPaths(...paths: string[]): string {
  return path.join(...paths);
}

/**
 * Get the directory name of a file path
 */
export function getDirName(filePath: string): string {
  return path.dirname(filePath);
}

/**
 * Get the base name of a file path
 */
export function getBaseName(filePath: string, ext?: string): string {
  return path.basename(filePath, ext);
}

/**
 * Get the extension of a file path
 */
export function getExtension(filePath: string): string {
  return path.extname(filePath);
}

/**
 * Write file and create directory structure if needed
 */
export function writeFileWithDir(filePath: string, content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dir = getDirName(filePath);
    ensureDirectoryExists(dir);
    
    fs.writeFile(filePath, content, 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

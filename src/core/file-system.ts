import { promises as fs } from 'fs';
import path from 'path';
import { IFileSystem } from '../types';

/**
 * File system implementation using Node.js fs promises
 */
export class FileSystem implements IFileSystem {
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    await this.createDirectory(dir);
    await fs.writeFile(filePath, content, 'utf8');
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async copyFile(source: string, destination: string): Promise<void> {
    const dir = path.dirname(destination);
    await this.createDirectory(dir);
    await fs.copyFile(source, destination);
  }

  async readDirectory(dirPath: string): Promise<string[]> {
    return fs.readdir(dirPath);
  }

  async removeFile(filePath: string): Promise<void> {
    await fs.unlink(filePath);
  }

  async removeDirectory(dirPath: string): Promise<void> {
    await fs.rmdir(dirPath, { recursive: true });
  }

  getAbsolutePath(relativePath: string): string {
    return path.resolve(relativePath);
  }

  joinPath(...parts: string[]): string {
    return path.join(...parts);
  }

  getExtension(filePath: string): string {
    return path.extname(filePath);
  }

  getBasename(filePath: string, ext?: string): string {
    return path.basename(filePath, ext);
  }

  getDirname(filePath: string): string {
    return path.dirname(filePath);
  }
}

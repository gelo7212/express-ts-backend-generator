import { BaseGenerator } from './base-generator';
import { 
  ILogger, 
  IFileSystem, 
  ITemplateEngine
} from '../types';
import { ITemplateRegistry } from '../templates';

/**
 * Generator for creating repositories
 */
export class RepositoryGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'repository');
  }

  canHandle(type: string): boolean {
    return type === 'repository';
  }

  getDescription(): string {
    return 'Generates repository interface and implementation for an existing domain';
  }
}

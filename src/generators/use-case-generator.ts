import { BaseGenerator } from './base-generator';
import { 
  ILogger, 
  IFileSystem, 
  ITemplateEngine
} from '../types';
import { ITemplateRegistry } from '../templates';

/**
 * Generator for creating use cases
 */
export class UseCaseGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'use-case');
  }

  canHandle(type: string): boolean {
    return type === 'use-case';
  }

  getDescription(): string {
    return 'Generates use cases for an existing domain';
  }
}

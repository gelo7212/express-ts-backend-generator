import { BaseGenerator } from './base-generator';
import { 
  ILogger, 
  IFileSystem, 
  ITemplateEngine
} from '../types';
import { ITemplateRegistry } from '../templates';

/**
 * Generator for creating domain services
 */
export class ServiceGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'service');
  }

  canHandle(type: string): boolean {
    return type === 'service';
  }

  getDescription(): string {
    return 'Generates a domain service for an existing domain';
  }
}

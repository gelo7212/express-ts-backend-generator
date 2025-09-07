import { BaseGenerator } from './base-generator';
import { 
  ILogger, 
  IFileSystem, 
  ITemplateEngine
} from '../types';
import { ITemplateRegistry } from '../templates';

/**
 * Generator for creating value objects
 */
export class ValueObjectGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'value-object');
  }

  canHandle(type: string): boolean {
    return type === 'value-object';
  }

  getDescription(): string {
    return 'Generates a value object for an existing domain';
  }
}

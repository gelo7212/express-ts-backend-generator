import { BaseGenerator } from './base-generator';
import { 
  ILogger, 
  IFileSystem, 
  ITemplateEngine
} from '../types';
import { ITemplateRegistry } from '../templates';

/**
 * Generator for creating controllers
 */
export class ControllerGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'controller');
  }

  canHandle(type: string): boolean {
    return type === 'controller';
  }

  getDescription(): string {
    return 'Generates a controller for an existing domain';
  }
}

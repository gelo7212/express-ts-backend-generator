import { BaseGenerator } from './base-generator';
import { GenerationContext, IFileSystem, ILogger, ITemplateEngine } from '../types';
import { ITemplateRegistry } from '../templates';

/**
 * Generator for creating entities
 */
export class EntityGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'entity');
  }

  canHandle(type: string): boolean {
    return type === 'entity';
  }

  getDescription(): string {
    return 'Generate a domain entity with associated files';
  }

  async generate(context: GenerationContext) {
    if (!context.domainName || !context.entityName) {
      throw new Error('Domain name and entity name are required for entity generation');
    }

    // Check if domain exists
    const domainPath = this.fileSystem.joinPath(
      context.projectPath,
      'src',
      'domain',
      context.templateData.domainNames?.lowercase || context.domainName.toLowerCase()
    );

    const domainExists = await this.fileSystem.exists(domainPath);
    if (!domainExists) {
      throw new Error(`Domain ${context.domainName} does not exist. Generate the domain first.`);
    }

    return super.generate(context);
  }
}

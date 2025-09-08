import { BaseGenerator } from './base-generator';
import { 
  ILogger, 
  IFileSystem, 
  ITemplateEngine,
  GenerationContext
} from '../types';
import { ITemplateRegistry } from '../templates';
import { ContainerManager } from '../core/container-manager';

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

  async generate(context: GenerationContext) {
    // Generate repository files first
    const result = await super.generate(context);
    
    // If generation was successful, update container and types
    if (result.success) {
      try {
        const containerManager = new ContainerManager(this.fileSystem, this.logger);
        await containerManager.updateContainerWithDomain(context.templateData.domainNames);
        await containerManager.updateTypesWithDomain(context.templateData.domainNames);
        result.generatedFiles.push('src/infrastructure/types.ts (auto-updated)');
        result.generatedFiles.push('src/infrastructure/container.ts (auto-updated)');
        
      } catch (error: any) {
        this.logger.warning(`Auto-update failed: ${error.message}`);
      }
    }
    
    return result;
  }
}

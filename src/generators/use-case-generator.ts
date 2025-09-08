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

  async generate(context: GenerationContext) {
    // Generate use case files first
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

import { BaseGenerator } from './base-generator';
import { 
  GenerationContext, 
  GenerationResult,
  ILogger, 
  IFileSystem, 
  ITemplateEngine
} from '../types';
import { ITemplateRegistry } from '../templates';

/**
 * Generator for creating presentation HTTP layer (controllers, DTOs, routes)
 */
export class PresentationHttpGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'presentation-http');
  }

  canHandle(type: string): boolean {
    return type === 'presentation-http';
  }

  getDescription(): string {
    return 'Generates presentation HTTP layer (controllers, DTOs, routes) for an existing domain';
  }

  async generate(context: GenerationContext): Promise<GenerationResult> {
    const result: GenerationResult = {
      success: false,
      generatedFiles: [],
      errors: []
    };

    try {
      this.logger.debug('Starting presentation HTTP generation');
      this.validateContext(context);
      
      const { domainNames } = context.templateData;
      
      // Generate controller
      const controllerPath = `src/presentation/http/controllers/${domainNames.kebabCase}.controller.ts`;
      if (!await this.fileSystem.exists(controllerPath) || context.options.force) {
        const controllerContent = await this.templateEngine.renderFile('presentation/controller.ts.ejs', context.templateData);
        await this.fileSystem.writeFile(controllerPath, controllerContent);
        result.generatedFiles.push(controllerPath);
      }

      // Generate HTTP DTO
      const httpDtoPath = `src/presentation/http/dto/${domainNames.kebabCase}.dto.ts`;
      if (!await this.fileSystem.exists(httpDtoPath) || context.options.force) {
        const httpDtoContent = await this.templateEngine.renderFile('presentation/http-dto.ts.ejs', context.templateData);
        await this.fileSystem.writeFile(httpDtoPath, httpDtoContent);
        result.generatedFiles.push(httpDtoPath);
      }

      // Generate routes
      const routesPath = `src/presentation/http/routes/${domainNames.kebabCase}.routes.ts`;
      if (!await this.fileSystem.exists(routesPath) || context.options.force) {
        const routesContent = await this.templateEngine.renderFile('presentation/routes.ts.ejs', context.templateData);
        await this.fileSystem.writeFile(routesPath, routesContent);
        result.generatedFiles.push(routesPath);
      }

      result.success = true;
      this.logger.debug(`Presentation HTTP generation completed`);
      
    } catch (error: any) {
      this.logger.error(`Presentation HTTP generation failed: ${error.message}`);
      result.errors.push(error.message);
    }

    return result;
  }
}

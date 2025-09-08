import { BaseGenerator } from './base-generator';
import { 
  GenerationContext, 
  GenerationResult,
  ILogger, 
  IFileSystem, 
  ITemplateEngine
} from '../types';
import { ITemplateRegistry } from '../templates';
import { ContainerManager } from '../core/container-manager';

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

      // Update route registry
      await this.updateRouteRegistry(context);
      
      // Update container and types using centralized manager
      const containerManager = new ContainerManager(this.fileSystem, this.logger);
      await containerManager.updateContainerWithDomain(context.templateData.domainNames);
      await containerManager.updateTypesWithDomain(context.templateData.domainNames);

      result.success = true;
      this.logger.debug(`Presentation HTTP generation completed`);
      
    } catch (error: any) {
      this.logger.error(`Presentation HTTP generation failed: ${error.message}`);
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Updates the route registry index file to include the new route
   */
  private async updateRouteRegistry(context: GenerationContext): Promise<void> {
    const { domainNames } = context.templateData;
    const routeIndexPath = 'src/presentation/http/routes/index.ts';
    
    try {
      // Check if route registry exists, if not create it
      if (!await this.fileSystem.exists(routeIndexPath)) {
        this.logger.info('Creating route registry index file...');
        const initialContent = await this.templateEngine.renderFile('presentation/route-index.ts.ejs', {});
        await this.fileSystem.writeFile(routeIndexPath, initialContent);
      }

      // Read existing content
      const existingContent = await this.fileSystem.readFile(routeIndexPath);
      
      // Check if route is already registered
      const routeImportPattern = new RegExp(`import ${domainNames.camelCase}Routes from './${domainNames.kebabCase}.routes';`, 'g');
      const routeRegisterPattern = new RegExp(`path: '/${domainNames.kebabCase}'`, 'g');
      
      if (routeImportPattern.test(existingContent) && routeRegisterPattern.test(existingContent)) {
        this.logger.debug(`Route ${domainNames.kebabCase} already registered in route registry`);
        return;
      }

      // Add import at the top (after existing imports)
      const importStatement = `import ${domainNames.camelCase}Routes from './${domainNames.kebabCase}.routes';`;
      const importRegex = /(import.*from.*\.routes';?\s*\n)/g;
      let updatedContent = existingContent;
      
      // Find the last import and add new import after it
      const matches = [...existingContent.matchAll(importRegex)];
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        const insertPosition = lastMatch.index! + lastMatch[0].length;
        updatedContent = existingContent.slice(0, insertPosition) + 
                        importStatement + '\n' + 
                        existingContent.slice(insertPosition);
      } else {
        // No existing route imports, add after the RouteRegistry import
        updatedContent = existingContent.replace(
          /(import { RouteRegistry }.*\n\n)/,
          `$1${importStatement}\n`
        );
      }

      // Add route registration
      const routeRegistration = `
// Register ${domainNames.pascalCase} routes
RouteRegistry.register({
  path: '/${domainNames.kebabCase}',
  router: ${domainNames.camelCase}Routes,
  name: '${domainNames.pascalCase} Routes',
  description: '${domainNames.pascalCase} management endpoints'
});`;

      // Insert before the auto-generated section
      updatedContent = updatedContent.replace(
        /\/\/ START_GENERATED_ROUTES/,
        routeRegistration + '\n\n// START_GENERATED_ROUTES'
      );

      await this.fileSystem.writeFile(routeIndexPath, updatedContent);
      this.logger.info(`✅ Updated route registry with ${domainNames.pascalCase} routes`);
      
    } catch (error: any) {
      this.logger.error(`Failed to update route registry: ${error.message}`);
    }
  }


}

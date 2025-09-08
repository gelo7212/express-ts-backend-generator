import { BaseGenerator } from './base-generator';
import { GenerationContext, IFileSystem, ILogger, ITemplateEngine } from '../types';
import { ITemplateRegistry } from '../templates';
import { ContainerManager } from '../core/container-manager';

/**
 * Generator for creating domain structures
 */
export class DomainGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'domain');
  }

  canHandle(type: string): boolean {
    return type === 'domain';
  }

  getDescription(): string {
    return 'Generate a complete domain structure with entities, repositories, and services';
  }

  async generate(context: GenerationContext) {
    if (!context.domainName) {
      throw new Error('Domain name is required for domain generation');
    }

    // Check if domain already exists
    const domainPath = this.fileSystem.joinPath(
      context.projectPath,
      'src',
      'domain',
      context.templateData.domainNames?.lowercase || context.domainName.toLowerCase()
    );

    const domainExists = await this.fileSystem.exists(domainPath);
    if (domainExists && !context.options.force) {
      this.logger.warning(`Domain ${context.domainName} already exists. Use --force to overwrite.`);
      return {
        success: false,
        generatedFiles: [],
        errors: [`Domain ${context.domainName} already exists`]
      };
    }

    // Generate all domain files first
    const result = await super.generate(context);
    
    // If generation was successful, use ContainerManager for complete auto-updates
    if (result.success) {
      try {
        // Create ContainerManager instance
        const containerManager = new ContainerManager(this.fileSystem, this.logger);
        await containerManager.updateContainerWithDomain(context.templateData.domainNames);
        await containerManager.updateTypesWithDomain(context.templateData.domainNames);
        result.generatedFiles.push('src/infrastructure/types.ts (auto-updated)');
        result.generatedFiles.push('src/infrastructure/container.ts (auto-updated)');
        
        // If HTTP presentation layer was generated, update route registry
        const httpControllerPath = this.fileSystem.joinPath(
          context.projectPath,
          'src',
          'presentation',
          'http',
          'controllers',
          `${context.domainName.toLowerCase()}.controller.ts`
        );
        
        if (await this.fileSystem.exists(httpControllerPath)) {
          await this.updateRouteRegistry(context);
          result.generatedFiles.push('src/presentation/http/routes/index.ts (auto-updated)');
        }
        
      } catch (error: any) {
        this.logger.warning(`Auto-update failed: ${error.message}`);
        // Fallback to old method
        await this.updateTypesFile(context);
        result.generatedFiles.push('src/infrastructure/types.ts (updated)');
      }
    }
    
    return result;
  }

  /**
   * Update the route registry with new domain routes
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

  /**
   * Update the infrastructure/types.ts file with new domain types
   */
  private async updateTypesFile(context: GenerationContext): Promise<void> {
    const { domainNames } = context.templateData;
    const typesPath = 'src/infrastructure/types.ts';
    
    try {
      // Read current types file
      const currentContent = await this.fileSystem.readFile(typesPath);
      
      // Create new TYPES entries for the domain
      const newTypes = `,
  
  // ${domainNames.pascalCase} Domain Services
  ${domainNames.pascalCase}DomainService: Symbol.for('${domainNames.pascalCase}DomainService'),
  
  // ${domainNames.pascalCase} Application Services
  ${domainNames.pascalCase}ApplicationService: Symbol.for('${domainNames.pascalCase}ApplicationService'),
  
  // ${domainNames.pascalCase} Use Cases
  Create${domainNames.pascalCase}UseCase: Symbol.for('Create${domainNames.pascalCase}UseCase'),
  Get${domainNames.pascalCase}UseCase: Symbol.for('Get${domainNames.pascalCase}UseCase'),
  Update${domainNames.pascalCase}UseCase: Symbol.for('Update${domainNames.pascalCase}UseCase'),
  Delete${domainNames.pascalCase}UseCase: Symbol.for('Delete${domainNames.pascalCase}UseCase'),
  
  // ${domainNames.pascalCase} Repository
  ${domainNames.pascalCase}Repository: Symbol.for('${domainNames.pascalCase}Repository'),
  
  // ${domainNames.pascalCase} Controller
  ${domainNames.pascalCase}Controller: Symbol.for('${domainNames.pascalCase}Controller')`;

      // Find the insertion point (before the closing brace of TYPES)
      const insertionPoint = currentContent.lastIndexOf('};');
      if (insertionPoint === -1) {
        throw new Error('Could not find TYPES object closing brace in types.ts');
      }

      // Insert new types before the closing brace
      const updatedContent = 
        currentContent.slice(0, insertionPoint) + 
        newTypes + '\n' +
        currentContent.slice(insertionPoint);

      // Write updated content
      await this.fileSystem.writeFile(typesPath, updatedContent);
      
      this.logger.debug(`Updated ${typesPath} with ${domainNames.pascalCase} domain types`);
      
    } catch (error: any) {
      this.logger.warning(`Failed to update types.ts: ${error.message}`);
    }
  }
}

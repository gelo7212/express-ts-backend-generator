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
 * Generator for HTTP Client Infrastructure
 * Generates HTTP client with Axios, interceptors, and API services
 */
export class HttpGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'http');
  }

  canHandle(type: string): boolean {
    return type === 'http' || type === 'http-client' || type === 'api-client';
  }

  supports(type: string): boolean {
    return this.canHandle(type);
  }

  getDescription(): string {
    return 'Generates HTTP client infrastructure with Axios for external API integration';
  }

  async generate(context: GenerationContext): Promise<GenerationResult> {
    try {
      this.logger.info('🚀 Generating HTTP client infrastructure...');
      
      // Validate required context
      if (!context.entityName) {
        throw new Error('Service name (entityName) is required for HTTP generation');
      }

      // Check if core HTTP infrastructure already exists
      const coreFilesExist = await this.checkCoreFilesExist(context);
      const forceCore = context.options.force === true || context.options.forceCore === true;

      if (coreFilesExist && !forceCore) {
        this.logger.info('🔒 Core HTTP infrastructure already exists. Updating services only...');
        this.logger.warning('⚠️  Use --force-core to update all core files (will prompt for confirmation)');
        
        // Generate only service files
        const result = await this.generateServiceOnly(context);
        
        if (result.success && result.generatedFiles.length > 0) {
          await this.updateInfrastructureFiles(context);
        }
        
        return result;
      } else if (coreFilesExist && forceCore) {
        // Prompt user for confirmation when forcing core updates
        const shouldUpdate = await this.promptForCoreUpdate(context);
        if (!shouldUpdate) {
          this.logger.info('❌ Core update cancelled by user');
          return {
            success: false,
            generatedFiles: [],
            errors: ['Core update cancelled by user']
          };
        }
        
        this.logger.warning('⚠️  Updating ALL core HTTP infrastructure files...');
      }

      // Debug: Log the template data to see what's being passed
      this.logger.debug('Template data being passed to templates:');
      this.logger.debug(JSON.stringify(context.templateData, null, 2));

      // Call the parent generate method which handles template processing properly
      const result = await super.generate(context);

      // Update package.json if generation was successful
      if (result.success && result.generatedFiles.length > 0) {
        await this.updatePackageJson(context);
        await this.updateInfrastructureFiles(context);
      }

      if (result.success) {
        this.logger.success(`✅ HTTP infrastructure generated successfully! Created ${result.generatedFiles.length} file(s)`);
        this.logger.info(`
📋 Generated HTTP Infrastructure:
   📁 src/infrastructure/http/
   ├── 📄 http-client.base.ts       (Base HTTP client with Axios)
   ├── 📄 http-client.factory.ts    (Factory for creating clients)
   ├── 📄 http-client.config.ts     (Configuration interface)
   ├── 📁 services/
   │   └── 📄 ${context.templateData.entityName?.kebabCase || context.entityName}-api.service.ts (API service)
   ├── 📁 types/
   │   ├── 📄 api.types.ts          (API interfaces)
   │   └── 📄 responses.types.ts    (Response types)
   ├── 📁 interceptors/
   │   └── 📄 index.ts              (Request/Response interceptors)
   └── 📄 index.ts                  (Main exports)

🔧 Next Steps:
   1. Configure API base URL in http-client.config.ts
   2. Set up authentication in interceptors/index.ts
   3. Add API endpoints to ${context.templateData.entityName?.kebabCase || context.entityName}-api.service.ts
   4. Import and use in your application layer

💡 Usage Example:
   import { ${context.templateData.entityName?.pascalCase || context.entityName}ApiService } from '@/infrastructure/http';
   
   const apiService = container.resolve('${context.templateData.entityName?.camelCase || context.entityName}ApiService');
   const result = await apiService.getAll();
        `);
      }

      return result;

    } catch (error) {
      const errorMsg = `HTTP generation failed: ${error}`;
      this.logger.error(`❌ ${errorMsg}`);
      return {
        success: false,
        generatedFiles: [],
        errors: [errorMsg]
      };
    }
  }

  /**
   * Update package.json with required dependencies
   */
  private async updatePackageJson(context: GenerationContext): Promise<void> {
    try {
      const packageJsonPath = 'package.json';
      
      if (!await this.fileSystem.exists(packageJsonPath)) {
        this.logger.warning('⚠️  package.json not found, skipping dependency update');
        return;
      }

      const content = await this.fileSystem.readFile(packageJsonPath);
      const packageJson = JSON.parse(content);

      // Add dependencies
      if (!packageJson.dependencies) packageJson.dependencies = {};

      const requiredDeps = {
        'axios': '^1.6.0'
      };

      let updated = false;
      Object.entries(requiredDeps).forEach(([pkg, version]) => {
        if (!packageJson.dependencies[pkg]) {
          packageJson.dependencies[pkg] = version;
          updated = true;
          this.logger.info(`📦 Added dependency: ${pkg}@${version}`);
        }
      });

      if (updated) {
        await this.fileSystem.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        this.logger.info('📦 Updated package.json with HTTP dependencies');
      }

    } catch (error) {
      this.logger.warning(`⚠️  Could not update package.json: ${error}`);
    }
  }

  /**
   * Update infrastructure files (types and container)
   */
  private async updateInfrastructureFiles(context: GenerationContext): Promise<void> {
    await this.updateInfrastructureTypes(context);
    await this.updateInfrastructureContainer(context);
  }

  /**
   * Update infrastructure types.ts to export HTTP types
   */
  private async updateInfrastructureTypes(context: GenerationContext): Promise<void> {
    try {
      const typesPath = 'src/infrastructure/types.ts';
      
      if (!await this.fileSystem.exists(typesPath)) {
        this.logger.info('ℹ️  Infrastructure types.ts not found, skipping type exports update');
        return;
      }

      const content = await this.fileSystem.readFile(typesPath);
      
      // Check if HTTP exports already exist
      if (content.includes('export * from \'./http\';')) {
        this.logger.info('ℹ️  HTTP types already exported in infrastructure types');
        return;
      }

      // Add HTTP exports
      const updatedContent = content + '\n\n// HTTP Infrastructure Types\nexport * from \'./http\';\n';
      await this.fileSystem.writeFile(typesPath, updatedContent);
      
      this.logger.info('🔧 Updated infrastructure types.ts with HTTP exports');

    } catch (error) {
      this.logger.warning(`⚠️  Could not update infrastructure types: ${error}`);
    }
  }

  /**
   * Update infrastructure container to register HTTP services
   */
  private async updateInfrastructureContainer(context: GenerationContext): Promise<void> {
    try {
      const containerPath = 'src/infrastructure/container.ts';
      
      if (!await this.fileSystem.exists(containerPath)) {
        this.logger.info('ℹ️  Infrastructure container.ts not found, skipping service registration');
        return;
      }

      const content = await this.fileSystem.readFile(containerPath);
      const entityName = context.templateData.entityName;
      
      // Check if HTTP services already registered
      if (content.includes('HttpClientFactory') || content.includes(`${entityName?.pascalCase}ApiService`)) {
        this.logger.info('ℹ️  HTTP services already registered in container');
        return;
      }

      // Add imports and registrations
      const updatedContent = this.addHttpContainerRegistrations(content, entityName);
      await this.fileSystem.writeFile(containerPath, updatedContent);
      
      this.logger.info('🔧 Updated infrastructure container with HTTP services');

    } catch (error) {
      this.logger.warning(`⚠️  Could not update infrastructure container: ${error}`);
    }
  }

  /**
   * Add HTTP service registrations to container
   */
  private addHttpContainerRegistrations(content: string, entityName: any): string {
    const lines = content.split('\n');
    
    // Add imports at the top
    const importLines = [
      `import { HttpClientFactory } from './http/http-client.factory';`,
      `import { ${entityName.pascalCase}ApiService } from './http/services/${entityName.kebabCase}-api.service';`
    ];
    
    // Find the last import statement
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, ...importLines);
    }
    
    // Add registrations before the export
    const registrations = [
      '',
      '  // HTTP Infrastructure',
      "  container.registerSingleton('httpClientFactory', () => new HttpClientFactory());",
      `  container.registerSingleton('${entityName.camelCase}ApiService', () => new ${entityName.pascalCase}ApiService(container.resolve('httpClientFactory')));`
    ];
    
    // Find the export statement
    const exportIndex = lines.findIndex(line => line.trim().startsWith('export'));
    if (exportIndex >= 0) {
      lines.splice(exportIndex, 0, ...registrations);
    }
    
    return lines.join('\n');
  }

  /**
   * Check if core HTTP infrastructure files already exist
   */
  private async checkCoreFilesExist(context: GenerationContext): Promise<boolean> {
    const coreFiles = [
      'src/infrastructure/http/http-client.base.ts',
      'src/infrastructure/http/http-client.factory.ts',
      'src/infrastructure/http/http-client.config.ts',
      'src/infrastructure/http/types/api.types.ts',
      'src/infrastructure/http/interceptors/index.ts',
      'src/infrastructure/http/index.ts'
    ];

    for (const file of coreFiles) {
      const filePath = this.fileSystem.joinPath(context.projectPath, file);
      if (await this.fileSystem.exists(filePath)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate only service files (when core infrastructure exists)
   */
  private async generateServiceOnly(context: GenerationContext): Promise<GenerationResult> {
    const result: GenerationResult = {
      success: true,
      generatedFiles: [],
      errors: []
    };

    try {
      // Get only service templates
      const templates = this.templateRegistry.getApplicableTemplates(this.generatorType, context);
      const serviceTemplates = templates.filter(template => 
        template.name === 'api-service-template' || 
        template.path.includes('services/')
      );

      if (serviceTemplates.length === 0) {
        this.logger.warning('No service templates found');
        return result;
      }

      // Generate service files
      for (const template of serviceTemplates) {
        try {
          const templatePath = this.templateRegistry.resolveTemplatePath(template.path);
          const outputPath = this.templateRegistry.resolveOutputPath(template.outputPath, context);

          // Check if file already exists
          if (await this.fileSystem.exists(outputPath)) {
            const shouldOverwrite = context.options.force || false;
            if (!shouldOverwrite) {
              this.logger.warning(`Service file already exists, skipping: ${outputPath}`);
              this.logger.info('Use --force to overwrite existing service files');
              continue;
            }
            this.logger.warning(`⚠️  Overwriting existing service file: ${outputPath}`);
          }

          // Render and write template
          const renderedContent = await this.templateEngine.renderFile(templatePath, context.templateData);
          await this.fileSystem.writeFile(outputPath, renderedContent);
          
          result.generatedFiles.push(outputPath);
          this.logger.success(`✅ Generated service file: ${outputPath}`);
        } catch (error: any) {
          result.errors.push(`Failed to generate ${template.name}: ${error.message}`);
          result.success = false;
        }
      }

      if (result.success) {
        this.logger.success(`✅ Service generation completed! Generated ${result.generatedFiles.length} service file(s)`);
        this.logger.info(`
📋 Generated Service Files:
   📁 src/infrastructure/http/services/
   └── 📄 ${context.templateData.entityName?.kebabCase || context.entityName}-api.service.ts

💡 Usage Example:
   import { ${context.templateData.entityName?.pascalCase || context.entityName}ApiService } from '@/infrastructure/http';
   
   const apiService = container.resolve('${context.templateData.entityName?.camelCase || context.entityName}ApiService');
   const result = await apiService.getAll();
        `);
      }

    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      this.logger.error(`❌ Service generation failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Prompt user for confirmation when updating core files
   */
  private async promptForCoreUpdate(context: GenerationContext): Promise<boolean> {
    this.logger.warning('🚨 WARNING: This will overwrite ALL existing HTTP infrastructure core files!');
    this.logger.warning('   This includes:');
    this.logger.warning('   - http-client.base.ts (HTTP client implementation)');
    this.logger.warning('   - http-client.factory.ts (Client factory)');
    this.logger.warning('   - http-client.config.ts (Configuration)');
    this.logger.warning('   - types/api.types.ts (Type definitions)');
    this.logger.warning('   - interceptors/index.ts (Request/Response interceptors)');
    this.logger.warning('   - index.ts (Main exports)');
    this.logger.warning('');
    this.logger.warning('   Any customizations you made to these files will be LOST!');
    this.logger.warning('');

    // In a real CLI, this would use readline or inquirer
    // For now, we'll check for a specific flag or environment variable
    const autoConfirm = context.options.yes || process.env.HTTP_GEN_AUTO_CONFIRM === 'true';
    
    if (autoConfirm) {
      this.logger.info('✅ Auto-confirmed via --yes flag or environment variable');
      return true;
    }

    // Since we can't do interactive prompts in this environment,
    // we'll require explicit confirmation via command line flags
    this.logger.error('❌ Interactive confirmation required but not available in this environment');
    this.logger.info('💡 To proceed, use: --yes flag to auto-confirm the update');
    this.logger.info('   Example: generate:http service-name --force-core --yes');
    
    return false;
  }
}

import { BaseCommand } from './base-command';
import { 
  CommandArgument, 
  CommandOption,
  GenerationContext,
  ILogger,
  IStringUtils,
  IDependencyContainer,
  IFileSystem,
  TOKENS
} from '../types';
import { IGeneratorFactory } from '../generators/generator-factory';

/**
 * Command to generate HTTP client infrastructure for external API integration
 */
export class GenerateHttpCommand extends BaseCommand {
  name = 'generate:http';
  description = 'Generate HTTP client infrastructure with Axios for external API integration';
  aliases = ['gen:http', 'g:http', 'gen:api', 'g:api'];

  arguments: CommandArgument[] = [
    {
      name: 'serviceName',
      description: 'Name of the API service to generate (e.g., "payment", "notification")',
      required: true
    }
  ];

  options: CommandOption[] = [
    {
      flags: '-c, --config <path>',
      description: 'Path to configuration file (JSON)'
    },
    {
      flags: '-b, --base-url <url>',
      description: 'Base URL for the API service'
    },
    {
      flags: '-t, --timeout <ms>',
      description: 'Request timeout in milliseconds',
      defaultValue: '5000'
    },
    {
      flags: '-r, --retries <count>',
      description: 'Number of retry attempts for failed requests',
      defaultValue: '3'
    },
    {
      flags: '-a, --auth-type <type>',
      description: 'Authentication type (bearer, api-key, basic, none)',
      defaultValue: 'bearer'
    },
    {
      flags: '-e, --endpoints <endpoints>',
      description: 'API endpoints as JSON string. Example: "[{"name":"getUsers","method":"GET","path":"/users"}]"'
    },
    {
      flags: '--endpoints-file <file>',
      description: 'Path to JSON file containing endpoints configuration'
    },
    {
      flags: '--interceptors',
      description: 'Include request/response interceptors',
      defaultValue: true
    },
    {
      flags: '--rate-limit',
      description: 'Include rate limiting support',
      defaultValue: false
    },
    {
      flags: '--cache',
      description: 'Include caching support',
      defaultValue: false
    },
    {
      flags: '--mock',
      description: 'Generate mock responses for development',
          defaultValue: false
    },
    {
      flags: '-f, --force',
      description: 'Force generation even if files exist',
      defaultValue: false
    },
    {
      flags: '--force-core',
      description: 'Force update of core HTTP infrastructure files (requires confirmation)',
      defaultValue: false
    },
    {
      flags: '-y, --yes',
      description: 'Auto-confirm all prompts (use with --force-core)',
      defaultValue: false
    }
  ];

  constructor(
    container: IDependencyContainer,
    logger: ILogger,
    stringUtils: IStringUtils,
    generatorFactory: IGeneratorFactory,
    private fileSystem: IFileSystem
  ) {
    super(container, logger, stringUtils, generatorFactory);
  }

  async execute(args: string[], options: Record<string, any>): Promise<void> {
    const [serviceName] = args;

    if (!serviceName || typeof serviceName !== 'string') {
      throw new Error('Service name is required and must be a string');
    }

    try {
      this.logger.info(`🚀 Generating HTTP client infrastructure for service: ${serviceName}`);

      // Get actual option values from Commander.js Command object
      const opts = typeof options.opts === 'function' ? options.opts() : options;

      // Parse endpoints if provided
      let endpoints: any[] = [];
      if (opts.endpoints) {
        try {
          endpoints = JSON.parse(opts.endpoints);
          if (!Array.isArray(endpoints)) {
            throw new Error('Endpoints must be an array');
          }
        } catch (error) {
          throw new Error(`Invalid endpoints JSON: ${error}`);
        }
      } else if (opts.endpointsFile) {
        try {
          const endpointsContent = await this.fileSystem.readFile(opts.endpointsFile);
          endpoints = JSON.parse(endpointsContent);
          if (!Array.isArray(endpoints)) {
            throw new Error('Endpoints file must contain an array');
          }
          this.logger.info(`📁 Loaded ${endpoints.length} endpoints from file: ${opts.endpointsFile}`);
        } catch (error) {
          throw new Error(`Failed to read endpoints file: ${error}`);
        }
      }

      // Generate naming variations
      const entityName = this.stringUtils.generateNamingConventions(serviceName);

      // Prepare generation context
      const context: GenerationContext = {
        projectPath: process.cwd(),
        entityName: serviceName,
        templateData: {
          entityName,
          serviceName,
          config: {
            baseUrl: opts.baseUrl || `https://api.${serviceName.toLowerCase()}.com`,
            timeout: parseInt(opts.timeout) || 5000,
            retries: parseInt(opts.retries) || 3,
            authType: opts.authType || 'bearer',
            endpoints: endpoints,
            includeInterceptors: opts.interceptors !== false,
            includeRateLimit: opts.rateLimit === true,
            includeCache: opts.cache === true,
            includeMock: opts.mock === true,
            force: opts.force === true,
            forceCore: opts.forceCore === true,
            yes: opts.yes === true
          }
        },
        options: opts
      };

      // Check if HTTP infrastructure already exists
      const httpBasePath = 'src/infrastructure/http';
      const httpExists = await this.fileSystem.exists(httpBasePath);
      
      if (httpExists && !context.templateData.config.force && !context.templateData.config.forceCore) {
        this.logger.info('📂 HTTP infrastructure already exists. Generating additional service...');
        
        // Only generate the specific API service
        await this.generateApiService(context);
      } else {
        // Generate full HTTP infrastructure
        this.logger.info('📦 Generating complete HTTP infrastructure...');
        await this.generateFullHttpInfrastructure(context);
      }

      // Update package.json to include axios if not present
      await this.updatePackageJson();

      // Update infrastructure container to register HTTP services
      await this.updateContainer(serviceName, entityName);

      this.logger.success(`✅ HTTP client infrastructure generated successfully!`);
      this.logger.info(`
📋 Generated HTTP Infrastructure:
   📁 src/infrastructure/http/
   ├── 📄 http-client.base.ts       (Base HTTP client with Axios)
   ├── 📄 http-client.factory.ts    (Factory for creating clients)
   ├── 📄 http-client.config.ts     (Configuration interface)
   ├── 📁 services/
   │   └── 📄 ${entityName.kebabCase}-api.service.ts (API service implementation)
   ├── 📁 types/
   │   ├── 📄 api.types.ts          (API interfaces)
   │   └── 📄 responses.types.ts    (Response types)
   ├── 📁 interceptors/
   │   └── 📄 index.ts              (Request/Response interceptors)
   └── 📄 index.ts                  (Main exports)

🔧 Next Steps:
   1. Configure API base URL in http-client.config.ts
   2. Set up authentication in interceptors/index.ts
   3. Add API endpoints to ${entityName.kebabCase}-api.service.ts
   4. Import and use in your application layer

💡 Usage Example:
   import { ${entityName.pascalCase}ApiService } from '@/infrastructure/http';
   
   const apiService = container.resolve('${entityName.camelCase}ApiService');
   const result = await apiService.getAll();
      `);

    } catch (error) {
      this.logger.error(`❌ Failed to generate HTTP infrastructure: ${error}`);
      throw error;
    }
  }

  private async generateFullHttpInfrastructure(context: GenerationContext): Promise<void> {
    const generator = this.generatorFactory.createGenerator('http');
    await generator.generate(context);
  }

  private async generateApiService(context: GenerationContext): Promise<void> {
    // Only generate the API service template
    const generator = this.generatorFactory.createGenerator('http');
    
    // Create a limited context for just the service
    const serviceContext = {
      ...context,
      templateData: {
        ...context.templateData,
        generateOnlyService: true
      }
    };
    
    await generator.generate(serviceContext);
    
    // After generating the service, update the index.ts to export it using smart markers
    await this.updateHttpIndexFileWithMarkers(context);
  }

  private async updateHttpIndexFile(context: GenerationContext): Promise<void> {
    const indexPath = 'src/infrastructure/http/index.ts';
    const entityName = context.templateData.entityName;
    
    if (!entityName) {
      this.logger.warning('⚠️  No entity name provided, skipping index.ts update');
      return;
    }

    try {
      // Check if index.ts exists
      const exists = await this.fileSystem.exists(indexPath);
      if (!exists) {
        this.logger.warning('⚠️  HTTP index.ts not found, skipping service export update');
        return;
      }

      // Read current index.ts content
      const content = await this.fileSystem.readFile(indexPath);
      
      // Generate service class name and file name
      const serviceClassName = `${entityName.pascalCase}ApiService`;
      const serviceFileName = `${entityName.kebabCase}-api.service`;
      
      // Check if service is already exported
      if (content.includes(`export { ${serviceClassName} }`)) {
        this.logger.info(`📋 Service ${serviceClassName} already exported in index.ts`);
        return;
      }

      let updatedContent = content;

      // 1. Add export statement in the API Services section
      const serviceExportLine = `export { ${serviceClassName} } from './services/${serviceFileName}';`;
      
      if (updatedContent.includes('// API Services')) {
        // Find the last export line in the API Services section
        const lines = updatedContent.split('\n');
        let insertIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('// API Services')) {
            // Find the last export statement after this comment
            for (let j = i + 1; j < lines.length; j++) {
              if (lines[j].includes('export {') && lines[j].includes('ApiService')) {
                insertIndex = j + 1;
              } else if (lines[j].startsWith('//') || (lines[j].trim() === '' && !lines[j + 1]?.includes('export'))) {
                break;
              }
            }
            break;
          }
        }
        
        if (insertIndex !== -1) {
          lines.splice(insertIndex, 0, serviceExportLine);
          updatedContent = lines.join('\n');
        }
      } else {
        // Add API Services section before imports
        if (updatedContent.includes('// Import classes for internal use')) {
          updatedContent = updatedContent.replace(
            /(\/\/ Import classes for internal use)/,
            `// API Services\n${serviceExportLine}\n\n$1`
          );
        }
      }

      // 2. Add import statement in the imports section
      const serviceImportLine = `import { ${serviceClassName} } from './services/${serviceFileName}';`;
      
      if (updatedContent.includes('// Import classes for internal use') && !updatedContent.includes(serviceImportLine)) {
        // Find the last import line in the imports section
        const lines = updatedContent.split('\n');
        let insertIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('// Import classes for internal use')) {
            // Find the last import statement after this comment
            for (let j = i + 1; j < lines.length; j++) {
              if (lines[j].includes('import {') && lines[j].includes('ApiService')) {
                insertIndex = j + 1;
              } else if (!lines[j].startsWith('import') && lines[j].trim() !== '') {
                break;
              }
            }
            break;
          }
        }
        
        if (insertIndex !== -1) {
          lines.splice(insertIndex, 0, serviceImportLine);
          updatedContent = lines.join('\n');
        }
      }

      // 3. Add client factory method in httpClients object
      const clientMethodName = `create${entityName.pascalCase}Client`;
      
      if (!updatedContent.includes(clientMethodName)) {
        const clientMethod = `  /**
   * Create default ${entityName.camelCase} API client
   */
  ${clientMethodName}(): ${serviceClassName} {
    const factory = new HttpClientFactory();
    return new ${serviceClassName}(factory);
  },

`;

        // Insert before the createFactory method
        if (updatedContent.includes('createFactory()')) {
          updatedContent = updatedContent.replace(
            /(  \/\*\*\n   \* Create HTTP client factory\n   \*\/\n  createFactory\(\))/,
            `${clientMethod}  $1`
          );
        }
      }

      // Write the updated content back to the file
      await this.fileSystem.writeFile(indexPath, updatedContent);
      
      this.logger.success(`✅ Updated index.ts to export ${serviceClassName}`);
      
    } catch (error) {
      this.logger.error(`❌ Failed to update index.ts: ${error}`);
    }
  }

  /**
   * Smart auto-generation system for HTTP index.ts with clear markers
   * Similar to route registry pattern with auto-generated sections
   */
  private async updateHttpIndexFileWithMarkers(context: GenerationContext): Promise<void> {
    const indexPath = 'src/infrastructure/http/index.ts';
    const entityName = context.templateData.entityName;
    
    if (!entityName) {
      this.logger.warning('⚠️  No entity name provided, skipping index.ts update');
      return;
    }

    try {
      // Check if index.ts exists
      const exists = await this.fileSystem.exists(indexPath);
      if (!exists) {
        this.logger.warning('⚠️  HTTP index.ts not found, skipping service export update');
        return;
      }

      // Read current index.ts content
      let content = await this.fileSystem.readFile(indexPath);
      
      // Generate service class name and file name
      const serviceClassName = `${entityName.pascalCase}ApiService`;
      const serviceFileName = `${entityName.kebabCase}-api.service`;
      
      // Check if service is already exported
      if (content.includes(`export { ${serviceClassName} }`)) {
        this.logger.info(`📋 Service ${serviceClassName} already exported in index.ts`);
        return;
      }

      let hasChanges = false;

      // 1. Add export statement in the auto-generated section
      const exportLine = `export { ${serviceClassName} } from './services/${serviceFileName}';`;
      const exportResult = this.addToAutoGeneratedSection(
        content, 
        'START_GENERATED_SERVICE_EXPORTS', 
        'END_GENERATED_SERVICE_EXPORTS',
        exportLine
      );
      
      if (exportResult.updated) {
        content = exportResult.content;
        hasChanges = true;
      }

      // 2. Add import statement in the auto-generated section
      const importLine = `import { ${serviceClassName} } from './services/${serviceFileName}';`;
      const importResult = this.addToAutoGeneratedSection(
        content,
        'START_GENERATED_IMPORTS',
        'END_GENERATED_IMPORTS', 
        importLine
      );
      
      if (importResult.updated) {
        content = importResult.content;
        hasChanges = true;
      }

      // 3. Add client method in the auto-generated section
      const clientMethodName = `create${entityName.pascalCase}Client`;
      const clientMethod = `  /**
   * Create default ${entityName.camelCase} API client
   */
  ${clientMethodName}(): ${serviceClassName} {
    const factory = new HttpClientFactory();
    return new ${serviceClassName}(factory);
  },`;

      const clientResult = this.addToAutoGeneratedSection(
        content,
        'START_GENERATED_CLIENT_METHODS',
        'END_GENERATED_CLIENT_METHODS',
        clientMethod
      );
      
      if (clientResult.updated) {
        content = clientResult.content;
        hasChanges = true;
      }

      // 4. Add service preset in the auto-generated section
      const presetName = entityName.camelCase;
      const servicePreset = `  /**
   * Default configuration for ${entityName.kebabCase} API
   */
  ${presetName}: {
    baseUrl: 'https://api.${entityName.kebabCase}.com',
    timeout: 5000,
    retries: 3,
    authType: 'bearer' as const
  },`;

      const presetResult = this.addToAutoGeneratedSection(
        content,
        'START_GENERATED_SERVICE_PRESETS',
        'END_GENERATED_SERVICE_PRESETS',
        servicePreset
      );
      
      if (presetResult.updated) {
        content = presetResult.content;
        hasChanges = true;
      }

      // 5. Add service to default export in the auto-generated section
      const defaultExportLine = `  ${serviceClassName},`;

      const defaultExportResult = this.addToAutoGeneratedSection(
        content,
        'START_GENERATED_DEFAULT_EXPORTS',
        'END_GENERATED_DEFAULT_EXPORTS',
        defaultExportLine
      );
      
      if (defaultExportResult.updated) {
        content = defaultExportResult.content;
        hasChanges = true;
      }

      // Update content if changes were made
      if (hasChanges) {
        await this.fileSystem.writeFile(indexPath, content);
        this.logger.success(`✅ Updated index.ts to export ${serviceClassName}`);
      } else {
        this.logger.info(`📋 No changes needed for ${serviceClassName}`);
      }
      
    } catch (error) {
      this.logger.error(`❌ Failed to update index.ts with markers: ${error}`);
    }
  }

  /**
   * Add content to auto-generated section between markers
   */
  private addToAutoGeneratedSection(
    content: string, 
    startMarker: string, 
    endMarker: string, 
    newContent: string
  ): { updated: boolean; content: string } {
    const startComment = `// ${startMarker}`;
    const endComment = `// ${endMarker}`;
    
    if (!content.includes(startComment) || !content.includes(endComment)) {
      return { updated: false, content };
    }

    // Check if content already exists
    if (content.includes(newContent)) {
      return { updated: false, content };
    }

    const regex = new RegExp(
      `(${startComment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n)([\\s\\S]*?)(\\n\\s*${endComment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'g'
    );
    
    const updated = content.replace(regex, (match, start, existing, end) => {
      // Ensure proper line breaks
      const trimmedExisting = existing.trim();
      const separator = trimmedExisting ? '\n' : '';
      return `${start}${trimmedExisting}${separator}${newContent}\n${end}`;
    });

    return { updated: updated !== content, content: updated };
  }

  private async updatePackageJson(): Promise<void> {
    try {
      const packageJsonPath = 'package.json';
      const exists = await this.fileSystem.exists(packageJsonPath);
      
      if (exists) {
        const content = await this.fileSystem.readFile(packageJsonPath);
        const packageJson = JSON.parse(content);
        
        // Add axios and types if not present
        if (!packageJson.dependencies) packageJson.dependencies = {};
        if (!packageJson.devDependencies) packageJson.devDependencies = {};
        
        const requiredDeps = {
          'axios': '^1.6.0'
        };
        
        const requiredDevDeps = {
          '@types/node': '^20.0.0'
        };
        
        let updated = false;
        
        // Add production dependencies
        Object.entries(requiredDeps).forEach(([pkg, version]) => {
          if (!packageJson.dependencies[pkg]) {
            packageJson.dependencies[pkg] = version;
            updated = true;
          }
        });
        
        // Add dev dependencies
        Object.entries(requiredDevDeps).forEach(([pkg, version]) => {
          if (!packageJson.devDependencies[pkg]) {
            packageJson.devDependencies[pkg] = version;
            updated = true;
          }
        });
        
        if (updated) {
          await this.fileSystem.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
          this.logger.info('📦 Updated package.json with HTTP dependencies');
        }
      }
    } catch (error) {
      this.logger.info(`⚠️  Could not update package.json: ${error}`);
    }
  }

  private async updateContainer(serviceName: string, entityName: any): Promise<void> {
    try {
      const containerPath = 'src/infrastructure/container.ts';
      const exists = await this.fileSystem.exists(containerPath);
      
      if (exists) {
        const content = await this.fileSystem.readFile(containerPath);
        
        // Check if HTTP imports already exist
        if (!content.includes('HttpClientFactory')) {
          // Add imports and registrations
          const updatedContent = this.addHttpContainerRegistrations(content, serviceName, entityName);
          await this.fileSystem.writeFile(containerPath, updatedContent);
          this.logger.info('🔧 Updated dependency container with HTTP services');
        }
      }
    } catch (error) {
      this.logger.info(`⚠️  Could not update container: ${error}`);
    }
  }

  private addHttpContainerRegistrations(content: string, serviceName: string, entityName: any): string {
    // Add imports at the top
    const importLines = [
      `import { HttpClientFactory } from './http/http-client.factory';`,
      `import { ${entityName.pascalCase}ApiService } from './http/services/${entityName.kebabCase}-api.service';`
    ];
    
    // Find the last import statement
    const lines = content.split('\n');
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
}

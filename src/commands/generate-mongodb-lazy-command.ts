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
 * Command to generate MongoDB with lazy loading pattern (no database abstractions)
 */
export class GenerateMongoDbLazyCommand extends BaseCommand {
  name = 'generate:mongodb:lazy';
  description = 'Generate MongoDB implementation with lazy loading pattern (no database abstractions)';
  aliases = ['gen:mongo:lazy', 'g:mongo:lazy', 'gen:mongo-lazy', 'g:ml'];

  arguments: CommandArgument[] = [
    {
      name: 'entityName',
      description: 'Name of the entity to generate MongoDB implementation for',
      required: true
    }
  ];

  options: CommandOption[] = [
    {
      flags: '-c, --config <path>',
      description: 'Path to configuration file (JSON)'
    },
    {
      flags: '-f, --fields <fields>',
      description: "Entity fields as JSON string (use single quotes). Example: \"[{'name':'title','type':'string','required':true},{'name':'price','type':'number','min':0}]\""
    },
    {
      flags: '-t, --timestamps',
      description: 'Include timestamps (createdAt, updatedAt)',
      defaultValue: true
    },
    {
      flags: '-v, --virtuals',
      description: 'Generate virtual fields',
      defaultValue: false
    },
    {
      flags: '-i, --indexes',
      description: 'Generate database indexes',
      defaultValue: false
    },
    {
      flags: '-m, --methods',
      description: 'Generate instance methods',
      defaultValue: false
    },
    {
      flags: '-s, --statics',
      description: 'Generate static methods',
      defaultValue: false
    },
    {
      flags: '--env-var <name>',
      description: 'Environment variable name for MongoDB URI',
      defaultValue: '{ENTITY}_MONGODB_URI'
    },
    {
      flags: '--db-name <name>',
      description: 'Database name (defaults to entity name + _db)'
    },
    {
      flags: '--shared <domain>',
      description: 'Generate within shared database domain structure with connection manager (e.g., --shared shopping creates src/infrastructure/database/shopping/mongodb/)'
    }
  ];

  async execute(args: any[], options: any): Promise<void> {
    const [entityName] = args;

    if (!entityName || typeof entityName !== 'string') {
      throw new Error('Entity name is required and must be a string');
    }

    this.logger.info(`Generating MongoDB lazy implementation for: ${entityName}`);
    
    // Get actual option values from Commander.js Command object
    const opts = typeof options.opts === 'function' ? options.opts() : options;

    try {
      // Parse configuration from file if provided
      let config = {};
      if (opts.config) {
        config = await this.loadConfigFromFile(opts.config);
      }

      // Parse and validate fields from JSON string if provided
      let fields;
      if (opts.fields) {
        
        opts.fields = opts.fields.replace(/'/g, '"'); // Replace single quotes with double quotes 
        try {
          fields = JSON.parse(opts.fields);
          if (!Array.isArray(fields)) {
            throw new Error('Fields must be an array');
          }
          
          // Validate each field
          fields.forEach((field, index) => {
            if (!field.name) {
              throw new Error(`Field at index ${index} is missing 'name' property`);
            }
            if (!field.type) {
              throw new Error(`Field '${field.name}' is missing 'type' property`);
            }
          });
          
          this.logger.info(`📝 Parsed ${fields.length} field(s) from JSON`);
        } catch (error) {
          throw new Error(`Invalid fields JSON: ${error}`);
        }
      } else {
        this.logger.info('📝 No fields provided, will use default schema fields');
      }

      // Generate naming conventions
      const schemaNames = this.stringUtils.generateNamingConventions(entityName);
      
      // Generate shared domain naming if provided
      let sharedDomainNames;
      if (opts.shared) {
        sharedDomainNames = this.stringUtils.generateNamingConventions(opts.shared);
      }

      // Create generation context
      const context: GenerationContext = {
        projectPath: process.cwd(),
        entityName,
        templateData: {
          schemaName: entityName,
          schemaNames,
          // Shared domain configuration
          sharedDomain: opts.shared,
          sharedDomainNames,
          // MongoDB specific options
          fields,
          timestamps: opts.timestamps !== false,
          virtuals: opts.virtuals || [],
          indexes: opts.indexes || [],
          methods: opts.methods || [],
          statics: opts.statics || [],
          // Database configuration
          databaseName: opts.dbName || (opts.shared ? `${sharedDomainNames?.kebabCase}_db` : `${schemaNames.kebabCase}_db`),
          envVar: opts.shared 
            ? `${sharedDomainNames?.uppercase}_MONGODB_URI`
            : (opts.envVar?.replace('{ENTITY}', schemaNames.uppercase) || `${schemaNames.uppercase}_MONGODB_URI`),
          // Merge with config file
          ...config
        },
        options: opts
      };

      // Generate using the factory
      const factory = this.container.resolve<IGeneratorFactory>(TOKENS.GENERATOR_FACTORY);
      
      // First, ensure domain structure exists for this entity
      await this.ensureDomainStructure(context, factory);
      
      // Then generate MongoDB implementation
      const result = await factory.createGenerator('mongodb-lazy').generate(context);

      if (result.success) {
        this.logger.success(`✅ MongoDB lazy implementation generated successfully!`);
        this.logger.info('');
        this.logger.info('🔥 Key benefits of this implementation:');
        this.logger.info('  ✅ Lazy loading - connects only when first used');
        this.logger.info('  ✅ Entity-specific database - independent MongoDB connection');  
        this.logger.info('  ✅ Native Mongoose features - no custom abstractions');
        this.logger.info('  ✅ ID persistence - uses MongoDB _id (no UUID generation)');
        this.logger.info('  ✅ Production ready - with error handling & connection management');
        this.logger.info('');
        this.logger.info('📝 Configuration required:');
        this.logger.info(`  Environment variable: ${context.templateData.envVar}`);
        this.logger.info(`  Example: ${context.templateData.envVar}=mongodb://localhost:27017/${context.templateData.databaseName}`);
        this.logger.info('');
        this.logger.info('🚀 Usage:');
        this.logger.info(`  Import ${schemaNames.pascalCase}MongoRepository in your use cases`);
        this.logger.info(`  Container will automatically bind I${schemaNames.pascalCase}Repository`);
      } else {
        this.logger.error('❌ Generation failed');
        result.errors.forEach((error: string) => this.logger.error(`  - ${error}`));
      }

    } catch (error) {
      this.logger.error(`Failed to generate MongoDB lazy implementation: ${error}`);
      throw error;
    }
  }

  /**
   * Load configuration from JSON file
   */
  private async loadConfigFromFile(configPath: string): Promise<any> {
    try {
      const fileSystem = this.container.resolve<IFileSystem>(TOKENS.FILE_SYSTEM);
      const exists = await fileSystem.exists(configPath);
      if (!exists) {
        throw new Error(`Configuration file not found: ${configPath}`);
      }

      const configContent = await fileSystem.readFile(configPath);
      return JSON.parse(configContent);
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error}`);
    }
  }

  /**
   * Ensure domain structure exists for the entity
   */
  private async ensureDomainStructure(context: GenerationContext, factory: IGeneratorFactory): Promise<void> {
    try {
      const fileSystem = this.container.resolve<IFileSystem>(TOKENS.FILE_SYSTEM);
      const schemaNames = context.templateData.schemaNames;
      
      // Check if domain structure exists
      const domainPath = `src/domain/${schemaNames.kebabCase}`;
      const entityPath = `${domainPath}/entities/${schemaNames.kebabCase}.entity.ts`;
      const repositoryInterfacePath = `${domainPath}/repositories/${schemaNames.kebabCase}.repository.interface.ts`;
      
      const entityExists = await fileSystem.exists(entityPath);
      const repositoryExists = await fileSystem.exists(repositoryInterfacePath);
      
      if (!entityExists || !repositoryExists) {
        this.logger.info(`📦 Creating domain structure for ${schemaNames.pascalCase}...`);
        
        // Generate domain layer first with proper context
        const domainContext: GenerationContext = {
          projectPath: context.projectPath,
          entityName: context.entityName,
          domainName: schemaNames.kebabCase, // Add domainName to context root
          templateData: {
            schemaName: context.entityName,
            schemaNames: schemaNames,
            fields: context.templateData.fields || [],
            // Domain-specific properties
            domainName: schemaNames.kebabCase,
            entityName: schemaNames.pascalCase,
            entityNames: schemaNames,
            domainNames: schemaNames, // Add domainNames for template compatibility
            // Add required properties for domain generation
            hasValueObjects: true,
            hasServices: false,
            hasEvents: false
          },
          options: context.options
        };
        
        const domainResult = await factory.createGenerator('domain').generate(domainContext);
        
        if (domainResult.success) {
          this.logger.success(`✅ Domain structure created for ${schemaNames.pascalCase}`);
        } else {
          this.logger.warning(`⚠️ Domain generation had issues: ${domainResult.errors.join(', ')}`);
        }
      } else {
        this.logger.info(`⚡ Domain structure already exists for ${schemaNames.pascalCase}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to ensure domain structure: ${error}`);
      throw new Error(`Domain structure is required for MongoDB generation: ${error}`);
    }
  }
}

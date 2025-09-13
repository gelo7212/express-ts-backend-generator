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
 * Command to generate MySQL with lazy loading pattern using Sequelize
 */
export class GenerateMySqlLazyCommand extends BaseCommand {
  name = 'generate:mysql:lazy';
  description = 'Generate MySQL implementation with lazy loading pattern using Sequelize (requires existing domain or --force)';
  aliases = ['gen:mysql:lazy', 'g:mysql:lazy', 'gen:mysql-lazy', 'g:sl'];

  arguments: CommandArgument[] = [
    {
      name: 'entityName',
      description: 'Name of the entity to generate MySQL implementation for',
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
      flags: '--shared <domain>',
      description: 'Generate as shared domain entity (multiple entities share connection)'
    },
    {
      flags: '--env-var <name>',
      description: 'Environment variable name for MySQL connection string'
    },
    {
      flags: '--db-name <name>',
      description: 'Database name'
    },
    {
      flags: '--host <host>',
      description: 'Database host',
      defaultValue: 'localhost'
    },
    {
      flags: '--port <port>',
      description: 'Database port',
      defaultValue: '3306'
    },
    {
      flags: '--dialect <dialect>',
      description: 'SQL dialect (mysql, mariadb)',
      defaultValue: 'mysql'
    },
    {
      flags: '--force',
      description: 'Force create domain structure if it doesn\'t exist',
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
    const [entityName] = args;

    if (!entityName || typeof entityName !== 'string') {
      throw new Error('Entity name is required and must be a string');
    }

    this.logger.info(`Generating MySQL lazy implementation for: ${entityName}`);
    
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
          fields.forEach((field: any, index: number) => {
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
          // MySQL/Sequelize specific options
          fields,
          timestamps: opts.timestamps !== false,
          virtuals: opts.virtuals || [],
          indexes: opts.indexes || [],
          methods: opts.methods || [],
          statics: opts.statics || [],
          // Database configuration
          databaseName: opts.dbName || (opts.shared ? `${sharedDomainNames?.kebabCase}_db` : `${schemaNames.kebabCase}_db`),
          envVar: opts.shared 
            ? `${sharedDomainNames?.uppercase}_DATABASE_URL`
            : (opts.envVar?.replace('{ENTITY}', schemaNames.uppercase) || `${schemaNames.uppercase}_DATABASE_URL`),
          host: opts.host || 'localhost',
          port: opts.port || '3306',
          dialect: opts.dialect || 'mysql',
          // Merge with config file
          ...config
        },
        options: opts
      };

      // Generate using the factory
      const factory = this.container.resolve<IGeneratorFactory>(TOKENS.GENERATOR_FACTORY);
      
      // First, ensure domain structure exists for this entity
      if (opts.force) {
        this.logger.info(`🔨 Force mode enabled - will create domain if needed`);
        await this.ensureDomainStructure(context, factory);
      } else {
        // Check if domain exists, if not, suggest using --force
        const schemaNames = context.templateData.schemaNames;
        const domainPath = `src/domain/${schemaNames.kebabCase}`;
        const domainExists = await this.fileSystem.exists(domainPath);
        
        if (!domainExists) {
          this.logger.error(`❌ Domain structure for '${schemaNames.pascalCase}' does not exist`);
          this.logger.info(`💡 Solutions:`);
          this.logger.info(`   1. Create domain first: generate:domain ${entityName}`);
          this.logger.info(`   2. Use --force flag to auto-create: generate:mysql:lazy ${entityName} --force`);
          throw new Error(
            `Domain structure for '${schemaNames.pascalCase}' does not exist. ` +
            `Please create the domain first or use --force flag.`
          );
        }
        
        this.logger.info(`⚡ Domain structure already exists for ${schemaNames.pascalCase}`);
      }
      
      // Then generate MySQL implementation
      const result = await factory.createGenerator('mysql-lazy').generate(context);

      if (result.success) {
        this.logger.success(`✅ MySQL lazy implementation generated successfully!`);
        this.logger.info('');
        this.logger.info('🔥 Key benefits of this implementation:');
        this.logger.info('  ✅ Lazy loading - connects only when first used');
        if (opts.shared) {
          this.logger.info('  ✅ Shared connection pool - resource efficient across domain');
          this.logger.info('  ✅ Transaction support - can run transactions across multiple entities');
        } else {
          this.logger.info('  ✅ Entity-specific database - independent MySQL connection');
        }
        this.logger.info('  ✅ Native Sequelize features - no custom abstractions');
        this.logger.info('  ✅ Type safety - full TypeScript support with Sequelize models');
        this.logger.info('  ✅ Production ready - with error handling & connection management');
        this.logger.info('');
        this.logger.info('📝 Configuration required:');
        const envVarName = context.templateData.envVar;
        this.logger.info(`  Environment variable: ${envVarName}`);
        this.logger.info(`  Example: ${envVarName}=mysql://user:password@localhost:3306/${context.templateData.databaseName}`);
        this.logger.info('');
        this.logger.info('🚀 Usage:');
        this.logger.info(`  Import ${schemaNames.pascalCase}MySqlRepository in your use cases`);
        this.logger.info(`  Container will automatically bind I${schemaNames.pascalCase}Repository`);
      } else {
        this.logger.error('❌ Failed to generate MySQL lazy implementation');
        result.errors.forEach((error: any) => this.logger.error(`  ${error}`));
        throw new Error('Generation failed');
      }

    } catch (error) {
      this.logger.error(`Failed to generate MySQL lazy implementation: ${error}`);
      throw error;
    }
  }

  /**
   * Load configuration from file
   */
  private async loadConfigFromFile(configPath: string): Promise<Record<string, any>> {
    try {
      const absolutePath = await this.fileSystem.getAbsolutePath(configPath);
      const exists = await this.fileSystem.exists(absolutePath);
      
      if (!exists) {
        this.logger.warning(`⚠️  Configuration file not found: ${configPath}`);
        return {};
      }

      const content = await this.fileSystem.readFile(absolutePath);
      const config = JSON.parse(content);
      this.logger.info(`📁 Loaded configuration from: ${configPath}`);
      return config;
    } catch (error) {
      this.logger.error(`Failed to load configuration file: ${error}`);
      throw error;
    }
  }

  /**
   * Ensure domain structure exists for the entity
   */
  private async ensureDomainStructure(context: GenerationContext, factory: IGeneratorFactory): Promise<void> {
    const schemaNames = context.templateData.schemaNames;
    const domainPath = `src/domain/${schemaNames.kebabCase}`;
    const domainExists = await this.fileSystem.exists(domainPath);

    if (!domainExists) {
      this.logger.info(`📦 Creating domain structure for ${schemaNames.pascalCase}...`);
      
      const domainContext: GenerationContext = {
        ...context,
        domainName: context.entityName,
        entityName: context.entityName,
        templateData: {
          ...context.templateData,
          domainName: context.entityName,
          entityName: context.entityName,
          domainNames: schemaNames, // Add domain naming conventions
          entityNames: schemaNames
        }
      };
      
      const domainResult = await factory.createGenerator('domain').generate(domainContext);
      if (!domainResult.success) {
        throw new Error(`Failed to create domain structure: ${domainResult.errors.join(', ')}`);
      }
      
      this.logger.success(`✅ Domain structure created for ${schemaNames.pascalCase}`);
    } else {
      this.logger.info(`⚡ Domain structure already exists for ${schemaNames.pascalCase}`);
    }
  }
}

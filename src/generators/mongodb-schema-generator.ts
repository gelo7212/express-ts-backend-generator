import { BaseGenerator } from './base-generator';
import { 
  GenerationContext, 
  GenerationResult,
  IFileSystem,
  ILogger,
  ITemplateEngine,
  IStringUtils
} from '../types';
import { ITemplateRegistry } from '../templates';

/**
 * Generator for MongoDB schema files
 */
export class MongoDbSchemaGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry,
    private stringUtils: IStringUtils
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'mongodb-schema');
  }

  canHandle(type: string): boolean {
    return type === 'mongodb-schema';
  }

  getDescription(): string {
    return 'Generates MongoDB schema files with Mongoose models';
  }

  async generate(context: GenerationContext): Promise<GenerationResult> {
    const result: GenerationResult = {
      success: true,
      generatedFiles: [],
      errors: []
    };

    try {
      this.logger.info('Generating MongoDB schema files...');

      // Validate required context data
      if (!context.templateData.schemaName) {
        throw new Error('Schema name is required for MongoDB schema generation');
      }

      // Generate naming conventions for the schema
      const schemaNames = this.stringUtils
        .generateNamingConventions(context.templateData.schemaName);

      // Enhanced context with naming conventions and database-agnostic data
      const enhancedContext: GenerationContext = {
        ...context,
        templateData: {
          ...context.templateData,
          schemaNames,
          // Database configuration
          databaseName: context.templateData.databaseName || 'main',
          databaseType: context.templateData.databaseType || 'mongodb', // Support multiple DB types
          // MongoDB-specific options (when using MongoDB)
          generateTimestamps: context.templateData.generateTimestamps ?? true,
          generateVirtuals: context.templateData.generateVirtuals ?? false,
          generateIndexes: context.templateData.generateIndexes ?? false,
          generateMethods: context.templateData.generateMethods ?? false,
          generateStatics: context.templateData.generateStatics ?? false,
          fields: context.templateData.fields && context.templateData.fields.length > 0 
            ? context.templateData.fields 
            : this.getDefaultSchemaFields(),
          // Provide default empty arrays for optional features
          virtuals: context.templateData.virtuals || [],
          indexes: context.templateData.indexes || [],
          instanceMethods: context.templateData.instanceMethods || [],
          staticMethods: context.templateData.staticMethods || [],
          // Database connection configuration (technology agnostic)
          databaseConfig: {
            type: context.templateData.databaseType || 'mongodb',
            connectionString: this.generateConnectionString(
              context.templateData.databaseType || 'mongodb',
              context.templateData.databaseName || 'main'
            ),
            options: this.getDatabaseOptions(context.templateData.databaseType || 'mongodb')
          }
        }
      };

      // Use the parent generate method with enhanced context
      const parentResult = await super.generate(enhancedContext);
      
      result.success = parentResult.success;
      result.generatedFiles = parentResult.generatedFiles;
      result.errors = parentResult.errors;

      // ENHANCEMENT: Replace existing in-memory repository with database-aware version
      if (result.success) {
        await this.upgradeExistingRepository(enhancedContext, result);
        await this.ensureDatabaseServiceExists(enhancedContext, result);
        await this.ensureDatabaseAbstractionExists(enhancedContext, result);
      }

      if (result.success) {
        this.logger.success(`MongoDB schema generated successfully for: ${context.templateData.schemaName}`);
        this.logger.info(`Generated files: ${result.generatedFiles.join(', ')}`);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error occurred');
      this.logger.error(`Failed to generate MongoDB schema: ${error}`);
    }

    return result;
  }

  /**
   * Upgrade existing in-memory repository to database-aware version
   * This replaces the repository file when user generates database schemas
   */
  private async upgradeExistingRepository(context: GenerationContext, result: GenerationResult): Promise<void> {
    try {
      const schemaNames = context.templateData.schemaNames;
      const domainName = schemaNames.kebabCase;
      
      // Path to existing repository (if it exists)
      const existingRepoPath = `src/infrastructure/repositories/${domainName}.repository.ts`;
      
      // Check if existing repository exists
      const exists = await this.fileSystem.exists(existingRepoPath);
      
      if (exists) {
        this.logger.info(`🔄 Upgrading existing repository: ${existingRepoPath}`);
        
        // Read existing repository to check if it's in-memory or already database-aware
        const existingContent = await this.fileSystem.readFile(existingRepoPath);
        
        // Check if it's an in-memory repository (contains Map storage)
        const isInMemoryRepo = existingContent.includes('Map<string,') && 
                              existingContent.includes('new Map()') &&
                              !existingContent.includes('DatabaseService');
        
        if (isInMemoryRepo) {
          this.logger.info(`📦 Detected in-memory repository, upgrading to database-aware version...`);
          
          // Generate database-aware repository
          await this.generateDatabaseAwareRepository(context, existingRepoPath, result);
          
          this.logger.success(`✅ Repository upgraded to database-aware version`);
        } else if (existingContent.includes('DatabaseService')) {
          this.logger.info(`⚡ Repository already database-aware, skipping upgrade`);
        } else {
          this.logger.info(`🤔 Repository exists but format unknown, backing up and upgrading...`);
          
          // Backup existing repository
          const backupPath = `${existingRepoPath}.backup`;
          await this.fileSystem.writeFile(backupPath, existingContent);
          this.logger.info(`📁 Backup created: ${backupPath}`);
          
          // Generate database-aware repository
          await this.generateDatabaseAwareRepository(context, existingRepoPath, result);
          
          this.logger.success(`✅ Repository upgraded to database-aware version (backup created)`);
        }
      } else {
        this.logger.info(`📝 No existing repository found at ${existingRepoPath}, skipping upgrade`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to upgrade repository: ${error}`);
      // Don't fail the entire generation for this
    }
  }

  /**
   * Generate database-aware repository to replace in-memory version
   */
  private async generateDatabaseAwareRepository(
    context: GenerationContext, 
    targetPath: string, 
    result: GenerationResult
  ): Promise<void> {
    try {
      // Create enhanced context for repository generation
      const repoContext: GenerationContext = {
        ...context,
        templateData: {
          ...context.templateData,
          // Ensure all required properties are available for the template
          schemaNames: context.templateData.schemaNames,
          databaseName: context.templateData.databaseName || 'main',
          databaseType: context.templateData.databaseType || 'mongodb',
          // Add flags to indicate this is a database-aware repository
          isDatabaseAware: true,
          useInMemory: false,
          // Add database service injection
          useDatabaseService: true
        }
      };

      // Use the proper EJS template instead of hardcoded string
      const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/database-aware-repository.ts.ejs');
      const repoTemplate = await this.templateEngine.renderFile(
        templatePath,
        repoContext.templateData
      );

      // Write the upgraded repository
      await this.fileSystem.writeFile(targetPath, repoTemplate);
      
      // Add to generated files list
      const absolutePath = await this.fileSystem.getAbsolutePath(targetPath);
      result.generatedFiles.push(absolutePath);
      
      this.logger.info(`📝 Generated database-aware repository: ${targetPath}`);
      
    } catch (error) {
      this.logger.error(`❌ Failed to generate database-aware repository: ${error}`);
      throw error;
    }
  }

  /**
   * Ensure DatabaseService exists in the project
   */
  private async ensureDatabaseServiceExists(context: GenerationContext, result: GenerationResult): Promise<void> {
    try {
      const databaseServicePath = 'src/infrastructure/database/database.service.ts';
      
      // Check if DatabaseService already exists
      const exists = await this.fileSystem.exists(databaseServicePath);
      
      if (!exists) {
        this.logger.info(`📦 Creating DatabaseService for multi-database support...`);
        
        // Ensure database directory exists
        const databaseDir = 'src/infrastructure/database';
        const dirExists = await this.fileSystem.exists(databaseDir);
        if (!dirExists) {
          await this.fileSystem.createDirectory(databaseDir);
        }
        
        // Generate DatabaseService using proper EJS template
        const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/database-service.ts.ejs');
        const serviceTemplate = await this.templateEngine.renderFile(
          templatePath,
          context.templateData
        );

        await this.fileSystem.writeFile(databaseServicePath, serviceTemplate);
        
        // Add to generated files list
        const absolutePath = await this.fileSystem.getAbsolutePath(databaseServicePath);
        result.generatedFiles.push(absolutePath);
        
        this.logger.success(`✅ DatabaseService created: ${databaseServicePath}`);
      } else {
        this.logger.info(`⚡ DatabaseService already exists, skipping creation`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to ensure DatabaseService exists: ${error}`);
      // Don't fail the entire generation for this
    }
  }

  /**
   * Validate MongoDB schema field configuration
   */
  private validateSchemaFields(fields: any[]): boolean {
    if (!Array.isArray(fields)) {
      return false;
    }

    return fields.every(field => {
      return field.name && 
             field.type && 
             typeof field.name === 'string' && 
             typeof field.type === 'string';
    });
  }

  /**
   * Generate default MongoDB schema fields
   */
  private getDefaultSchemaFields(): any[] {
    return [
      {
        name: 'name',
        type: 'String',
        required: true,
        description: 'Name field'
      },
      {
        name: 'description',
        type: 'String',
        required: false,
        description: 'Description field'
      }
    ];
  }

  /**
   * Ensure database abstraction layer exists (interface, factory, connections)
   */
  private async ensureDatabaseAbstractionExists(context: GenerationContext, result: GenerationResult): Promise<void> {
    try {
      const databaseDir = 'src/infrastructure/database';
      
      // Ensure database directory exists
      const dirExists = await this.fileSystem.exists(databaseDir);
      if (!dirExists) {
        await this.fileSystem.createDirectory(databaseDir);
      }

      // Create database connection interface
      await this.createDatabaseConnectionInterface(databaseDir, result);
      
      // Create database connection factory
      await this.createDatabaseConnectionFactory(databaseDir, result);
      
      // Create MongoDB connection implementation  
      await this.createMongoDbConnection(databaseDir, result);
      
    } catch (error) {
      this.logger.error(`❌ Failed to create database abstraction layer: ${error}`);
      // Don't fail the entire generation for this
    }
  }

  /**
   * Create database connection interface if it doesn't exist
   */
  private async createDatabaseConnectionInterface(databaseDir: string, result: GenerationResult): Promise<void> {
    const interfacePath = `${databaseDir}/database-connection.interface.ts`;
    const exists = await this.fileSystem.exists(interfacePath);
    
    if (!exists) {
      const interfaceContent = `/**
 * Database Connection Interface
 * Supports database technology agnostic approach
 * Generated on: ${new Date().toISOString()}
 */
export interface DatabaseConnection {
  /**
   * Check if the connection is ready
   */
  isConnectionReady(): boolean;

  /**
   * Get the current connection state
   */
  getConnectionState(): string;

  /**
   * Connect to the database
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the database
   */
  disconnect(): Promise<void>;

  /**
   * Get the native connection object (e.g., Mongoose connection)
   */
  getNativeConnection(): any;

  /**
   * Get connection configuration
   */
  getConfig(): DatabaseConnectionConfig;
}

/**
 * Database Connection Configuration
 */
export interface DatabaseConnectionConfig {
  type: 'mongodb' | 'postgresql' | 'mysql' | 'sqlite';
  database: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  options?: any;
}`;

      await this.fileSystem.writeFile(interfacePath, interfaceContent);
      const absolutePath = await this.fileSystem.getAbsolutePath(interfacePath);
      result.generatedFiles.push(absolutePath);
      this.logger.info(`📦 Created database connection interface: ${interfacePath}`);
    }
  }

  /**
   * Create database connection factory if it doesn't exist
   */
  private async createDatabaseConnectionFactory(databaseDir: string, result: GenerationResult): Promise<void> {
    const factoryPath = `${databaseDir}/database-connection.factory.ts`;
    const exists = await this.fileSystem.exists(factoryPath);
    
    if (!exists) {
      try {
        // Use clean factory template
        const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/database-connection-factory.ts.ejs');
        const factoryContent = await this.templateEngine.renderFile(templatePath, {
          projectName: 'Generated Project',
          timestamp: new Date().toISOString()
        });

        await this.fileSystem.writeFile(factoryPath, factoryContent);
        const absolutePath = await this.fileSystem.getAbsolutePath(factoryPath);
        result.generatedFiles.push(absolutePath);
        this.logger.info(`📦 Created database connection factory: ${factoryPath}`);
      } catch (error) {
        this.logger.error(`❌ Failed to create database connection factory: ${error}`);
      }
    }
  }

  /**
   * Create MongoDB connection implementation if it doesn't exist
   */
  private async createMongoDbConnection(databaseDir: string, result: GenerationResult): Promise<void> {
    const mongoDbDir = `${databaseDir}/mongodb`;
    const connectionPath = `${mongoDbDir}/mongodb-connection.ts`;
    
    // Ensure mongodb directory exists
    const dirExists = await this.fileSystem.exists(mongoDbDir);
    if (!dirExists) {
      await this.fileSystem.createDirectory(mongoDbDir);
    }
    
    const exists = await this.fileSystem.exists(connectionPath);
    
    if (!exists) {
      try {
        // Use clean MongoDB connection template
        const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mongodb/clean-connection.ts.ejs');
        const connectionContent = await this.templateEngine.renderFile(templatePath, {
          projectName: 'Generated Project',
          timestamp: new Date().toISOString()
        });
        
        await this.fileSystem.writeFile(connectionPath, connectionContent);
        result.generatedFiles.push(connectionPath);
        this.logger.info(`📦 Created MongoDB connection: ${connectionPath}`);
      } catch (error) {
        this.logger.error(`❌ Failed to create MongoDB connection: ${error}`);
      }
    }
  }

  /**
   * Generate connection string for different database types
   */
  private generateConnectionString(databaseType: string, databaseName: string): string {
    switch (databaseType) {
      case 'mongodb':
        return `mongodb://localhost:27017/${databaseName}`;
      case 'postgresql':
        return `postgresql://localhost:5432/${databaseName}`;
      case 'mysql':
        return `mysql://localhost:3306/${databaseName}`;
      case 'sqlite':
        return `sqlite:${databaseName}.db`;
      default:
        return `${databaseType}://localhost/${databaseName}`;
    }
  }

  /**
   * Get database-specific options
   */
  private getDatabaseOptions(databaseType: string): any {
    switch (databaseType) {
      case 'mongodb':
        return {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          bufferMaxEntries: 0,
          bufferCommands: false
        };
      case 'postgresql':
        return {
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000
        };
      case 'mysql':
        return {
          connectionLimit: 10,
          acquireTimeout: 60000,
          timeout: 60000
        };
      case 'sqlite':
        return {
          mode: 'OPEN_READWRITE | OPEN_CREATE'
        };
      default:
        return {};
    }
  }
}

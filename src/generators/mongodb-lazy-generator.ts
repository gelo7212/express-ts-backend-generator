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
 * Generator for MongoDB with Lazy Loading Pattern
 * Generates entity-specific MongoDB implementations without database-agnostic abstractions
 */
export class MongoDbLazyGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'mongodb-lazy');
  }

  canHandle(type: string): boolean {
    return type === 'mongodb-lazy' || type === 'mongo-lazy';
  }

  supports(type: string): boolean {
    return this.canHandle(type);
  }

  getDescription(): string {
    return 'Generates MongoDB implementation with lazy loading pattern (no database abstractions)';
  }

  async generate(context: GenerationContext): Promise<GenerationResult> {
    const result: GenerationResult = {
      success: false,
      generatedFiles: [],
      errors: []
    };

    try {
      this.logger.info('Generating MongoDB lazy implementation...');
      
      // Validate required context
      if (!context.templateData.schemaName) {
        throw new Error('Schema name is required for MongoDB lazy generation');
      }

      // Validate required fields
      if (!context.templateData.schemaNames) {
        throw new Error('Schema names are required for generation');
      }

      // Prepare enhanced template data
      const templateData = {
        ...context.templateData,
        // MongoDB lazy loading flags
        useDatabaseService: false,
        isDatabaseAware: false,
        isLazyLoading: true,
        useNativeMongoose: true,
        // Process schema fields with validation
        fields: this.processSchemaFields(context.templateData.fields || this.getDefaultSchemaFields()),
        // Default empty arrays for optional configurations
        indexes: context.templateData.indexes || [],
        virtuals: context.templateData.virtuals || [],
        methods: context.templateData.methods || [],
        statics: context.templateData.statics || [],
        // Enable timestamps by default
        timestamps: context.templateData.timestamps !== false,
        // Preserve naming conventions
        schemaNames: context.templateData.schemaNames,
        // Database configuration with fallback
        databaseName: context.templateData.databaseName || `${context.templateData.schemaNames.kebabCase}_db`
      };

      // Create database directory structure
      const entityDir = `src/infrastructure/database/${templateData.schemaNames.kebabCase}`;
      const mongoDir = `${entityDir}/mongodb`;
      const schemasDir = `${mongoDir}/schemas`;
      const modelsDir = `${mongoDir}/models`;
      const repositoriesDir = `${mongoDir}/repositories`;

      // Ensure directories exist
      for (const dir of [entityDir, mongoDir, schemasDir, modelsDir, repositoriesDir]) {
        await this.fileSystem.createDirectory(dir);
      }

      // Generate MongoDB files using lazy templates
      await this.generateLazyConnection(mongoDir, templateData, result);
      await this.generateLazySchema(schemasDir, templateData, result);
      await this.generateLazyModel(modelsDir, templateData, result);
      await this.generateLazyRepository(repositoriesDir, templateData, result);
      await this.generateLazyIndex(mongoDir, templateData, result);

      // Update container bindings
      await this.updateContainerBindings(templateData, result);

      if (result.errors.length === 0) {
        result.success = true;
        this.logger.success(`MongoDB lazy implementation generated successfully for: ${context.templateData.schemaName}`);
        this.logger.info(`Generated files: ${result.generatedFiles.length} files`);
        this.logger.info('🔥 Key Benefits:');
        this.logger.info('  ✅ Lazy loading - only connects when first used');
        this.logger.info('  ✅ Entity-specific database - independent MongoDB instance');
        this.logger.info('  ✅ Native Mongoose features - no custom abstractions');
        this.logger.info('  ✅ Production ready - with error handling & connection management');
      }

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error occurred');
      this.logger.error(`Failed to generate MongoDB lazy implementation: ${error}`);
    }

    return result;
  }

  /**
   * Generate lazy-loading MongoDB connection
   */
  private async generateLazyConnection(
    targetDir: string,
    templateData: any,
    result: GenerationResult
  ): Promise<void> {
    const filePath = `${targetDir}/connection.ts`;
    const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mongodb/lazy-connection.ts.ejs');
    
    const content = await this.templateEngine.renderFile(templatePath, templateData);
    await this.fileSystem.writeFile(filePath, content);
    
    const absolutePath = await this.fileSystem.getAbsolutePath(filePath);
    result.generatedFiles.push(absolutePath);
    
    this.logger.info(`📝 Generated lazy connection: ${filePath}`);
  }

  /**
   * Generate Mongoose schema with MongoDB optimizations
   */
  private async generateLazySchema(
    targetDir: string,
    templateData: any,
    result: GenerationResult
  ): Promise<void> {
    const filePath = `${targetDir}/${templateData.schemaNames.kebabCase}.schema.ts`;
    const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mongodb/lazy-schema.ts.ejs');
    
    const content = await this.templateEngine.renderFile(templatePath, templateData);
    await this.fileSystem.writeFile(filePath, content);
    
    const absolutePath = await this.fileSystem.getAbsolutePath(filePath);
    result.generatedFiles.push(absolutePath);
    
    this.logger.info(`📝 Generated lazy schema: ${filePath}`);
  }

  /**
   * Generate Mongoose model with lazy loading
   */
  private async generateLazyModel(
    targetDir: string,
    templateData: any,
    result: GenerationResult
  ): Promise<void> {
    const filePath = `${targetDir}/${templateData.schemaNames.kebabCase}.model.ts`;
    const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mongodb/lazy-model.ts.ejs');
    
    const content = await this.templateEngine.renderFile(templatePath, templateData);
    await this.fileSystem.writeFile(filePath, content);
    
    const absolutePath = await this.fileSystem.getAbsolutePath(filePath);
    result.generatedFiles.push(absolutePath);
    
    this.logger.info(`📝 Generated lazy model: ${filePath}`);
  }

  /**
   * Generate repository with native Mongoose
   */
  private async generateLazyRepository(
    targetDir: string,
    templateData: any,
    result: GenerationResult
  ): Promise<void> {
    const filePath = `${targetDir}/${templateData.schemaNames.kebabCase}.repository.ts`;
    const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mongodb/lazy-repository.ts.ejs');
    
    const content = await this.templateEngine.renderFile(templatePath, templateData);
    await this.fileSystem.writeFile(filePath, content);
    
    const absolutePath = await this.fileSystem.getAbsolutePath(filePath);
    result.generatedFiles.push(absolutePath);
    
    this.logger.info(`📝 Generated lazy repository: ${filePath}`);
  }

  /**
   * Generate index file for easy imports
   */
  private async generateLazyIndex(
    targetDir: string,
    templateData: any,
    result: GenerationResult
  ): Promise<void> {
    const filePath = `${targetDir}/index.ts`;
    const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mongodb/lazy-index.ts.ejs');
    
    const content = await this.templateEngine.renderFile(templatePath, templateData);
    await this.fileSystem.writeFile(filePath, content);
    
    const absolutePath = await this.fileSystem.getAbsolutePath(filePath);
    result.generatedFiles.push(absolutePath);
    
    this.logger.info(`📝 Generated lazy index: ${filePath}`);
  }

  /**
   * Update container bindings to use MongoDB repository
   */
  private async updateContainerBindings(
    templateData: any,
    result: GenerationResult
  ): Promise<void> {
    try {
      const containerPath = 'src/infrastructure/container.ts';
      const exists = await this.fileSystem.exists(containerPath);
      
      if (!exists) {
        this.logger.warning(`Container file not found at ${containerPath}, skipping binding update`);
        return;
      }

      const existingContent = await this.fileSystem.readFile(containerPath);
      const schemaNames = templateData.schemaNames;

      // Add imports for MongoDB repository and interface
      const mongoRepoImport = `import { ${schemaNames.pascalCase}MongoRepository } from './database/${schemaNames.kebabCase}/mongodb/repositories/${schemaNames.kebabCase}.repository';`;
      const interfaceImport = `import { I${schemaNames.pascalCase}Repository } from '../domain/${schemaNames.kebabCase}/repositories/${schemaNames.kebabCase}.repository.interface';`;
      
      // Add binding for repository
      const bindingStatement = `// ${schemaNames.pascalCase} Repository - MongoDB Implementation
container.bind<I${schemaNames.pascalCase}Repository>(TYPES.${schemaNames.pascalCase}Repository).to(${schemaNames.pascalCase}MongoRepository);`;

      let updatedContent = existingContent;
      
      // Add MongoDB repository import if not exists
      if (!existingContent.includes(mongoRepoImport)) {
        const lastImportMatch = existingContent.match(/import .* from .*;(?!.*import)/);
        if (lastImportMatch) {
          const insertPosition = lastImportMatch.index! + lastImportMatch[0].length;
          updatedContent = updatedContent.slice(0, insertPosition) + '\n' + mongoRepoImport + updatedContent.slice(insertPosition);
        }
      }
      
      // Add repository interface import if not exists
      if (!updatedContent.includes(interfaceImport)) {
        const lastImportMatch = updatedContent.match(/import .* from .*;(?!.*import)/);
        if (lastImportMatch) {
          const insertPosition = lastImportMatch.index! + lastImportMatch[0].length;
          updatedContent = updatedContent.slice(0, insertPosition) + '\n' + interfaceImport + updatedContent.slice(insertPosition);
        }
      }

      // Add binding if not exists
      if (!updatedContent.includes(`TYPES.${schemaNames.pascalCase}Repository`)) {
        const bindingPosition = updatedContent.lastIndexOf('export { container };');
        if (bindingPosition !== -1) {
          updatedContent = updatedContent.slice(0, bindingPosition) + '\n' + bindingStatement + '\n\n' + updatedContent.slice(bindingPosition);
        }
      }
      
      // Write the updated content if changes were made
      if (updatedContent !== existingContent) {
        await this.fileSystem.writeFile(containerPath, updatedContent);
        this.logger.info(`📝 Updated container bindings for ${schemaNames.pascalCase}Repository`);
      } else {
        this.logger.info(`📦 Container binding already exists for ${schemaNames.pascalCase}Repository`);
      }
    } catch (error) {
      this.logger.warning(`⚠️ Could not update container bindings: ${error}`);
      // Don't fail the generation for this
    }
  }

  /**
   * Process and enhance schema fields for MongoDB with validation
   */
  private processSchemaFields(fields: any[]): any[] {
    if (!Array.isArray(fields)) {
      this.logger.warning('⚠️ Fields is not an array, using default fields');
      return this.getDefaultSchemaFields().map(field => this.enhanceField(field));
    }

    if (fields.length === 0) {
      this.logger.info('📝 No fields provided, using default fields');
      return this.getDefaultSchemaFields().map(field => this.enhanceField(field));
    }

    return fields.map(field => this.enhanceField(field));
  }

  /**
   * Enhance a single field with MongoDB-specific properties
   */
  private enhanceField(field: any): any {
    // Validate required field properties
    if (!field.name) {
      throw new Error('Field name is required');
    }
    if (!field.type) {
      throw new Error(`Field type is required for field: ${field.name}`);
    }

    return {
      ...field,
      mongooseType: this.getMongooseType(field.type),
      schemaDefinition: this.getSchemaDefinition(field)
    };
  }

  /**
   * Get Mongoose-compatible type
   */
  private getMongooseType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'date': 'Date',
      'array': 'any[]',
      'object': 'any'
    };
    
    return typeMap[type.toLowerCase()] || 'any';
  }

  /**
   * Get Mongoose schema definition
   */
  private getSchemaDefinition(field: any): any {
    const definition: any = {};
    
    // Map type
    switch (field.type.toLowerCase()) {
      case 'string':
        definition.type = 'String';
        break;
      case 'number':
        definition.type = 'Number';
        break;
      case 'boolean':
        definition.type = 'Boolean';
        break;
      case 'date':
        definition.type = 'Date';
        break;
      case 'array':
        definition.type = '[]';
        break;
      case 'object':
        definition.type = 'Schema.Types.Mixed';
        break;
      default:
        definition.type = 'Schema.Types.Mixed';
    }

    // Add constraints
    if (field.required) definition.required = true;
    if (field.unique) definition.unique = true;
    if (field.index) definition.index = true;
    if (field.default !== undefined) definition.default = field.default;
    if (field.validate) definition.validate = field.validate;
    if (field.trim) definition.trim = true;
    if (field.lowercase) definition.lowercase = true;
    if (field.uppercase) definition.uppercase = true;
    if (field.minlength) definition.minlength = field.minlength;
    if (field.maxlength) definition.maxlength = field.maxlength;
    if (field.min) definition.min = field.min;
    if (field.max) definition.max = field.max;
    if (field.enum) definition.enum = field.enum;

    return definition;
  }

  /**
   * Generate default schema fields
   */
  private getDefaultSchemaFields(): any[] {
    return [
      {
        name: 'name',
        type: 'string',
        required: true,
        trim: true,
        description: 'Name field'
      },
      {
        name: 'email',
        type: 'string',
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        description: 'Email field'
      },
      {
        name: 'isActive',
        type: 'boolean',
        default: true,
        description: 'Active status'
      }
    ];
  }
}

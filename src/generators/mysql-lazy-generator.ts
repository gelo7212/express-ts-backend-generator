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
 * Generator for MySQL with Lazy Loading Pattern using Sequelize
 * Generates entity-specific MySQL implementations without database-agnostic abstractions
 */
export class MySqlLazyGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'mysql-lazy');
  }

  canHandle(type: string): boolean {
    return type === 'mysql-lazy' || type === 'sequelize-lazy';
  }

  supports(type: string): boolean {
    return this.canHandle(type);
  }

  getDescription(): string {
    return 'Generates MySQL implementation with lazy loading pattern using Sequelize (no database abstractions)';
  }

  async generate(context: GenerationContext): Promise<GenerationResult> {
    const result: GenerationResult = {
      success: false,
      generatedFiles: [],
      errors: []
    };

    try {
      this.logger.info('Generating MySQL lazy implementation...');
      
      // Validate required context
      if (!context.templateData.schemaName) {
        throw new Error('Schema name is required for MySQL lazy generation');
      }

      // Validate required fields
      if (!context.templateData.schemaNames) {
        throw new Error('Schema names are required for generation');
      }

      // Prepare enhanced template data
      const templateData = {
        ...context.templateData,
        // MySQL lazy loading flags
        useDatabaseService: false,
        isDatabaseAware: false,
        isLazyLoading: true,
        useNativeSequelize: true,
        // Shared domain configuration
        sharedDomain: context.templateData.sharedDomain,
        sharedDomainNames: context.templateData.sharedDomainNames,
        // Process schema fields with validation - extract from domain if exists
        fields: await this.getFieldsForGeneration(context),
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
        databaseName: context.templateData.databaseName || `${context.templateData.schemaNames.kebabCase}_db`,
        // MySQL/Sequelize specific configuration
        dialect: context.templateData.dialect || 'mysql',
        host: context.templateData.host || 'localhost',
        port: context.templateData.port || '3306',
        envVar: context.templateData.envVar
      };

      // Create database directory structure
      let entityDir, sqlDir, schemasDir, modelsDir, repositoriesDir;
      
      if (templateData.sharedDomain) {
        // Shared domain structure: src/infrastructure/database/shopping/mysql/
        const sharedDir = `src/infrastructure/database/${templateData.sharedDomainNames.kebabCase}`;
        sqlDir = `${sharedDir}/mysql`;
        schemasDir = `${sqlDir}/schemas`;
        modelsDir = `${sqlDir}/models`;
        repositoriesDir = `${sqlDir}/repositories`;
        entityDir = sharedDir;
      } else {
        // Individual entity structure: src/infrastructure/database/cart/mysql/
        entityDir = `src/infrastructure/database/${templateData.schemaNames.kebabCase}`;
        sqlDir = `${entityDir}/mysql`;
        schemasDir = `${sqlDir}/schemas`;
        modelsDir = `${sqlDir}/models`;
        repositoriesDir = `${sqlDir}/repositories`;
      }

      // Ensure directories exist
      for (const dir of [entityDir, sqlDir, schemasDir, modelsDir, repositoriesDir]) {
        await this.fileSystem.createDirectory(dir);
      }

      if (templateData.sharedDomain) {
        this.logger.info(`📁 Using shared domain structure: ${templateData.sharedDomain}`);
        await this.generateSharedConnection(sqlDir, templateData, result);
        await this.generateSharedIndex(entityDir, templateData, result);
      } else {
        this.logger.info('📁 Using individual entity database structure');
        await this.generateLazyConnection(sqlDir, templateData, result);
        await this.generateEntityIndex(entityDir, templateData, result);
      }

      // Generate core files for all patterns
      await this.generateSequelizeSchema(schemasDir, templateData, result);
      await this.generateSequelizeModel(modelsDir, templateData, result);
      await this.generateMySqlRepository(repositoriesDir, templateData, result);

      // Update DI container bindings
      await this.updateContainerBindings(context, templateData, result);

      result.success = true;
      this.logger.success(`✅ MySQL lazy implementation generated successfully!`);

    } catch (error) {
      this.logger.error(`Failed to generate MySQL lazy implementation: ${error}`);
      result.errors.push(error instanceof Error ? error.message : String(error));
    }

    return result;
  }

  /**
   * Generate shared MySQL connection manager for multiple entities in same domain
   */
  private async generateSharedConnection(
    sqlDir: string, 
    templateData: any, 
    result: GenerationResult
  ): Promise<void> {
    const connectionPath = `${sqlDir}/shared-connection.ts`;
    
    // Only create connection if it doesn't exist
    const exists = await this.fileSystem.exists(connectionPath);
    if (!exists) {
      const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mysql/shared-connection.ts.ejs');
      const content = await this.templateEngine.renderFile(templatePath, templateData);
      
      await this.fileSystem.writeFile(connectionPath, content);
      result.generatedFiles.push(connectionPath);
      this.logger.info(`✅ Generated shared MySQL connection: ${connectionPath}`);
    } else {
      this.logger.info(`⚡ Shared MySQL connection already exists: ${connectionPath}`);
    }
  }

  /**
   * Generate lazy MySQL connection for individual entity
   */
  private async generateLazyConnection(
    sqlDir: string, 
    templateData: any, 
    result: GenerationResult
  ): Promise<void> {
    const connectionPath = `${sqlDir}/lazy-connection.ts`;
    
    const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mysql/lazy-connection.ts.ejs');
    const content = await this.templateEngine.renderFile(templatePath, templateData);
    
    await this.fileSystem.writeFile(connectionPath, content);
    result.generatedFiles.push(connectionPath);
    this.logger.info(`✅ Generated lazy MySQL connection: ${connectionPath}`);
  }

  /**
   * Generate Sequelize schema definition
   */
  private async generateSequelizeSchema(
    schemasDir: string, 
    templateData: any, 
    result: GenerationResult
  ): Promise<void> {
    const schemaPath = `${schemasDir}/${templateData.schemaNames.kebabCase}-schema.ts`;
    
    const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mysql/schema.ts.ejs');
    const content = await this.templateEngine.renderFile(templatePath, templateData);
    
    await this.fileSystem.writeFile(schemaPath, content);
    result.generatedFiles.push(schemaPath);
    this.logger.info(`✅ Generated Sequelize schema: ${schemaPath}`);
  }

  /**
   * Generate Sequelize model
   */
  private async generateSequelizeModel(
    modelsDir: string, 
    templateData: any, 
    result: GenerationResult
  ): Promise<void> {
    const modelPath = `${modelsDir}/${templateData.schemaNames.kebabCase}-model.ts`;
    
    const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mysql/model.ts.ejs');
    const content = await this.templateEngine.renderFile(templatePath, templateData);
    
    await this.fileSystem.writeFile(modelPath, content);
    result.generatedFiles.push(modelPath);
    this.logger.info(`✅ Generated Sequelize model: ${modelPath}`);
  }

  /**
   * Generate MySQL repository implementation
   */
  private async generateMySqlRepository(
    repositoriesDir: string, 
    templateData: any, 
    result: GenerationResult
  ): Promise<void> {
    const repositoryPath = `${repositoriesDir}/${templateData.schemaNames.kebabCase}-mysql-repository.ts`;
    
    const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mysql/repository.ts.ejs');
    const content = await this.templateEngine.renderFile(templatePath, templateData);
    
    await this.fileSystem.writeFile(repositoryPath, content);
    result.generatedFiles.push(repositoryPath);
    this.logger.info(`✅ Generated MySQL repository: ${repositoryPath}`);
  }

  /**
   * Generate shared domain index file
   */
  private async generateSharedIndex(
    entityDir: string, 
    templateData: any, 
    result: GenerationResult
  ): Promise<void> {
    const indexPath = `${entityDir}/index.ts`;
    
    // For shared domains, we need to append to existing index file
    const exists = await this.fileSystem.exists(indexPath);
    if (exists) {
      await this.appendToSharedIndex(indexPath, templateData, result);
    } else {
      await this.createSharedIndex(indexPath, templateData, result);
    }
  }

  /**
   * Generate individual entity index file
   */
  private async generateEntityIndex(
    entityDir: string, 
    templateData: any, 
    result: GenerationResult
  ): Promise<void> {
    const indexPath = `${entityDir}/index.ts`;
    
    const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mysql/lazy-index.ts.ejs');
    const content = await this.templateEngine.renderFile(templatePath, templateData);
    
    await this.fileSystem.writeFile(indexPath, content);
    result.generatedFiles.push(indexPath);
    this.logger.info(`✅ Generated MySQL entity index: ${indexPath}`);
  }

  /**
   * Create new shared index file
   */
  private async createSharedIndex(
    indexPath: string, 
    templateData: any, 
    result: GenerationResult
  ): Promise<void> {
    const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mysql/shared-index.ts.ejs');
    const content = await this.templateEngine.renderFile(templatePath, templateData);
    
    await this.fileSystem.writeFile(indexPath, content);
    result.generatedFiles.push(indexPath);
    this.logger.info(`✅ Generated shared MySQL index: ${indexPath}`);
  }

  /**
   * Append entity exports to existing shared index file
   */
  private async appendToSharedIndex(
    indexPath: string, 
    templateData: any, 
    result: GenerationResult
  ): Promise<void> {
    // Read existing content
    const existingContent = await this.fileSystem.readFile(indexPath);
    
    // Check if this entity is already exported
    const entityExportPattern = new RegExp(`export.*${templateData.schemaNames.pascalCase}.*Repository`, 'i');
    if (entityExportPattern.test(existingContent)) {
      this.logger.info(`⚡ ${templateData.schemaNames.pascalCase} already exported in shared index`);
      return;
    }

    // Generate the new exports for this entity
    const templatePath = this.templateRegistry.resolveTemplatePath('infrastructure/mysql/shared-export.ts.ejs');
    const newExports = await this.templateEngine.renderFile(templatePath, templateData);
    
    // Append to existing content
    const updatedContent = existingContent + '\n' + newExports;
    
    await this.fileSystem.writeFile(indexPath, updatedContent);
    result.generatedFiles.push(indexPath);
    this.logger.info(`✅ Updated shared MySQL index with ${templateData.schemaNames.pascalCase}: ${indexPath}`);
  }

  /**
   * Update dependency injection container bindings
   */
  private async updateContainerBindings(
    context: GenerationContext, 
    templateData: any, 
    result: GenerationResult
  ): Promise<void> {
    const containerPath = 'src/infrastructure/container/index.ts';
    
    try {
      const exists = await this.fileSystem.exists(containerPath);
      if (!exists) {
        this.logger.warning('⚠️  Container file not found, skipping binding update');
        return;
      }

      const content = await this.fileSystem.readFile(containerPath);
      
      // Check if binding already exists
      const bindingPattern = new RegExp(`I${templateData.schemaNames.pascalCase}Repository.*${templateData.schemaNames.pascalCase}MySqlRepository`, 'i');
      if (bindingPattern.test(content)) {
        this.logger.info(`⚡ ${templateData.schemaNames.pascalCase} repository binding already exists`);
        return;
      }

      // Generate binding content
      const bindingPath = templateData.sharedDomain 
        ? `../database/${templateData.sharedDomainNames.kebabCase}`
        : `../database/${templateData.schemaNames.kebabCase}`;

      const importStatement = `import { ${templateData.schemaNames.pascalCase}MySqlRepository } from '${bindingPath}';`;
      const bindingStatement = `container.registerSingleton<I${templateData.schemaNames.pascalCase}Repository>('${templateData.schemaNames.pascalCase}Repository', () => new ${templateData.schemaNames.pascalCase}MySqlRepository());`;

      // Add import after existing imports
      let updatedContent = content;
      const lastImportMatch = content.match(/^import.*$/gm);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        updatedContent = content.replace(lastImport, `${lastImport}\n${importStatement}`);
      }

      // Add binding before container export
      const exportMatch = updatedContent.match(/export\s+{\s*container\s*}/);
      if (exportMatch) {
        updatedContent = updatedContent.replace(exportMatch[0], `${bindingStatement}\n\n${exportMatch[0]}`);
      }

      await this.fileSystem.writeFile(containerPath, updatedContent);
      result.generatedFiles.push(containerPath);
      this.logger.info(`✅ Updated container bindings for ${templateData.schemaNames.pascalCase}Repository`);

    } catch (error) {
      this.logger.warning(`⚠️  Failed to update container bindings: ${error}`);
      // Don't fail the whole generation for this
    }
  }

  /**
   * Get fields for generation - extract from domain if exists, otherwise use provided or default
   */
  private async getFieldsForGeneration(context: GenerationContext): Promise<any[]> {
    const schemaNames = context.templateData.schemaNames;
    const domainPath = `src/domain/${schemaNames.kebabCase}`;
    const domainExists = await this.fileSystem.exists(domainPath);

    let fields = context.templateData.fields;
    
    if (domainExists) {
      // Extract fields from existing domain entity
      this.logger.info(`📋 Extracting fields from existing domain entity...`);
      fields = await this.extractFieldsFromDomainEntity(domainPath, schemaNames);
    }

    // If still no fields, use defaults
    if (!fields || fields.length === 0) {
      this.logger.info(`📝 Using default schema fields`);
      fields = this.getDefaultSchemaFields();
    }

    return this.processSchemaFields(fields);
  }

  /**
   * Process and validate schema fields
   */
  private processSchemaFields(fields: any[]): any[] {
    return fields.map(field => ({
      ...field,
      // Map common types to Sequelize types (preserve existing if already set)
      sequelizeType: field.sequelizeType || this.mapToSequelizeType(field.type),
      // Add MySQL-specific validation (preserve existing if already set)
      mysqlValidation: field.mysqlValidation || this.getMySqlValidation(field)
    }));
  }

  /**
   * Map field types to Sequelize data types
   */
  private mapToSequelizeType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'DataTypes.STRING',
      'text': 'DataTypes.TEXT',
      'number': 'DataTypes.INTEGER',
      'float': 'DataTypes.FLOAT',
      'decimal': 'DataTypes.DECIMAL',
      'boolean': 'DataTypes.BOOLEAN',
      'date': 'DataTypes.DATE',
      'enum': 'DataTypes.ENUM',
      'json': 'DataTypes.JSON',
      'uuid': 'DataTypes.UUID'
    };
    
    return typeMap[type.toLowerCase()] || 'DataTypes.STRING';
  }

  /**
   * Get MySQL-specific validation for field
   */
  private getMySqlValidation(field: any): any {
    const validation: any = {};
    
    if (field.required) {
      validation.allowNull = false;
    }
    
    if (field.unique) {
      validation.unique = true;
    }
    
    if (field.min !== undefined) {
      validation.validate = { ...validation.validate, min: field.min };
    }
    
    if (field.max !== undefined) {
      validation.validate = { ...validation.validate, max: field.max };
    }
    
    if (field.length) {
      validation.validate = { ...validation.validate, len: [0, field.length] };
    }
    
    return validation;
  }

  /**
   * Get default schema fields for MySQL
   */
  private getDefaultSchemaFields(): any[] {
    return [
      {
        name: 'id',
        type: 'uuid',
        required: true,
        primaryKey: true,
        sequelizeType: 'DataTypes.UUID',
        mysqlValidation: { allowNull: false, primaryKey: true, defaultValue: 'DataTypes.UUIDV4' }
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        length: 255,
        sequelizeType: 'DataTypes.STRING',
        mysqlValidation: { allowNull: false, validate: { len: [1, 255] } }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        sequelizeType: 'DataTypes.TEXT',
        mysqlValidation: { allowNull: true }
      },
      {
        name: 'isActive',
        type: 'boolean',
        required: false,
        sequelizeType: 'DataTypes.BOOLEAN',
        mysqlValidation: { allowNull: true, defaultValue: true }
      }
    ];
  }

  /**
   * Extract fields from existing domain entity
   */
  private async extractFieldsFromDomainEntity(domainPath: string, schemaNames: any): Promise<any[]> {
    try {
      const entityPath = `${domainPath}/${schemaNames.kebabCase}.entity.ts`;
      const entityExists = await this.fileSystem.exists(entityPath);
      
      if (!entityExists) {
        this.logger.warning(`⚠️  Domain entity file not found: ${entityPath}`);
        return this.getDefaultSchemaFields();
      }

      const entityContent = await this.fileSystem.readFile(entityPath);
      const fields = this.parseFieldsFromEntityFile(entityContent, schemaNames.pascalCase);
      
      this.logger.info(`📋 Extracted ${fields.length} fields from domain entity`);
      return fields;
    } catch (error) {
      this.logger.warning(`⚠️  Failed to extract fields from domain entity: ${error}`);
      return this.getDefaultSchemaFields();
    }
  }

  /**
   * Parse fields from entity file content
   */
  private parseFieldsFromEntityFile(content: string, entityName: string): any[] {
    const fields: any[] = [];
    
    // Look for the entity class definition
    const classMatch = content.match(new RegExp(`export\\s+class\\s+${entityName}\\s*{([^}]*)}`, 's'));
    if (!classMatch) {
      this.logger.warning(`⚠️  Could not find ${entityName} class definition`);
      return this.getDefaultSchemaFields();
    }

    const classBody = classMatch[1];
    
    // Parse properties (excluding constructor and methods)
    const propertyMatches = classBody.match(/(?:private\s+|public\s+|readonly\s+)*([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\?)?:\s*([^;=\n]+)/g);
    
    if (propertyMatches) {
      for (const match of propertyMatches) {
        const propMatch = match.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*(\?)?:\s*([^;=\n]+)/);
        if (propMatch) {
          const [, name, optional, type] = propMatch;
          
          // Skip constructor and method-like patterns
          if (name === 'constructor' || type.includes('(')) continue;
          
          const field = {
            name: name.trim(),
            type: this.mapDomainTypeToMysqlType(type.trim()),
            required: !optional,
            sequelizeType: this.mapToSequelizeType(this.mapDomainTypeToMysqlType(type.trim())),
            mysqlValidation: this.getMySqlValidationForDomainField(name, type.trim(), !optional)
          };
          
          fields.push(field);
        }
      }
    }

    // Ensure id field exists if not found
    const hasId = fields.some(f => f.name === 'id');
    if (!hasId) {
      fields.unshift({
        name: 'id',
        type: 'uuid',
        required: true,
        primaryKey: true,
        sequelizeType: 'DataTypes.UUID',
        mysqlValidation: { allowNull: false, primaryKey: true, defaultValue: 'DataTypes.UUIDV4' }
      });
    }

    return fields;
  }

  /**
   * Map domain types to MySQL field types
   */
  private mapDomainTypeToMysqlType(domainType: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number', 
      'boolean': 'boolean',
      'Date': 'date',
      'string[]': 'json',
      'number[]': 'json',
      'any': 'json',
      'object': 'json'
    };
    
    // Handle optional types (string | undefined, etc.)
    const cleanType = domainType.replace(/\s*\|\s*undefined/g, '').trim();
    return typeMap[cleanType] || 'string';
  }

  /**
   * Get MySQL validation for domain field
   */
  private getMySqlValidationForDomainField(name: string, type: string, required: boolean): any {
    const validation: any = {};
    
    if (required) {
      validation.allowNull = false;
    } else {
      validation.allowNull = true;
    }
    
    // Add defaults for common fields
    if (name === 'isActive' && type.includes('boolean')) {
      validation.defaultValue = true;
    }
    
    if (name === 'id') {
      validation.primaryKey = true;
      validation.defaultValue = 'DataTypes.UUIDV4';
    }
    
    // Add string length validation
    if (type === 'string' && name !== 'description') {
      validation.validate = { len: [1, 255] };
    }
    
    return validation;
  }
}

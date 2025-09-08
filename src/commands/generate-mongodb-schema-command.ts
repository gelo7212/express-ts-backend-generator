import { BaseCommand } from './base-command';
import { 
  CommandArgument, 
  CommandOption,
  GenerationContext,
  ILogger,
  IStringUtils,
  IDependencyContainer,
  IFileSystem
} from '../types';
import { IGeneratorFactory } from '../generators/generator-factory';

/**
 * Command to generate database schema files (MongoDB, PostgreSQL, MySQL, SQLite)
 */
export class GenerateMongoDbSchemaCommand extends BaseCommand {
  name = 'generate:schema:mongodb';
  description = 'Generate database schema files with support for multiple database technologies (MongoDB, PostgreSQL, MySQL, SQLite)';
  aliases = ['gen:schema:mongo', 'g:s:mongo', 'gen:schema:db', 'g:s:db'];

  arguments: CommandArgument[] = [
    {
      name: 'schemaName',
      description: 'Name of the database schema to generate',
      required: true
    }
  ];

  options: CommandOption[] = [
    {
      flags: '-c, --config <path>',
      description: 'Path to configuration file (JSON)'
    },
    {
      flags: '-d, --database <name>',
      description: 'Database name for organizing schemas (default: "main")',
      defaultValue: 'main'
    },
    {
      flags: '--db-type <type>',
      description: 'Database technology type (mongodb, postgresql, mysql, sqlite)',
      defaultValue: 'mongodb'
    },
    {
      flags: '-f, --fields <fields>',
      description: 'Schema fields as JSON string'
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
      description: 'Generate indexes',
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
      flags: '-o, --domain <domain>',
      description: 'Domain context for the schema'
    }
  ];

  async execute(args: any[], options: any): Promise<void> {
    const [schemaName] = args;

    if (!schemaName || typeof schemaName !== 'string') {
      throw new Error('Schema name is required and must be a string');
    }

    this.logger.info(`Generating MongoDB schema: ${schemaName}`);
    
    // Get actual option values from Commander.js Command object
    const opts = typeof options.opts === 'function' ? options.opts() : options;

    try {
      // Parse configuration from file if provided
      let config = {};
      if (opts.config) {
        config = await this.loadConfigFromFile(opts.config);
      }

      // Parse fields from JSON string if provided
      let fields = [];
      if (opts.fields) {
        try {
          // Handle different JSON string formats
          let jsonString = opts.fields;
          
          this.logger.debug(`Original JSON string: ${jsonString.substring(0, 200)}...`);
          this.logger.debug(`Original JSON full: ${jsonString}`);
          
          // Try to reconstruct JSON if PowerShell stripped quotes
          jsonString = this.reconstructPowerShellJson(jsonString);
          
          this.logger.debug(`Reconstructed JSON string: ${jsonString.substring(0, 200)}...`);
          this.logger.debug(`Reconstructed JSON full: ${jsonString}`);
          
          // If it's not properly quoted, try to fix common issues
          if (!jsonString.startsWith('[') && !jsonString.startsWith('{')) {
            throw new Error('Fields must be a valid JSON array or object');
          }
          
          // Try to parse the JSON
          fields = JSON.parse(jsonString);
          if (!Array.isArray(fields)) {
            throw new Error('Fields must be an array');
          }
        } catch (error) {
          // If JSON parsing fails, show helpful error message
          this.logger.error('Failed to parse fields JSON. PowerShell may have corrupted the JSON.');
          this.logger.info('Recommended solutions:');
          this.logger.info('1. Use a config file: --config path/to/config.json');
          this.logger.info('2. Use single quotes in PowerShell: --fields \'[{"name":"title","type":"String"}]\'');
          this.logger.info('3. Escape quotes: --fields "[{\\"name\\":\\"title\\",\\"type\\":\\"String\\"}]"');
          this.logger.error(`Raw input received: ${opts.fields?.substring(0, 200)}...`);
          throw new Error(`Invalid fields JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        // Default fields if none provided
        fields = this.getDefaultFields();
      }

      // Validate fields structure
      this.validateFields(fields);

      // Create template data
      const templateData = {
        schemaName,
        fields,
        databaseName: opts.database || 'main',
        databaseType: opts.dbType || 'mongodb', // Add database type support
        generateTimestamps: opts.timestamps !== false,
        generateVirtuals: opts.virtuals === true,
        generateIndexes: opts.indexes === true,
        generateMethods: opts.methods === true,
        generateStatics: opts.statics === true,
        domainName: opts.domain,
        ...config
      };

      console.log('Template data being passed:', templateData); // Debug log

      console.log('Template data being passed:', templateData); // Debug log

      // Create generation context
      const context: GenerationContext = this.createContext(
        [schemaName],
        opts,
        templateData
      );

      // Get the MongoDB schema generator
      const generator = this.generatorFactory.createGenerator('mongodb-schema');
      if (!generator) {
        throw new Error('MongoDB schema generator not found. Please ensure it is properly registered.');
      }

      // Generate the schema
      const result = await generator.generate(context);

      if (result.success) {
        this.logger.success(`MongoDB schema '${schemaName}' generated successfully!`);
        if (result.generatedFiles.length > 0) {
          this.logger.info('Generated files:');
          result.generatedFiles.forEach((file: string) => {
            this.logger.info(`  - ${file}`);
          });
        }
      } else {
        this.logger.error(`Failed to generate MongoDB schema '${schemaName}'`);
        result.errors.forEach((error: string) => {
          this.logger.error(`  - ${error}`);
        });
        throw new Error('Generation failed');
      }

    } catch (error) {
      this.logger.error(`Error generating MongoDB schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Load configuration from JSON file
   */
  private async loadConfigFromFile(configPath: string): Promise<any> {
    try {
      const fs = this.container.resolve<IFileSystem>('IFileSystem');
      const configContent = await fs.readFile(configPath);
      return JSON.parse(configContent);
    } catch (error) {
      throw new Error(`Failed to load config file '${configPath}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get default schema fields
   */
  private getDefaultFields(): any[] {
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
   * Validate field structure
   */
  private validateFields(fields: any[]): void {
    if (!Array.isArray(fields)) {
      throw new Error('Fields must be an array');
    }

    for (const field of fields) {
      if (!field.name || typeof field.name !== 'string') {
        throw new Error('Each field must have a valid name (string)');
      }

      if (!field.type || typeof field.type !== 'string') {
        throw new Error(`Field '${field.name}' must have a valid type (string)`);
      }

      // Validate MongoDB/Mongoose types
      const validTypes = [
        'String', 'Number', 'Date', 'Buffer', 'Boolean', 'Mixed', 'ObjectId', 'Array', 'Decimal128', 'Map'
      ];
      
      if (!validTypes.includes(field.type)) {
        this.logger.warning(`Field '${field.name}' has type '${field.type}' which may not be a standard Mongoose type`);
      }
    }
  }

  private reconstructPowerShellJson(input: string): string {
    // PowerShell often strips quotes from JSON, so we need to reconstruct them
    let reconstructed = input;
    
    // First, handle smart quotes that might have been introduced
    reconstructed = reconstructed
      .replace(/'/g, '"')  // Replace smart quotes with regular quotes
      .replace(/'/g, '"')  // Replace other smart quotes
      .replace(/"/g, '"')  // Replace other smart quotes
      .replace(/"/g, '"'); // Replace other smart quotes
    
    // If PowerShell stripped quotes completely, we need to reconstruct the JSON
    if (reconstructed.includes('{name:') || reconstructed.includes('[{name:')) {
      this.logger.debug('PowerShell stripped quotes detected, reconstructing JSON...');
      
      // Step 1: Add quotes around property names
      reconstructed = reconstructed.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '"$1":');
      
      // Step 2: Add quotes around string values (complex regex to handle different contexts)
      // Handle values after colons that aren't numbers, booleans, or already quoted
      reconstructed = reconstructed.replace(/:"?([a-zA-Z][a-zA-Z0-9_]*)"?([,\]\}])/g, (match, value, terminator) => {
        // Don't quote boolean values, null, or numbers
        if (value === 'true' || value === 'false' || value === 'null' || !isNaN(Number(value))) {
          return `:${value}${terminator}`;
        }
        return `:"${value}"${terminator}`;
      });
      
      // Step 3: Handle array values like [electronics,clothing,books]
      reconstructed = reconstructed.replace(/\[([^\[\]]*)\]/g, (match, content) => {
        // Skip if it contains objects (has colons)
        if (content.includes(':')) return match;
        
        // Split by comma and quote string items
        const items = content.split(',').map((item: string) => {
          item = item.trim();
          // Skip if already quoted
          if (item.startsWith('"') && item.endsWith('"')) return item;
          // Skip numbers and booleans
          if (item === 'true' || item === 'false' || item === 'null' || !isNaN(Number(item))) return item;
          // Quote everything else
          return `"${item}"`;
        });
        
        return `[${items.join(',')}]`;
      });
    }
    
    return reconstructed;
  }
}

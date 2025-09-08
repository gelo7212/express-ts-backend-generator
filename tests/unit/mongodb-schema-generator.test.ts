import { MongoDbSchemaGenerator } from '../../../src/generators/mongodb-schema-generator';
import { 
  GenerationContext,
  IFileSystem,
  ILogger,
  ITemplateEngine,
  IStringUtils
} from '../../../src/types';
import { ITemplateRegistry } from '../../../src/templates';

// Mock implementations
class MockFileSystem implements IFileSystem {
  private files: Map<string, string> = new Map();

  async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  async readFile(path: string): Promise<string> {
    return this.files.get(path) || '';
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async createDirectory(path: string): Promise<void> {
    // Mock implementation
  }

  async copyFile(source: string, destination: string): Promise<void> {
    const content = this.files.get(source);
    if (content) {
      this.files.set(destination, content);
    }
  }

  async readDirectory(path: string): Promise<string[]> {
    return Array.from(this.files.keys()).filter(key => key.startsWith(path));
  }

  joinPath(...parts: string[]): string {
    return parts.join('/');
  }

  getAbsolutePath(relativePath: string): string {
    return relativePath;
  }

  getExtension(filePath: string): string {
    return filePath.split('.').pop() || '';
  }

  getBasename(filePath: string, ext?: string): string {
    const name = filePath.split('/').pop() || '';
    return ext ? name.replace(ext, '') : name;
  }

  getDirname(filePath: string): string {
    return filePath.split('/').slice(0, -1).join('/');
  }

  getFiles(): Map<string, string> {
    return this.files;
  }
}

class MockLogger implements ILogger {
  private logs: string[] = [];

  info(message: string): void {
    this.logs.push(`INFO: ${message}`);
  }

  success(message: string): void {
    this.logs.push(`SUCCESS: ${message}`);
  }

  warning(message: string): void {
    this.logs.push(`WARNING: ${message}`);
  }

  error(message: string): void {
    this.logs.push(`ERROR: ${message}`);
  }

  debug(message: string): void {
    this.logs.push(`DEBUG: ${message}`);
  }

  getLogs(): string[] {
    return this.logs;
  }
}

class MockTemplateEngine implements ITemplateEngine {
  async render(template: string, data: Record<string, any>): Promise<string> {
    // Simple template engine mock
    let result = template;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`<%=\\s*${key}\\s*%>`, 'g');
      result = result.replace(regex, String(data[key]));
    });
    return result;
  }

  async renderFile(templatePath: string, data: Record<string, any>): Promise<string> {
    return this.render(`Template from ${templatePath}`, data);
  }
}

class MockStringUtils implements IStringUtils {
  toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + this.toCamelCase(str).slice(1);
  }

  toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  toSnakeCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  }

  toLowercase(str: string): string {
    return str.toLowerCase();
  }

  pluralize(str: string): string {
    return str + 's';
  }

  singularize(str: string): string {
    return str.endsWith('s') ? str.slice(0, -1) : str;
  }

  generateNamingConventions(str: string) {
    return {
      camelCase: this.toCamelCase(str),
      pascalCase: this.toPascalCase(str),
      kebabCase: this.toKebabCase(str),
      snakeCase: this.toSnakeCase(str),
      lowercase: this.toLowercase(str),
      uppercase: str.toUpperCase(),
      pluralCamelCase: this.toCamelCase(this.pluralize(str)),
      pluralPascalCase: this.toPascalCase(this.pluralize(str)),
      pluralKebabCase: this.toKebabCase(this.pluralize(str)),
      singularCamelCase: this.toCamelCase(this.singularize(str)),
      singularPascalCase: this.toPascalCase(this.singularize(str))
    };
  }
}

class MockTemplateRegistry implements ITemplateRegistry {
  private configs: Map<string, any> = new Map();

  loadFromDirectory(path: string): Promise<void> {
    return Promise.resolve();
  }

  getConfig(type: string): any {
    return this.configs.get(type) || {
      name: 'mock-config',
      type: type,
      templates: []
    };
  }

  getApplicableTemplates(type: string, context: any): any[] {
    return [
      {
        name: 'mock-template',
        path: 'mock/template.ejs',
        type: 'file',
        outputPath: `src/generated/${type}.ts`
      }
    ];
  }

  setConfig(type: string, config: any): void {
    this.configs.set(type, config);
  }
}

describe('MongoDB Schema Generator Tests', () => {
  let generator: MongoDbSchemaGenerator;
  let mockFileSystem: MockFileSystem;
  let mockLogger: MockLogger;
  let mockTemplateEngine: MockTemplateEngine;
  let mockTemplateRegistry: MockTemplateRegistry;
  let mockStringUtils: MockStringUtils;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockLogger = new MockLogger();
    mockTemplateEngine = new MockTemplateEngine();
    mockTemplateRegistry = new MockTemplateRegistry();
    mockStringUtils = new MockStringUtils();

    generator = new MongoDbSchemaGenerator(
      mockFileSystem,
      mockLogger,
      mockTemplateEngine,
      mockTemplateRegistry,
      mockStringUtils
    );
  });

  describe('Basic Functionality', () => {
    it('should identify itself as mongodb-schema generator', () => {
      expect(generator.canHandle('mongodb-schema')).toBe(true);
      expect(generator.canHandle('other-type')).toBe(false);
    });

    it('should provide correct description', () => {
      const description = generator.getDescription();
      expect(description).toContain('MongoDB');
      expect(description).toContain('schema');
    });
  });

  describe('Schema Generation', () => {
    it('should generate schema with basic fields', async () => {
      const context: GenerationContext = {
        projectPath: '/test/project',
        templateData: {
          schemaName: 'User',
          fields: [
            { name: 'name', type: 'String', required: true },
            { name: 'email', type: 'String', required: true },
            { name: 'age', type: 'Number', required: false }
          ]
        },
        options: {}
      };

      const result = await generator.generate(context);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle schema with advanced field options', async () => {
      const context: GenerationContext = {
        projectPath: '/test/project',
        templateData: {
          schemaName: 'Product',
          fields: [
            { 
              name: 'name', 
              type: 'String', 
              required: true,
              minLength: 3,
              maxLength: 100
            },
            { 
              name: 'price', 
              type: 'Number', 
              required: true,
              min: 0
            },
            {
              name: 'category',
              type: 'String',
              required: true,
              enum: ['electronics', 'clothing', 'books']
            }
          ]
        },
        options: {}
      };

      const result = await generator.generate(context);

      expect(result.success).toBe(true);
    });

    it('should generate schema with timestamps', async () => {
      const context: GenerationContext = {
        projectPath: '/test/project',
        templateData: {
          schemaName: 'Article',
          generateTimestamps: true,
          fields: [
            { name: 'title', type: 'String', required: true },
            { name: 'content', type: 'String', required: true }
          ]
        },
        options: {}
      };

      const result = await generator.generate(context);

      expect(result.success).toBe(true);
    });

    it('should generate schema with virtual fields', async () => {
      const context: GenerationContext = {
        projectPath: '/test/project',
        templateData: {
          schemaName: 'Person',
          generateVirtuals: true,
          fields: [
            { name: 'firstName', type: 'String', required: true },
            { name: 'lastName', type: 'String', required: true }
          ],
          virtuals: [
            {
              name: 'fullName',
              getter: 'return `${this.firstName} ${this.lastName}`;'
            }
          ]
        },
        options: {}
      };

      const result = await generator.generate(context);

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing schema name', async () => {
      const context: GenerationContext = {
        projectPath: '/test/project',
        templateData: {
          // Missing schemaName
          fields: []
        },
        options: {}
      };

      const result = await generator.generate(context);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Schema name is required'));
    });

    it('should handle invalid field types', async () => {
      const context: GenerationContext = {
        projectPath: '/test/project',
        templateData: {
          schemaName: 'TestSchema',
          fields: [
            { name: 'invalidField', type: 'InvalidType', required: true }
          ]
        },
        options: {}
      };

      // Should still generate but with warnings
      const result = await generator.generate(context);
      
      // Check if warning was logged
      const logs = mockLogger.getLogs();
      const hasWarning = logs.some(log => 
        log.includes('WARNING') && log.includes('InvalidType')
      );
      expect(hasWarning).toBe(true);
    });
  });

  describe('Naming Conventions', () => {
    it('should generate proper naming conventions', async () => {
      const context: GenerationContext = {
        projectPath: '/test/project',
        templateData: {
          schemaName: 'UserProfile',
          fields: [
            { name: 'name', type: 'String', required: true }
          ]
        },
        options: {}
      };

      await generator.generate(context);

      // Verify that naming conventions were applied correctly
      const namingConventions = mockStringUtils.generateNamingConventions('UserProfile');
      expect(namingConventions.camelCase).toBe('userProfile');
      expect(namingConventions.pascalCase).toBe('UserProfile');
      expect(namingConventions.kebabCase).toBe('user-profile');
    });
  });
});

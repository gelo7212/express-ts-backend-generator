import path from 'path';
import { 
  GeneratorConfig, 
  TemplateDefinition,
  TemplateCondition,
  GenerationContext,
  IFileSystem,
  ILogger 
} from '../types';
import { ITemplateRegistry } from './index';

/**
 * Registry for managing templates and generator configurations
 */
export class TemplateRegistry implements ITemplateRegistry {
  private configs = new Map<string, GeneratorConfig>();
  private templatePath: string;

  constructor(
    private fileSystem: IFileSystem,
    private logger: ILogger,
    templatePath: string
  ) {
    this.templatePath = templatePath;
  }

  register(config: GeneratorConfig): void {
    this.logger.debug(`Registering generator config: ${config.name}`);
    this.configs.set(config.type, config);
  }

  getTemplates(generatorType: string): TemplateDefinition[] {
    const config = this.configs.get(generatorType);
    if (!config) {
      this.logger.warning(`No templates found for generator type: ${generatorType}`);
      return [];
    }
    return config.templates;
  }

  getConfig(generatorType: string): GeneratorConfig | undefined {
    return this.configs.get(generatorType);
  }

  getAllGeneratorTypes(): string[] {
    return Array.from(this.configs.keys());
  }

  validateTemplate(template: TemplateDefinition): boolean {
    const templatePath = path.join(this.templatePath, template.path);
    
    // Basic validation
    if (!template.name || !template.path || !template.outputPath) {
      this.logger.error(`Template ${template.name} is missing required fields`);
      return false;
    }

    // Check if template file exists (for file templates)
    if (template.type === 'file') {
      // Note: This would be async in real implementation
      // For now, we assume the template exists
      return true;
    }

    return true;
  }

  /**
   * Check if template conditions are met
   */
  evaluateConditions(
    conditions: TemplateCondition[] | undefined,
    context: GenerationContext
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    return conditions.every(condition => {
      const value = context.templateData[condition.field] || context.options[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'not-equals':
          return value !== condition.value;
        case 'exists':
          return value !== undefined && value !== null;
        case 'not-exists':
          return value === undefined || value === null;
        default:
          this.logger.warning(`Unknown condition operator: ${condition.operator}`);
          return false;
      }
    });
  }

  /**
   * Get templates that match the given context
   */
  getApplicableTemplates(
    generatorType: string,
    context: GenerationContext
  ): TemplateDefinition[] {
    const templates = this.getTemplates(generatorType);
    
    return templates.filter(template => 
      this.evaluateConditions(template.conditions, context)
    );
  }

  /**
   * Load generator configurations from directory
   */
  async loadFromDirectory(configPath: string): Promise<void> {
    try {
      const files = await this.fileSystem.readDirectory(configPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const configFile = path.join(configPath, file);
          const configContent = await this.fileSystem.readFile(configFile);
          const config: GeneratorConfig = JSON.parse(configContent);
          
          this.register(config);
          this.logger.debug(`Loaded generator config from: ${file}`);
        }
      }
    } catch (error: any) {
      this.logger.error(`Failed to load generator configs: ${error.message}`);
    }
  }

  /**
   * Resolve template path relative to template directory
   */
  resolveTemplatePath(templatePath: string): string {
    return path.join(this.templatePath, templatePath);
  }

  /**
   * Resolve output path with template data substitution
   */
  resolveOutputPath(
    outputPath: string, 
    context: GenerationContext
  ): string {
    let resolved = outputPath;
    
    // Replace placeholders with actual values
    resolved = this.replacePlaceholders(resolved, context.templateData);

    return path.join(context.projectPath, resolved);
  }

  /**
   * Replace placeholders in string with values from data object
   * Supports nested object properties like {domainNames.lowercase}
   */
  private replacePlaceholders(template: string, data: any): string {
    return template.replace(/\{([^}]+)\}/g, (match, path) => {
      const value = this.getNestedValue(data, path);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}

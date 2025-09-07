import { BaseGenerator } from './base-generator';
import { GenerationContext, IFileSystem, ILogger, ITemplateEngine } from '../types';
import { ITemplateRegistry } from '../templates';

/**
 * Generator for creating domain structures
 */
export class DomainGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'domain');
  }

  canHandle(type: string): boolean {
    return type === 'domain';
  }

  getDescription(): string {
    return 'Generate a complete domain structure with entities, repositories, and services';
  }

  async generate(context: GenerationContext) {
    if (!context.domainName) {
      throw new Error('Domain name is required for domain generation');
    }

    // Check if domain already exists
    const domainPath = this.fileSystem.joinPath(
      context.projectPath,
      'src',
      'domain',
      context.templateData.domainNames?.lowercase || context.domainName.toLowerCase()
    );

    const domainExists = await this.fileSystem.exists(domainPath);
    if (domainExists && !context.options.force) {
      this.logger.warning(`Domain ${context.domainName} already exists. Use --force to overwrite.`);
      return {
        success: false,
        generatedFiles: [],
        errors: [`Domain ${context.domainName} already exists`]
      };
    }

    // Generate all domain files first
    const result = await super.generate(context);
    
    // If generation was successful, update the TYPES file
    if (result.success) {
      await this.updateTypesFile(context);
      result.generatedFiles.push('src/infrastructure/types.ts (updated)');
    }
    
    return result;
  }

  /**
   * Update the infrastructure/types.ts file with new domain types
   */
  private async updateTypesFile(context: GenerationContext): Promise<void> {
    const { domainNames } = context.templateData;
    const typesPath = 'src/infrastructure/types.ts';
    
    try {
      // Read current types file
      const currentContent = await this.fileSystem.readFile(typesPath);
      
      // Create new TYPES entries for the domain
      const newTypes = `,
  
  // ${domainNames.pascalCase} Domain Services
  ${domainNames.pascalCase}DomainService: Symbol.for('${domainNames.pascalCase}DomainService'),
  
  // ${domainNames.pascalCase} Application Services
  ${domainNames.pascalCase}ApplicationService: Symbol.for('${domainNames.pascalCase}ApplicationService'),
  
  // ${domainNames.pascalCase} Use Cases
  Create${domainNames.pascalCase}UseCase: Symbol.for('Create${domainNames.pascalCase}UseCase'),
  Get${domainNames.pascalCase}UseCase: Symbol.for('Get${domainNames.pascalCase}UseCase'),
  Update${domainNames.pascalCase}UseCase: Symbol.for('Update${domainNames.pascalCase}UseCase'),
  Delete${domainNames.pascalCase}UseCase: Symbol.for('Delete${domainNames.pascalCase}UseCase'),
  
  // ${domainNames.pascalCase} Repository
  ${domainNames.pascalCase}Repository: Symbol.for('${domainNames.pascalCase}Repository'),
  
  // ${domainNames.pascalCase} Controller
  ${domainNames.pascalCase}Controller: Symbol.for('${domainNames.pascalCase}Controller')`;

      // Find the insertion point (before the closing brace of TYPES)
      const insertionPoint = currentContent.lastIndexOf('};');
      if (insertionPoint === -1) {
        throw new Error('Could not find TYPES object closing brace in types.ts');
      }

      // Insert new types before the closing brace
      const updatedContent = 
        currentContent.slice(0, insertionPoint) + 
        newTypes + '\n' +
        currentContent.slice(insertionPoint);

      // Write updated content
      await this.fileSystem.writeFile(typesPath, updatedContent);
      
      this.logger.debug(`Updated ${typesPath} with ${domainNames.pascalCase} domain types`);
      
    } catch (error: any) {
      this.logger.warning(`Failed to update types.ts: ${error.message}`);
    }
  }
}

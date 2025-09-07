import { BaseCommand } from './base-command';
import { 
  CommandArgument, 
  CommandOption,
  GenerationContext,
  IDependencyContainer,
  ILogger,
  IStringUtils
} from '../types';
import { IGeneratorFactory } from '../generators/generator-factory';

/**
 * Command to generate an entity
 */
export class GenerateEntityCommand extends BaseCommand {
  name = 'generate:entity';
  description = 'Generate an entity for existing domain';
  aliases = ['g:entity', 'g:e', 'g-e'];
  
  arguments: CommandArgument[] = [
    {
      name: 'domain-name',
      description: 'Name of the existing domain',
      required: true
    },
    {
      name: 'entity-name',
      description: 'Name of the entity',
      required: true
    }
  ];

  options: CommandOption[] = [
    {
      flags: '-f, --force',
      description: 'Force overwrite if entity exists'
    }
  ];

  constructor(
    container: IDependencyContainer,
    logger: ILogger,
    stringUtils: IStringUtils,
    generatorFactory: IGeneratorFactory
  ) {
    super(container, logger, stringUtils, generatorFactory);
  }

  async execute(args: any[], options: any): Promise<void> {
    await this.requireProject();
    this.validateArgs(args);
    
    const domainName = args[0];
    const entityName = args[1];
    
    this.logger.info(`Generating entity: ${entityName} for domain: ${domainName}`);
    
    // Generate naming conventions
    const domainNames = this.generateNamingConventions(domainName);
    const entityNames = this.generateNamingConventions(entityName);
    
    // Check if domain exists
    await this.ensureDomainExists(domainNames.lowercase);
    
    // Create generation context
    const context: GenerationContext = {
      projectPath: process.cwd(),
      domainName,
      entityName,
      templateData: {
        domainName,
        domainNames,
        entityName,
        entityNames
      },
      options
    };

    // Generate entity
    const generator = this.generatorFactory.createGenerator('entity');
    const result = await generator.generate(context);
    
    this.handleResult(result);
    
    if (result.success) {
      this.logger.info(`\nEntity ${entityNames.pascalCase} created successfully for domain ${domainName}!`);
    }
  }
}

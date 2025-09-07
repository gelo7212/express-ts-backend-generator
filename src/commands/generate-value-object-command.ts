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
 * Command to generate a value object
 */
export class GenerateValueObjectCommand extends BaseCommand {
  name = 'generate:value-object';
  description = 'Generate a value object for existing domain';
  aliases = ['g:value-object', 'g:vo', 'g-vo'];
  
  arguments: CommandArgument[] = [
    {
      name: 'domain-name',
      description: 'Name of the existing domain',
      required: true
    },
    {
      name: 'vo-name',
      description: 'Name of the value object',
      required: true
    }
  ];

  options: CommandOption[] = [
    {
      flags: '-f, --force',
      description: 'Force overwrite if value object exists'
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
    const voName = args[1];
    
    this.logger.info(`Generating value object: ${voName} for domain: ${domainName}`);
    
    // Generate naming conventions
    const domainNames = this.generateNamingConventions(domainName);
    const voNames = this.generateNamingConventions(voName);
    
    // Check if domain exists
    await this.ensureDomainExists(domainNames.lowercase);
    
    // Create generation context
    const context: GenerationContext = {
      projectPath: process.cwd(),
      domainName,
      templateData: {
        domainName,
        domainNames,
        voName,
        voNames
      },
      options
    };

    // Generate value object
    const generator = this.generatorFactory.createGenerator('value-object');
    const result = await generator.generate(context);
    
    this.handleResult(result);
    
    if (result.success) {
      this.logger.info(`\nValue object ${voName} created successfully for domain ${domainName}!`);
    }
  }
}

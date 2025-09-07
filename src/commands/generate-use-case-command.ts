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
 * Command to generate a use case
 */
export class GenerateUseCaseCommand extends BaseCommand {
  name = 'generate:use-case';
  description = 'Generate a use case for existing domain';
  aliases = ['g:use-case', 'g:uc', 'g-uc'];
  
  arguments: CommandArgument[] = [
    {
      name: 'domain-name',
      description: 'Name of the existing domain',
      required: true
    },
    {
      name: 'use-case-name',
      description: 'Name of the use case (e.g., create-user, get-user)',
      required: true
    }
  ];

  options: CommandOption[] = [
    {
      flags: '-f, --force',
      description: 'Force overwrite if use case exists'
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
    const useCaseName = args[1];
    
    this.logger.info(`Generating use case: ${useCaseName} for domain: ${domainName}`);
    
    // Generate naming conventions
    const domainNames = this.generateNamingConventions(domainName);
    const useCaseNames = this.generateNamingConventions(useCaseName);
    
    // Check if domain exists
    await this.ensureDomainExists(domainNames.lowercase);
    
    // Create generation context
    const context: GenerationContext = {
      projectPath: process.cwd(),
      domainName,
      templateData: {
        domainName,
        domainNames,
        useCaseName,
        useCaseNames
      },
      options
    };

    // Generate use case
    const generator = this.generatorFactory.createGenerator('use-case');
    const result = await generator.generate(context);
    
    this.handleResult(result);
    
    if (result.success) {
      this.logger.info(`\nUse case ${useCaseName} created successfully for domain ${domainName}!`);
    }
  }
}

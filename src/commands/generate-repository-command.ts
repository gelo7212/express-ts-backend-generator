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
 * Command to generate a repository
 */
export class GenerateRepositoryCommand extends BaseCommand {
  name = 'generate:repository';
  description = 'Generate repository interface and implementation for existing domain';
  aliases = ['g:repository', 'g:r', 'g-r'];
  
  arguments: CommandArgument[] = [
    {
      name: 'domain-name',
      description: 'Name of the existing domain',
      required: true
    }
  ];

  options: CommandOption[] = [
    {
      flags: '-f, --force',
      description: 'Force overwrite if repository exists'
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
    
    this.logger.info(`Generating repository for domain: ${domainName}`);
    
    // Generate naming conventions
    const domainNames = this.generateNamingConventions(domainName);
    
    // Check if domain exists
    await this.ensureDomainExists(domainNames.lowercase);
    
    // Create generation context
    const context: GenerationContext = {
      projectPath: process.cwd(),
      domainName,
      templateData: {
        domainName,
        domainNames
      },
      options
    };

    // Generate repository
    const generator = this.generatorFactory.createGenerator('repository');
    const result = await generator.generate(context);
    
    this.handleResult(result);
    
    if (result.success) {
      this.logger.info(`\nRepository for ${domainNames.pascalCase} created successfully!`);
      this.logger.info(`Generated:`);
      this.logger.info(`  • Repository interface in src/domain/${domainNames.lowercase}/repositories/`);
      this.logger.info(`  • Repository implementation in src/infrastructure/repositories/`);
    }
  }
}

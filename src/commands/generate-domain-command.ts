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
 * Command to generate a domain
 */
export class GenerateDomainCommand extends BaseCommand {
  name = 'generate:domain';
  description = 'Generate a complete domain structure with entities, repositories, and services';
  aliases = ['g:domain', 'g:d', 'g-d'];
  
  arguments: CommandArgument[] = [
    {
      name: 'domain-name',
      description: 'Name of the domain to create',
      required: true
    }
  ];

  options: CommandOption[] = [
    {
      flags: '-f, --force',
      description: 'Force overwrite if domain exists'
    },
    {
      flags: '--skip-tests',
      description: 'Skip generating test files'
    },
    {
      flags: '--skip-entity',
      description: 'Skip generating default entity'
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
    
    this.logger.info(`Generating domain: ${domainName}`);
    
    // Generate naming conventions
    const domainNames = this.generateNamingConventions(domainName);
    
    // Create generation context
    const context: GenerationContext = {
      projectPath: process.cwd(),
      domainName,
      templateData: {
        domainName,
        domainNames,
        skipTests: options.skipTests,
        skipEntity: options.skipEntity
      },
      options
    };

    // Generate domain
    const generator = this.generatorFactory.createGenerator('domain');
    const result = await generator.generate(context);
    
    this.handleResult(result);
    
    if (result.success) {
      this.logger.info(`\nDomain ${domainName} created successfully!`);
      this.logger.info(`\nGenerated structure:`);
      this.logger.info(`  src/domain/${domainNames.lowercase}/`);
      this.logger.info(`  src/application/use-cases/${domainNames.lowercase}/`);
      this.logger.info(`  src/infrastructure/repositories/`);
      this.logger.info(`  src/presentation/http/controllers/`);
    }
  }
}

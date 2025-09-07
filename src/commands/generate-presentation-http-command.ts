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
 * Command to generate presentation HTTP layer
 */
export class GeneratePresentationHttpCommand extends BaseCommand {
  name = 'generate:presentation-http';
  description = 'Generate presentation HTTP layer (controllers, DTOs, routes) for existing domain';
  aliases = ['g:presentation-http', 'g:p-http', 'g-p-http'];
  
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
      description: 'Force overwrite if files exist'
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
    
    this.logger.info(`Generating presentation HTTP layer for domain: ${domainName}`);
    
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

    // Generate presentation HTTP layer
    const generator = this.generatorFactory.createGenerator('presentation-http');
    const result = await generator.generate(context);
    
    this.handleResult(result);
    
    if (result.success) {
      this.logger.info(`\nPresentation HTTP layer for ${domainNames.pascalCase} created successfully!`);
      this.logger.info(`Generated:`);
      this.logger.info(`  • Controller in src/presentation/http/controllers/`);
      this.logger.info(`  • HTTP DTO in src/presentation/http/dto/`);
      this.logger.info(`  • Routes in src/presentation/http/routes/`);
    }
  }
}

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
 * Command to generate a controller
 */
export class GenerateControllerCommand extends BaseCommand {
  name = 'generate:controller';
  description = 'Generate a controller for existing domain';
  aliases = ['g:controller', 'g:c', 'g-c'];
  
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
      description: 'Force overwrite if controller exists'
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
    
    this.logger.info(`Generating controller for domain: ${domainName}`);
    
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

    // Generate controller
    const generator = this.generatorFactory.createGenerator('controller');
    const result = await generator.generate(context);
    
    this.handleResult(result);
    
    if (result.success) {
      this.logger.info(`\nController ${domainNames.pascalCase}Controller created successfully!`);
    }
  }
}

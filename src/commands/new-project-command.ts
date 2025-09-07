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
 * Command to generate a new project
 */
export class NewProjectCommand extends BaseCommand {
  name = 'new';
  description = 'Generate a new Express TypeScript project with DDD architecture';
  aliases = ['create'];
  
  arguments: CommandArgument[] = [
    {
      name: 'project-name',
      description: 'Name of the project to create',
      required: true
    }
  ];

  options: CommandOption[] = [
    {
      flags: '-f, --force',
      description: 'Force overwrite if directory exists'
    },
    {
      flags: '-t, --template <template>',
      description: 'Template to use (default: basic)',
      defaultValue: 'basic'
    },
    {
      flags: '--skip-git',
      description: 'Skip git initialization'
    },
    {
      flags: '--skip-install',
      description: 'Skip npm install'
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
    this.validateArgs(args);
    
    const projectName = args[0];
    const projectPath = this.container.resolve<any>('IFileSystem').getAbsolutePath(projectName);
    
    this.logger.info(`Creating new project: ${projectName}`);
    
    // Generate naming conventions
    const namingConventions = this.generateNamingConventions(projectName);
    
    // Create generation context
    const context: GenerationContext = {
      projectPath,
      templateData: {
        projectName,
        ...namingConventions,
        template: options.template,
        skipGit: options.skipGit,
        skipInstall: options.skipInstall
      },
      options
    };

    // Generate project
    const generator = this.generatorFactory.createGenerator('project');
    const result = await generator.generate(context);
    
    this.handleResult(result);
    
    if (result.success) {
      this.logger.info(`\nProject ${projectName} created successfully!`);
      this.logger.info(`\nNext steps:`);
      this.logger.info(`  cd ${projectName}`);
      if (!options.skipInstall) {
        this.logger.info(`  npm install`);
      }
      this.logger.info(`  npm run dev`);
    }
  }
}

import { 
  ICommand, 
  CommandArgument, 
  CommandOption,
  GenerationContext,
  GenerationResult,
  ILogger,
  IStringUtils,
  IDependencyContainer
} from '../types';
import { IGeneratorFactory } from '../generators/generator-factory';

/**
 * Base class for all commands
 */
export abstract class BaseCommand implements ICommand {
  abstract name: string;
  abstract description: string;
  abstract arguments: CommandArgument[];
  abstract options: CommandOption[];
  aliases?: string[];

  constructor(
    protected container: IDependencyContainer,
    protected logger: ILogger,
    protected stringUtils: IStringUtils,
    protected generatorFactory: IGeneratorFactory
  ) {}

  abstract execute(args: any[], options: any): Promise<void>;

  /**
   * Create generation context from command arguments and options
   */
  protected createContext(
    args: any[], 
    options: any,
    additionalData: Record<string, any> = {}
  ): GenerationContext {
    const projectPath = process.cwd();
    
    return {
      projectPath,
      templateData: {
        ...additionalData
      },
      options
    };
  }

  /**
   * Validate required arguments
   */
  protected validateArgs(args: any[]): void {
    const requiredArgs = this.arguments.filter(arg => arg.required);
    
    if (args.length < requiredArgs.length) {
      const missingArgs = requiredArgs.slice(args.length).map(arg => arg.name);
      throw new Error(`Missing required arguments: ${missingArgs.join(', ')}`);
    }
  }

  /**
   * Generate naming conventions for a given name
   */
  protected generateNamingConventions(name: string) {
    return this.stringUtils.generateNamingConventions(name);
  }

  /**
   * Handle generation result
   */
  protected handleResult(result: GenerationResult): void {
    if (result.success) {
      this.logger.success(`Generated ${result.generatedFiles.length} files successfully`);
      
      if (result.generatedFiles.length > 0) {
        this.logger.info('Generated files:');
        result.generatedFiles.forEach(file => {
          this.logger.info(`  • ${file}`);
        });
      }
    } else {
      this.logger.error('Generation failed');
      result.errors.forEach(error => {
        this.logger.error(`  • ${error}`);
      });
    }
  }

  /**
   * Check if project is initialized (has package.json and src folder)
   */
  protected async isProjectInitialized(): Promise<boolean> {
    const fileSystem = this.container.resolve<any>('IFileSystem');
    const packageJsonExists = await fileSystem.exists('package.json');
    const srcExists = await fileSystem.exists('src');
    
    return packageJsonExists && srcExists;
  }

  /**
   * Ensure command is run in a valid project directory
   */
  protected async requireProject(): Promise<void> {
    const isInitialized = await this.isProjectInitialized();
    if (!isInitialized) {
      throw new Error('This command must be run in an initialized project directory. Run "new <project-name>" first.');
    }
  }

  /**
   * Ensure domain exists in the project
   */
  protected async ensureDomainExists(domainName: string): Promise<void> {
    const fileSystem = this.container.resolve<any>('IFileSystem');
    const domainPath = `src/domain/${domainName}`;
    const domainExists = await fileSystem.exists(domainPath);
    
    if (!domainExists) {
      throw new Error(`Domain '${domainName}' does not exist. Please generate the domain first using 'generate:domain ${domainName}'.`);
    }
  }
}

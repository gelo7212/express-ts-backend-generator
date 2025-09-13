import path from 'path';
import { 
  DependencyContainer,
  ConsoleLogger,
  FileSystem,
  StringUtils,
  TemplateEngine
} from '.';
import { 
  IDependencyContainer,
  ILogger,
  IFileSystem,
  IStringUtils,
  ITemplateEngine,
  TOKENS
} from '../types';
import { TemplateRegistry, ITemplateRegistry } from '../templates';
import { GeneratorFactory, IGeneratorFactory } from '../generators/generator-factory';
import { CommandRegistry, ICommandRegistry } from '../commands/command-registry';

// Generators
import { ProjectGenerator } from '../generators/project-generator';
import { DomainGenerator } from '../generators/domain-generator';
import { EntityGenerator } from '../generators/entity-generator';
import { ControllerGenerator } from '../generators/controller-generator';
import { UseCaseGenerator } from '../generators/use-case-generator';
import { RepositoryGenerator } from '../generators/repository-generator';
import { ServiceGenerator } from '../generators/service-generator';
import { ValueObjectGenerator } from '../generators/value-object-generator';
import { PresentationHttpGenerator } from '../generators/presentation-http-generator';
import { MongoDbLazyGenerator } from '../generators/mongodb-lazy-generator';
import { MySqlLazyGenerator } from '../generators/mysql-lazy-generator';

// Commands
import { NewProjectCommand } from '../commands/new-project-command';
import { GenerateDomainCommand } from '../commands/generate-domain-command';
import { GenerateControllerCommand } from '../commands/generate-controller-command';
import { GenerateUseCaseCommand } from '../commands/generate-use-case-command';
import { GenerateRepositoryCommand } from '../commands/generate-repository-command';
import { GenerateServiceCommand } from '../commands/generate-service-command';
import { GenerateValueObjectCommand } from '../commands/generate-value-object-command';
import { GeneratePresentationHttpCommand } from '../commands/generate-presentation-http-command';
import { GenerateEntityCommand } from '../commands/generate-entity-command';
import { GenerateMongoDbLazyCommand } from '../commands/generate-mongodb-lazy-command';
import { GenerateMySqlLazyCommand } from '../commands/generate-mysql-lazy-command';

/**
 * Application bootstrapper - sets up dependency injection and registers services
 */
export class Application {
  private container: IDependencyContainer;
  private isInitialized = false;

  constructor() {
    this.container = new DependencyContainer();
  }

  /**
   * Initialize the application with all dependencies
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.registerCoreServices();
    await this.registerTemplateServices();
    await this.registerGeneratorServices();
    await this.registerCommandServices();
    await this.loadConfigurations();

    this.isInitialized = true;
  }

  /**
   * Get the dependency container
   */
  getContainer(): IDependencyContainer {
    return this.container;
  }

  private async registerCoreServices(): Promise<void> {
    // Core services
    this.container.registerSingleton(TOKENS.LOGGER, () => new ConsoleLogger());
    this.container.registerSingleton(TOKENS.FILE_SYSTEM, () => new FileSystem());
    this.container.registerSingleton(TOKENS.STRING_UTILS, () => new StringUtils());
    this.container.registerSingleton(TOKENS.TEMPLATE_ENGINE, () => new TemplateEngine());

    // Configuration
    const templatePath = path.join(__dirname, '..', '..', 'templates');
    this.container.register(TOKENS.TEMPLATE_PATH, templatePath);
  }

  private async registerTemplateServices(): Promise<void> {
    this.container.registerSingleton(TOKENS.TEMPLATE_REGISTRY, () => {
      const fileSystem = this.container.resolve<IFileSystem>(TOKENS.FILE_SYSTEM);
      const logger = this.container.resolve<ILogger>(TOKENS.LOGGER);
      const templatePath = this.container.resolve<string>(TOKENS.TEMPLATE_PATH);
      
      return new TemplateRegistry(fileSystem, logger, templatePath);
    });
  }

  private async registerGeneratorServices(): Promise<void> {
    this.container.registerSingleton(TOKENS.GENERATOR_FACTORY, () => {
      const factory = new GeneratorFactory(this.container);
      
      // Register generators
      this.registerGenerators(factory);
      
      return factory;
    });
  }

  private registerGenerators(factory: IGeneratorFactory): void {
    const fileSystem = this.container.resolve<IFileSystem>(TOKENS.FILE_SYSTEM);
    const logger = this.container.resolve<ILogger>(TOKENS.LOGGER);
    const templateEngine = this.container.resolve<ITemplateEngine>(TOKENS.TEMPLATE_ENGINE);
    const templateRegistry = this.container.resolve<ITemplateRegistry>(TOKENS.TEMPLATE_REGISTRY);
    const stringUtils = this.container.resolve<IStringUtils>(TOKENS.STRING_UTILS);

    // Register all generators
    factory.registerGenerator('project', 
      new ProjectGenerator(fileSystem, logger, templateEngine, templateRegistry)
    );
    
    factory.registerGenerator('domain', 
      new DomainGenerator(fileSystem, logger, templateEngine, templateRegistry)
    );
    
    factory.registerGenerator('entity', 
      new EntityGenerator(fileSystem, logger, templateEngine, templateRegistry)
    );
    
    factory.registerGenerator('controller', 
      new ControllerGenerator(fileSystem, logger, templateEngine, templateRegistry)
    );
    
    factory.registerGenerator('use-case', 
      new UseCaseGenerator(fileSystem, logger, templateEngine, templateRegistry)
    );
    
    factory.registerGenerator('repository', 
      new RepositoryGenerator(fileSystem, logger, templateEngine, templateRegistry)
    );
    
    factory.registerGenerator('service', 
      new ServiceGenerator(fileSystem, logger, templateEngine, templateRegistry)
    );
    
    factory.registerGenerator('value-object', 
      new ValueObjectGenerator(fileSystem, logger, templateEngine, templateRegistry)
    );
    
    factory.registerGenerator('presentation-http', 
      new PresentationHttpGenerator(fileSystem, logger, templateEngine, templateRegistry)
    );

    factory.registerGenerator('mongodb-lazy', 
      new MongoDbLazyGenerator(fileSystem, logger, templateEngine, templateRegistry)
    );

    factory.registerGenerator('mysql-lazy', 
      new MySqlLazyGenerator(fileSystem, logger, templateEngine, templateRegistry)
    );
  }

  private async registerCommandServices(): Promise<void> {
    this.container.registerSingleton(TOKENS.COMMAND_REGISTRY, () => {
      const registry = new CommandRegistry();
      
      // Register commands
      this.registerCommands(registry);
      
      return registry;
    });
  }

  private registerCommands(registry: ICommandRegistry): void {
    const logger = this.container.resolve<ILogger>(TOKENS.LOGGER);
    const stringUtils = this.container.resolve<IStringUtils>(TOKENS.STRING_UTILS);
    const generatorFactory = this.container.resolve<IGeneratorFactory>(TOKENS.GENERATOR_FACTORY);
    const fileSystem = this.container.resolve<IFileSystem>(TOKENS.FILE_SYSTEM);

    // Register all commands
    registry.register(
      new NewProjectCommand(this.container, logger, stringUtils, generatorFactory)
    );
    
    registry.register(
      new GenerateDomainCommand(this.container, logger, stringUtils, generatorFactory)
    );
    
    registry.register(
      new GenerateControllerCommand(this.container, logger, stringUtils, generatorFactory)
    );
    
    registry.register(
      new GenerateUseCaseCommand(this.container, logger, stringUtils, generatorFactory)
    );
    
    registry.register(
      new GenerateRepositoryCommand(this.container, logger, stringUtils, generatorFactory)
    );
    
    registry.register(
      new GenerateServiceCommand(this.container, logger, stringUtils, generatorFactory)
    );
    
    registry.register(
      new GenerateValueObjectCommand(this.container, logger, stringUtils, generatorFactory)
    );
    
    registry.register(
      new GeneratePresentationHttpCommand(this.container, logger, stringUtils, generatorFactory)
    );
    
    registry.register(
      new GenerateEntityCommand(this.container, logger, stringUtils, generatorFactory)
    );

    registry.register(
      new GenerateMongoDbLazyCommand(this.container, logger, stringUtils, generatorFactory)
    );

    registry.register(
      new GenerateMySqlLazyCommand(this.container, logger, stringUtils, generatorFactory, fileSystem)
    );
  }

  private async loadConfigurations(): Promise<void> {
    const templateRegistry = this.container.resolve<ITemplateRegistry>(TOKENS.TEMPLATE_REGISTRY);
    const configPath = path.join(__dirname, '..', '..', 'configs');
    
    try {
      await templateRegistry.loadFromDirectory(configPath);
    } catch (error) {
      // Config directory might not exist yet, which is okay
      const logger = this.container.resolve<ILogger>(TOKENS.LOGGER);
      logger.debug('No configuration directory found, using default configurations');
    }
  }

  /**
   * Get a service from the container
   */
  resolve<T>(token: string): T {
    return this.container.resolve<T>(token);
  }

  /**
   * Check if the application is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

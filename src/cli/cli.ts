import { Command } from 'commander';
import { Application } from '../core/application';
import { ICommandRegistry, ILogger, TOKENS } from '../types';

/**
 * CLI application using Commander.js
 */
export class CLI {
  private program: Command;
  private app: Application;

  constructor() {
    this.program = new Command();
    this.app = new Application();
  }

  /**
   * Initialize and start the CLI
   */
  async run(argv: string[] = process.argv): Promise<void> {
    try {
      await this.app.initialize();
      this.setupProgram();
      this.registerCommands();
      await this.program.parseAsync(argv);
    } catch (error: any) {
      const logger = this.app.resolve<ILogger>(TOKENS.LOGGER);
      logger.error(`CLI Error: ${error.message}`);
      process.exit(1);
    }
  }

  private setupProgram(): void {
    this.program
      .name('express-ts-gen')
      .description('Clean, maintainable CLI tool to scaffold Express TypeScript projects with DDD architecture')
      .version('2.0.0')
      .option('-v, --verbose', 'Enable verbose output')
      .option('--debug', 'Enable debug output')
      .hook('preAction', (thisCommand) => {
        // Set environment variables based on options
        if (thisCommand.opts().debug) {
          process.env.DEBUG = 'true';
        }
      });
  }

  private registerCommands(): void {
    const commandRegistry = this.app.resolve<ICommandRegistry>(TOKENS.COMMAND_REGISTRY);
    const commands = commandRegistry.getAllCommands();
    
    commands.forEach(command => {
      // Register the main command (with colon syntax)
      const cmd = this.program
        .command(command.name)
        .description(command.description);

      // Add aliases (including both colon and dash syntax)
      if (command.aliases && command.aliases.length > 0) {
        command.aliases.forEach(alias => {
          cmd.alias(alias);
        });
      }

      // Add arguments
      command.arguments.forEach(arg => {
        if (arg.required) {
          if (arg.variadic) {
            cmd.argument(`<${arg.name}...>`, arg.description);
          } else {
            cmd.argument(`<${arg.name}>`, arg.description);
          }
        } else {
          if (arg.variadic) {
            cmd.argument(`[${arg.name}...]`, arg.description);
          } else {
            cmd.argument(`[${arg.name}]`, arg.description);
          }
        }
      });

      // Add options
      command.options.forEach(option => {
        cmd.option(option.flags, option.description, option.defaultValue);
      });

      // Set action
      cmd.action(async (...args) => {
        const options = args.pop(); // Commander puts options as last argument
        const actionArgs = args;
        
        try {
          await command.execute(actionArgs, options);
        } catch (error: any) {
          const logger = this.app.resolve<ILogger>(TOKENS.LOGGER);
          logger.error(error.message);
          process.exit(1);
        }
      });
    });

    // Add help command improvements
    this.program.addHelpCommand('help [command]', 'Display help for command');
    
    // Custom help
    this.program.on('--help', () => {
      const logger = this.app.resolve<ILogger>(TOKENS.LOGGER);
      logger.info('\nExamples:');
      logger.info('  $ express-ts-gen new my-project');
      logger.info('  $ express-ts-gen generate:domain user');
      logger.info('  $ express-ts-gen g:d user');
      logger.info('  $ express-ts-gen generate:entity user profile');
      logger.info('  $ express-ts-gen g:e user profile');
      logger.info('');
      logger.info('For more information, visit: https://github.com/gelo7212/express-ts-backend-generator');
    });
  }

  /**
   * Get the underlying commander program
   */
  getProgram(): Command {
    return this.program;
  }

  /**
   * Get the application instance
   */
  getApplication(): Application {
    return this.app;
  }
}

import { ICommand, CommandArgument, CommandOption } from '../types';

export interface ICommandRegistry {
  register(command: ICommand): void;
  getCommand(name: string): ICommand | undefined;
  getAllCommands(): ICommand[];
  hasCommand(name: string): boolean;
}

/**
 * Registry for managing CLI commands
 */
export class CommandRegistry implements ICommandRegistry {
  private commands = new Map<string, ICommand>();
  private aliases = new Map<string, string>();

  register(command: ICommand): void {
    this.commands.set(command.name, command);
    
    // Register aliases
    if (command.aliases) {
      command.aliases.forEach(alias => {
        this.aliases.set(alias, command.name);
      });
    }
  }

  getCommand(nameOrAlias: string): ICommand | undefined {
    // Check direct command name first
    let command = this.commands.get(nameOrAlias);
    
    // If not found, check aliases
    if (!command) {
      const commandName = this.aliases.get(nameOrAlias);
      if (commandName) {
        command = this.commands.get(commandName);
      }
    }
    
    return command;
  }

  getAllCommands(): ICommand[] {
    return Array.from(this.commands.values());
  }

  hasCommand(nameOrAlias: string): boolean {
    return this.commands.has(nameOrAlias) || this.aliases.has(nameOrAlias);
  }

  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  getAliases(): Map<string, string> {
    return new Map(this.aliases);
  }
}

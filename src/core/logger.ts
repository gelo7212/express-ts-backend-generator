import chalk from 'chalk';
import { ILogger } from '../types';

/**
 * Console logger implementation with colors and formatting
 */
export class ConsoleLogger implements ILogger {
  private prefix = '[EXPRESS-TS-GEN]';

  info(message: string): void {
    console.log(chalk.blue(`${this.prefix} ${message}`));
  }

  success(message: string): void {
    console.log(chalk.green(`${this.prefix} ✅ ${message}`));
  }

  warning(message: string): void {
    console.log(chalk.yellow(`${this.prefix} ⚠️  ${message}`));
  }

  error(message: string): void {
    console.log(chalk.red(`${this.prefix} ❌ ${message}`));
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray(`${this.prefix} 🐛 ${message}`));
    }
  }

  // Additional helper methods
  startSpinner(message: string): void {
    console.log(chalk.cyan(`${this.prefix} 🔄 ${message}...`));
  }

  listItem(message: string): void {
    console.log(chalk.white(`  • ${message}`));
  }

  section(title: string): void {
    console.log();
    console.log(chalk.bold.underline(title));
    console.log();
  }
}

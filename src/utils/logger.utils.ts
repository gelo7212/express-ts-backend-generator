import chalk from 'chalk';

/**
 * Logger utility functions for consistent output formatting
 */

export function success(message: string): void {
  console.log(chalk.green('✓ ' + message));
}

export function error(message: string): void {
  console.log(chalk.red('✗ ' + message));
}

export function warning(message: string): void {
  console.log(chalk.yellow('⚠ ' + message));
}

export function info(message: string): void {
  console.log(chalk.blue('ℹ ' + message));
}

export function listItem(message: string): void {
  console.log(chalk.gray('  • ' + message));
}

export function header(message: string): void {
  console.log(chalk.bold.cyan('\n' + message));
}

export function subheader(message: string): void {
  console.log(chalk.bold(message));
}

export function divider(): void {
  console.log(chalk.gray('─'.repeat(50)));
}

export function newLine(): void {
  console.log('');
}

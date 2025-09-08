// Core interfaces for the generator engine

export interface ILogger {
  info(message: string): void;
  success(message: string): void;
  warning(message: string): void;
  error(message: string): void;
  debug(message: string): void;
}

export interface IFileSystem {
  exists(path: string): Promise<boolean>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  createDirectory(path: string): Promise<void>;
  copyFile(source: string, destination: string): Promise<void>;
  readDirectory(path: string): Promise<string[]>;
  joinPath(...parts: string[]): string;
  getAbsolutePath(relativePath: string): string;
  getExtension(filePath: string): string;
  getBasename(filePath: string, ext?: string): string;
  getDirname(filePath: string): string;
}

export interface ITemplateEngine {
  render(template: string, data: Record<string, any>): Promise<string>;
  renderFile(templatePath: string, data: Record<string, any>): Promise<string>;
}

export interface IStringUtils {
  toCamelCase(str: string): string;
  toPascalCase(str: string): string;
  toKebabCase(str: string): string;
  toSnakeCase(str: string): string;
  toLowercase(str: string): string;
  pluralize(str: string): string;
  singularize(str: string): string;
  generateNamingConventions(str: string): NamingConventions;
}

export interface GenerationContext {
  projectPath: string;
  domainName?: string;
  entityName?: string;
  templateData: Record<string, any>;
  options: Record<string, any>;
}

export interface GenerationResult {
  success: boolean;
  generatedFiles: string[];
  errors: string[];
}

export interface IGenerator {
  generate(context: GenerationContext): Promise<GenerationResult>;
  canHandle(type: string): boolean;
  getDescription(): string;
}

export interface ICommand {
  name: string;
  description: string;
  aliases?: string[];
  arguments: CommandArgument[];
  options: CommandOption[];
  execute(args: any[], options: any): Promise<void>;
}

export interface CommandArgument {
  name: string;
  description: string;
  required: boolean;
  variadic?: boolean;
}

export interface CommandOption {
  flags: string;
  description: string;
  defaultValue?: any;
}

export interface TemplateDefinition {
  name: string;
  path: string;
  type: 'file' | 'directory';
  outputPath: string;
  conditions?: TemplateCondition[];
}

export interface TemplateCondition {
  field: string;
  operator: 'equals' | 'not-equals' | 'exists' | 'not-exists';
  value?: any;
}

export interface GeneratorConfig {
  name: string;
  type: string;
  templates: TemplateDefinition[];
  dependencies?: string[];
  hooks?: GeneratorHooks;
}

export interface GeneratorHooks {
  beforeGeneration?: (context: GenerationContext) => Promise<void>;
  afterGeneration?: (context: GenerationContext, result: GenerationResult) => Promise<void>;
  onError?: (context: GenerationContext, error: Error) => Promise<void>;
}

export interface ICommandRegistry {
  register(command: ICommand): void;
  getCommand(name: string): ICommand | undefined;
  getAllCommands(): ICommand[];
  hasCommand(name: string): boolean;
}

export interface IDependencyContainer {
  register<T>(token: string, implementation: T): void;
  registerSingleton<T>(token: string, factory: () => T): void;
  resolve<T>(token: string): T;
  isRegistered(token: string): boolean;
}

// Common types
export type GeneratorType = 
  | 'project'
  | 'domain'
  | 'entity'
  | 'value-object'
  | 'use-case'
  | 'repository'
  | 'service'
  | 'controller'
  | 'dto'
  | 'presentation-http'
  | 'mongodb-lazy';

export interface NamingConventions {
  camelCase: string;
  pascalCase: string;
  kebabCase: string;
  snakeCase: string;
  lowercase: string;
  uppercase: string;
  pluralCamelCase: string;
  pluralPascalCase: string;
  pluralKebabCase: string;
  singularCamelCase: string;
  singularPascalCase: string;
}

// Service tokens for dependency injection
export const TOKENS = {
  // Core services
  LOGGER: 'ILogger',
  FILE_SYSTEM: 'IFileSystem', 
  TEMPLATE_ENGINE: 'ITemplateEngine',
  STRING_UTILS: 'IStringUtils',
  
  // Generators
  GENERATOR_FACTORY: 'IGeneratorFactory',
  TEMPLATE_REGISTRY: 'ITemplateRegistry',
  COMMAND_REGISTRY: 'ICommandRegistry',
  
  // Configuration
  CONFIG: 'Config',
  TEMPLATE_PATH: 'TemplatePath',
  
  // Strategies
  NAMING_STRATEGY: 'INamingStrategy',
  VALIDATION_STRATEGY: 'IValidationStrategy'
} as const;

export type Token = typeof TOKENS[keyof typeof TOKENS];

import { 
  GeneratorConfig, 
  TemplateDefinition,
  GenerationContext 
} from '../types';

export interface ITemplateRegistry {
  register(config: GeneratorConfig): void;
  getTemplates(generatorType: string): TemplateDefinition[];
  getConfig(generatorType: string): GeneratorConfig | undefined;
  getAllGeneratorTypes(): string[];
  validateTemplate(template: TemplateDefinition): boolean;
  getApplicableTemplates(generatorType: string, context: GenerationContext): TemplateDefinition[];
  resolveTemplatePath(templatePath: string): string;
  resolveOutputPath(outputPath: string, context: GenerationContext): string;
  loadFromDirectory(configPath: string): Promise<void>;
}

export * from './template-registry';

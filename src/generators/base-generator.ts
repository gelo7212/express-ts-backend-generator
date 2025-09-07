import { 
  IGenerator,
  GenerationContext,
  GenerationResult,
  IFileSystem,
  ILogger,
  ITemplateEngine
} from '../types';
import { ITemplateRegistry } from '../templates';

/**
 * Base generator class with common functionality
 */
export abstract class BaseGenerator implements IGenerator {
  constructor(
    protected fileSystem: IFileSystem,
    protected logger: ILogger,
    protected templateEngine: ITemplateEngine,
    protected templateRegistry: ITemplateRegistry,
    protected generatorType: string
  ) {}

  abstract canHandle(type: string): boolean;
  abstract getDescription(): string;

  async generate(context: GenerationContext): Promise<GenerationResult> {
    const result: GenerationResult = {
      success: true,
      generatedFiles: [],
      errors: []
    };

    try {
      this.logger.info(`Starting generation for: ${this.generatorType}`);
      
      // Get generator config
      const config = this.templateRegistry.getConfig(this.generatorType);
      if (!config) {
        throw new Error(`No configuration found for generator type: ${this.generatorType}`);
      }

      // Execute before generation hook
      if (config.hooks?.beforeGeneration) {
        await config.hooks.beforeGeneration(context);
      }

      // Get applicable templates
      const templates = this.templateRegistry.getApplicableTemplates(this.generatorType, context);
      
      if (templates.length === 0) {
        this.logger.warning(`No applicable templates found for: ${this.generatorType}`);
        return result;
      }

      // Generate files from templates
      for (const template of templates) {
        try {
          await this.generateFromTemplate(template, context, result);
        } catch (error: any) {
          result.errors.push(`Failed to generate ${template.name}: ${error.message}`);
          result.success = false;
        }
      }

      // Execute after generation hook
      if (config.hooks?.afterGeneration) {
        await config.hooks.afterGeneration(context, result);
      }

      if (result.success) {
        this.logger.success(`Generated ${result.generatedFiles.length} files for ${this.generatorType}`);
      } else {
        this.logger.error(`Generation completed with errors for ${this.generatorType}`);
      }

    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      
      // Execute error hook
      const config = this.templateRegistry.getConfig(this.generatorType);
      if (config?.hooks?.onError) {
        await config.hooks.onError(context, error);
      }
      
      this.logger.error(`Generation failed for ${this.generatorType}: ${error.message}`);
    }

    return result;
  }

  private async generateFromTemplate(
    template: any,
    context: GenerationContext,
    result: GenerationResult
  ): Promise<void> {
    const templatePath = this.templateRegistry.resolveTemplatePath(template.path);
    const outputPath = this.templateRegistry.resolveOutputPath(template.outputPath, context);

    if (template.type === 'file') {
      await this.generateFile(templatePath, outputPath, context, result);
    } else if (template.type === 'directory') {
      await this.generateDirectory(templatePath, outputPath, context, result);
    }
  }

  private async generateFile(
    templatePath: string,
    outputPath: string,
    context: GenerationContext,
    result: GenerationResult
  ): Promise<void> {
    // Check if file already exists
    if (await this.fileSystem.exists(outputPath)) {
      const shouldOverwrite = context.options.force || false;
      if (!shouldOverwrite) {
        this.logger.warning(`File already exists, skipping: ${outputPath}`);
        return;
      }
    }

    // Render template
    const renderedContent = await this.templateEngine.renderFile(templatePath, context.templateData);
    
    // Write file
    await this.fileSystem.writeFile(outputPath, renderedContent);
    
    result.generatedFiles.push(outputPath);
    this.logger.debug(`Generated file: ${outputPath}`);
  }

  private async generateDirectory(
    templatePath: string,
    outputPath: string,
    context: GenerationContext,
    result: GenerationResult
  ): Promise<void> {
    // Create directory structure
    await this.fileSystem.createDirectory(outputPath);
    
    // Process all files in template directory
    const files = await this.fileSystem.readDirectory(templatePath);
    
    for (const file of files) {
      const sourceFile = this.fileSystem.joinPath(templatePath, file);
      const targetFile = this.fileSystem.joinPath(outputPath, file);
      
      // Check if it's a directory by trying to read it as a directory
      try {
        await this.fileSystem.readDirectory(sourceFile);
        // It's a directory, recurse
        await this.generateDirectory(sourceFile, targetFile, context, result);
      } catch {
        // It's a file, generate it
        await this.generateFile(sourceFile, targetFile, context, result);
      }
    }
  }

  /**
   * Validate context before generation
   */
  protected validateContext(context: GenerationContext): void {
    if (!context.projectPath) {
      throw new Error('Project path is required');
    }

    if (!context.templateData) {
      throw new Error('Template data is required');
    }
  }

  /**
   * Create default template data for the generator
   */
  protected createDefaultTemplateData(context: GenerationContext): Record<string, any> {
    return {
      ...context.templateData,
      timestamp: new Date().toISOString(),
      generator: this.generatorType
    };
  }
}

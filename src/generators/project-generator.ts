import { BaseGenerator } from './base-generator';
import { GenerationContext, IFileSystem, ILogger, ITemplateEngine } from '../types';
import { ITemplateRegistry } from '../templates';

/**
 * Generator for creating new projects
 */
export class ProjectGenerator extends BaseGenerator {
  constructor(
    fileSystem: IFileSystem,
    logger: ILogger,
    templateEngine: ITemplateEngine,
    templateRegistry: ITemplateRegistry
  ) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'project');
  }

  canHandle(type: string): boolean {
    return type === 'project';
  }

  getDescription(): string {
    return 'Generate a new Express TypeScript project with DDD architecture';
  }

  async generate(context: GenerationContext) {
    // Validate project doesn't already exist
    const projectExists = await this.fileSystem.exists(context.projectPath);
    if (projectExists && !context.options.force) {
      throw new Error(`Project directory already exists: ${context.projectPath}`);
    }

    // Enhance context with project-specific data
    context.templateData = {
      ...this.createDefaultTemplateData(context),
      projectName: this.fileSystem.getBasename(context.projectPath),
      ...context.templateData
    };

    return super.generate(context);
  }
}

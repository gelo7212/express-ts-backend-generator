import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { writeFileWithDir } from '../utils/file.utils.js';
import { success, error, listItem } from '../utils/logger.utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TemplateConfig {
  template: string;
  output: string;
  data: Record<string, any>;
}

/**
 * Template generation engine
 */
export class TemplateGenerator {
  private templatesPath: string;

  constructor() {
    this.templatesPath = path.join(__dirname, '..', 'templates');
  }

  async generateFromTemplate(templatePath: string, outputPath: string, data: Record<string, any>): Promise<boolean> {
    try {
      const fullTemplatePath = path.join(this.templatesPath, templatePath);
      const template = await fs.readFile(fullTemplatePath, 'utf8');
      const rendered = ejs.render(template, data);
      
      await writeFileWithDir(outputPath, rendered);
      listItem(`Generated: ${outputPath}`);
      
      return true;
    } catch (err: any) {
      error(`Failed to generate ${outputPath}: ${err.message}`);
      return false;
    }
  }

  async generateMultipleFromTemplate(templates: TemplateConfig[]): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (const template of templates) {
      const result = await this.generateFromTemplate(
        template.template,
        template.output,
        template.data
      );
      results.push(result);
    }
    
    return results;
  }

  async copyStaticFile(sourcePath: string, outputPath: string): Promise<boolean> {
    try {
      const fullSourcePath = path.join(this.templatesPath, '..', 'static', sourcePath);
      await writeFileWithDir(outputPath, await fs.readFile(fullSourcePath, 'utf8'));
      listItem(`Copied: ${outputPath}`);
      return true;
    } catch (err: any) {
      error(`Failed to copy ${outputPath}: ${err.message}`);
      return false;
    }
  }
}

export const templateGenerator = new TemplateGenerator();

// Helper functions for backwards compatibility
export async function generateFromTemplate(templatePath: string, outputPath: string, data: Record<string, any>): Promise<boolean> {
  return templateGenerator.generateFromTemplate(templatePath, outputPath, data);
}

export async function generateFromTemplateString(templateString: string, outputPath: string, data: Record<string, any>): Promise<void> {
  const rendered = ejs.render(templateString, data);
  await writeFileWithDir(outputPath, rendered);
  listItem(`Generated: ${outputPath}`);
}

import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { writeFileWithDir } from '../utils/file.utils.js';
import { success, error, listItem } from '../utils/logger.utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Template generation engine
 */
export class TemplateGenerator {
  constructor() {
    this.templatesPath = path.join(__dirname, '..', 'templates');
  }

  async generateFromTemplate(templatePath, outputPath, data) {
    try {
      const fullTemplatePath = path.join(this.templatesPath, templatePath);
      const template = await fs.readFile(fullTemplatePath, 'utf8');
      const rendered = ejs.render(template, data);
      
      await writeFileWithDir(outputPath, rendered);
      listItem(`Generated: ${outputPath}`);
      
      return true;
    } catch (err) {
      error(`Failed to generate ${outputPath}: ${err.message}`);
      return false;
    }
  }

  async generateMultipleFromTemplate(templates) {
    const results = [];
    
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

  async copyStaticFile(sourcePath, outputPath) {
    try {
      const fullSourcePath = path.join(this.templatesPath, '..', 'static', sourcePath);
      await writeFileWithDir(outputPath, await fs.readFile(fullSourcePath, 'utf8'));
      listItem(`Copied: ${outputPath}`);
      return true;
    } catch (err) {
      error(`Failed to copy ${outputPath}: ${err.message}`);
      return false;
    }
  }
}

export const templateGenerator = new TemplateGenerator();

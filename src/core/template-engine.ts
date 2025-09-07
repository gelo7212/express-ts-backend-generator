import ejs from 'ejs';
import { ITemplateEngine } from '../types';

/**
 * EJS template engine implementation
 */
export class TemplateEngine implements ITemplateEngine {
  async render(template: string, data: Record<string, any>): Promise<string> {
    try {
      return ejs.render(template, data);
    } catch (error) {
      throw new Error(`Template rendering failed: ${error}`);
    }
  }

  async renderFile(templatePath: string, data: Record<string, any>): Promise<string> {
    try {
      return new Promise<string>((resolve, reject) => {
        ejs.renderFile(templatePath, data, (err, result) => {
          if (err) {
            reject(new Error(`Template file rendering failed: ${err.message}`));
          } else {
            resolve(result);
          }
        });
      });
    } catch (error) {
      throw new Error(`Template file rendering failed: ${error}`);
    }
  }

  /**
   * Check if a template contains conditional blocks
   */
  hasConditionals(template: string): boolean {
    return template.includes('<%') && (
      template.includes('<% if') || 
      template.includes('<%if') ||
      template.includes('<% unless') ||
      template.includes('<%unless')
    );
  }

  /**
   * Extract variables used in a template
   */
  extractVariables(template: string): string[] {
    const variables = new Set<string>();
    const variableRegex = /<%[^%]*?(\w+)[^%]*?%>/g;
    let match;

    while ((match = variableRegex.exec(template)) !== null) {
      if (match[1] && !['if', 'unless', 'else', 'endif', 'for', 'endfor'].includes(match[1])) {
        variables.add(match[1]);
      }
    }

    return Array.from(variables);
  }
}

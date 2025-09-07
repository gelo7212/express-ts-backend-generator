import pluralize from 'pluralize';
import { IStringUtils, NamingConventions } from '../types';

/**
 * String utilities for naming conventions
 */
export class StringUtils implements IStringUtils {
  toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '')
      .replace(/[-_]/g, '');
  }

  toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
        return word.toUpperCase();
      })
      .replace(/\s+/g, '')
      .replace(/[-_]/g, '');
  }

  toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  toLowercase(str: string): string {
    return str.toLowerCase();
  }

  pluralize(str: string): string {
    return pluralize(str);
  }

  singularize(str: string): string {
    return pluralize.singular(str);
  }

  /**
   * Generate all naming conventions for a given string
   */
  generateNamingConventions(str: string): NamingConventions {
    const camelCase = this.toCamelCase(str);
    const pascalCase = this.toPascalCase(str);
    const kebabCase = this.toKebabCase(str);
    const snakeCase = this.toSnakeCase(str);
    const lowercase = this.toLowercase(str);
    const uppercase = str.toUpperCase();

    return {
      camelCase,
      pascalCase,
      kebabCase,
      snakeCase,
      lowercase,
      uppercase,
      pluralCamelCase: this.toCamelCase(this.pluralize(str)),
      pluralPascalCase: this.toPascalCase(this.pluralize(str)),
      pluralKebabCase: this.toKebabCase(this.pluralize(str)),
      singularCamelCase: this.toCamelCase(this.singularize(str)),
      singularPascalCase: this.toPascalCase(this.singularize(str))
    };
  }

  /**
   * Sanitize a string for use as a filename
   */
  sanitizeFileName(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9-_\.]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Capitalize first letter of each word
   */
  capitalize(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Convert string to title case
   */
  toTitleCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

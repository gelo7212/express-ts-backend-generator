/**
 * String utility functions for code generation
 */

export function toCamelCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (_, char) => char.toLowerCase());
}

export function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

export function toConstantCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

export function toDotCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1.$2')
    .replace(/[\s_-]+/g, '.')
    .toLowerCase();
}

export function lowercase(str: string): string {
  return str.toLowerCase();
}

export function uppercase(str: string): string {
  return str.toUpperCase();
}

export interface NameVariations {
  original: string;
  camelCase: string;
  pascalCase: string;
  kebabCase: string;
  snakeCase: string;
  constantCase: string;
  dotCase: string;
  lowercase: string;
  uppercase: string;
}

export function createNameVariations(input: string): NameVariations {
  return {
    original: input,
    camelCase: toCamelCase(input),
    pascalCase: toPascalCase(input),
    kebabCase: toKebabCase(input),
    snakeCase: toSnakeCase(input),
    constantCase: toConstantCase(input),
    dotCase: toDotCase(input),
    lowercase: input.toLowerCase(),
    uppercase: input.toUpperCase()
  };
}

export function pluralize(word: string): string {
  // Simple pluralization rules
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es';
  }
  return word + 's';
}

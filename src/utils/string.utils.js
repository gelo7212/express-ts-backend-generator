/**
 * String utility functions for code generation
 */

export function toCamelCase(str) {
  return str
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (_, char) => char.toLowerCase());
}

export function toPascalCase(str) {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

export function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

export function toConstantCase(str) {
  return toSnakeCase(str).toUpperCase();
}

export function toDotCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1.$2')
    .replace(/[\s_-]+/g, '.')
    .toLowerCase();
}

export function lowercase(str) {
  return str.toLowerCase();
}

export function uppercase(str) {
  return str.toUpperCase();
}

export function createNameVariations(input) {
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

export function pluralize(word) {
  // Simple pluralization rules
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es';
  }
  return word + 's';
}

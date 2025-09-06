import { 
  toCamelCase, 
  toPascalCase, 
  toKebabCase, 
  lowercase,
  pluralize
} from '../utils/string.utils.js';
import { generateFromTemplate } from '../generators/template.generator.js';
import { directoryExists } from '../utils/file.utils.js';

export async function generateController(domainName: string) {
  const names = {
    camelCase: toCamelCase(domainName),
    pascalCase: toPascalCase(domainName),
    kebabCase: toKebabCase(domainName),
    lowercase: lowercase(domainName),
    pluralCamelCase: toCamelCase(pluralize(domainName)),
    pluralPascalCase: toPascalCase(pluralize(domainName))
  };

  console.log(`🚀 Generating controller: ${names.pascalCase}Controller`);

  try {
    // Check if domain exists
    const domainPath = `src/domain/${names.lowercase}`;
    if (!(await directoryExists(domainPath))) {
      console.error(`❌ Domain ${names.pascalCase} does not exist. Please generate the domain first.`);
      return;
    }

    await generateFromTemplate(
      'presentation/controller.template.ts',
      `src/presentation/http/controllers/${names.kebabCase}.controller.ts`,
      names
    );

    console.log(`✅ Controller ${names.pascalCase}Controller generated successfully!`);
    
  } catch (error) {
    console.error('❌ Error generating controller:', error);
  }
}

import { 
  toCamelCase, 
  toPascalCase, 
  toKebabCase, 
  lowercase,
  pluralize
} from '../utils/string.utils';
import { generateFromTemplate } from '../generators/template.generator';
import { directoryExists } from '../utils/file.utils';

export async function generateRepository(domainName: string) {
  const names = {
    camelCase: toCamelCase(domainName),
    pascalCase: toPascalCase(domainName),
    kebabCase: toKebabCase(domainName),
    lowercase: lowercase(domainName),
    pluralCamelCase: toCamelCase(pluralize(domainName)),
    pluralPascalCase: toPascalCase(pluralize(domainName))
  };

  console.log(`🚀 Generating repository: ${names.pascalCase}Repository`);

  try {
    // Check if domain exists
    const domainPath = `src/domain/${names.lowercase}`;
    if (!(await directoryExists(domainPath))) {
      console.error(`❌ Domain ${names.pascalCase} does not exist. Please generate the domain first.`);
      return;
    }

    // Generate repository interface
    await generateFromTemplate(
      'domain/repository.interface.template.ts',
      `src/domain/${names.lowercase}/repositories/${names.kebabCase}.repository.interface.ts`,
      names
    );

    // Generate repository implementation
    await generateFromTemplate(
      'infrastructure/repository.template.ts',
      `src/infrastructure/repositories/${names.kebabCase}.repository.ts`,
      names
    );

    console.log(`✅ Repository ${names.pascalCase}Repository generated successfully!`);
    
  } catch (error) {
    console.error('❌ Error generating repository:', error);
  }
}

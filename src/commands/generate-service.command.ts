import { 
  toCamelCase, 
  toPascalCase, 
  toKebabCase, 
  lowercase,
  pluralize
} from '../utils/string.utils';
import { generateFromTemplate } from '../generators/template.generator';
import { directoryExists } from '../utils/file.utils';

export async function generateService(domainName: string) {
  const names = {
    camelCase: toCamelCase(domainName),
    pascalCase: toPascalCase(domainName),
    kebabCase: toKebabCase(domainName),
    lowercase: lowercase(domainName),
    pluralCamelCase: toCamelCase(pluralize(domainName)),
    pluralPascalCase: toPascalCase(pluralize(domainName))
  };

  console.log(`🚀 Generating service: ${names.pascalCase}DomainService`);

  try {
    // Check if domain exists
    const domainPath = `src/domain/${names.lowercase}`;
    if (!(await directoryExists(domainPath))) {
      console.error(`❌ Domain ${names.pascalCase} does not exist. Please generate the domain first.`);
      return;
    }

    await generateFromTemplate(
      'domain/domain-service.template.ts',
      `src/domain/${names.lowercase}/services/${names.kebabCase}-domain.service.ts`,
      names
    );

    console.log(`✅ Service ${names.pascalCase}DomainService generated successfully!`);
    
  } catch (error) {
    console.error('❌ Error generating service:', error);
  }
}

import { 
  toCamelCase, 
  toPascalCase, 
  toKebabCase, 
  lowercase,
  pluralize
} from '../utils/string.utils';
import { generateFromTemplate } from '../generators/template.generator';
import { directoryExists } from '../utils/file.utils';

export async function generateEntity(domainName: string, entityName: string) {
  const domainNames = {
    camelCase: toCamelCase(domainName),
    pascalCase: toPascalCase(domainName),
    kebabCase: toKebabCase(domainName),
    lowercase: lowercase(domainName)
  };

  const entityNames = {
    camelCase: toCamelCase(entityName),
    pascalCase: toPascalCase(entityName),
    kebabCase: toKebabCase(entityName),
    lowercase: lowercase(entityName),
    pluralCamelCase: toCamelCase(pluralize(entityName)),
    pluralPascalCase: toPascalCase(pluralize(entityName))
  };

  console.log(`🚀 Generating entity: ${entityNames.pascalCase} for domain ${domainNames.pascalCase}`);

  try {
    // Check if domain exists
    const domainPath = `src/domain/${domainNames.lowercase}`;
    if (!(await directoryExists(domainPath))) {
      console.error(`❌ Domain ${domainNames.pascalCase} does not exist. Please generate the domain first.`);
      return;
    }

    await generateFromTemplate(
      'domain/entity.template.ts',
      `src/domain/${domainNames.lowercase}/entities/${entityNames.kebabCase}.entity.ts`,
      entityNames
    );

    console.log(`✅ Entity ${entityNames.pascalCase} generated successfully!`);
    
  } catch (error) {
    console.error('❌ Error generating entity:', error);
  }
}

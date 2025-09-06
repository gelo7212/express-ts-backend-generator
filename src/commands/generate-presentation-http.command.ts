import { 
  toCamelCase, 
  toPascalCase, 
  toKebabCase, 
  lowercase,
  pluralize
} from '../utils/string.utils';
import { generateFromTemplate } from '../generators/template.generator';
import { directoryExists } from '../utils/file.utils';

export async function generatePresentationHttp(domainName: string) {
  const names = {
    camelCase: toCamelCase(domainName),
    pascalCase: toPascalCase(domainName),
    kebabCase: toKebabCase(domainName),
    lowercase: lowercase(domainName),
    pluralCamelCase: toCamelCase(pluralize(domainName)),
    pluralPascalCase: toPascalCase(pluralize(domainName))
  };

  console.log(`🚀 Generating HTTP presentation layer for domain: ${names.pascalCase}`);

  try {
    // Check if domain exists
    const domainPath = `src/domain/${names.lowercase}`;
    if (!(await directoryExists(domainPath))) {
      console.error(`❌ Domain ${names.pascalCase} does not exist. Please generate the domain first with:`);
      console.error(`   express-ts-backend-generator g-d ${names.lowercase}`);
      return;
    }

    // Generate HTTP presentation components
    await generateHttpController(names);
    await generateHttpDto(names);
    await generateHttpRoutes(names);

    console.log(`✅ HTTP presentation layer for ${names.pascalCase} generated successfully!`);
    console.log('\n📁 Generated files:');
    printGeneratedFiles(names);
    
    console.log('\n📋 Next steps:');
    console.log(`1. Import and register routes in src/app.ts:`);
    console.log(`   import { ${names.camelCase}Routes } from './presentation/http/routes/${names.kebabCase}.routes';`);
    console.log(`   app.use('/api/${names.pluralCamelCase}', ${names.camelCase}Routes);`);
    console.log('2. Update src/infrastructure/container.ts to register new dependencies');
    
  } catch (error) {
    console.error('❌ Error generating HTTP presentation layer:', error);
  }
}

async function generateHttpController(names: any) {
  await generateFromTemplate(
    'presentation/controller.template.ts',
    `src/presentation/http/controllers/${names.kebabCase}.controller.ts`,
    names
  );
}

async function generateHttpDto(names: any) {
  await generateFromTemplate(
    'presentation/http-dto.template.ts',
    `src/presentation/http/dto/${names.kebabCase}.dto.ts`,
    names
  );
}

async function generateHttpRoutes(names: any) {
  await generateFromTemplate(
    'presentation/routes.template.ts',
    `src/presentation/http/routes/${names.kebabCase}.routes.ts`,
    names
  );
}

function printGeneratedFiles(names: any) {
  const files = [
    `src/presentation/http/controllers/${names.kebabCase}.controller.ts`,
    `src/presentation/http/dto/${names.kebabCase}.dto.ts`,
    `src/presentation/http/routes/${names.kebabCase}.routes.ts`
  ];

  files.forEach(file => console.log(`   ${file}`));
}

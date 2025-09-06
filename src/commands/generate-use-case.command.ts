import { 
  toCamelCase, 
  toPascalCase, 
  toKebabCase, 
  lowercase,
  pluralize
} from '../utils/string.utils.js';
import { generateFromTemplate, generateFromTemplateString } from '../generators/template.generator.js';
import { directoryExists } from '../utils/file.utils.js';

export async function generateUseCase(domainName: string, useCaseName: string) {
  const domainNames = {
    camelCase: toCamelCase(domainName),
    pascalCase: toPascalCase(domainName),
    kebabCase: toKebabCase(domainName),
    lowercase: lowercase(domainName)
  };

  const useCaseNames = {
    camelCase: toCamelCase(useCaseName),
    pascalCase: toPascalCase(useCaseName),
    kebabCase: toKebabCase(useCaseName),
    lowercase: lowercase(useCaseName)
  };

  console.log(`🚀 Generating use case: ${useCaseNames.pascalCase} for domain ${domainNames.pascalCase}`);

  try {
    // Check if domain exists
    const domainPath = `src/domain/${domainNames.lowercase}`;
    if (!(await directoryExists(domainPath))) {
      console.error(`❌ Domain ${domainNames.pascalCase} does not exist. Please generate the domain first.`);
      return;
    }

    const useCaseTemplate = `import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/types';
import { I${domainNames.pascalCase}Repository } from '../../../domain/${domainNames.lowercase}/repositories/${domainNames.kebabCase}.repository.interface';

@injectable()
export class ${useCaseNames.pascalCase}UseCase {
  constructor(
    @inject(TYPES.${domainNames.pascalCase}Repository) private ${domainNames.camelCase}Repository: I${domainNames.pascalCase}Repository
  ) {}

  async execute(/* Add your parameters here */): Promise<any> {
    // TODO: Implement your use case logic here
    throw new Error('Use case not implemented');
  }
}`;

    const outputPath = `src/application/use-cases/${domainNames.lowercase}/${useCaseNames.kebabCase}.use-case.ts`;
    await generateFromTemplateString(useCaseTemplate, outputPath, {});

    console.log(`✅ Use case ${useCaseNames.pascalCase} generated successfully!`);
    console.log(`📁 Generated: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error generating use case:', error);
  }
}

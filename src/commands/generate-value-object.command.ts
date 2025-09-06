import { 
  toCamelCase, 
  toPascalCase, 
  toKebabCase, 
  lowercase,
  pluralize
} from '../utils/string.utils.js';
import { generateFromTemplateString } from '../generators/template.generator.js';
import { directoryExists } from '../utils/file.utils.js';

export async function generateValueObject(domainName: string, voName: string) {
  const domainNames = {
    camelCase: toCamelCase(domainName),
    pascalCase: toPascalCase(domainName),
    kebabCase: toKebabCase(domainName),
    lowercase: lowercase(domainName)
  };

  const voNames = {
    camelCase: toCamelCase(voName),
    pascalCase: toPascalCase(voName),
    kebabCase: toKebabCase(voName),
    lowercase: lowercase(voName)
  };

  console.log(`🚀 Generating value object: ${voNames.pascalCase} for domain ${domainNames.pascalCase}`);

  try {
    // Check if domain exists
    const domainPath = `src/domain/${domainNames.lowercase}`;
    if (!(await directoryExists(domainPath))) {
      console.error(`❌ Domain ${domainNames.pascalCase} does not exist. Please generate the domain first.`);
      return;
    }

    const voTemplate = `import { ValueObject } from '../../shared/value-object';

export interface ${voNames.pascalCase}Props {
  value: string; // Change this type as needed
}

export class ${voNames.pascalCase} extends ValueObject<${voNames.pascalCase}Props> {
  constructor(props: ${voNames.pascalCase}Props) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(value: string): ${voNames.pascalCase} {
    // Add validation logic here
    if (!value || value.trim().length === 0) {
      throw new Error('${voNames.pascalCase} cannot be empty');
    }

    return new ${voNames.pascalCase}({ value: value.trim() });
  }
}`;

    const outputPath = `src/domain/${domainNames.lowercase}/value-objects/${voNames.kebabCase}.ts`;
    await generateFromTemplateString(voTemplate, outputPath, {});

    console.log(`✅ Value object ${voNames.pascalCase} generated successfully!`);
    console.log(`📁 Generated: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error generating value object:', error);
  }
}

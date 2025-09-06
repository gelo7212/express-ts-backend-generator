import { 
  toCamelCase, 
  toPascalCase, 
  toKebabCase, 
  lowercase, 
  pluralize 
} from '../utils/string.utils.js';
import { generateFromTemplate, generateFromTemplateString } from '../generators/template.generator.js';
import { directoryExists, fileExists } from '../utils/file.utils.js';

interface DomainNames {
  camelCase: string;
  pascalCase: string;
  kebabCase: string;
  lowercase: string;
  pluralCamelCase: string;
  pluralPascalCase: string;
}

export async function generateDomain(domainName: string, options: any = {}) {
  const names: DomainNames = {
    camelCase: toCamelCase(domainName),
    pascalCase: toPascalCase(domainName),
    kebabCase: toKebabCase(domainName),
    lowercase: lowercase(domainName),
    pluralCamelCase: toCamelCase(pluralize(domainName)),
    pluralPascalCase: toPascalCase(pluralize(domainName))
  };

  console.log(`🚀 Generating domain: ${names.pascalCase}`);

  try {
    // Check if domain already exists
    const domainPath = `src/domain/${names.lowercase}`;
    if (await directoryExists(domainPath)) {
      console.log(`⚠️  Domain ${names.pascalCase} already exists. Skipping generation.`);
      return;
    }

    // 1. Generate domain structure
    await generateDomainStructure(names);
    
    // 2. Generate application layer
    await generateApplicationLayer(names);
    
    // 3. Generate infrastructure
    await generateInfrastructureLayer(names);
    
    // 4. Generate presentation layer
    await generatePresentationLayer(names);
    
    // 5. Generate tests (if not skipped)
    if (!options.skipTests) {
      await generateTests(names);
    }

    // 6. Update types.ts file
    await updateTypesFile(names);

    // 7. Update container.ts file
    await updateContainerFile(names);

    console.log(`✅ Domain ${names.pascalCase} generated successfully!`);
    console.log('\n📁 Generated files:');
    printGeneratedFiles(names);
    
    console.log('\n📋 Next steps:');
    console.log('1. Add routes to src/app.ts');
    console.log('2. Install any additional dependencies if needed');
    
  } catch (error) {
    console.error('❌ Error generating domain:', error);
  }
}

async function generateDomainStructure(names: DomainNames) {
  const files = [
    // Entities
    {
      template: 'domain/entity.template.ts',
      output: `src/domain/${names.lowercase}/entities/${names.kebabCase}.entity.ts`,
      data: names
    },
    // Events
    {
      template: 'domain/event-created.template.ts',
      output: `src/domain/${names.lowercase}/events/${names.kebabCase}-created.event.ts`,
      data: names
    },
    {
      template: 'domain/event-updated.template.ts',
      output: `src/domain/${names.lowercase}/events/${names.kebabCase}-updated.event.ts`,
      data: names
    },
    // Repository Interface
    {
      template: 'domain/repository.interface.template.ts',
      output: `src/domain/${names.lowercase}/repositories/${names.kebabCase}.repository.interface.ts`,
      data: names
    },
    // Domain Service
    {
      template: 'domain/domain-service.template.ts',
      output: `src/domain/${names.lowercase}/services/${names.kebabCase}-domain.service.ts`,
      data: names
    }
  ];

  for (const file of files) {
    await generateFromTemplate(file.template, file.output, file.data);
  }
}

async function generateApplicationLayer(names: DomainNames) {
  const files = [
    // DTOs
    {
      template: 'application/dto.template.ts',
      output: `src/application/dto/${names.kebabCase}.dto.ts`,
      data: names
    },
    // Use Cases
    {
      template: 'application/get-use-case.template.ts',
      output: `src/application/use-cases/${names.lowercase}/get-${names.kebabCase}.use-case.ts`,
      data: names
    },
    {
      template: 'application/create-use-case.template.ts',
      output: `src/application/use-cases/${names.lowercase}/create-${names.kebabCase}.use-case.ts`,
      data: names
    },
    {
      template: 'application/update-use-case.template.ts',
      output: `src/application/use-cases/${names.lowercase}/update-${names.kebabCase}.use-case.ts`,
      data: names
    },
    {
      template: 'application/delete-use-case.template.ts',
      output: `src/application/use-cases/${names.lowercase}/delete-${names.kebabCase}.use-case.ts`,
      data: names
    }
  ];

  for (const file of files) {
    await generateFromTemplate(file.template, file.output, file.data);
  }
}

async function generateInfrastructureLayer(names: DomainNames) {
  const files = [
    // Repository Implementation
    {
      template: 'infrastructure/repository.template.ts',
      output: `src/infrastructure/repositories/${names.kebabCase}.repository.ts`,
      data: names
    }
  ];

  for (const file of files) {
    await generateFromTemplate(file.template, file.output, file.data);
  }
}

async function generatePresentationLayer(names: DomainNames) {
  const files = [
    // Controller
    {
      template: 'presentation/controller.template.ts',
      output: `src/presentation/http/controllers/${names.kebabCase}.controller.ts`,
      data: names
    }
  ];

  for (const file of files) {
    await generateFromTemplate(file.template, file.output, file.data);
  }
}

async function generateTests(names: DomainNames) {
  const testTemplate = `import { ${names.pascalCase} } from '../../../src/domain/${names.lowercase}/entities/${names.kebabCase}.entity';

describe('${names.pascalCase}', () => {
  it('should create a ${names.lowercase} with valid properties', () => {
    const props = {
      name: 'Test ${names.pascalCase}',
      description: 'Test description',
      isActive: true
    };

    const ${names.camelCase} = new ${names.pascalCase}(props);

    expect(${names.camelCase}.name).toBe(props.name);
    expect(${names.camelCase}.description).toBe(props.description);
    expect(${names.camelCase}.isActive).toBe(props.isActive);
    expect(${names.camelCase}.id).toBeDefined();
  });

  it('should update ${names.lowercase} name', () => {
    const ${names.camelCase} = new ${names.pascalCase}({
      name: 'Original Name',
      isActive: true
    });

    ${names.camelCase}.updateName('Updated Name');

    expect(${names.camelCase}.name).toBe('Updated Name');
  });
});`;

  const testOutputPath = `test/unit/domain/${names.kebabCase}.entity.spec.ts`;
  await generateFromTemplateString(testTemplate, testOutputPath, names);
}

function printGeneratedFiles(names: DomainNames) {
  const files = [
    `src/domain/${names.lowercase}/entities/${names.kebabCase}.entity.ts`,
    `src/domain/${names.lowercase}/events/${names.kebabCase}-created.event.ts`,
    `src/domain/${names.lowercase}/events/${names.kebabCase}-updated.event.ts`,
    `src/domain/${names.lowercase}/repositories/${names.kebabCase}.repository.interface.ts`,
    `src/domain/${names.lowercase}/services/${names.kebabCase}-domain.service.ts`,
    `src/application/dto/${names.kebabCase}.dto.ts`,
    `src/application/use-cases/${names.lowercase}/get-${names.kebabCase}.use-case.ts`,
    `src/application/use-cases/${names.lowercase}/create-${names.kebabCase}.use-case.ts`,
    `src/application/use-cases/${names.lowercase}/update-${names.kebabCase}.use-case.ts`,
    `src/application/use-cases/${names.lowercase}/delete-${names.kebabCase}.use-case.ts`,
    `src/infrastructure/repositories/${names.kebabCase}.repository.ts`,
    `src/presentation/http/controllers/${names.kebabCase}.controller.ts`,
    `test/unit/domain/${names.kebabCase}.entity.spec.ts`
  ];

  files.forEach(file => console.log(`   ${file}`));
}

async function updateTypesFile(names: DomainNames) {
  const typesPath = 'src/infrastructure/types.ts';
  
  // Check if types file exists
  if (!fileExists(typesPath)) {
    console.log('⚠️  types.ts file not found, skipping TYPES update');
    return;
  }

  try {
    // Read current types file
    const fs = await import('fs/promises');
    let typesContent = await fs.readFile(typesPath, 'utf8');

    // Check if these types already exist to avoid duplicates
    if (typesContent.includes(`${names.pascalCase}Repository: Symbol.for('${names.pascalCase}Repository')`)) {
      console.log('📝 TYPES already exist for this domain, skipping update');
      return;
    }

    // Define the new types to insert into different sections
    const domainService = `  ${names.pascalCase}DomainService: Symbol.for('${names.pascalCase}DomainService'),`;
    const useCases = [
      `  Create${names.pascalCase}UseCase: Symbol.for('Create${names.pascalCase}UseCase'),`,
      `  Get${names.pascalCase}UseCase: Symbol.for('Get${names.pascalCase}UseCase'),`,
      `  Update${names.pascalCase}UseCase: Symbol.for('Update${names.pascalCase}UseCase'),`,
      `  Delete${names.pascalCase}UseCase: Symbol.for('Delete${names.pascalCase}UseCase'),`
    ];
    const repository = `  ${names.pascalCase}Repository: Symbol.for('${names.pascalCase}Repository'),`;
    const controller = `  ${names.pascalCase}Controller: Symbol.for('${names.pascalCase}Controller'),`;

    // Smart insertion strategy
    let updatedContent = typesContent;

    // 1. Insert Domain Service after existing domain services
    const domainServicesSection = updatedContent.indexOf('// Domain Services');
    if (domainServicesSection !== -1) {
      // Find the end of the domain services section (next comment or repositories section)
      const nextSection = updatedContent.indexOf('\n  // ', domainServicesSection + 1);
      if (nextSection !== -1) {
        updatedContent = updatedContent.slice(0, nextSection) + '\n' + domainService + updatedContent.slice(nextSection);
      }
    }

    // 2. Insert Use Cases after existing use cases for this domain or at the end of use cases
    const useCasesStart = updatedContent.indexOf('// Use Cases');
    if (useCasesStart !== -1) {
      // Find the end of use cases section (before repositories)
      const repositoriesSection = updatedContent.indexOf('\n  // Repositories');
      if (repositoriesSection !== -1) {
        const useCaseSection = `\n  // Use Cases - ${names.pascalCase}\n` + useCases.join('\n') + '\n';
        updatedContent = updatedContent.slice(0, repositoriesSection) + useCaseSection + updatedContent.slice(repositoriesSection);
      }
    }

    // 3. Insert Repository after existing repositories
    const repositoriesSection = updatedContent.indexOf('// Repositories');
    if (repositoriesSection !== -1) {
      const nextSection = updatedContent.indexOf('\n  // ', repositoriesSection + 1);
      if (nextSection !== -1) {
        updatedContent = updatedContent.slice(0, nextSection) + '\n' + repository + updatedContent.slice(nextSection);
      }
    }

    // 4. Insert Controller after existing controllers
    const controllersSection = updatedContent.indexOf('// Controllers');
    if (controllersSection !== -1) {
      const closingBrace = updatedContent.indexOf('\n};', controllersSection);
      if (closingBrace !== -1) {
        updatedContent = updatedContent.slice(0, closingBrace) + '\n' + controller + updatedContent.slice(closingBrace);
      }
    }
    
    // Write back to file
    await fs.writeFile(typesPath, updatedContent, 'utf8');
    console.log(`📝 Updated ${typesPath} with new TYPES for ${names.pascalCase} domain`);
    
  } catch (error) {
    console.log(`⚠️  Failed to update types.ts: ${error}`);
  }
}

async function updateContainerFile(names: DomainNames) {
  const containerPath = 'src/infrastructure/container.ts';
  
  // Check if container file exists
  if (!fileExists(containerPath)) {
    console.log('⚠️  container.ts file not found, skipping container update');
    return;
  }

  try {
    // Read current container file
    const fs = await import('fs/promises');
    let containerContent = await fs.readFile(containerPath, 'utf8');

    // Check if these bindings already exist to avoid duplicates
    if (containerContent.includes(`${names.pascalCase}Repository).to(${names.pascalCase}Repository)`)) {
      console.log('📦 Container bindings already exist for this domain, skipping update');
      return;
    }

    // Define the imports to add
    const domainImport = `import { ${names.pascalCase}DomainService } from '../domain/${names.lowercase}/services/${names.kebabCase}-domain.service';`;
    const repositoryImport = `import { ${names.pascalCase}Repository } from '../infrastructure/repositories/${names.kebabCase}.repository';`;
    const repositoryInterfaceImport = `import { I${names.pascalCase}Repository } from '../domain/${names.lowercase}/repositories/${names.kebabCase}.repository.interface';`;
    const useCaseImports = [
      `import { Create${names.pascalCase}UseCase } from '../application/use-cases/${names.lowercase}/create-${names.kebabCase}.use-case';`,
      `import { Get${names.pascalCase}UseCase } from '../application/use-cases/${names.lowercase}/get-${names.kebabCase}.use-case';`,
      `import { Update${names.pascalCase}UseCase } from '../application/use-cases/${names.lowercase}/update-${names.kebabCase}.use-case';`,
      `import { Delete${names.pascalCase}UseCase } from '../application/use-cases/${names.lowercase}/delete-${names.kebabCase}.use-case';`
    ];
    const controllerImport = `import { ${names.pascalCase}Controller } from '../presentation/http/controllers/${names.kebabCase}.controller';`;

    // Define the bindings to add
    const repositoryBinding = `container.bind<I${names.pascalCase}Repository>(TYPES.${names.pascalCase}Repository).to(${names.pascalCase}Repository);`;
    const domainServiceBinding = `container.bind<${names.pascalCase}DomainService>(TYPES.${names.pascalCase}DomainService).to(${names.pascalCase}DomainService);`;
    const useCaseBindings = [
      `container.bind<Create${names.pascalCase}UseCase>(TYPES.Create${names.pascalCase}UseCase).to(Create${names.pascalCase}UseCase);`,
      `container.bind<Get${names.pascalCase}UseCase>(TYPES.Get${names.pascalCase}UseCase).to(Get${names.pascalCase}UseCase);`,
      `container.bind<Update${names.pascalCase}UseCase>(TYPES.Update${names.pascalCase}UseCase).to(Update${names.pascalCase}UseCase);`,
      `container.bind<Delete${names.pascalCase}UseCase>(TYPES.Delete${names.pascalCase}UseCase).to(Delete${names.pascalCase}UseCase);`
    ];
    const controllerBinding = `container.bind<${names.pascalCase}Controller>(TYPES.${names.pascalCase}Controller).to(${names.pascalCase}Controller);`;

    let updatedContent = containerContent;

    // 1. Add imports - Domain
    const domainImportsSection = updatedContent.indexOf('// Domain');
    if (domainImportsSection !== -1) {
      const nextSection = updatedContent.indexOf('\n// ', domainImportsSection + 1);
      if (nextSection !== -1) {
        updatedContent = updatedContent.slice(0, nextSection) + '\n' + domainImport + updatedContent.slice(nextSection);
      }
    }

    // 2. Add imports - Application (Use Cases)
    const applicationImportsSection = updatedContent.indexOf('// Application');
    if (applicationImportsSection !== -1) {
      const nextSection = updatedContent.indexOf('\n// ', applicationImportsSection + 1);
      if (nextSection !== -1) {
        const useCaseImportsText = '\n' + useCaseImports.join('\n');
        updatedContent = updatedContent.slice(0, nextSection) + useCaseImportsText + updatedContent.slice(nextSection);
      }
    }

    // 3. Add imports - Infrastructure
    const infrastructureImportsSection = updatedContent.indexOf('// Infrastructure');
    if (infrastructureImportsSection !== -1) {
      const nextSection = updatedContent.indexOf('\n// ', infrastructureImportsSection + 1);
      if (nextSection !== -1) {
        const infraImportsText = '\n' + repositoryImport + '\n' + repositoryInterfaceImport;
        updatedContent = updatedContent.slice(0, nextSection) + infraImportsText + updatedContent.slice(nextSection);
      }
    }

    // 4. Add imports - Presentation
    const presentationImportsSection = updatedContent.indexOf('// Presentation');
    if (presentationImportsSection !== -1) {
      const containerStart = updatedContent.indexOf('\nconst container', presentationImportsSection);
      if (containerStart !== -1) {
        updatedContent = updatedContent.slice(0, containerStart) + '\n' + controllerImport + updatedContent.slice(containerStart);
      }
    }

    // 5. Add bindings - Repositories
    const repositoriesBindingSection = updatedContent.indexOf('// Repositories');
    if (repositoriesBindingSection !== -1) {
      const nextSection = updatedContent.indexOf('\n// ', repositoriesBindingSection + 1);
      if (nextSection !== -1) {
        updatedContent = updatedContent.slice(0, nextSection) + '\n' + repositoryBinding + updatedContent.slice(nextSection);
      }
    }

    // 6. Add bindings - Domain Services
    const domainServicesBindingSection = updatedContent.indexOf('// Domain Services');
    if (domainServicesBindingSection !== -1) {
      const nextSection = updatedContent.indexOf('\n// ', domainServicesBindingSection + 1);
      if (nextSection !== -1) {
        updatedContent = updatedContent.slice(0, nextSection) + '\n' + domainServiceBinding + updatedContent.slice(nextSection);
      }
    }

    // 7. Add bindings - Use Cases
    const useCasesBindingSection = updatedContent.indexOf('// Use Cases');
    if (useCasesBindingSection !== -1) {
      const nextSection = updatedContent.indexOf('\n// ', useCasesBindingSection + 1);
      if (nextSection !== -1) {
        const useCaseBindingsText = '\n' + useCaseBindings.join('\n');
        updatedContent = updatedContent.slice(0, nextSection) + useCaseBindingsText + updatedContent.slice(nextSection);
      }
    }

    // 8. Add bindings - Controllers
    const controllersBindingSection = updatedContent.indexOf('// Controllers');
    if (controllersBindingSection !== -1) {
      const exportSection = updatedContent.indexOf('\nexport { container };', controllersBindingSection);
      if (exportSection !== -1) {
        updatedContent = updatedContent.slice(0, exportSection) + '\n' + controllerBinding + updatedContent.slice(exportSection);
      }
    }

    // Write back to file
    await fs.writeFile(containerPath, updatedContent, 'utf8');
    console.log(`📦 Updated ${containerPath} with new bindings for ${names.pascalCase} domain`);
    
  } catch (error) {
    console.log(`⚠️  Failed to update container.ts: ${error}`);
  }
}

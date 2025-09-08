import { IFileSystem, ILogger } from '../types';

/**
 * Utility for managing container and types file updates
 * Centralized logic to avoid duplication across generators
 */
export class ContainerManager {
  constructor(
    private fileSystem: IFileSystem,
    private logger: ILogger
  ) {}

  /**
   * Updates the container.ts file with new domain bindings
   */
  async updateContainerWithDomain(domainNames: any): Promise<void> {
    const containerPath = 'src/infrastructure/container.ts';
    
    try {
      if (!await this.fileSystem.exists(containerPath)) {
        this.logger.error('Container file not found');
        return;
      }

      const existingContent = await this.fileSystem.readFile(containerPath);
      
      // Check if domain is already in container
      const domainPattern = new RegExp(`${domainNames.pascalCase}Repository.*to\\(${domainNames.pascalCase}Repository\\)`, 'g');
      if (domainPattern.test(existingContent)) {
        this.logger.debug(`${domainNames.pascalCase} domain already exists in container`);
        return;
      }

      let updatedContent = existingContent;

      // 1. Add imports
      updatedContent = this.addDomainImports(updatedContent, domainNames);
      
      // 2. Add bindings
      updatedContent = this.addDomainBindings(updatedContent, domainNames);

      await this.fileSystem.writeFile(containerPath, updatedContent);
      this.logger.info(`✅ Updated container with ${domainNames.pascalCase} bindings`);
      
    } catch (error: any) {
      this.logger.error(`Failed to update container: ${error.message}`);
    }
  }

  /**
   * Adds imports for a domain to the container file
   */
  private addDomainImports(content: string, domainNames: any): string {
    const imports = [
      // Domain Service
      `import { ${domainNames.pascalCase}DomainService } from '../domain/${domainNames.kebabCase}/services/${domainNames.kebabCase}-domain.service';`,
      
      // Application Service
      `import { ${domainNames.pascalCase}ApplicationService } from '../application/services/${domainNames.kebabCase}-application.service';`,
      
      // Use Cases
      `import { Create${domainNames.pascalCase}UseCase } from '../application/use-cases/${domainNames.kebabCase}/create-${domainNames.kebabCase}.use-case';`,
      `import { Get${domainNames.pascalCase}UseCase } from '../application/use-cases/${domainNames.kebabCase}/get-${domainNames.kebabCase}.use-case';`,
      `import { Update${domainNames.pascalCase}UseCase } from '../application/use-cases/${domainNames.kebabCase}/update-${domainNames.kebabCase}.use-case';`,
      `import { Delete${domainNames.pascalCase}UseCase } from '../application/use-cases/${domainNames.kebabCase}/delete-${domainNames.kebabCase}.use-case';`,
      
      // Repository
      `import { ${domainNames.pascalCase}Repository } from '../infrastructure/repositories/${domainNames.kebabCase}.repository';`,
      `import { I${domainNames.pascalCase}Repository } from '../domain/${domainNames.kebabCase}/repositories/${domainNames.kebabCase}.repository.interface';`,
      
      // Controller
      `import { ${domainNames.pascalCase}Controller } from '../presentation/http/controllers/${domainNames.kebabCase}.controller';`
    ];

    let updatedContent = content;

    // Find the last import and add our imports after it
    const lastImportMatch = content.match(/import.*from.*['"].*['"];?/g);
    if (lastImportMatch && lastImportMatch.length > 0) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      const newImports = '\n\n// ' + domainNames.pascalCase + ' Domain - Auto-generated imports\n' + imports.join('\n');
      updatedContent = content.slice(0, insertPosition) + newImports + content.slice(insertPosition);
    }

    return updatedContent;
  }

  /**
   * Adds bindings for a domain to the container file
   */
  private addDomainBindings(content: string, domainNames: any): string {
    const bindings = [
      `// ${domainNames.pascalCase} - Auto-generated bindings`,
      `container.bind<I${domainNames.pascalCase}Repository>(TYPES.${domainNames.pascalCase}Repository).to(${domainNames.pascalCase}Repository);`,
      `container.bind<${domainNames.pascalCase}DomainService>(TYPES.${domainNames.pascalCase}DomainService).to(${domainNames.pascalCase}DomainService);`,
      `container.bind<${domainNames.pascalCase}ApplicationService>(TYPES.${domainNames.pascalCase}ApplicationService).to(${domainNames.pascalCase}ApplicationService);`,
      `container.bind<Create${domainNames.pascalCase}UseCase>(TYPES.Create${domainNames.pascalCase}UseCase).to(Create${domainNames.pascalCase}UseCase);`,
      `container.bind<Get${domainNames.pascalCase}UseCase>(TYPES.Get${domainNames.pascalCase}UseCase).to(Get${domainNames.pascalCase}UseCase);`,
      `container.bind<Update${domainNames.pascalCase}UseCase>(TYPES.Update${domainNames.pascalCase}UseCase).to(Update${domainNames.pascalCase}UseCase);`,
      `container.bind<Delete${domainNames.pascalCase}UseCase>(TYPES.Delete${domainNames.pascalCase}UseCase).to(Delete${domainNames.pascalCase}UseCase);`,
      `container.bind<${domainNames.pascalCase}Controller>(TYPES.${domainNames.pascalCase}Controller).to(${domainNames.pascalCase}Controller);`
    ];

    // Insert bindings before export
    const bindingsText = '\n' + bindings.join('\n') + '\n';
    return content.replace(/export { container };/, bindingsText + '\nexport { container };');
  }

  /**
   * Updates the types.ts file with new domain symbols
   */
  async updateTypesWithDomain(domainNames: any): Promise<void> {
    const typesPath = 'src/infrastructure/types.ts';
    
    try {
      if (!await this.fileSystem.exists(typesPath)) {
        this.logger.error('Types file not found');
        return;
      }

      const existingContent = await this.fileSystem.readFile(typesPath);
      
      // Check if domain types already exist
      const domainTypePattern = new RegExp(`${domainNames.pascalCase}Controller.*Symbol`, 'g');
      if (domainTypePattern.test(existingContent)) {
        this.logger.debug(`${domainNames.pascalCase} types already exist`);
        return;
      }

      // Check if we need to add a comma to the previous line
      let contentToUpdate = existingContent;
      
      // Find the last property before the closing brace
      const beforeClosingBrace = existingContent.match(/^(.+?)(\s*};)(\s*\/\/ Interface Types)/ms);
      if (beforeClosingBrace) {
        const beforeBrace = beforeClosingBrace[1];
        const lastLine = beforeBrace.trim().split('\n').pop()?.trim();
        
        // Check if the last property line doesn't end with a comma
        if (lastLine && !lastLine.endsWith(',') && !lastLine.endsWith('{')) {
          contentToUpdate = existingContent.replace(
            new RegExp(`(${lastLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(\\s*};)`, 'm'),
            `$1,$2`
          );
        }
      }

      // Add new type symbols
      const newTypes = [
        ``,
        `  // ${domainNames.pascalCase} - Auto-generated types`,
        `  ${domainNames.pascalCase}DomainService: Symbol.for('${domainNames.pascalCase}DomainService'),`,
        `  ${domainNames.pascalCase}ApplicationService: Symbol.for('${domainNames.pascalCase}ApplicationService'),`,
        `  Create${domainNames.pascalCase}UseCase: Symbol.for('Create${domainNames.pascalCase}UseCase'),`,
        `  Get${domainNames.pascalCase}UseCase: Symbol.for('Get${domainNames.pascalCase}UseCase'),`,
        `  Update${domainNames.pascalCase}UseCase: Symbol.for('Update${domainNames.pascalCase}UseCase'),`,
        `  Delete${domainNames.pascalCase}UseCase: Symbol.for('Delete${domainNames.pascalCase}UseCase'),`,
        `  ${domainNames.pascalCase}Repository: Symbol.for('${domainNames.pascalCase}Repository'),`,
        `  ${domainNames.pascalCase}Controller: Symbol.for('${domainNames.pascalCase}Controller')`
      ].join('\n');

      // Insert before the closing brace of TYPES
      const updatedContent = contentToUpdate.replace(
        /};(\s*\/\/ Interface Types)/,
        `${newTypes}\n};$1`
      );

      await this.fileSystem.writeFile(typesPath, updatedContent);
      this.logger.info(`✅ Updated types with ${domainNames.pascalCase} symbols`);
      
    } catch (error: any) {
      this.logger.error(`Failed to update types: ${error.message}`);
    }
  }
}

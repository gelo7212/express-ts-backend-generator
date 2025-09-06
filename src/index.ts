#!/usr/bin/env node
import { Command } from 'commander';
import { generateProject } from './commands/generate-project.command';
import { generateDomain } from './commands/generate-domain.command';
import { generateUseCase } from './commands/generate-use-case.command';
import { generateController } from './commands/generate-controller.command';
import { generateEntity } from './commands/generate-entity.command';
import { generateValueObject } from './commands/generate-value-object.command';
import { generateRepository } from './commands/generate-repository.command';
import { generateService } from './commands/generate-service.command';
import { generatePresentationHttp } from './commands/generate-presentation-http.command';

const program = new Command();

program
  .name('express-ts-backend-generator')
  .description('Generate DDD Express TypeScript projects and components')
  .version('1.0.0');

// Generate new project
program
  .command('new <project-name>')
  .description('Generate a new Express TypeScript project')
  .action(generateProject);

// Generate domain
program
  .command('generate domain <domain-name>')
  .description('Generate a new domain with complete DDD structure')
  .option('--skip-tests', 'Skip generating test files')
  .action((domainName, options) => generateDomain(domainName, options));

program
  .command('g-d <domain-name>')
  .description('Generate a new domain with complete DDD structure (short)')
  .option('--skip-tests', 'Skip generating test files')
  .action((domainName, options) => generateDomain(domainName, options));

// Generate use case
program
  .command('generate use-case <domain-name> <use-case-name>')
  .description('Generate a new use case for existing domain')
  .action((domainName, useCaseName) => generateUseCase(domainName, useCaseName));

program
  .command('g-uc <domain-name> <use-case-name>')
  .description('Generate a new use case for existing domain (short)')
  .action((domainName, useCaseName) => generateUseCase(domainName, useCaseName));

// Generate controller
program
  .command('generate controller <domain-name>')
  .description('Generate a new controller for existing domain')
  .action((domainName) => generateController(domainName));

program
  .command('g-c <domain-name>')
  .description('Generate a new controller for existing domain (short)')
  .action((domainName) => generateController(domainName));

// Generate entity
program
  .command('generate entity <domain-name> <entity-name>')
  .description('Generate a new entity for existing domain')
  .action((domainName, entityName) => generateEntity(domainName, entityName));

program
  .command('g-e <domain-name> <entity-name>')
  .description('Generate a new entity for existing domain (short)')
  .action((domainName, entityName) => generateEntity(domainName, entityName));

// Generate value object
program
  .command('generate value-object <domain-name> <vo-name>')
  .description('Generate a new value object for existing domain')
  .action((domainName, voName) => generateValueObject(domainName, voName));

program
  .command('g-vo <domain-name> <vo-name>')
  .description('Generate a new value object for existing domain (short)')
  .action((domainName, voName) => generateValueObject(domainName, voName));

// Generate repository
program
  .command('generate repository <domain-name>')
  .description('Generate repository interface and implementation for existing domain')
  .action((domainName) => generateRepository(domainName));

program
  .command('g-r <domain-name>')
  .description('Generate repository interface and implementation for existing domain (short)')
  .action((domainName) => generateRepository(domainName));

// Generate service
program
  .command('generate service <domain-name>')
  .description('Generate domain service for existing domain')
  .action((domainName) => generateService(domainName));

program
  .command('g-s <domain-name>')
  .description('Generate domain service for existing domain (short)')
  .action((domainName) => generateService(domainName));

// Generate presentation HTTP layer
program
  .command('generate-presentation-http <domain-name>')
  .description('Generate presentation HTTP layer (controllers, DTOs, routes) for existing domain')
  .action((domainName) => generatePresentationHttp(domainName));

program
  .command('g-p-http <domain-name>')
  .description('Generate presentation HTTP layer (short)')
  .action((domainName) => generatePresentationHttp(domainName));

program.parse();

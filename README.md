# Express TypeScript Backend Generator V2

A clean, maintainable CLI tool to scaffold Express TypeScript projects with Domain-Driven Design (DDD) architecture.

## 🏗️ Architecture Overview

The V2 generator has been completely redesigned with clean architecture principles:

### Core Components

1. **Dependency Injection Container** - Clean dependency management
2. **Plugin-based Command System** - Easy to add new commands
3. **Template Registry** - Dynamic template management
4. **Generator Factory** - Strategy pattern for different generators
5. **Configuration-driven** - JSON-based template configurations

### Project Structure

```
src/
├── cli/                  # CLI interface layer
│   └── cli.ts           # Commander.js integration
├── commands/             # Command implementations
│   ├── base-command.ts  # Base command class
│   ├── command-registry.ts
│   └── [specific-commands].ts
├── core/                 # Core services
│   ├── application.ts   # Main application bootstrapper
│   ├── container.ts     # Dependency injection
│   ├── logger.ts        # Logging service
│   ├── file-system.ts   # File operations
│   ├── string-utils.ts  # String utilities
│   └── template-engine.ts # EJS template rendering
├── generators/           # Code generators
│   ├── base-generator.ts # Base generator class
│   ├── generator-factory.ts
│   └── [specific-generators].ts
├── templates/            # Template registry
│   └── template-registry.ts
├── types/                # TypeScript interfaces
│   ├── interfaces.ts    # Core interfaces
│   └── tokens.ts        # DI tokens
└── index.ts             # Entry point
```

## 🚀 Key Features

### 1. Easy Command Addition

To add a new command:

```typescript
export class MyNewCommand extends BaseCommand {
  name = 'my:command';
  description = 'My new command';
  arguments = [{ name: 'arg1', required: true, description: 'First argument' }];
  options = [{ flags: '-f, --force', description: 'Force option' }];

  async execute(args: any[], options: any): Promise<void> {
    // Command implementation
  }
}
```

Register it in `Application.registerCommands()`:

```typescript
registry.register(new MyNewCommand(this.container, logger, stringUtils, generatorFactory));
```

### 2. Easy Template Addition

Create a JSON configuration in `configs/`:

```json
{
  "name": "my-generator",
  "type": "my-type",
  "templates": [
    {
      "name": "my-template",
      "path": "my-template.ejs",
      "type": "file",
      "outputPath": "output/{name}.ts",
      "conditions": [
        {
          "field": "includeFeature",
          "operator": "equals", 
          "value": true
        }
      ]
    }
  ]
}
```

### 3. Dynamic Template Generation

Templates support:
- **EJS templating** with full variable substitution
- **Conditional generation** based on user options
- **Directory structure** generation
- **Naming conventions** (camelCase, PascalCase, kebab-case, etc.)

### 4. Clean Generator Pattern

```typescript
export class MyGenerator extends BaseGenerator {
  constructor(fileSystem, logger, templateEngine, templateRegistry) {
    super(fileSystem, logger, templateEngine, templateRegistry, 'my-type');
  }

  canHandle(type: string): boolean {
    return type === 'my-type';
  }

  getDescription(): string {
    return 'My custom generator';
  }
}
```

## 📝 Usage Examples

### Generate a new project
```bash
express-ts-gen new my-project
express-ts-gen create my-project --template advanced
```

### Generate domain components
```bash
express-ts-gen generate:domain user
express-ts-gen g:d user --skip-tests
```

### Generate entities
```bash
express-ts-gen generate:entity user profile
express-ts-gen g:e user profile --force
```

## 🔧 Configuration

### Template Variables

All templates have access to:
- `projectName` - Project name
- `domainName` - Domain name (if applicable)
- `domainNames` - All naming conventions for domain
- `entityNames` - All naming conventions for entity
- `timestamp` - Generation timestamp
- Custom data from command options

### Naming Conventions

Automatically generated for any name:
```typescript
{
  camelCase: 'userName',
  pascalCase: 'UserName', 
  kebabCase: 'user-name',
  snakeCase: 'user_name',
  lowercase: 'username',
  uppercase: 'USERNAME',
  pluralCamelCase: 'userNames',
  pluralPascalCase: 'UserNames',
  // ... etc
}
```

## 🧪 Testing

Run tests:
```bash
npm test
npm run test:watch
npm run test:coverage
```

## 🔄 Migration from V1

The V2 architecture is completely backward compatible with V1 templates but offers much more flexibility:

### V1 Issues Solved:
- ✅ Hard to add new commands (required manual CLI updates)
- ✅ Templates tightly coupled to generators 
- ✅ No conditional template generation
- ✅ Difficult to maintain and extend
- ✅ Poor separation of concerns

### V2 Benefits:
- ✅ Plugin-based architecture
- ✅ Configuration-driven templates
- ✅ Clean dependency injection
- ✅ Easy to test and maintain
- ✅ Extensible and scalable

## 🤝 Contributing

1. Add new generators in `src/generators/`
2. Add new commands in `src/commands/`
3. Add template configs in `configs/`
4. Add templates in `templates/`
5. Register everything in `src/core/application.ts`

The architecture makes it easy to contribute new features without touching existing code!

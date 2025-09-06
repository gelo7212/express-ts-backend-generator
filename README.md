# Express TypeScript Backend Generator

An Angular-like CLI tool to scaffold Express TypeScript projects with Domain-Driven Design (DDD) architecture and Clean Architecture principles.

## Features

- 🚀 **Angular-like CLI** - Familiar commands for rapid development
- 🏗️ **DDD Architecture** - Complete Domain-Driven Design structure
- 🧹 **Clean Architecture** - Separation of concerns with proper layering
- 📦 **TypeScript** - Full TypeScript support with proper typing
- 🔧 **Dependency Injection** - Using Inversify for IoC
- ✅ **Testing Ready** - Jest configuration and test generation
- 🐳 **Docker Ready** - Dockerfile and docker-compose included

## Installation

```bash
npm install -g express-ts-backend-generator
```

## Commands

### Project Generation

```bash
# Create a new project
express-ts-backend-generator new my-project
```

### Domain Generation

```bash
# Generate complete domain (recommended)
express-ts-backend-generator generate domain product
express-ts-backend-generator g-d product

# Short aliases available
express-ts-backend-generator g-d user
express-ts-backend-generator g-d order
```

This generates:
- Domain entities, value objects, events
- Repository interfaces and implementations
- Domain services
- Application DTOs and use cases (CRUD)
- Infrastructure repositories
- Presentation controllers
- Unit tests

### Individual Component Generation

```bash
# Generate specific use case
express-ts-backend-generator generate use-case product get-products-by-category
express-ts-backend-generator g-uc product calculate-discount

# Generate entity
express-ts-backend-generator generate entity product variant
express-ts-backend-generator g-e product category

# Generate value object
express-ts-backend-generator generate value-object product sku
express-ts-backend-generator g-vo user email

# Generate repository
express-ts-backend-generator generate repository product
express-ts-backend-generator g-r product

# Generate controller
express-ts-backend-generator generate controller product
express-ts-backend-generator g-c product

# Generate domain service
express-ts-backend-generator generate service product
express-ts-backend-generator g-s product
```

## Available Commands Summary

| Command | Alias | Description | Example |
|---------|-------|-------------|---------|
| `new <name>` | | Create new project | `express-ts-backend-generator new my-api` |
| `generate domain <name>` | `g-d` | Generate complete domain | `express-ts-backend-generator g-d product` |
| `generate entity <domain> <name>` | `g-e` | Generate entity only | `express-ts-backend-generator g-e product variant` |
| `generate value-object <domain> <name>` | `g-vo` | Generate value object | `express-ts-backend-generator g-vo product sku` |
| `generate use-case <domain> <name>` | `g-uc` | Generate use case | `express-ts-backend-generator g-uc product get-by-category` |
| `generate controller <domain>` | `g-c` | Generate controller | `express-ts-backend-generator g-c product` |
| `generate repository <domain>` | `g-r` | Generate repository | `express-ts-backend-generator g-r product` |
| `generate service <domain>` | `g-s` | Generate domain service | `express-ts-backend-generator g-s product` |

## Usage Examples

### 1. Create a new project

```bash
express-ts-backend-generator new ecommerce-api
cd ecommerce-api
npm install
npm run dev
```

### 2. Generate a complete domain

```bash
# Generate Product domain
express-ts-backend-generator g-d product

# This creates complete DDD structure with CRUD operations
```

### 3. Add custom use cases

```bash
# Add specific business operations
express-ts-backend-generator g-uc product calculate-discount
express-ts-backend-generator g-uc product check-inventory
```

## Next Steps After Generation

1. **Update Dependencies**: Add new types to `src/infrastructure/types.ts`
2. **Register Services**: Update `src/infrastructure/container.ts` 
3. **Add Routes**: Update `src/app.ts` to include new routes
4. **Customize Logic**: Implement your specific business logic

## Development

- Build the CLI: `npm run build`
- Test locally: `npm run dev -- new test-project`

## License

MIT License

```sh
npm publish --access public
```

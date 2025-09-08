# Express TypeScript Backend Generator

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)

A powerful CLI tool for scaffolding **Express.js TypeScript** backends with **Domain-Driven Design (DDD)** architecture and **Clean Architecture** principles.

[Installation](#installation) •
[Quick Start](#quick-start) •
[Commands](#commands) •
[Examples](#examples) •
[Architecture](#architecture) •
[Contributing](#contributing)

</div>

---

## Features

✨ **Modern Architecture** - Clean Architecture & Domain-Driven Design patterns  
🚀 **TypeScript First** - Full TypeScript support with strict typing  
📦 **Modular Generation** - Generate complete domains or individual components  
🔧 **Configurable Templates** - JSON-driven template system  
🧪 **Test Ready** - Includes Jest configuration and test templates  
🐳 **Docker Support** - Ready-to-use Docker configurations  
📡 **MongoDB Integration** - Built-in MongoDB patterns and implementations  
🔄 **Extensible** - Plugin-based architecture for easy customization  

## Installation

### NPM (Recommended)
```bash
npm install -g express-ts-backend-generator
```

### Yarn
```bash
yarn global add express-ts-backend-generator
```

### Usage without installation
```bash
npx express-ts-backend-generator new my-project
```

## Quick Start

### 1. Create a new project
```bash
express-ts-gen new my-awesome-api
cd my-awesome-api
npm install
```

### 2. Generate your first domain
```bash
express-ts-gen generate:domain user
```

### 3. Start developing
```bash
npm run dev
```

Your API will be running at `http://localhost:3000` 🎉

## Commands

### Project Commands

#### `new` / `create`
Create a new Express TypeScript project with complete DDD structure.

```bash
express-ts-gen new <project-name> [options]
```

**Generated Files:**
```
my-project/
├── src/
│   ├── application/           # Use cases and application services
│   ├── domain/               # Domain entities, value objects, services
│   ├── infrastructure/       # Database, external services
│   ├── presentation/         # Controllers, routes, middleware
│   └── server.ts            # Express server setup
├── test/                    # Test structure matching src/
├── docker-compose.yml       # Docker development environment
├── Dockerfile              # Production Docker image
├── jest.config.js          # Jest configuration
└── package.json            # Dependencies and scripts
```

**Options:**
- `-f, --force` - Force overwrite if directory exists
- `-t, --template <template>` - Template to use (default: `basic`)
- `--skip-git` - Skip git initialization
- `--skip-install` - Skip npm install

### Domain Commands

#### `generate:domain` / `g:domain`
Generate a complete domain with all DDD components.

```bash
express-ts-gen generate:domain <domain-name> [options]
```

**Options:**
- `-f, --force` - Force overwrite if domain exists
- `--skip-tests` - Skip generating test files
- `--skip-entity` - Skip generating default entity

**Generated Files:**
```
src/
├── domain/<domain-name>/
│   ├── entities/
│   │   └── <Domain>.entity.ts
│   ├── value-objects/
│   ├── repositories/
│   │   └── <Domain>Repository.interface.ts
│   └── services/
│       └── <Domain>DomainService.ts
├── application/<domain-name>/
│   ├── use-cases/
│   │   ├── Create<Domain>UseCase.ts
│   │   ├── Get<Domain>UseCase.ts
│   │   ├── Update<Domain>UseCase.ts
│   │   └── Delete<Domain>UseCase.ts
│   ├── services/
│   │   └── <Domain>ApplicationService.ts
│   └── dto/
│       └── <Domain>.dto.ts
├── infrastructure/<domain-name>/
│   └── repositories/
│       └── <Domain>Repository.ts
└── presentation/<domain-name>/
    ├── controllers/
    │   └── <Domain>Controller.ts
    └── routes/
        └── <domain>.routes.ts
```

#### `generate:entity` / `g:entity`
Generate domain entities with rich domain logic.

```bash
express-ts-gen generate:entity <domain-name> <entity-name> [options]
```

**Generated Files:**
- `src/domain/<domain-name>/entities/<Entity>.entity.ts`
- `test/domain/<domain-name>/entities/<Entity>.entity.test.ts`

#### `generate:use-case` / `g:use-case`
Generate application use cases following CQRS patterns.

```bash
express-ts-gen generate:use-case <domain-name> <use-case-name> [options]
```

**Generated Files:**
- `src/application/<domain-name>/use-cases/<UseCase>UseCase.ts`
- `test/application/<domain-name>/use-cases/<UseCase>UseCase.test.ts`

#### `generate:controller` / `g:controller`
Generate presentation layer controllers with Express.js integration.

```bash
express-ts-gen generate:controller <domain-name> [options]
```

**Generated Files:**
- `src/presentation/<domain-name>/controllers/<Domain>Controller.ts`
- `src/presentation/<domain-name>/routes/<domain>.routes.ts`
- `test/presentation/<domain-name>/controllers/<Domain>Controller.test.ts`

#### `generate:repository` / `g:repository`
Generate repository interfaces and implementations.

```bash
express-ts-gen generate:repository <domain-name> [options]
```

**Generated Files:**
- `src/domain/<domain-name>/repositories/<Domain>Repository.interface.ts`
- `src/infrastructure/<domain-name>/repositories/<Domain>Repository.ts`
- `test/infrastructure/<domain-name>/repositories/<Domain>Repository.test.ts`

#### `generate:service` / `g:service`
Generate domain services for complex business logic.

```bash
express-ts-gen generate:service <domain-name> [options]
```

**Generated Files:**
- `src/domain/<domain-name>/services/<Domain>DomainService.ts`
- `test/domain/<domain-name>/services/<Domain>DomainService.test.ts`

#### `generate:value-object` / `g:value-object`
Generate value objects for domain modeling.

```bash
express-ts-gen generate:value-object <domain-name> <vo-name> [options]
```

**Generated Files:**
- `src/domain/<domain-name>/value-objects/<ValueObject>.vo.ts`
- `test/domain/<domain-name>/value-objects/<ValueObject>.vo.test.ts`

#### `generate:presentation-http` / `g:presentation-http`
Generate complete HTTP presentation layer.

```bash
express-ts-gen generate:presentation-http <domain-name> [options]
```

**Generated Files:**
- Controllers, routes, DTOs, and middleware for HTTP APIs

#### `generate:mongodb:lazy` / `gen:mongo:lazy`
Generate MongoDB implementation with lazy loading patterns.

```bash
express-ts-gen generate:mongodb:lazy <entity-name> [options]
```

**Options:**
- `-c, --config <path>` - Path to configuration file (JSON)
- `-f, --fields <fields>` - Entity fields as JSON string
- `-t, --timestamps` - Include timestamps (createdAt, updatedAt) (default: true)
- `-v, --virtuals` - Generate virtual fields (default: false)
- `-i, --indexes` - Generate database indexes (default: false)
- `-m, --methods` - Generate instance methods (default: false)
- `-s, --statics` - Generate static methods (default: false)
- `--env-var <name>` - Environment variable name for MongoDB URI
- `--db-name <name>` - Database name

**Generated Files:**
- MongoDB-specific repository implementations
- Connection factories and database configurations
- Lazy loading patterns and optimizations

### Global Options

All commands support these global options:

- `-v, --verbose` - Enable verbose output
- `--debug` - Enable debug output  
- `-h, --help` - Display help information
- `-V, --version` - Display version number

## Examples

### Complete E-commerce API

```bash
# Create project
express-ts-gen new ecommerce-api
cd ecommerce-api

# Generate core domains
express-ts-gen generate:domain user
express-ts-gen generate:domain product  
express-ts-gen generate:domain order

# Generate additional entities
express-ts-gen generate:entity product category
express-ts-gen generate:entity order orderItem

# Generate custom use cases
express-ts-gen generate:use-case user resetPassword
express-ts-gen generate:use-case order calculateTotal

# Start development
npm run dev
```

### Microservice with MongoDB

```bash
# Create project
express-ts-gen new user-service
cd user-service

# Generate user domain
express-ts-gen generate:domain user

# Generate MongoDB lazy implementation with timestamps and indexes
express-ts-gen generate:mongodb:lazy user --timestamps --indexes

# Generate value objects
express-ts-gen generate:value-object user email
express-ts-gen generate:value-object user password

npm run dev
```

### API-only Backend

```bash
# Create API project
express-ts-gen new api-backend
cd api-backend

# Generate multiple domains
express-ts-gen generate:domain auth
express-ts-gen generate:domain profile
express-ts-gen generate:domain notification

# Generate presentation layer only
express-ts-gen generate:presentation-http auth
express-ts-gen generate:presentation-http profile

npm run dev
```

## Architecture

### Clean Architecture Layers

The generator follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│              🌐 Presentation                │  ← Controllers, Routes, Middleware
├─────────────────────────────────────────────┤
│              📋 Application                 │  ← Use Cases, Services, DTOs  
├─────────────────────────────────────────────┤
│               🏛️ Domain                     │  ← Entities, Value Objects, Services
├─────────────────────────────────────────────┤
│             🔧 Infrastructure               │  ← Repositories, Database, External APIs
└─────────────────────────────────────────────┘
```

### Domain-Driven Design (DDD)

Each domain is organized following DDD tactical patterns:

```
src/domain/user/
├── entities/
│   ├── User.entity.ts          # Domain Entity
│   └── UserProfile.entity.ts   # Aggregate
├── value-objects/
│   ├── Email.vo.ts             # Value Object
│   └── Password.vo.ts          # Value Object  
├── repositories/
│   └── UserRepository.interface.ts  # Repository Contract
├── services/
│   └── UserDomainService.ts    # Domain Service
└── events/
    ├── UserCreated.event.ts    # Domain Event
    └── UserUpdated.event.ts    # Domain Event
```

### Generated Project Structure

```
my-project/
├── 📁 src/
│   ├── 📁 application/         # Use Cases & Application Services
│   │   └── 📁 user/
│   │       ├── 📁 use-cases/   # CQRS Commands & Queries
│   │       ├── 📁 services/    # Application Services  
│   │       └── 📁 dto/         # Data Transfer Objects
│   ├── 📁 domain/              # Business Logic Core
│   │   └── 📁 user/
│   │       ├── 📁 entities/    # Domain Entities
│   │       ├── 📁 value-objects/ # Value Objects
│   │       ├── 📁 repositories/ # Repository Interfaces
│   │       ├── 📁 services/    # Domain Services
│   │       └── 📁 events/      # Domain Events
│   ├── 📁 infrastructure/      # External Concerns
│   │   └── 📁 user/
│   │       ├── 📁 repositories/ # Repository Implementations
│   │       ├── 📁 database/    # Database Configurations
│   │       └── 📁 external/    # External Service Adapters
│   ├── 📁 presentation/        # HTTP/API Layer
│   │   └── 📁 user/
│   │       ├── 📁 controllers/ # Express Controllers
│   │       ├── 📁 routes/      # Route Definitions
│   │       ├── 📁 middleware/  # Route Middleware
│   │       └── 📁 validators/  # Request Validators
│   └── 📄 server.ts           # Express Server Setup
├── 📁 test/                   # Test Structure (mirrors src/)
├── 📁 docs/                   # API Documentation
├── 🐳 docker-compose.yml      # Development Environment
├── 🐳 Dockerfile             # Production Image
├── 🧪 jest.config.js         # Testing Configuration
└── 📦 package.json           # Project Dependencies
```

## Configuration

### Project Configuration

Generated projects come with sensible defaults but can be customized:

**Package.json Scripts:**
```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

**TypeScript Configuration:**
Projects use strict TypeScript settings for better code quality and error catching.

**Jest Testing:**
Complete testing setup with domain, application, and presentation layer test examples.

### Environment Variables

Configure your generated project using environment variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration  
DATABASE_URL=mongodb://localhost:27017/myapp
DB_NAME=myapp

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# External Services
REDIS_URL=redis://localhost:6379
EMAIL_SERVICE_API_KEY=your-api-key
```

### MongoDB Field Configuration

When using `generate:mongodb:lazy`, you can specify entity fields:

```bash
# Simple fields
express-ts-gen generate:mongodb:lazy product --fields "[{'name':'title','type':'string','required':true},{'name':'price','type':'number','min':0}]"

# With validation
express-ts-gen generate:mongodb:lazy user --fields "[{'name':'email','type':'string','required':true,'unique':true},{'name':'age','type':'number','min':18,'max':120}]"
```

**Supported Field Types:**
- `string` - Text fields with optional length limits
- `number` - Numeric fields with min/max validation  
- `boolean` - True/false values
- `date` - Date/timestamp fields
- `array` - Array of values
- `object` - Nested objects

### Naming Conventions

The generator automatically handles different naming conventions:

```typescript
// Input: "user-profile" or "UserProfile" or "user_profile"
// Generates consistent names across all files:
{
  camelCase: "userProfile",      // Variables, methods
  pascalCase: "UserProfile",     // Classes, interfaces  
  kebabCase: "user-profile",     // URLs, file names
  snakeCase: "user_profile",     // Database columns
  pluralPascalCase: "UserProfiles" // Collections
}
```

## Project Structure Guide

### Understanding Generated Projects

When you create a new project with `express-ts-gen new my-project`, you get a well-structured TypeScript backend following Domain-Driven Design principles.

### Working with Domains

**Domains** represent business concepts in your application. Each domain contains:

```
src/domain/user/
├── entities/           # Core business objects
├── value-objects/      # Immutable domain values  
├── repositories/       # Data access contracts
├── services/          # Domain business logic
└── events/            # Domain events
```

### Building Your API

**1. Start with a Domain**
```bash
express-ts-gen generate:domain user
```
This creates the complete domain structure with entities, repositories, and services.

**2. Add Controllers**
```bash  
express-ts-gen generate:controller user
```
This creates HTTP endpoints and route handlers for your domain.

**3. Customize Entities**
```bash
express-ts-gen generate:entity user profile
express-ts-gen generate:value-object user email
```

**4. Add Use Cases**
```bash
express-ts-gen generate:use-case user resetPassword
express-ts-gen generate:use-case user updateProfile  
```

### Database Integration

**For MongoDB Projects:**
```bash
# Generate MongoDB-specific implementations
express-ts-gen generate:mongodb:lazy user --timestamps --indexes

# With custom fields
express-ts-gen generate:mongodb:lazy product --fields "[{'name':'title','type':'string','required':true},{'name':'price','type':'number','min':0}]"
```

### Working with Generated Code

**Entity Example:**
```typescript
// Generated: src/domain/user/entities/User.entity.ts
export class User {
  constructor(
    private readonly id: UserId,
    private readonly email: Email,
    private name: string
  ) {}

  changeName(newName: string): void {
    this.name = newName;
    // Domain events, validation, etc.
  }
}
```

**Controller Example:**
```typescript
// Generated: src/presentation/user/controllers/UserController.ts
export class UserController {
  async createUser(req: Request, res: Response): Promise<void> {
    const createUserUseCase = container.get(CreateUserUseCase);
    const result = await createUserUseCase.execute(req.body);
    res.status(201).json(result);
  }
}
```

## TypeScript Types & Interfaces

The generator creates comprehensive TypeScript definitions for type safety:

### Infrastructure Types
```typescript
// Generated: src/infrastructure/types.ts
export const TYPES = {
  // Domain Services
  UserDomainService: Symbol.for('UserDomainService'),
  
  // Application Services
  UserApplicationService: Symbol.for('UserApplicationService'),
  
  // Use Cases
  CreateUserUseCase: Symbol.for('CreateUserUseCase'),
  GetUserUseCase: Symbol.for('GetUserUseCase'),
  UpdateUserUseCase: Symbol.for('UpdateUserUseCase'),
  DeleteUserUseCase: Symbol.for('DeleteUserUseCase'),
  
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  
  // Infrastructure
  Database: Symbol.for('Database'),
  EventBus: Symbol.for('EventBus'),
  Cache: Symbol.for('Cache'),
  Logger: Symbol.for('Logger'),
  
  // Controllers
  UserController: Symbol.for('UserController')
};

// Interface definitions for infrastructure services
export interface ILogger {
  info(message: string, meta?: any): void;
  error(message: string, error?: Error): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export interface IEventBus {
  publish(event: any): Promise<void>;
  subscribe(eventType: string, handler: (event: any) => Promise<void>): void;
}

export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}
```

### Repository Implementation Pattern
```typescript
// Generated: src/infrastructure/repositories/user.repository.ts
import { injectable } from 'inversify';
import { IUserRepository } from '../../domain/user/repositories/user.repository.interface';
import { User } from '../../domain/user/entities/user.entity';

@injectable()
export class UserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async update(user: User): Promise<void> {
    if (this.users.has(user.id)) {
      this.users.set(user.id, user);
    } else {
      throw new Error('User not found');
    }
  }

  async delete(id: string): Promise<void> {
    if (!this.users.delete(id)) {
      throw new Error('User not found');
    }
  }
}
```

## Dependency Injection Container

The generator includes Inversify-based dependency injection for clean architecture:

### Container Configuration
```typescript
// Generated: src/infrastructure/container.ts
import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES, ILogger, IEventBus, ICache } from './types';

// Domain
import { UserDomainService } from '../domain/user/services/user-domain.service';

// Application
import { UserApplicationService } from '../application/services/user-application.service';
import { CreateUserUseCase } from '../application/use-cases/user/create-user.use-case';
import { GetUserUseCase } from '../application/use-cases/user/get-user.use-case';

// Infrastructure
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { IUserRepository } from '../domain/user/repositories/user.repository.interface';
import { WinstonLogger } from '../infrastructure/logger/winston.logger';

// Presentation
import { UserController } from '../presentation/http/controllers/user.controller';

const container = new Container();

// Infrastructure Services
container.bind<ILogger>(TYPES.Logger).to(WinstonLogger).inSingletonScope();
container.bind<IEventBus>(TYPES.EventBus).to(InMemoryEventBus).inSingletonScope();
container.bind<ICache>(TYPES.Cache).to(InMemoryCache).inSingletonScope();

// Repositories
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);

// Domain Services
container.bind<UserDomainService>(TYPES.UserDomainService).to(UserDomainService);

// Application Services
container.bind<UserApplicationService>(TYPES.UserApplicationService).to(UserApplicationService);

// Use Cases
container.bind<CreateUserUseCase>(TYPES.CreateUserUseCase).to(CreateUserUseCase);
container.bind<GetUserUseCase>(TYPES.GetUserUseCase).to(GetUserUseCase);

// Controllers
container.bind<UserController>(TYPES.UserController).to(UserController);

export { container };
```

### Using Dependency Injection in Controllers
```typescript
// Generated: src/presentation/http/controllers/user.controller.ts
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../../infrastructure/types';
import { UserApplicationService } from '../../../application/services/user-application.service';

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.UserApplicationService) 
    private userApplicationService: UserApplicationService
  ) {}

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const createUserDto = req.body;
      const user = await this.userApplicationService.createUser({
        name: createUserDto.name
      });

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
```

## Routing System

The generator creates a modular routing system with automatic route registration:

### Route Registry Pattern
```typescript
// Generated: src/presentation/http/route-registry.ts
import { Router } from 'express';

export interface RouteConfig {
  path: string;
  router: Router;
  name: string;
  description?: string;
}

export class RouteRegistry {
  private static routes: RouteConfig[] = [];

  static register(config: RouteConfig): void {
    // Check if route already exists
    const existingIndex = this.routes.findIndex(route => route.path === config.path);
    
    if (existingIndex >= 0) {
      // Update existing route
      this.routes[existingIndex] = config;
      console.log(`🔄 Updated route: ${config.path} (${config.name})`);
    } else {
      // Add new route
      this.routes.push(config);
      console.log(`➕ Registered route: ${config.path} (${config.name})`);
    }
  }

  static getRoutes(): RouteConfig[] {
    return [...this.routes];
  }

  static unregister(path: string): boolean {
    const index = this.routes.findIndex(route => route.path === path);
    if (index >= 0) {
      this.routes.splice(index, 1);
      return true;
    }
    return false;
  }
}
```

### Express App Configuration
```typescript
// Generated: src/presentation/http/app.ts
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { container } from '../../infrastructure/container';
import { TYPES, ILogger } from '../../infrastructure/types';
import { RouteRegistry } from './route-registry';
import { errorHandler } from './middleware/error-handler.middleware';

const app = express();
const logger = container.get<ILogger>(TYPES.Logger);

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// API Routes - Auto-registered from RouteRegistry
const routes = RouteRegistry.getRoutes();
routes.forEach(route => {
  app.use('/api', route.router);  // Note: routes are prefixed with /api
  logger.info(`Registered route: /api${route.path}`);
});

// Error handling middleware (must be last)
app.use(errorHandler);

export { app };
```

### Domain-Specific Routes
When you generate a domain, routes are automatically created and registered:

```typescript
// Generated: src/presentation/http/routes/user.routes.ts
import { Router } from 'express';
import { container } from '../../../infrastructure/container';
import { TYPES } from '../../../infrastructure/types';
import { UserController } from '../controllers/user.controller';
import { validationMiddleware } from '../middleware/validation.middleware';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

const router = Router();
const userController = container.get<UserController>(TYPES.UserController);

// Routes
router.post('/users', 
  validationMiddleware(CreateUserDto),
  userController.createUser
);

router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', 
  validationMiddleware(UpdateUserDto),
  userController.updateUser
);
router.delete('/users/:id', userController.deleteUser);

export default router;
```

### Route Registration
Routes are registered through a central registry:

```typescript
// Generated: src/presentation/http/routes/index.ts
import { RouteRegistry } from '../route-registry';
import userRoutes from './user.routes';

// Register User routes
RouteRegistry.register({
  path: '/users',
  router: userRoutes,
  name: 'User Routes',
  description: 'User management endpoints'
});

export { RouteRegistry };
```

## API Documentation

### Consistent Response Format
Generated controllers follow a consistent API response pattern:

```typescript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}

// Error Response  
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Generated API Endpoints
When you generate a domain, you automatically get RESTful endpoints:

```typescript
// User domain endpoints (example)
POST   /api/users           # Create new user
GET    /api/users           # Get all users
GET    /api/users/:id       # Get user by ID  
PUT    /api/users/:id       # Update user
DELETE /api/users/:id       # Delete user
```

### Route Registration
The generator uses automatic route registration, so new domains are immediately accessible:

```bash
# After generating a user domain
express-ts-gen generate:domain user

# Your API automatically includes:
# - Route registration in RouteRegistry
# - Controller with dependency injection
# - Consistent error handling
# - Request/response patterns
```

### Health Check Endpoint
Every generated project includes a health check:

```typescript
GET /health
Response: {
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "your-project-name"
}
```

### Root Endpoint
The root endpoint provides project information:

```typescript
GET /
Response: {
  "message": "Welcome to your-project-name!",
  "version": "1.0.0",
  "documentation": "/api-docs"
}
```

## Error Handling & Validation

The generator includes comprehensive error handling patterns:

### Domain Errors
```typescript
// Generated: src/domain/common/errors/DomainError.ts
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  
  constructor(message: string, public readonly field?: string) {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
}
```

### Global Error Handler
```typescript
// Generated: src/presentation/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../domain/common/errors/DomainError';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof DomainError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }

  // Unexpected errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
}
```

## Testing Framework

Generated projects include complete testing setup:

### Unit Tests
```typescript
// Generated: test/domain/user/entities/User.entity.test.ts
import { User } from '../../../../src/domain/user/entities/User.entity';
import { Email } from '../../../../src/domain/user/value-objects/Email.vo';

describe('User Entity', () => {
  it('should create a user with valid data', () => {
    const email = Email.create('john@example.com');
    const user = new User('123', email, 'John Doe');
    
    expect(user.getId()).toBe('123');
    expect(user.getEmail().getValue()).toBe('john@example.com');
    expect(user.getName()).toBe('John Doe');
  });

  it('should change user name', () => {
    const email = Email.create('john@example.com');
    const user = new User('123', email, 'John Doe');
    
    user.changeName('Jane Doe');
    
    expect(user.getName()).toBe('Jane Doe');
  });
});
```

### Integration Tests
```typescript
// Generated: test/presentation/user/controllers/UserController.test.ts
import request from 'supertest';
import { app } from '../../../../src/server';

describe('UserController', () => {
  it('should create a user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(userData.email);
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests  
npm run test:integration
```

### Environment Setup

Generated projects include environment configuration:

```env
# Server
PORT=3000
NODE_ENV=development

# Database  
DATABASE_URL=mongodb://localhost:27017/myapp
DB_NAME=myapp

# Security
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## API Reference

### Generated API Endpoints

When you generate a domain, you get these RESTful endpoints:

```typescript
// User domain example
GET    /api/users           # Get all users
GET    /api/users/:id       # Get user by ID  
POST   /api/users           # Create new user
PUT    /api/users/:id       # Update user
DELETE /api/users/:id       # Delete user

// With query parameters
GET    /api/users?page=1&limit=10&sort=createdAt:desc
GET    /api/users?search=john&status=active
```

### Response Format

All APIs follow consistent response format:

```typescript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}

// Error Response  
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR", 
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Troubleshooting

### Common Issues

**Command not found: express-ts-gen**
```bash
# Make sure it's installed globally
npm install -g express-ts-backend-generator

# Or use npx
npx express-ts-backend-generator --version
```

**Permission denied on Windows**
```bash
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Template generation fails**
```bash
# Enable debug mode for detailed logs
express-ts-gen generate:domain user --debug
```

**Port already in use**
```bash
# Change port in .env file
PORT=3001

# Or kill process using port
npx kill-port 3000
```

## Community & Support

### Getting Help

**📚 Documentation Issues**
Found unclear documentation or examples that don't work? Let us know!

**🐛 Bug Reports**  
Encountered a bug? Please include:
- Command you ran
- Expected vs actual behavior  
- Error messages
- Operating system

**💡 Feature Requests**
Have ideas for new generators or improvements? We'd love to hear them!

**🤝 Template Contributions**
Share your custom templates and configurations with the community.

### Feedback

Your feedback helps improve the tool for everyone:

- ⭐ **Star the repository** if you find it useful
- 🐦 **Share your projects** built with the generator
- 📝 **Write about your experience** using the tool
- 💬 **Join discussions** about DDD and clean architecture

### Best Practices

**Project Organization:**
- Keep domains focused and cohesive
- Use value objects for domain concepts
- Separate business logic from infrastructure
- Write tests for your domain logic

**Generated Code:**
- Customize generated templates to fit your needs  
- Follow the established patterns in generated code
- Keep your domain layer pure (no external dependencies)
- Use dependency injection for cross-cutting concerns

## License

MIT © [Your Name](https://github.com/gelo7212)

## Support

- 🐛 [Report Bug](https://github.com/gelo7212/express-ts-backend-generator/issues)
- 💡 [Request Feature](https://github.com/gelo7212/express-ts-backend-generator/issues)
- 📧 [Email Support](mailto:your.email@domain.com)
- 💬 [Discord Community](https://discord.gg/your-community)

---

<div align="center">

**Made with ❤️ for the TypeScript community**

[⭐ Star on GitHub](https://github.com/gelo7212/express-ts-backend-generator) • 
[🐦 Follow on Twitter](https://twitter.com/your-handle) • 
[📝 Read the Blog](https://your-blog.com)

</div>

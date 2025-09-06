# Express TypeScript Backend Generator

A powerful CLI tool to scaffold Express TypeScript projects with Domain-Driven Design (DDD) architecture and Clean Architecture principles.

## 🎯 **When to Use This Project**

This generator is perfect for:
- **Real-time monitoring and alerts

## ⚠️ **When NOT to Use This Project**

### **❌ Not Suitable For:**

#### **Simple CRUD Applications**
- **Basic REST APIs** with minimal business logic
- **Prototype/Proof of Concepts** that won't evolve
- **Simple data entry forms** with basic validation
- **Static content APIs** without complex business rules

*Alternative: Use Express.js with simple MVC pattern*

#### **Microservices with Single Responsibility**
- **Single-purpose services** (e.g., just authentication)
- **Data transformation services** without business logic
- **Simple proxy/gateway services**
- **Basic file upload/storage services**

*Alternative: Use lightweight frameworks like Fastify or basic Express*

#### **Real-time Applications Requiring Extreme Performance**
- **High-frequency trading systems** (microsecond latency)
- **Game servers** requiring custom UDP protocols
- **IoT gateways** with custom binary protocols
- **Video streaming servers** with specialized codecs

*Alternative: Use Go, Rust, or C++ with custom networking*

#### **Small Personal Projects**
- **Learning projects** where you want to understand basics
- **Quick scripts** or automation tools
- **Simple webhooks** or API integrations
- **Personal blogs** or static sites

*Alternative: Use Next.js API routes, Netlify Functions, or simple Express*

### **🤔 Consider Alternatives When:**

#### **Team Constraints**
- **Junior-only teams** unfamiliar with DDD/Clean Architecture
- **Very small teams** (1-2 developers) with simple requirements
- **Short-term projects** (< 3 months) with no evolution plans
- **Legacy codebases** that can't adopt new patterns

#### **Technical Constraints**
- **Extreme performance requirements** (sub-millisecond response times)
- **Memory-constrained environments** (IoT devices, embedded systems)
- **Existing architecture** that conflicts with DDD patterns
- **Third-party integrations** that dictate architecture

#### **Business Constraints**
- **Rapid prototyping** where architecture doesn't matter
- **Proof of concepts** that will be thrown away
- **Marketing experiments** with unknown requirements
- **One-time data migration** scripts

## 🎯 **Decision Matrix**

| Project Characteristic | Use This Generator | Consider Alternatives |
|------------------------|-------------------|----------------------|
| **Business Logic Complexity** | Medium to High | Low |
| **Expected Lifespan** | > 6 months | < 3 months |
| **Team Size** | 3+ developers | 1-2 developers |
| **Performance Requirements** | Standard web app | Extreme performance |
| **Scalability Needs** | Will grow over time | Fixed scope |
| **Maintenance Window** | Long-term project | Short-term/disposable |
| **Team Experience** | Familiar with TypeScript/DDD | Beginner level |
| **Testing Requirements** | Comprehensive testing needed | Basic or no testing |

## Features# **🏢 Enterprise Applications**
- **E-commerce Platforms**: Product catalogs, order management, inventory systems
- **Financial Services**: Banking systems, payment processing, trading platforms
- **Healthcare Systems**: Patient management, medical records, appointment scheduling
- **SaaS Platforms**: Multi-tenant applications, subscription management
- **CRM/ERP Systems**: Customer relationship management, resource planning

### **🚀 Startup & MVP Development**
- **Rapid Prototyping**: Quickly validate business ideas with proper architecture
- **Scalable Foundation**: Start small but build with enterprise patterns
- **Team Onboarding**: Consistent codebase structure for new developers
- **Technical Debt Prevention**: Avoid architectural mistakes from day one

### **🎓 Learning & Education**
- **Clean Architecture**: Learn SOLID principles and DDD patterns
- **TypeScript Mastery**: Advanced patterns with dependency injection
- **Backend Development**: Industry-standard Express.js applications
- **Testing Practices**: Unit testing with Jest and proper mocking

### **💼 Professional Development**
- **Portfolio Projects**: Showcase enterprise-level architecture skills
- **Client Projects**: Deliver professional, maintainable solutions
- **Code Reviews**: Demonstrate knowledge of design patterns
- **Job Interviews**: Show understanding of modern backend architectures

## 🌟 **Real-World Project Examples**

### **E-commerce Platform**
```bash
# Create project structure
express-ts-backend-generator new shopify-clone

# Generate core domains
express-ts-backend-generator g-d product
express-ts-backend-generator g-d order
express-ts-backend-generator g-d user
express-ts-backend-generator g-d inventory
express-ts-backend-generator g-d payment

# Add business-specific use cases
express-ts-backend-generator g-uc product calculate-discount
express-ts-backend-generator g-uc order process-checkout
express-ts-backend-generator g-uc inventory check-availability
```

### **SaaS Subscription Platform**
```bash
# Multi-tenant SaaS platform
express-ts-backend-generator new saas-platform

# Core business domains
express-ts-backend-generator g-d tenant
express-ts-backend-generator g-d subscription
express-ts-backend-generator g-d billing
express-ts-backend-generator g-d feature

# Advanced use cases
express-ts-backend-generator g-uc subscription calculate-prorated-amount
express-ts-backend-generator g-uc billing generate-invoice
express-ts-backend-generator g-uc tenant manage-feature-flags
```

### **Healthcare Management System**
```bash
# Medical platform
express-ts-backend-generator new healthcare-system

# Healthcare domains
express-ts-backend-generator g-d patient
express-ts-backend-generator g-d appointment
express-ts-backend-generator g-d medical-record
express-ts-backend-generator g-d doctor
express-ts-backend-generator g-d prescription

# Medical-specific use cases
express-ts-backend-generator g-uc appointment schedule-recurring
express-ts-backend-generator g-uc prescription check-drug-interactions
```

### **Financial Trading Platform**
```bash
# Trading system
express-ts-backend-generator new trading-platform

# Financial domains
express-ts-backend-generator g-d portfolio
express-ts-backend-generator g-d trade
express-ts-backend-generator g-d market-data
express-ts-backend-generator g-d risk-management

# Trading-specific logic
express-ts-backend-generator g-uc trade execute-market-order
express-ts-backend-generator g-uc portfolio calculate-risk-metrics
express-ts-backend-generator g-uc risk-management validate-trade-limits
```

## 🏗️ **Architecture Benefits**

### **Why Use This Instead of Basic Express Setup?**

| Basic Express | This Generator |
|---------------|----------------|
| ❌ No structure | ✅ Clean Architecture layers |
| ❌ Tight coupling | ✅ Dependency injection with Inversify |
| ❌ Mixed concerns | ✅ Separation of business logic |
| ❌ Hard to test | ✅ Built-in testing patterns |
| ❌ Scalability issues | ✅ Domain-driven design |
| ❌ No standards | ✅ Enterprise patterns & conventions |

### **Technical Advantages**
- **🧪 Testability**: Every component is mockable and testable
- **🔧 Maintainability**: Clear separation of concerns
- **📈 Scalability**: Modular architecture grows with your business
- **🤝 Team Collaboration**: Consistent patterns across teams
- **🚀 Development Speed**: Generate complete features in seconds
- **🛡️ Type Safety**: Full TypeScript support with strict typing

## 👥 **Perfect For These Teams**

### **🏢 Enterprise Development Teams**
- **Large Organizations**: Need consistent architecture across projects
- **Multiple Teams**: Require standardized patterns and conventions
- **Long-term Projects**: Building systems that need to scale and evolve
- **Compliance Requirements**: Need proper separation of concerns for auditing

### **🚀 Startup Development Teams**
- **MVP Development**: Quick validation with production-ready architecture
- **Growing Teams**: Onboard new developers with clear patterns
- **Limited Resources**: Maximize development speed without sacrificing quality
- **Investor Demos**: Showcase professional architecture to stakeholders

### **👨‍💻 Individual Developers**
- **Freelancers**: Deliver professional solutions to clients
- **Portfolio Building**: Demonstrate enterprise development skills
- **Learning Path**: Master advanced TypeScript and design patterns
- **Side Projects**: Build scalable applications from day one

### **🎓 Educational Institutions**
- **Computer Science Programs**: Teach modern backend architecture
- **Bootcamps**: Bridge gap between tutorials and real-world development
- **Corporate Training**: Upskill development teams
- **Code Reviews**: Establish quality standards and best practices

## 🌍 **Industry Applications**

### **💰 FinTech & Banking**
**Use Cases:**
- Payment processing systems
- Digital wallets and transfers
- Loan management platforms
- Investment portfolio tracking
- Cryptocurrency exchanges
- Risk assessment tools

**Why This Generator:**
- Strict type safety for financial calculations
- Clear audit trails through domain events
- Separation of business rules from infrastructure
- Comprehensive testing for regulatory compliance

### **🛒 E-commerce & Retail**
**Use Cases:**
- Online marketplaces
- Inventory management systems
- Order fulfillment platforms
- Customer loyalty programs
- Pricing engines
- Product recommendation systems

**Why This Generator:**
- Complex business rules in domain layer
- Scalable architecture for high traffic
- Integration-ready for third-party services
- Event-driven architecture for real-time updates

### **🏥 Healthcare & Medical**
**Use Cases:**
- Electronic health records (EHR)
- Telemedicine platforms
- Medical device integration
- Patient scheduling systems
- Prescription management
- Clinical trial management

**Why This Generator:**
- HIPAA compliance through proper data separation
- Complex business rules for medical protocols
- Integration with medical devices and systems
- Audit trails for regulatory requirements

### **🎓 Education & EdTech**
**Use Cases:**
- Learning management systems (LMS)
- Student information systems
- Online course platforms
- Assessment and grading systems
- Library management
- Research data platforms

**Why This Generator:**
- Multi-tenant architecture for institutions
- Complex user roles and permissions
- Gradebook calculations in domain layer
- Scalable for large student populations

### **🏢 SaaS & B2B Platforms**
**Use Cases:**
- CRM systems
- Project management tools
- HR management platforms
- Marketing automation
- Business intelligence dashboards
- API-first platforms

**Why This Generator:**
- Multi-tenant architecture built-in
- Feature flags and subscription management
- API-first design with clean interfaces
- Scalable for growing customer base

### **🎮 Gaming & Entertainment**
**Use Cases:**
- Game backend services
- Player progression systems
- Leaderboards and achievements
- In-game commerce
- Streaming platforms
- Content management systems

**Why This Generator:**
- High-performance architecture
- Real-time event processing
- Complex scoring algorithms in domain
- Scalable for millions of users

### **🏭 IoT & Manufacturing**
**Use Cases:**
- Device management platforms
- Sensor data processing
- Predictive maintenance systems
- Supply chain tracking
- Quality control systems
- Production monitoring

**Why This Generator:**
- Event-driven architecture for sensor data
- Complex business rules for manufacturing
- Integration with industrial systems
- Real-time monitoring and alerts

## Features

- 🚀 **Powerful CLI** - Intuitive commands for rapid development
- 🏗️ **DDD Architecture** - Complete Domain-Driven Design structure
- 🧹 **Clean Architecture** - Separation of concerns with proper layering
- 📦 **TypeScript** - Full TypeScr### 4. **Database Integration**
Update your repository implementations with actual database connections (MongoDB, PostgreSQL, etc.).

### 5. **Environment Configuration**
Update `src/config/config.ts` with any new environment variables your domain requires.

## 🔍 **Troubleshooting Guide**

### Common Issues and Solutions

#### Issue 1: Dependency Injection Errors
```bash
Error: No matching bindings found for serviceIdentifier: Symbol(ProductRepository)
```

**Root Cause:** Missing or incorrect dependency registration.

**Solution:**
1. Check `src/infrastructure/types.ts` - ensure symbol is defined
2. Check `src/infrastructure/container.ts` - ensure binding exists
3. Verify import paths are correct
4. Ensure `reflect-metadata` is imported in `app.ts`

#### Issue 2: Circular Dependency Detection
```bash
Error: Circular dependency detected: UserService -> UserRepository -> UserService
```

**Root Cause:** Improper dependency design violating Clean Architecture.

**Solution:**
1. Use interfaces instead of concrete classes in constructor injection
2. Follow dependency direction: Domain ← Application ← Infrastructure ← Presentation
3. Move shared logic to domain services

#### Issue 3: Route Not Found
```bash
Cannot GET /api/products - 404 Not Found
```

**Solutions:**
1. Check if routes are registered in `app.ts`:
   ```typescript
   app.use('/api/products', productRoutes);
   ```
2. Verify route file exports correctly:
   ```typescript
   export { productRoutes }; // or export default
   ```
3. Check controller registration in container.ts

#### Issue 4: TypeScript Compilation Errors
```bash
Property 'productRepository' does not exist on type 'CreateProductUseCase'
```

**Solutions:**
1. Ensure proper constructor parameter decoration:
   ```typescript
   constructor(
     @inject(TYPES.ProductRepository) private productRepository: IProductRepository
   ) {}
   ```
2. Verify interface imports are correct
3. Check tsconfig.json has proper decorator settings

### 🛠️ **Best Practices**

#### 1. **Dependency Management**
- Always use interfaces for dependency injection
- Register all dependencies in a single container configuration
- Use singleton scope for stateless services
- Use transient scope for stateful services

#### 2. **Error Handling**
```typescript
// Domain Layer - Use domain exceptions
export class InvalidProductPriceError extends DomainError {
  constructor(price: number) {
    super(`Invalid product price: ${price}. Price must be positive.`);
  }
}

// Application Layer - Handle domain exceptions
export class CreateProductUseCase {
  async execute(dto: CreateProductDto): Promise<ProductDto> {
    try {
      const product = new Product(dto.name, dto.price);
      return await this.productRepository.save(product);
    } catch (error) {
      if (error instanceof InvalidProductPriceError) {
        throw new ApplicationError(`Product creation failed: ${error.message}`);
      }
      throw error;
    }
  }
}

// Presentation Layer - Transform to HTTP responses
export class ProductController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createProductUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ApplicationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

#### 3. **Testing Strategy**
```typescript
// Unit Tests - Test in isolation
describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn()
    };
    useCase = new CreateProductUseCase(mockRepository);
  });

  it('should create product successfully', async () => {
    // Arrange
    const dto = { name: 'Test Product', price: 100 };
    const expectedProduct = new Product(dto.name, dto.price);
    mockRepository.save.mockResolvedValue(expectedProduct);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Product));
    expect(result).toEqual(expectedProduct);
  });
});
```

#### 4. **Performance Optimization**
- Use caching for frequently accessed data
- Implement pagination for large datasets
- Use database indexes for query optimization
- Consider CQRS pattern for read-heavy applications

#### 5. **Security Considerations**
```typescript
// Input validation middleware
export const validateCreateProduct = [
  body('name').isString().isLength({ min: 1, max: 100 }),
  body('price').isNumeric().isFloat({ min: 0.01 }),
  body('categoryId').isUUID(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Rate limiting
import rateLimit from 'express-rate-limit';

const createProductLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many product creation requests, please try again later.'
});
```

## Developmentport with proper typing
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

# Generate presentation HTTP layer (controllers, DTOs, routes)
express-ts-backend-generator generate-presentation-http product
express-ts-backend-generator g-p-http product
```

**⚠️ Important Note on HTTP Presentation Layer:**

The `generate-presentation-http` / `g-p-http` command is used when:
1. You have an existing domain without HTTP endpoints
2. You want to generate HTTP controllers separately from domain logic
3. You're adding REST API to an existing domain

**Requirements:**
- Domain must already exist (generated with `g-d` or individual components)
- You must manually register the controller in `container.ts` and routes in `app.ts`

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
| `generate-presentation-http <domain>` | `g-p-http` | Generate HTTP presentation layer | `express-ts-backend-generator g-p-http product` |

## Detailed Usage Patterns

### 🎯 **Complete Domain Generation Workflow**

#### Scenario 1: Generate Complete E-commerce Product Domain

```bash
# 1. Generate the complete product domain
express-ts-backend-generator g-d product

# This creates the full DDD structure:
# ✅ Domain entities, value objects, events
# ✅ Repository interfaces and implementations  
# ✅ Domain services
# ✅ Application DTOs and CRUD use cases
# ✅ Infrastructure repositories
# ✅ HTTP presentation layer (controllers, DTOs, routes)
# ✅ Unit tests
```

**Generated Architecture:**
```
src/
├── domain/product/
│   ├── entities/product.entity.ts
│   ├── value-objects/
│   ├── events/product-created.event.ts
│   ├── repositories/product.repository.interface.ts
│   └── services/product-domain.service.ts
├── application/
│   ├── dto/product.dto.ts
│   ├── services/product-application.service.ts
│   └── use-cases/product/
│       ├── create-product.use-case.ts
│       ├── get-product.use-case.ts
│       ├── update-product.use-case.ts
│       └── delete-product.use-case.ts
├── infrastructure/repositories/
│   └── product.repository.ts
└── presentation/http/
    ├── controllers/product.controller.ts
    ├── dto/product.dto.ts
    └── routes/product.routes.ts
```

#### Scenario 2: Generate Individual Components

```bash
# Generate domain first
express-ts-backend-generator g-d order

# Add custom use cases for business logic
express-ts-backend-generator g-uc order calculate-total-price
express-ts-backend-generator g-uc order apply-discount
express-ts-backend-generator g-uc order process-payment

# Add additional entities to the domain
express-ts-backend-generator g-e order order-item
express-ts-backend-generator g-e order shipping-address

# Add value objects for business rules
express-ts-backend-generator g-vo order discount-code
express-ts-backend-generator g-vo order payment-method
```

#### Scenario 3: Separate HTTP Presentation Layer

When you need to generate HTTP endpoints for an existing domain:

```bash
# First ensure domain exists
express-ts-backend-generator g-d inventory

# Later, generate separate HTTP presentation layer
express-ts-backend-generator g-p-http inventory
```

**⚠️ Important:** When using separate HTTP generation, you must manually:
1. Update `types.ts` with controller symbols
2. Register controller in `container.ts`
3. Import and register routes in `app.ts`

### 🏗️ **Architecture Patterns**

#### Clean Architecture Layers

```typescript
// 📁 Domain Layer (Business Rules)
export class Product extends BaseEntity {
  constructor(
    private name: string,
    private price: Money,
    private category: Category
  ) {
    super();
    this.validateBusinessRules();
  }
}

// 📁 Application Layer (Use Cases)
@injectable()
export class CreateProductUseCase {
  async execute(dto: CreateProductDto): Promise<ProductDto> {
    // Orchestrate domain objects
    const product = new Product(dto.name, dto.price, dto.category);
    return await this.productRepository.save(product);
  }
}

// 📁 Infrastructure Layer (External Concerns)
@injectable()
export class ProductRepository implements IProductRepository {
  async save(product: Product): Promise<Product> {
    // Database implementation
  }
}

// 📁 Presentation Layer (HTTP Interface)
@injectable()
export class ProductController {
  async create(req: Request, res: Response): Promise<void> {
    const result = await this.createProductUseCase.execute(req.body);
    res.status(201).json(result);
  }
}
```

#### Dependency Injection Flow

```typescript
// 1. Define contracts in types.ts
export const TYPES = {
  ProductRepository: Symbol.for('ProductRepository'),
  CreateProductUseCase: Symbol.for('CreateProductUseCase')
};

// 2. Register implementations in container.ts
container.bind<IProductRepository>(TYPES.ProductRepository).to(ProductRepository);
container.bind<CreateProductUseCase>(TYPES.CreateProductUseCase).to(CreateProductUseCase);

// 3. Inject dependencies in use cases
@injectable()
export class CreateProductUseCase {
  constructor(
    @inject(TYPES.ProductRepository) private productRepository: IProductRepository,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}
}
```

### 🧪 **Testing Strategy**

The generator creates comprehensive test suites:

```typescript
// Generated unit test structure
describe('Product Entity', () => {
  it('should create valid product with business rules', () => {
    // Test domain logic
  });
  
  it('should throw error for invalid price', () => {
    // Test business rule validation
  });
});

describe('CreateProductUseCase', () => {
  it('should create product successfully', () => {
    // Test application logic with mocks
  });
});
```

### 🔧 **Customization Guidelines**

#### Adding Custom Business Logic

```bash
# 1. Generate base domain
express-ts-backend-generator g-d subscription

# 2. Add custom use cases
express-ts-backend-generator g-uc subscription check-renewal-eligibility
express-ts-backend-generator g-uc subscription calculate-prorated-amount

# 3. Add domain-specific value objects
express-ts-backend-generator g-vo subscription billing-cycle
express-ts-backend-generator g-vo subscription subscription-tier
```

#### Integration with External Services

```typescript
// Add to types.ts
export interface IPaymentService {
  processPayment(amount: Money, method: PaymentMethod): Promise<PaymentResult>;
}

// Register in container.ts
container.bind<IPaymentService>(TYPES.PaymentService).to(StripePaymentService);

// Inject in use cases
@injectable()
export class ProcessOrderUseCase {
  constructor(
    @inject(TYPES.PaymentService) private paymentService: IPaymentService
  ) {}
}
```

### ⚡ **Performance Considerations**

#### Repository Pattern with Caching

```typescript
@injectable()
export class CachedProductRepository implements IProductRepository {
  constructor(
    @inject(TYPES.ProductRepository) private baseRepository: IProductRepository,
    @inject(TYPES.Cache) private cache: ICache
  ) {}

  async findById(id: string): Promise<Product | null> {
    const cached = await this.cache.get<Product>(`product:${id}`);
    if (cached) return cached;
    
    const product = await this.baseRepository.findById(id);
    if (product) {
      await this.cache.set(`product:${id}`, product, 3600);
    }
    return product;
  }
}
```

### 🚨 **Common Pitfalls & Solutions**

#### 1. **Forgotten Dependency Registration**
```bash
Error: No matching bindings found for serviceIdentifier: Symbol(ProductService)
```
**Solution:** Always update `types.ts` and `container.ts` after generation.

#### 2. **Circular Dependencies**
```bash
Error: Circular dependency detected
```
**Solution:** Use interfaces and proper layering (Domain → Application → Infrastructure → Presentation).

#### 3. **Missing Route Registration**
```bash
Error: Cannot GET /api/products
```
**Solution:** Import and register routes in `app.ts`.

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

### 1. **Dependency Injection Setup** (Critical)

After generating any new domain or components, you **MUST** update the dependency injection configuration:

#### Update `src/infrastructure/types.ts`
Add new type symbols for your generated components:

```typescript
export const TYPES = {
  // Existing types...
  
  // Add new domain symbols
  ProductDomainService: Symbol.for('ProductDomainService'),
  ProductApplicationService: Symbol.for('ProductApplicationService'),
  
  // Add new use case symbols
  CreateProductUseCase: Symbol.for('CreateProductUseCase'),
  GetProductUseCase: Symbol.for('GetProductUseCase'),
  UpdateProductUseCase: Symbol.for('UpdateProductUseCase'),
  DeleteProductUseCase: Symbol.for('DeleteProductUseCase'),
  
  // Add new repository symbol
  ProductRepository: Symbol.for('ProductRepository'),
  
  // Add new controller symbol
  ProductController: Symbol.for('ProductController')
};
```

#### Update `src/infrastructure/container.ts`
Register all new dependencies in the IoC container:

```typescript
// Import new components
import { ProductDomainService } from '../domain/product/services/product-domain.service';
import { ProductApplicationService } from '../application/services/product-application.service';
import { CreateProductUseCase } from '../application/use-cases/product/create-product.use-case';
import { GetProductUseCase } from '../application/use-cases/product/get-product.use-case';
import { UpdateProductUseCase } from '../application/use-cases/product/update-product.use-case';
import { DeleteProductUseCase } from '../application/use-cases/product/delete-product.use-case';
import { ProductRepository } from '../infrastructure/repositories/product.repository';
import { IProductRepository } from '../domain/product/repositories/product.repository.interface';
import { ProductController } from '../presentation/http/controllers/product.controller';

// Register in container
container.bind<IProductRepository>(TYPES.ProductRepository).to(ProductRepository);
container.bind<ProductDomainService>(TYPES.ProductDomainService).to(ProductDomainService);
container.bind<ProductApplicationService>(TYPES.ProductApplicationService).to(ProductApplicationService);
container.bind<CreateProductUseCase>(TYPES.CreateProductUseCase).to(CreateProductUseCase);
container.bind<GetProductUseCase>(TYPES.GetProductUseCase).to(GetProductUseCase);
container.bind<UpdateProductUseCase>(TYPES.UpdateProductUseCase).to(UpdateProductUseCase);
container.bind<DeleteProductUseCase>(TYPES.DeleteProductUseCase).to(DeleteProductUseCase);
container.bind<ProductController>(TYPES.ProductController).to(ProductController);
```

### 2. **Route Registration** (When using separate HTTP presentation)

If you generated HTTP presentation separately, add routes to `src/app.ts`:

```typescript
import { productRoutes } from './presentation/http/routes/product.routes';
app.use('/api/products', productRoutes);
```

### 3. **Database Integration**
Update your repository implementations with actual database connections (MongoDB, PostgreSQL, etc.).

### 4. **Environment Configuration**
Update `src/config/config.ts` with any new environment variables your domain requires.

## Development

- Build the CLI: `npm run build`
- Test locally: `npm run dev -- new test-project`

## 📚 **Quick Reference**

### Command Patterns
```bash
# Full domain generation (recommended for new domains)
express-ts-backend-generator g-d <domain-name>

# Individual component generation
express-ts-backend-generator g-e <domain> <entity-name>     # Entity
express-ts-backend-generator g-vo <domain> <vo-name>       # Value Object  
express-ts-backend-generator g-uc <domain> <uc-name>       # Use Case
express-ts-backend-generator g-c <domain>                  # Controller
express-ts-backend-generator g-r <domain>                  # Repository
express-ts-backend-generator g-s <domain>                  # Domain Service

# HTTP layer for existing domain
express-ts-backend-generator g-p-http <domain>             # HTTP Presentation
```

### Post-Generation Checklist
- [ ] Update `src/infrastructure/types.ts` with new symbols
- [ ] Register dependencies in `src/infrastructure/container.ts`
- [ ] Add routes to `src/app.ts` (for separate HTTP generation)
- [ ] Run `npm run build` to check TypeScript compilation
- [ ] Run tests with `npm test`
- [ ] Update database schemas if using entities
- [ ] Configure environment variables in `.env`

### File Structure Quick Guide
```
src/
├── domain/<domain>/              # Business logic & rules
│   ├── entities/                 # Domain entities
│   ├── value-objects/           # Value objects
│   ├── events/                  # Domain events
│   ├── repositories/            # Repository interfaces
│   └── services/                # Domain services
├── application/                 # Use cases & DTOs
│   ├── dto/                     # Data transfer objects
│   ├── services/                # Application services
│   └── use-cases/<domain>/      # Use case implementations
├── infrastructure/             # External concerns
│   ├── repositories/           # Repository implementations
│   ├── cache/                  # Caching implementations
│   ├── logger/                 # Logging implementations
│   ├── messaging/              # Event bus implementations
│   ├── container.ts            # DI container setup
│   └── types.ts               # DI type definitions
└── presentation/http/          # HTTP interface
    ├── controllers/            # HTTP controllers
    ├── dto/                   # HTTP DTOs
    ├── middleware/            # HTTP middleware
    └── routes/               # Route definitions
```

## License

MIT License

```sh
npm publish --access public
```

# Hexagonal Architecture in NestJS: Stop Mocking Prisma and Start Designing for Change

*Your NestJS service works. The tests pass. But then someone says: "We need to swap Postgres for an external API." And suddenly, you're rewriting everything.*

Sound familiar? This is what happens when your business logic is welded to your database driver. In this article, I'll show you how to break that coupling using **Hexagonal Architecture** (Ports & Adapters) in NestJS -- with a real e-commerce codebase you can clone and run.

**Repository**: [github.com/sandylib/nest-starter-kit](https://github.com/sandylib/nest-starter-kit)

- **`main` branch** -- The starting point: Clean Architecture with services tightly coupled to Prisma.
- **`feat/hexagonal-architecture` branch** -- The refactored version using Ports & Adapters.

---

## The Starting Point: A Clean-ish NestJS Starter Kit

I built [nest-starter-kit](https://github.com/sandylib/nest-starter-kit) as a practical starting template for NestJS projects. It comes with:

- **NestJS 11** with Clean Architecture folder structure (core, application, presentation, infrastructure, shared)
- **Prisma 7** with PostgreSQL for typed database access
- **Swagger** auto-generated API documentation
- **Structured logging** via Winston with environment-aware transports
- **JWT authentication** middleware with a `@CurrentUser()` decorator
- **Global exception filters** for database and external API errors
- **A shopping cart example domain** -- Products (CRUD), Carts, Cart Items, and health monitoring

The `main` branch has all of this working. The architecture looks solid. Services live in `application/use-cases/`, controllers in `presentation/web/`, Prisma in `infrastructure/adapters/`. Tests pass. Coverage is at 90%.

But there's a problem hiding in plain sight.

---

## The Problem: Services That Know Too Much

Here's a typical NestJS service from the starter kit. Looks clean, right?

```typescript
// application/use-cases/products.service.ts
@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaAdapter,
    private readonly logger: LoggerProvider,
  ) {}

  async findAll() {
    this.logger.info("Fetching all products", LOGGING.CATEGORIES.API);
    return this.prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(BUSINESS_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return product;
  }

  // ... create, update, remove all call this.prisma directly
}
```

What's wrong with it?

1. **The service imports infrastructure.** `PrismaAdapter` comes from `../../infrastructure/adapters/prisma.adapter`. Your business logic now depends on a specific ORM.

2. **Tests mock ORM internals.** To test `findAll`, you mock `prisma.product.findMany`. To test `addItem` in the cart service, you mock `prisma.product.findUnique`, `prisma.cartItem.findUnique`, `prisma.cartItem.create`, and `prisma.cartItem.update`. Your test setup knows the exact Prisma method signatures:

```typescript
// Test setup -- you're testing Prisma's API, not your business logic
const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
```

3. **Changing the data source means rewriting services.** If tomorrow your products come from a REST API instead of Postgres, you're rewriting every service method plus all their tests.

The application layer (your business rules) is handcuffed to the infrastructure layer (your database). This is the exact problem [Alistair Cockburn described in his original 2005 Hexagonal Architecture paper](https://alistair.cockburn.us/hexagonal-architecture):

> *"Both the user-side and the server-side problems actually are caused by the same error in design and programming -- the entanglement between the business logic and the interaction with external entities."*

---

## Hexagonal Architecture in 60 Seconds

The core idea is simple: **your application talks to the outside world through ports, not through concrete implementations.**

```
                    ┌───────────────────────────────────┐
                    │                                   │
   HTTP Request ──▶ │        APPLICATION CORE           │
                    │                                   │
   CLI Command ──▶  │   Use Cases / Business Logic      │
                    │                                   │
   Message Queue ─▶ │   Depends ONLY on Port            │
                    │   Interfaces (abstractions)        │
                    │                                   │
                    └──────┬────────────┬───────────────┘
                           │            │
                     ┌─────▼──┐    ┌────▼─────┐
                     │ Port A │    │  Port B  │
                     │(iface) │    │ (iface)  │
                     └─────┬──┘    └────┬─────┘
                           │            │
                    ┌──────▼──┐    ┌────▼──────┐
                    │Postgres │    │ REST API  │
                    │ Adapter │    │  Adapter  │
                    └─────────┘    └───────────┘
```

- **Port** = A TypeScript interface that defines *what* the application needs. "I need to find products." It doesn't care *how*.
- **Adapter** = A concrete class that implements the port using a specific technology. "Here's how to find products using Prisma." or "Here's how to find products via an HTTP API."
- **NestJS Module** = The wiring layer. It binds a port (interface) to an adapter (implementation) using dependency injection.

The application core never imports Prisma, Axios, or any infrastructure class. It only depends on the port interface.

---

## Step 1: Define the Port

A port is a pure TypeScript interface that lives in the **application layer**, not the infrastructure layer. It describes *what data access the business logic needs*, without saying *how*.

```typescript
// src/application/ports/product.repository.ts
import { Product } from "../../core/entities/product.entity";

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(data: {
    name: string;
    description?: string;
    price: number;
    stock?: number;
  }): Promise<Product>;
  update(
    id: string,
    data: { name?: string; description?: string; price?: number; stock?: number },
  ): Promise<Product>;
  remove(id: string): Promise<Product>;
}
```

Notice: no Prisma types, no HTTP types, no ORM details. Just domain entities (`Product`) and plain data shapes.

**Why not use an abstract class?** In TypeScript, interfaces are erased at compile time -- they have zero runtime overhead. But NestJS's DI system needs a runtime token to look up providers. Abstract classes work as tokens, but they couple your port to a class hierarchy. Instead, we use `Symbol` tokens:

```typescript
// src/application/ports/injection-tokens.ts
export const PRODUCT_REPOSITORY = Symbol("ProductRepository");
export const CART_REPOSITORY = Symbol("CartRepository");
```

Symbols are unique, lightweight runtime identifiers. They let NestJS find the right implementation without your interface needing to be a class.

---

## Step 2: Extract the Adapter

Now move all the Prisma-specific code out of the service and into an adapter class in the **infrastructure layer**. The adapter implements the port interface:

```typescript
// src/infrastructure/repositories/product-prisma.repository.ts
@Injectable()
export class ProductPrismaRepository
  extends BaseRepository
  implements ProductRepository
{
  constructor(
    private readonly prisma: PrismaAdapter,
    logger: LoggerProvider,
  ) {
    super(logger);
  }

  async findAll(): Promise<Product[]> {
    return this.loggedOperation(
      "Fetching all products",
      LOGGING.CATEGORIES.API,
      {},
      async () => {
        const products = await this.prisma.product.findMany({
          orderBy: { createdAt: "desc" },
        });
        return products.map(this.toDomain);
      },
    );
  }

  async findById(id: string): Promise<Product | null> {
    return this.loggedOperation(
      "Fetching product",
      LOGGING.CATEGORIES.API,
      { id },
      async () => {
        const product = await this.prisma.product.findUnique({
          where: { id },
        });
        return product ? this.toDomain(product) : null;
      },
    );
  }

  // create, update, remove follow the same pattern...

  private toDomain(prismaProduct: any): Product {
    return {
      id: prismaProduct.id,
      name: prismaProduct.name,
      description: prismaProduct.description,
      price: Number(prismaProduct.price),
      stock: prismaProduct.stock,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
    };
  }
}
```

Two things to notice:

1. **The adapter owns the mapping.** The `toDomain` method translates from Prisma's types to your domain entity. This is the adapter's job -- translating between the outside world's format and your application's format.

2. **The adapter owns the logging.** The `loggedOperation` helper (from `BaseRepository`) wraps every call with timing, structured logging, and error logging. This boilerplate used to clutter every service method. Now it's in one place.

### The BaseRepository Helper

Every data-access adapter does the same thing: log before, call, log after, log errors. The `BaseRepository` abstract class eliminates this repetition:

```typescript
// src/infrastructure/repositories/base.repository.ts
export abstract class BaseRepository {
  constructor(protected readonly logger: LoggerProvider) {}

  protected async loggedOperation<T>(
    label: string,
    category: string,
    meta: Record<string, unknown>,
    fn: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();
    this.logger.info(label, category, meta);

    try {
      const result = await fn();
      this.logger.info(`Successfully ${label.toLowerCase()}`, category, {
        ...meta,
        responseTime: `${Date.now() - startTime}ms`,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to ${label.toLowerCase()}`,
        error as Error,
        category,
        { ...meta, responseTime: `${Date.now() - startTime}ms` },
      );
      throw error;
    }
  }
}
```

Every adapter method collapses from ~15 lines of boilerplate to ~5 lines of actual logic.

---

## Step 3: Refactor the Service

This is the payoff. Here's the before and after:

### BEFORE: Service depends on Prisma

```typescript
@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaAdapter,      // Infrastructure import
    private readonly logger: LoggerProvider,      // Infrastructure import
  ) {}

  async findAll() {
    this.logger.info("Fetching all products", LOGGING.CATEGORIES.API);
    return this.prisma.product.findMany({         // ORM-specific call
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    this.logger.info(`Fetching product ${id}`, LOGGING.CATEGORIES.API);
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(BUSINESS_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }
    return product;
  }
}
```

### AFTER: Service depends only on the port interface

```typescript
@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,  // Port interface
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(BUSINESS_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }
    return product;
  }
}
```

The service no longer imports anything from `infrastructure/`. It only knows about the port interface and domain entities. The logging, the Prisma calls, the type mapping -- all gone. What remains is **pure business logic**.

---

## Step 4: Wire It in the Module

NestJS modules are the wiring layer -- the place where you bind port tokens to adapter implementations:

```typescript
// src/infrastructure/modules/products.module.ts
@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    PrismaAdapter,
    { provide: PRODUCT_REPOSITORY, useClass: ProductPrismaRepository },
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
```

That `{ provide: PRODUCT_REPOSITORY, useClass: ProductPrismaRepository }` line is the entire adapter binding. Want to swap to a different data source? Change one line:

```typescript
// Swap from Prisma to an HTTP API adapter
{ provide: PRODUCT_REPOSITORY, useClass: ProductApiRepository },

// Or use an in-memory adapter for local development
{ provide: PRODUCT_REPOSITORY, useClass: InMemoryProductRepository },
```

No service code changes. No test rewrites.

---

## Step 5: Testing Gets Dramatically Simpler

This is where the pattern really pays for itself. Compare the test setup:

### BEFORE: Mocking Prisma internals

```typescript
beforeEach(async () => {
  const mockPrisma = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  const module = await Test.createTestingModule({
    providers: [
      ProductsService,
      { provide: PrismaAdapter, useValue: mockPrisma },
      { provide: LoggerProvider, useValue: mockLogger },
    ],
  }).compile();
});
```

### AFTER: Mocking the port interface

```typescript
beforeEach(async () => {
  const mockRepository: jest.Mocked<ProductRepository> = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const module = await Test.createTestingModule({
    providers: [
      ProductsService,
      { provide: PRODUCT_REPOSITORY, useValue: mockRepository },
    ],
  }).compile();
});
```

You're mocking a **business contract** (what the service needs), not **infrastructure details** (how Prisma structures its client). The mock matches the port interface one-to-one.

And the tests themselves become cleaner:

```typescript
// BEFORE: testing Prisma's API shape
expect(prisma.product.findMany).toHaveBeenCalledWith({
  orderBy: { createdAt: "desc" },
});

// AFTER: testing the repository contract
expect(productRepository.findAll).toHaveBeenCalledTimes(1);
```

The Prisma query details (`orderBy`, `where`, `include`) are now tested in the **adapter tests**, where they belong. The service tests focus purely on business logic.

---

## The Real Challenge: CartService with Business Rules

`ProductsService` is a simple CRUD pass-through. The real value of hexagonal architecture shows when you have **business logic mixed with data access**. Look at `CartsService.addItem`:

```typescript
async addItem(cartId: string, productId: string, quantity: number): Promise<CartItem> {
  // Business rule: cart must be active
  const cart = await this.findById(cartId);
  if (cart.status !== CARTS.STATUS.ACTIVE) {
    throw new BadRequestException(BUSINESS_ERROR_MESSAGES.CART_NOT_ACTIVE);
  }

  // Business rule: product must exist
  const product = await this.productRepository.findById(productId);
  if (!product) {
    throw new NotFoundException(BUSINESS_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
  }

  // Business rule: sufficient stock
  if (product.stock < quantity) {
    throw new BadRequestException(BUSINESS_ERROR_MESSAGES.INSUFFICIENT_STOCK);
  }

  // Business rule: upsert (update quantity if exists, create if new)
  const existingItem = await this.cartRepository.findCartItem(cartId, productId);
  if (existingItem) {
    return this.cartRepository.updateCartItemQuantity(
      existingItem.id,
      existingItem.quantity + quantity,
    );
  }

  return this.cartRepository.createCartItem(cartId, productId, quantity);
}
```

Every line is either a business rule or a call through a port interface. No Prisma. No `this.prisma.cartItem.findUnique({ where: { cartId_productId: { cartId, productId } } })`. The service reads like a description of the business process.

Notice that `CartsService` depends on **two** ports -- `CartRepository` and `ProductRepository`. The module wires both:

```typescript
@Module({
  controllers: [CartsController],
  providers: [
    CartsService,
    PrismaAdapter,
    { provide: CART_REPOSITORY, useClass: CartPrismaRepository },
    { provide: PRODUCT_REPOSITORY, useClass: ProductPrismaRepository },
  ],
  exports: [CartsService],
})
export class CartsModule {}
```

---

## Swapping Adapters: Where This Shines

Imagine your product catalog moves from a local database to an upstream REST API. You write one new adapter:

```typescript
@Injectable()
export class ProductApiRepository
  extends BaseRepository
  implements ProductRepository
{
  constructor(
    private readonly httpClient: HttpClient,
    logger: LoggerProvider,
  ) {
    super(logger);
  }

  async findAll(): Promise<Product[]> {
    return this.loggedOperation(
      "Fetching all products",
      LOGGING.CATEGORIES.API,
      {},
      async () => {
        const response = await this.httpClient.instance.get("/products");
        return response.data.map(this.toDomain);
      },
    );
  }

  // ... other methods hit the API instead of Prisma
}
```

Then change one line in the module:

```typescript
{ provide: PRODUCT_REPOSITORY, useClass: ProductApiRepository },
```

Zero changes to `ProductsService`. Zero changes to `CartsService`. Zero changes to their tests.

You can also create an **in-memory adapter** for fast isolated tests or local development without a database:

```typescript
@Injectable()
export class InMemoryProductRepository implements ProductRepository {
  private products: Product[] = [];

  async findAll(): Promise<Product[]> {
    return [...this.products];
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === id) ?? null;
  }

  async create(data: { name: string; price: number; stock?: number }): Promise<Product> {
    const product: Product = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      stock: data.stock ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(product);
    return product;
  }

  // ... update, remove operate on the in-memory array
}
```

Same port. Three different adapters. Each testable independently.

---

## Project Structure After Refactoring

```
src/
├── application/                         # Application layer
│   ├── ports/                           # ← NEW: Port interfaces + tokens
│   │   ├── injection-tokens.ts          #   Symbol tokens for NestJS DI
│   │   ├── product.repository.ts        #   interface ProductRepository
│   │   ├── cart.repository.ts           #   interface CartRepository
│   │   └── index.ts                     #   Barrel exports
│   └── use-cases/                       # Services (pure business logic)
│       ├── products.service.ts          #   Depends on ProductRepository port
│       ├── carts.service.ts             #   Depends on Cart + Product ports
│       └── __tests__/                   #   Mock ports, not Prisma
├── infrastructure/                      # Infrastructure layer
│   ├── repositories/                    # ← NEW: Adapter implementations
│   │   ├── base.repository.ts           #   Abstract base with loggedOperation()
│   │   ├── product-prisma.repository.ts #   ProductPrismaRepository
│   │   ├── cart-prisma.repository.ts    #   CartPrismaRepository
│   │   └── __tests__/                   #   Test adapters with mocked Prisma
│   ├── adapters/                        # HTTP client, Prisma client
│   ├── mappers/                         # Entity-DTO mappers
│   └── modules/                         # NestJS modules (wiring layer)
├── presentation/                        # Controllers, DTOs, decorators
├── core/                                # Domain entities
└── shared/                              # Constants, types, utilities
```

The key architectural constraint: **the `application/` folder never imports from `infrastructure/`**. The dependency arrow points inward. Infrastructure depends on the application (by implementing its ports), never the other way around.

---

## Trade-offs: When NOT to Use This

Hexagonal architecture is not free. Here's when the overhead isn't worth it:

- **Prototypes and MVPs.** If you're validating an idea and might throw the code away, the indirection adds cost with no benefit.
- **Simple CRUD with no business logic.** If your service is literally `return this.prisma.product.findMany()` with no validation, no orchestration, no rules -- the port interface is just a redundant copy of the service interface.
- **Single data source that will never change.** If you're 100% certain you'll always use Postgres via Prisma, the swappability benefit is theoretical.
- **Small teams, small codebases.** The pattern shines in larger codebases where multiple developers need clear boundaries and independently testable components.

The pattern pays for itself when:

- You have **business logic** (validation, orchestration, conditional flows) mixed with data access.
- You need **multiple adapters** (database, external API, cache, message queue).
- You want **fast, isolated tests** that don't mock ORM internals.
- Your team is **large enough** that clear architectural boundaries prevent accidental coupling.

---

## Conclusion

Hexagonal Architecture in NestJS comes down to three things:

1. **Define ports** as TypeScript interfaces with Symbol injection tokens in `application/ports/`.
2. **Implement adapters** as `@Injectable()` classes in `infrastructure/repositories/` that implement the port interfaces.
3. **Wire them** in NestJS modules with `{ provide: TOKEN, useClass: Adapter }`.

Your services become pure business logic. Your tests mock contracts, not ORMs. And when the infrastructure changes -- and it will -- you swap one adapter class in one module file.

The full implementation is in the [nest-starter-kit repository](https://github.com/sandylib/nest-starter-kit). To see the transformation:

```bash
# Clone the repo
git clone https://github.com/sandylib/nest-starter-kit.git
cd nest-starter-kit

# See the "before" -- tightly coupled services
git checkout main

# See the "after" -- Hexagonal Architecture with Ports & Adapters
git checkout feat/hexagonal-architecture

# Run the tests to see everything passes
npm install && npm test
```

Compare the two branches to see exactly what changed -- and more importantly, what *didn't* change (controllers, DTOs, entities, mappers all stayed the same).

---

## References

- [Hexagonal Architecture (Ports & Adapters) -- Alistair Cockburn, 2005](https://alistair.cockburn.us/hexagonal-architecture) -- The original paper that defined the pattern.
- [NestJS Custom Providers](https://docs.nestjs.com/fundamentals/custom-providers) -- How `useClass`, `useValue`, and injection tokens work in NestJS.
- [Dependency Inversion Principle -- Robert C. Martin](https://web.archive.org/web/20110714224327/http://www.objectmentor.com/resources/articles/dip.pdf) -- "High-level modules should not depend on low-level modules. Both should depend on abstractions."

# NestJS BFF Coding Standards

## Overview

This document defines the coding standards and architectural principles for NestJS BFF projects built from the starter kit. The project follows **Clean Architecture** principles to ensure maintainability, testability, and separation of concerns.

## Table of Contents

1. [Clean Architecture Structure](#clean-architecture-structure)
2. [Controller Standards](#controller-standards)
3. [Error Handling](#error-handling)
4. [Configuration Management](#configuration-management)
5. [Constants Organization](#constants-organization)
6. [Logging Standards](#logging-standards)
7. [HTTP Client Standards](#http-client-standards)
8. [API Documentation Standards](#api-documentation-standards)
9. [Naming Conventions](#naming-conventions)
10. [Function Standards](#function-standards)
11. [Build Pipeline](#build-pipeline)

---

## Clean Architecture Structure

### Directory Structure

```text
src/
├── core/                      # Domain layer
│   ├── entities/             # Domain entities (pure interfaces)
│   └── middleware/           # Auth, logging middleware
├── application/               # Application layer
│   └── use-cases/            # Service implementations
├── presentation/              # Presentation layer
│   └── web/
│       ├── controllers/      # API controllers
│       ├── decorators/       # Custom decorators
│       └── dto/              # Data transfer objects
├── infrastructure/            # Infrastructure layer
│   ├── adapters/             # HTTP clients, external services
│   ├── config/               # Configuration services
│   ├── filters/              # Exception filters
│   ├── logging/              # Logger setup
│   ├── mappers/              # Entity-DTO mappers
│   └── modules/              # NestJS modules
└── shared/                    # Cross-cutting concerns
    ├── constants/            # Application constants
    │   ├── domains/          # Domain-specific constants
    │   └── errors/           # Error message constants
    ├── errors/               # Shared error classes
    ├── testing/              # Test utilities
    └── types/                # Shared interfaces
```

### Layer Dependencies

```text
              ┌─────────────────────────────────────┐
              │         PRESENTATION                │
              │                                     │
              │  Controllers    Decorators          │
              │  Web Layer      DTOs                │
              └─────────────────┬───────────────────┘
                                │ depends on
                                ▼
              ┌─────────────────────────────────────┐
              │          APPLICATION                │
              │                                     │
              │  Use Cases      Errors              │
              │  Business Logic Exception Handling  │
              └─────────────────┬───────────────────┘
                                │ depends on
                                ▼
              ┌─────────────────────────────────────┐
              │         INFRASTRUCTURE              │
              │                                     │
              │  Adapters       Config              │
              │  HTTP Client    Modules             │
              └─────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────┐
    │                    SHARED                           │
    │                                                     │
    │  Constants          Types                           │
    │  Domain Constants   Interfaces                      │
    │                                                     │
    │  (Used by all layers above)                         │
    └─────────────────────────────────────────────────────┘
```

* **Domain**: Business entities and core domain logic
* **Application**: Use cases, business rules, and application-specific errors
* **Presentation**: HTTP controllers, decorators, and web layer concerns
* **Infrastructure**: External dependencies, adapters, configuration, and NestJS modules
* **Shared**: Common utilities, constants, and type definitions used across all layers

---

## Controller Standards

### Rules

1. **No Business Logic**: Controllers handle only HTTP concerns.
2. **Dependency Injection**: Use constructor injection for services.
3. **Constants Only**: No hardcoded strings or values.
4. **Consistent Decorators**: Apply `@ApiDatabaseDocumentation` or `@ApiDocumentation` to all endpoints.
5. **Async/Await**: Always use async/await for service calls.
6. **Single Responsibility**: One controller per domain/resource.

### Example

```typescript
@ApiTags(PRODUCTS.ROUTES.TAG)
@ApiBearerAuth()
@Controller(PRODUCTS.ROUTES.BASE)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: PRODUCTS.DOCS.LIST.OPERATION })
  @ApiDatabaseDocumentation()
  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productsService.findAll();
    return toProductDtos(products);
  }
}
```

---

## Error Handling

### Rules

1. **Custom Exceptions**: Define domain-specific exception classes.
2. **Preserve Context**: Avoid re-wrapping `HttpExceptions`.
3. **Meaningful Messages**: Provide clear, descriptive error messages.
4. **Proper Status Codes**: Use appropriate HTTP status codes.
5. **No Hardcoded Messages**: Use constants for all error messages.

### Error Constants Structure

```text
src/shared/constants/errors/
├── auth-errors.constants.ts       # AUTH_ERROR_MESSAGES
├── api-errors.constants.ts        # API_ERROR_MESSAGES
├── validation-errors.constants.ts # VALIDATION_ERROR_MESSAGES
├── business-errors.constants.ts   # BUSINESS_ERROR_MESSAGES
└── database-errors.constants.ts   # DATABASE_ERROR_MESSAGES
```

---

## Configuration Management

### Rules

1. **Single Source**: Centralise configuration in `AppConfigProvider`.
2. **Environment Variables**: All configuration comes from environment variables.
3. **Default Values**: Provide sensible defaults where possible.
4. **Type Safety**: Use interfaces to define configuration structure.
5. **Singleton**: `AppConfigProvider` must be application-scoped.

---

## Constants Organization

### Rules

1. **Domain Grouping**: Group constants by business domain.
2. **Nested Structure**: Use nested objects for logical organization.
3. **As Const**: Use `as const` for type safety.
4. **Descriptive Names**: Ensure constant names clearly describe their purpose.
5. **No Hardcoding**: Replace all string literals with constants.

---

## Logging Standards

### Rules

1. **Structured Logging**: Use JSON format with consistent metadata.
2. **Categorized Logs**: Use categories (http, auth, api, security, performance).
3. **Environment Aware**: Console for local, SumoLogic for deployed environments.
4. **Rich Context**: Include service name, version, region, response times.
5. **Error Details**: Always include stack traces and error context.

### LoggerProvider Usage

```typescript
constructor(private readonly logger: LoggerProvider) {}

this.logger.info('Operation completed', 'category', { metadata });
this.logger.error('Operation failed', error, 'category', { context });
this.logger.logHttpRequest(req, res, responseTime);
this.logger.logApiCall(url, method, statusCode, responseTime);
this.logger.logSecurityEvent('Unauthorized access', { userId, ip });
```

---

## HTTP Client Standards

### Rules

1. **Request Scope**: Use REQUEST scope for authentication context.
2. **Base Configuration**: Set base URL and timeout.
3. **Interceptors**: Add auth headers automatically.
4. **Error Handling**: Handle domain-specific errors in services.
5. **Single Instance**: Use one HTTP client for all external API calls.

---

## API Documentation Standards

### Rules

1. **Consistent Decorator**: Use `@ApiDatabaseDocumentation` for database endpoints, `@ApiDocumentation` for external API endpoints.
2. **Response Types**: Define DTOs for complex responses.
3. **Meaningful Descriptions**: Provide descriptive summaries for all endpoints.
4. **Status Codes**: Reference constants for status codes.

---

## Naming Conventions

### Files and Folders

* **kebab-case**: `products.controller.ts`
* **Domain prefix**: `products.service.ts`
* **Descriptive**: `api-documentation.decorator.ts`

### Classes and Interfaces

* **PascalCase**: `ProductsController`
* **Suffixes**: `AppConfigProvider`, `LoggerProvider`, `AuthenticationError`

### Constants

* **SCREAMING_SNAKE_CASE**: `HTTP_STATUS`, `AUTH_ERROR_MESSAGES`
* **Domain grouping**: `PRODUCTS.ROUTES.BASE`

### Functions and Variables

* **camelCase**: `findAll`, `toProductDto`
* **Action verbs**: `get`, `create`, `update`, `delete`, `find`

---

## Function Standards

### Rules

1. **Single Responsibility**: Each function must have one purpose.
2. **Async/Await**: Prefer async/await over `.then()` chains.
3. **Error Handling**: Always handle errors gracefully.
4. **Type Safety**: Define TypeScript types for parameters and return values.
5. **Constants**: Do not hardcode values inside function bodies.

---

## Build Pipeline

### Build Pipeline Structure

```bash
# Full build pipeline
npm run build
# clean -> type-check -> lint -> test:ci -> compile

# CI-optimized build
npm run build:ci
# type-check -> lint:ci -> test:ci -> compile

# Quick validation (no compilation)
npm run validate
# type-check -> lint -> test
```

### Available Commands

| Command | Purpose | Use Case |
|---------|---------|----------|
| `npm run build` | Full build with validation | Local development, final verification |
| `npm run build:ci` | CI-optimized build | Automated deployments |
| `npm run validate` | Quick validation check | Before committing changes |
| `npm run type-check` | TypeScript compilation check | Standalone type validation |
| `npm run lint` | ESLint analysis | Code quality review |
| `npm run lint:fix` | Auto-fix ESLint issues | Pre-commit formatting |
| `npm run test:ci` | Jest with coverage | CI/CD pipeline testing |

---

## Code Review Checklist

* [ ] No hardcoded values (strings, numbers, URLs).
* [ ] Imports respect Clean Architecture layers.
* [ ] Error handling follows standard patterns.
* [ ] Constants are well-organized and named.
* [ ] Error messages use appropriate constants from `/errors/` directory.
* [ ] Logging uses `LoggerProvider` with proper categories.
* [ ] API documentation is complete and accurate.
* [ ] Functions follow single-responsibility principle.
* [ ] Naming conventions are followed.
* [ ] Type safety is maintained.
* [ ] Build pipeline passes (type-check, lint, test).

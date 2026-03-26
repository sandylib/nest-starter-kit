# Nest Starter Kit

NestJS starter kit with Clean Architecture, Prisma ORM, Swagger API documentation, and structured logging. Includes a shopping cart example domain to demonstrate patterns and conventions.

## Prerequisites

- **Node.js** >= 22.0.0
- **npm** >= 10.0.0
- **Docker** (for local PostgreSQL database)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start PostgreSQL
docker compose -f docker-compose.db.yml up -d

# 4. Generate Prisma client
npm run db:generate

# 5. Run database migrations
npm run db:migrate:dev

# 6. (Optional) Seed sample data
npm run db:seed

# 7. Start development server
npm run dev
```

The API will be available at `http://localhost:4000` with Swagger docs at `http://localhost:4000/swagger`.

## Available Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Full build with validation (type-check, lint, test, compile) |
| `npm run build:ci` | CI-optimised build |
| `npm run compile` | TypeScript compilation only |
| `npm run start` | Start production server |
| `npm run clean` | Remove build artifacts |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run type-check` | TypeScript type checking |
| `npm run test` | Run tests |
| `npm run test:ci` | Run tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run validate` | Quick validation (type-check + lint + test) |
| `npm run format` | Format code with Prettier |

### Database Commands

| Command | Purpose |
|---------|---------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate:dev` | Create and apply dev migrations |
| `npm run db:migrate:deploy` | Apply migrations (production) |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:seed` | Seed sample data |
| `npm run db:reset` | Reset database |
| `npm run db:push` | Push schema changes |

### Docker Commands

```bash
docker compose -f docker-compose.db.yml up -d     # Start database
docker compose -f docker-compose.db.yml down       # Stop database
docker compose -f docker-compose.db.yml down -v    # Reset database (delete data)
docker compose -f docker-compose.db.yml logs -f    # View database logs
```

## Project Structure

```
src/
├── main.ts                              # Application bootstrap
├── app.module.ts                        # Root module
├── core/                                # Domain layer
│   ├── entities/                        # Domain entities (pure interfaces)
│   └── middleware/                       # Auth, logging middleware
├── application/                         # Application layer
│   └── use-cases/                       # Service implementations
├── presentation/                        # Presentation layer
│   └── web/
│       ├── controllers/                 # API controllers
│       ├── decorators/                  # Custom decorators
│       └── dto/                         # Data transfer objects
├── infrastructure/                      # Infrastructure layer
│   ├── adapters/                        # HTTP clients, Prisma
│   ├── config/                          # Configuration services
│   ├── errors/                          # Auth exceptions
│   ├── filters/                         # Exception filters
│   ├── logging/                         # Logger setup
│   ├── mappers/                         # Entity-DTO mappers
│   └── modules/                         # NestJS modules
└── shared/                              # Cross-cutting concerns
    ├── constants/                       # Application constants
    │   ├── domains/                     # Domain-specific constants
    │   └── errors/                      # Error message constants
    ├── errors/                          # Shared error classes
    ├── testing/                         # Test utilities
    └── types/                           # Shared interfaces
```

## Architecture

This project follows **Clean Architecture** principles:

- **Core (Domain)**: Business entities and domain logic
- **Application**: Use cases and business rules
- **Presentation**: HTTP controllers, DTOs, and web layer
- **Infrastructure**: External dependencies, adapters, configuration
- **Shared**: Constants, types, and utilities used across layers

### Layer Dependencies

```
Presentation → Application → Infrastructure
                    ↑
                 Shared (used by all)
```

## Example Domain: Shopping Cart

The starter kit includes a shopping cart example with:

- **Products** -- CRUD operations (`GET/POST/PUT/DELETE /products`)
- **Carts** -- Cart management (`POST /carts`, `GET /carts/:id`)
- **Cart Items** -- Add/remove items (`POST/DELETE /carts/:id/items`)
- **Monitoring** -- Health checks (`GET /healthcheck`, `GET /pingdom`)

## Key Features

### Swagger API Documentation

Available at `/swagger` with auto-generated docs from decorators.

### Structured Logging

Winston-based logging with categories (http, auth, api, security, performance). Local development uses coloured console output; deployed environments use JSON format with optional SumoLogic transport.

### Prisma ORM

Prisma 7 with PostgreSQL adapter, auto-migrations on startup, and typed database access.

### Authentication

JWT-based auth middleware that extracts and validates Bearer tokens. Uses `@CurrentUser()` decorator to access user context in controllers.

### Error Handling

Global exception filters for database errors (Prisma) and external API errors. Custom error classes with proper HTTP status code mapping.

### Configuration

Centralised `AppConfigProvider` reads from environment variables with sensible defaults. For deployed environments, DATABASE_URL is fetched from AWS SSM Parameter Store.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Yes | - | Server port |
| `ENVIRONMENT` | No | `local` | Environment name |
| `API_BASE_URL` | Yes | - | External API base URL |
| `REGION` | Yes | - | Deployment region |
| `DATABASE_URL` | Yes* | - | PostgreSQL connection string |
| `SUMO_ENDPOINT` | No | - | SumoLogic collector URL |

*For deployed environments, `DATABASE_URL` can be fetched from SSM Parameter Store.

## Testing

Tests use Jest with ts-jest. Coverage thresholds are set to 90% for branches, functions, lines, and statements.

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:ci

# Run a specific test
npm run test -- --runTestsByPath src/application/use-cases/__tests__/products.service.spec.ts
```

## Customising for Your Project

1. Update `package.json` name and description
2. Update `LOGGING.METADATA.SERVICE` in `src/shared/constants/logging.constants.ts`
3. Update `MONITORING.HEALTH.SERVICE` in `src/shared/constants/domains/monitoring.constants.ts`
4. Update `DB_SSM_PARAMETER_NAME` in `src/main.ts`
5. Update `docker-compose.db.yml` container and database names
6. Update CORS whitelist in `src/shared/constants/config-defaults.constants.ts`
7. Replace the shopping cart example with your domain models

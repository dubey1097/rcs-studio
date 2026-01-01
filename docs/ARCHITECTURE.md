# Architecture Documentation

## Overview

GOGL RCS is a modern Angular application built with enterprise-grade architecture patterns and best practices. This document outlines the architectural decisions, folder structure, and design patterns used throughout the application.

## Table of Contents

1. [Monorepo Structure](#monorepo-structure)
2. [Application Architecture](#application-architecture)
3. [Design Patterns](#design-patterns)
4. [Folder Structure](#folder-structure)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)
7. [Logging](#logging)
8. [Testing Strategy](#testing-strategy)

## Monorepo Structure

The project uses **Nx** as the monorepo tool, providing:

- **Code sharing** across multiple applications and libraries
- **Dependency graph** management
- **Build optimization** with caching
- **Code generation** and scaffolding

### Workspace Layout

```
gogl-rcs-workspace/
├── apps/
│   └── gogl-rcs/          # Main Angular application
├── libs/
│   └── shared/            # Shared libraries
│       ├── dto/           # Data Transfer Objects
│       ├── errors/        # Error handling
│       ├── logger/        # Logging service
│       └── ui/            # UI component library
├── docs/                  # Documentation
├── docker-compose.yml     # Local development services
└── nx.json               # Nx configuration
```

## Application Architecture

### Core Principles

1. **Separation of Concerns**: Each module has a single responsibility
2. **Dependency Injection**: Services are injected, not instantiated
3. **Reactive Programming**: RxJS for async operations
4. **Immutable State**: NgRx for predictable state management
5. **Type Safety**: TypeScript strict mode enabled

### Architectural Layers

#### 1. Presentation Layer
- **Components**: Presentational and container components
- **Templates**: HTML with Angular directives
- **Styles**: SCSS with BEM methodology

#### 2. Application Layer
- **Services**: Business logic and API communication
- **Guards**: Route protection
- **Resolvers**: Data pre-fetching
- **Interceptors**: HTTP request/response handling

#### 3. Domain Layer
- **Models**: Domain entities and DTOs
- **Enums**: Type-safe enumerations
- **Interfaces**: Contracts and type definitions

#### 4. Infrastructure Layer
- **State Management**: NgRx store, effects, reducers
- **Error Handling**: Global error handler
- **Logging**: Centralized logging service

## Design Patterns

### 1. Module Pattern
- **CoreModule**: Singleton services, loaded once
- **SharedModule**: Reusable components and directives
- **Feature Modules**: Domain-specific functionality

### 2. Singleton Pattern
- **LoggerService**: Single instance across the application
- **CoreModule**: Ensured single instantiation

### 3. Strategy Pattern
- **ButtonComponent**: Different button types (primary, secondary, etc.)
- **Error Handling**: Different error strategies

### 4. Observer Pattern
- **RxJS Observables**: Reactive data streams
- **NgRx Effects**: Side effect management

### 5. Factory Pattern
- **Error Creation**: AppError factory methods
- **Component Creation**: Angular component factory

### 6. Template Method Pattern
- **ModalComponent**: Lifecycle hooks (onShow, onHide)
- **Base Components**: Common component behavior

### 7. Dependency Injection Pattern
- **Angular DI**: Service injection throughout the app
- **Token-based Injection**: Configuration injection

## Folder Structure

### Application Structure

```
apps/gogl-rcs/src/app/
├── core/                  # Core module (singleton services)
│   ├── interceptors/     # HTTP interceptors
│   ├── guards/           # Route guards
│   ├── resolvers/        # Route resolvers
│   └── services/         # Core services
├── features/             # Feature modules
│   └── home/            # Home feature module
├── shared/              # Shared module
│   └── shared.module.ts
├── store/               # NgRx store
│   ├── actions/         # Action creators
│   ├── effects/         # Side effects
│   ├── reducers/        # State reducers
│   └── selectors/       # State selectors
├── app.component.ts
├── app.module.ts
└── app-routing.module.ts
```

### Library Structure

```
libs/shared/
├── dto/                 # Data Transfer Objects
│   ├── enums.ts
│   ├── interfaces.ts
│   └── types.ts
├── errors/              # Error handling
│   ├── app-error.ts
│   └── error-handler.ts
├── logger/              # Logging
│   └── logger.service.ts
└── ui/                  # UI components
    ├── button/
    ├── modal/
    └── form-field/
```

## State Management

### NgRx Architecture

The application uses **NgRx** for state management following the Redux pattern:

1. **Actions**: Describe state changes
2. **Reducers**: Pure functions that update state
3. **Effects**: Handle side effects (API calls, etc.)
4. **Selectors**: Memoized state queries

### Store Structure

```typescript
interface AppState {
  app: {
    initialized: boolean;
    loading: boolean;
    error: string | null;
  };
  // Additional feature states...
}
```

### Best Practices

- **Immutable Updates**: Use spread operator or Immer
- **Type Safety**: Typed actions and state
- **Selectors**: Memoized for performance
- **Effects**: Handle async operations

## Error Handling

### Error Hierarchy

1. **AppError**: Base error class with status codes
2. **ErrorInterceptor**: HTTP error handling
3. **Global Error Handler**: Unhandled error catching

### Error Flow

```
HTTP Request → ErrorInterceptor → AppError → Logger → User Notification
```

### Error Response Format

```typescript
{
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    details?: unknown;
  }
}
```

## Logging

### Logger Service

Centralized logging with different log levels:

- **DEBUG**: Development debugging
- **INFO**: General information
- **WARN**: Warning messages
- **ERROR**: Error messages

### Log Format

```typescript
{
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
  stack?: string;
}
```

## Testing Strategy

### Unit Testing
- **Jest**: Test runner and assertion library
- **Component Testing**: Angular Testing Utilities
- **Service Testing**: Mock dependencies

### Integration Testing
- **E2E Testing**: Cypress (if configured)
- **API Testing**: Mock HTTP requests

### Test Coverage Goals
- **Components**: > 80%
- **Services**: > 90%
- **Utilities**: > 95%

## Best Practices

### Code Organization
1. **One file per component/service**
2. **Barrel exports** for clean imports
3. **Feature-based** folder structure
4. **Shared code** in libraries

### Naming Conventions
- **Components**: PascalCase (e.g., `HomeComponent`)
- **Services**: PascalCase with "Service" suffix (e.g., `LoggerService`)
- **Interfaces**: PascalCase, often prefixed with "I" (e.g., `IUser`)
- **Enums**: PascalCase (e.g., `LogLevel`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_TIMEOUT`)

### TypeScript
- **Strict mode** enabled
- **No `any` types** (use `unknown` if needed)
- **Explicit return types** for public methods
- **Interface over type** for object shapes

### Angular
- **OnPush change detection** where possible
- **Lazy loading** for feature modules
- **TrackBy functions** in *ngFor
- **Async pipe** for observables

## Performance Optimization

1. **Lazy Loading**: Feature modules loaded on demand
2. **OnPush Strategy**: Reduce change detection cycles
3. **TrackBy Functions**: Optimize *ngFor rendering
4. **Memoization**: NgRx selectors with memoization
5. **Bundle Optimization**: Tree shaking and code splitting

## Security

1. **XSS Prevention**: Angular's built-in sanitization
2. **CSRF Protection**: HTTP-only cookies
3. **Input Validation**: Form validators
4. **Route Guards**: Authentication and authorization
5. **HTTPS**: Enforced in production

## Deployment

### Build Configurations

- **Development**: Source maps, dev tools enabled
- **Staging**: Optimized build, staging API
- **Production**: Minified, optimized, production API

### Environment Files

- `environment.ts`: Development
- `environment.staging.ts`: Staging
- `environment.prod.ts`: Production

## Future Enhancements

1. **Micro-frontends**: Module federation
2. **PWA Support**: Service workers, offline support
3. **Internationalization**: i18n support
4. **Accessibility**: WCAG 2.1 compliance
5. **Performance Monitoring**: APM integration


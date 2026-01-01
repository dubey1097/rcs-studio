# GOGL RCS - Angular Application

A modern, enterprise-grade Angular application built with best practices, design patterns, and coding standards.

## 🚀 Features

- **Monorepo Structure**: Nx workspace for scalable architecture
- **State Management**: NgRx for predictable state management
- **UI Component Library**: Reusable components (buttons, modals, form fields)
- **Error Handling**: Global error handling with unified error responses
- **Logging**: Centralized logging service with multiple log levels
- **Environment Configuration**: Separate configs for dev, staging, and production
- **Docker Support**: Local development environment with Docker Compose
- **Code Quality**: ESLint, Prettier, and Husky for code standards
- **Type Safety**: TypeScript strict mode enabled

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for local services)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Google
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Copy environment template:
```bash
cp env.template .env
```

4. Update `.env` file with your configuration values.

5. Start local services (PostgreSQL, Redis, RabbitMQ):
```bash
npm run docker:up
# or
yarn docker:up
```

## 🏃 Running the Application

### Development Server

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:4200`

### Build

```bash
# Development build
npm run build

# Production build
npm run build -- --configuration=production
```

### Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Linting

```bash
# Lint all projects
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## 📁 Project Structure

```
gogl-rcs-workspace/
├── apps/
│   └── gogl-rcs/              # Main Angular application
│       └── src/
│           ├── app/
│           │   ├── core/      # Core module (singleton services)
│           │   ├── features/  # Feature modules
│           │   ├── shared/    # Shared module
│           │   └── store/     # NgRx store
│           └── environments/  # Environment configs
├── libs/
│   └── shared/                # Shared libraries
│       ├── dto/               # Data Transfer Objects
│       ├── errors/            # Error handling
│       ├── logger/            # Logging service
│       └── ui/                # UI component library
├── docs/                      # Documentation
├── docker-compose.yml         # Local development services
└── env.template              # Environment template
```

## 🏗️ Architecture

The application follows a modular architecture with clear separation of concerns:

- **Presentation Layer**: Components and templates
- **Application Layer**: Services, guards, resolvers
- **Domain Layer**: Models, DTOs, interfaces
- **Infrastructure Layer**: State management, error handling, logging

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 📚 Documentation

- [Architecture Documentation](docs/ARCHITECTURE.md) - Detailed architecture overview
- [Coding Standards](docs/CODING_STANDARDS.md) - Coding conventions and best practices

## 🎨 UI Components

The application includes a reusable UI component library:

- **Button Component**: Multiple types (primary, secondary, danger, etc.)
- **Modal Component**: Reusable modal dialogs
- **Form Field Component**: Form inputs with validation

### Usage Example

```typescript
import { SharedUiModule } from '@gogl-rcs/shared/ui';

// In your module
@NgModule({
  imports: [SharedUiModule],
})
export class MyModule {}
```

```html
<!-- Button -->
<lib-button type="primary" (clicked)="handleClick()">
  Click Me
</lib-button>

<!-- Modal -->
<lib-modal [show]="showModal" [title]="'My Modal'" (closed)="closeModal()">
  <p>Modal content</p>
</lib-modal>

<!-- Form Field -->
<lib-form-field
  label="Email"
  type="email"
  [required]="true"
  [(ngModel)]="email">
</lib-form-field>
```

## 🔧 Configuration

### Environment Files

- `environment.ts`: Development configuration
- `environment.staging.ts`: Staging configuration
- `environment.prod.ts`: Production configuration

### Docker Services

The `docker-compose.yml` file includes:

- **PostgreSQL**: Database server
- **Redis**: Caching and session storage
- **RabbitMQ**: Message broker (optional)

## 🧪 Testing

The project uses Jest for unit testing. Test files should be placed next to the source files with `.spec.ts` extension.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📝 Code Quality

### Linting

ESLint is configured with Angular-specific rules. Run linting:

```bash
npm run lint
```

### Formatting

Prettier is used for code formatting. Format code:

```bash
npm run format
```

### Git Hooks

Husky is configured with pre-commit hooks to:
- Run lint-staged (lint and format staged files)
- Validate commit messages with commitlint

## 🔐 Security

- Input validation on all forms
- XSS prevention (Angular's built-in sanitization)
- Route guards for authentication
- HTTP interceptors for error handling
- Environment-based configuration

## 🚢 Deployment

### Build Configurations

- **Development**: `npm run build`
- **Staging**: `npm run build -- --configuration=staging`
- **Production**: `npm run build -- --configuration=production`

### Environment Variables

Ensure all environment variables are properly configured for your deployment environment.

## 🤝 Contributing

1. Follow the [Coding Standards](docs/CODING_STANDARDS.md)
2. Write tests for new features
3. Update documentation as needed
4. Follow conventional commit messages
5. Ensure all tests pass before submitting

## 📄 License

[Add your license information here]

## 👥 Team

[Add team information here]

## 📞 Support

[Add support contact information here]


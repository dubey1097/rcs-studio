# Quick Start Guide

This guide will help you get started with the GOGL RCS Angular application quickly.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Docker Desktop** (optional, for local services) - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)

## Installation Steps

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd Google

# Install dependencies
npm install
# or
yarn install
```

### 2. Environment Setup

```bash
# Copy the environment template
cp env.template .env

# Edit .env file with your configuration
# (Optional: Default values work for local development)
```

### 3. Start Local Services (Optional)

If you want to use PostgreSQL, Redis, or RabbitMQ locally:

```bash
# Start Docker services
npm run docker:up

# Check service status
npm run docker:logs

# Stop services
npm run docker:down
```

### 4. Run the Application

```bash
# Start development server
npm start
# or
yarn start
```

The application will be available at `http://localhost:4200`

## Common Commands

### Development

```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Code Quality

```bash
# Lint all projects
npm run lint

# Format code
npm run format

# Check code formatting
npm run format:check
```

### Docker Services

```bash
# Start services
npm run docker:up

# Stop services
npm run docker:down

# View logs
npm run docker:logs
```

## Project Structure Overview

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
└── docker-compose.yml     # Local services
```

## Using UI Components

### Button Component

```html
<lib-button type="primary" (clicked)="handleClick()">
  Click Me
</lib-button>
```

### Modal Component

```html
<lib-modal [show]="showModal" [title]="'My Modal'" (closed)="closeModal()">
  <p>Modal content</p>
  <div footer>
    <lib-button type="primary" (clicked)="closeModal()">Close</lib-button>
  </div>
</lib-modal>
```

### Form Field Component

```html
<lib-form-field
  label="Email"
  type="email"
  [required]="true"
  [(ngModel)]="email">
</lib-form-field>
```

## Next Steps

1. **Read the Documentation**:
   - [Architecture Documentation](ARCHITECTURE.md)
   - [Coding Standards](CODING_STANDARDS.md)

2. **Explore the Codebase**:
   - Check `apps/gogl-rcs/src/app` for application code
   - Check `libs/shared` for shared libraries

3. **Start Building**:
   - Create new feature modules
   - Use shared UI components
   - Follow coding standards

## Troubleshooting

### Port Already in Use

If port 4200 is already in use:

```bash
# Use a different port
ng serve --port 4201
```

### Docker Services Not Starting

```bash
# Check Docker is running
docker ps

# Check service logs
npm run docker:logs

# Restart services
npm run docker:down
npm run docker:up
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Nx cache
npx nx reset
```

## Getting Help

- Check the [Architecture Documentation](ARCHITECTURE.md)
- Review [Coding Standards](CODING_STANDARDS.md)
- Check existing code examples in the codebase

## Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [NgRx Documentation](https://ngrx.io/docs)
- [Nx Documentation](https://nx.dev/getting-started/intro)


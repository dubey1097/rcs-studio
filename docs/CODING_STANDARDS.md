# Coding Standards

This document outlines the coding standards, conventions, and best practices for the GOGL RCS project.

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Standards](#typescript-standards)
3. [Angular Standards](#angular-standards)
4. [Naming Conventions](#naming-conventions)
5. [File Organization](#file-organization)
6. [Code Style](#code-style)
7. [Documentation](#documentation)
8. [Testing Standards](#testing-standards)

## General Principles

### SOLID Principles

1. **Single Responsibility**: Each class/function should have one reason to change
2. **Open/Closed**: Open for extension, closed for modification
3. **Liskov Substitution**: Derived classes must be substitutable for their base classes
4. **Interface Segregation**: Many specific interfaces are better than one general interface
5. **Dependency Inversion**: Depend on abstractions, not concretions

### DRY (Don't Repeat Yourself)

- Extract common logic into reusable functions/services
- Use shared components for repeated UI patterns
- Create utility functions for common operations

### KISS (Keep It Simple, Stupid)

- Prefer simple solutions over complex ones
- Avoid premature optimization
- Write code that is easy to understand

## TypeScript Standards

### Type Safety

```typescript
// ✅ Good: Explicit types
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad: Using any
function calculateTotal(items: any[]): any {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Strict Mode

- Always use TypeScript strict mode
- Enable all strict compiler options
- Avoid `any` type - use `unknown` if type is truly unknown

### Type Definitions

```typescript
// ✅ Good: Interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Good: Type for unions/intersections
type Status = 'active' | 'inactive' | 'pending';
type UserWithStatus = User & { status: Status };
```

### Null Safety

```typescript
// ✅ Good: Null checks
if (user?.email) {
  sendEmail(user.email);
}

// ✅ Good: Optional chaining
const userName = user?.profile?.name ?? 'Unknown';
```

## Angular Standards

### Component Structure

```typescript
// ✅ Good: Proper component structure
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit, OnDestroy {
  // 1. Properties
  @Input() users: User[] = [];
  @Output() userSelected = new EventEmitter<User>();

  // 2. Constructor
  constructor(private userService: UserService) {}

  // 3. Lifecycle hooks
  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  // 4. Public methods
  selectUser(user: User): void {
    this.userSelected.emit(user);
  }

  // 5. Private methods
  private loadUsers(): void {
    // Implementation
  }
}
```

### Change Detection

```typescript
// ✅ Good: OnPush strategy for better performance
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})

// ✅ Good: Immutable updates
this.users = [...this.users, newUser];

// ❌ Bad: Mutating state
this.users.push(newUser);
```

### Dependency Injection

```typescript
// ✅ Good: Constructor injection
constructor(
  private userService: UserService,
  private logger: LoggerService
) {}

// ❌ Bad: Service locator pattern
constructor() {
  this.userService = inject(UserService);
}
```

### RxJS Best Practices

```typescript
// ✅ Good: Proper subscription management
private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.userService.getUsers()
    .pipe(takeUntil(this.destroy$))
    .subscribe(users => this.users = users);
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

// ✅ Good: Using async pipe
users$ = this.userService.getUsers();
```

```html
<!-- Template -->
<div *ngFor="let user of users$ | async">
  {{ user.name }}
</div>
```

## Naming Conventions

### Files

- **Components**: `kebab-case.component.ts` (e.g., `user-list.component.ts`)
- **Services**: `kebab-case.service.ts` (e.g., `user.service.ts`)
- **Interfaces**: `kebab-case.interface.ts` (e.g., `user.interface.ts`)
- **Enums**: `kebab-case.enum.ts` (e.g., `user-role.enum.ts`)
- **Guards**: `kebab-case.guard.ts` (e.g., `auth.guard.ts`)
- **Resolvers**: `kebab-case.resolver.ts` (e.g., `user.resolver.ts`)

### Code

- **Classes**: PascalCase (e.g., `UserService`, `HomeComponent`)
- **Interfaces**: PascalCase, optionally prefixed with "I" (e.g., `IUser`, `User`)
- **Enums**: PascalCase (e.g., `UserRole`, `LogLevel`)
- **Variables**: camelCase (e.g., `userName`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_RETRY_COUNT`)
- **Private members**: camelCase with underscore prefix (e.g., `_userService`) or just camelCase
- **Methods**: camelCase (e.g., `getUser()`, `calculateTotal()`)
- **Events**: camelCase (e.g., `userSelected`, `formSubmitted`)

### Selectors

```typescript
// ✅ Good: Descriptive selectors
selector: 'app-user-list'
selector: 'lib-button'
selector: '[appHighlight]'
```

## File Organization

### Component Files

```
user-list/
├── user-list.component.ts
├── user-list.component.html
├── user-list.component.scss
└── user-list.component.spec.ts
```

### Module Structure

```typescript
// 1. Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// 2. Component imports
import { UserListComponent } from './user-list.component';

// 3. Module definition
@NgModule({
  declarations: [UserListComponent],
  imports: [CommonModule],
  exports: [UserListComponent],
})
export class UserListModule {}
```

### Import Order

```typescript
// 1. Angular core imports
import { Component, OnInit } from '@angular/core';

// 2. Angular feature imports
import { Router } from '@angular/router';

// 3. Third-party imports
import { Observable } from 'rxjs';

// 4. Application imports
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
```

## Code Style

### Formatting

- Use **Prettier** for code formatting
- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** required
- **Trailing commas** in multi-line structures

### Line Length

- Maximum **100 characters** per line
- Break long lines at logical points

### Comments

```typescript
// ✅ Good: JSDoc comments for public APIs
/**
 * Retrieves a user by ID
 * @param id - The user ID
 * @returns Observable of the user
 */
getUser(id: string): Observable<User> {
  // Implementation
}

// ✅ Good: Inline comments for complex logic
// Calculate total with tax (15% VAT)
const total = subtotal * 1.15;

// ❌ Bad: Obvious comments
// Set the user
this.user = user;
```

### Functions

```typescript
// ✅ Good: Small, focused functions
function calculateTax(amount: number, rate: number): number {
  return amount * rate;
}

// ❌ Bad: Large, complex functions
function processOrder(order: Order): void {
  // 100+ lines of code...
}
```

### Error Handling

```typescript
// ✅ Good: Specific error handling
try {
  await this.userService.saveUser(user);
} catch (error) {
  if (error instanceof AppError) {
    this.handleAppError(error);
  } else {
    this.logger.error('Unexpected error', error);
    this.showGenericError();
  }
}

// ❌ Bad: Catching all errors silently
try {
  await this.userService.saveUser(user);
} catch (error) {
  // Ignored
}
```

## Documentation

### JSDoc Comments

```typescript
/**
 * User Service
 * Provides user management functionality
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  /**
   * Retrieves all users
   * @returns Observable array of users
   */
  getUsers(): Observable<User[]> {
    // Implementation
  }

  /**
   * Creates a new user
   * @param userData - The user data to create
   * @returns Observable of the created user
   * @throws {AppError} If user creation fails
   */
  createUser(userData: Partial<User>): Observable<User> {
    // Implementation
  }
}
```

### README Files

- Each feature module should have a README
- Document public APIs
- Include usage examples
- List dependencies

## Testing Standards

### Test Structure

```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should return users', () => {
      // Test implementation
    });
  });
});
```

### Test Naming

- Use descriptive test names
- Follow pattern: `should [expected behavior] when [condition]`

```typescript
it('should return empty array when no users exist', () => {
  // Test
});

it('should throw error when user ID is invalid', () => {
  // Test
});
```

### Coverage Requirements

- **Components**: Minimum 80% coverage
- **Services**: Minimum 90% coverage
- **Utilities**: Minimum 95% coverage

## Git Commit Standards

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```
feat(user): add user profile page

Implement user profile component with edit functionality

Closes #123
```

```
fix(auth): resolve token expiration issue

Token was not being refreshed properly on expiration

Fixes #456
```

## Code Review Checklist

- [ ] Code follows naming conventions
- [ ] TypeScript strict mode compliance
- [ ] No `any` types used
- [ ] Proper error handling
- [ ] Unit tests included
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met
- [ ] Security best practices followed

## Linting and Formatting

### ESLint Rules

- Enforce TypeScript best practices
- Prevent common errors
- Maintain code consistency

### Prettier Configuration

- Automatic code formatting
- Consistent style across the codebase
- Integrated with pre-commit hooks

## Resources

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Best Practices](https://rxjs.dev/guide/overview)
- [NgRx Best Practices](https://ngrx.io/guide/store)


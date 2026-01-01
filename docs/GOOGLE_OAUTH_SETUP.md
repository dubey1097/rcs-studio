# Google OAuth Authentication Setup

This document explains how to set up and use Google OAuth authentication in the GOGL RCS application.

## Overview

The application uses **Google Identity Services** (GIS) for authentication. Users can sign in with their Google accounts, and the application stores the ID token in memory (not localStorage) for security.

## Features

- ✅ Google Sign-In integration using Google Identity Services
- ✅ ID token storage in memory (secure)
- ✅ Automatic token attachment to API requests
- ✅ Route protection with AuthGuard
- ✅ NgRx state management for auth state
- ✅ Token verification with backend

## Prerequisites

1. **Google Cloud Platform (GCP) Project**
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google Identity Services API

2. **OAuth 2.0 Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Create OAuth 2.0 Client ID
   - Configure authorized JavaScript origins
   - Configure authorized redirect URIs

## Configuration

### 1. GCP Configuration

#### Authorized JavaScript Origins
Add your application URLs:
- `http://localhost:4200` (development)
- `https://staging.yourdomain.com` (staging)
- `https://yourdomain.com` (production)

#### Authorized Redirect URIs
Add redirect URIs if using redirect flow:
- `http://localhost:4200/auth/callback` (development)
- `https://staging.yourdomain.com/auth/callback` (staging)
- `https://yourdomain.com/auth/callback` (production)

#### Consent Screen
- Configure OAuth consent screen
- Add required scopes (email, profile)
- Add test users (for testing)

### 2. Application Configuration

#### Environment Variables

Update your environment files with the Google Client ID:

**Development** (`apps/gogl-rcs/src/environments/environment.ts`):
```typescript
export const environment = {
  // ... other config
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID_HERE',
};
```

**Staging** (`apps/gogl-rcs/src/environments/environment.staging.ts`):
```typescript
export const environment = {
  // ... other config
  googleClientId: 'YOUR_STAGING_GOOGLE_CLIENT_ID_HERE',
};
```

**Production** (`apps/gogl-rcs/src/environments/environment.prod.ts`):
```typescript
export const environment = {
  // ... other config
  googleClientId: 'YOUR_PRODUCTION_GOOGLE_CLIENT_ID_HERE',
};
```

#### Using Environment Variables

You can also use environment variables:

```bash
# Set environment variable
export GOOGLE_CLIENT_ID=your-client-id-here

# Or in .env file
GOOGLE_CLIENT_ID=your-client-id-here
```

## Architecture

### Components

1. **AuthService** (`apps/gogl-rcs/src/app/core/services/auth.service.ts`)
   - Handles Google OAuth flow
   - Manages token storage in memory
   - Provides authentication state observables

2. **AuthInterceptor** (`apps/gogl-rcs/src/app/core/interceptors/auth.interceptor.ts`)
   - Automatically attaches Bearer token to API requests
   - Skips token attachment for auth endpoints

3. **AuthGuard** (`apps/gogl-rcs/src/app/core/guards/auth.guard.ts`)
   - Protects routes requiring authentication
   - Redirects to login if not authenticated

4. **LoginComponent** (`apps/gogl-rcs/src/app/features/auth/login/login.component.ts`)
   - Renders Google Sign-In button
   - Handles authentication flow

### State Management

- **Actions**: `apps/gogl-rcs/src/app/store/actions/auth.actions.ts`
- **Reducers**: `apps/gogl-rcs/src/app/store/reducers/auth.reducer.ts`
- **Effects**: `apps/gogl-rcs/src/app/store/effects/auth.effects.ts`

## Usage

### Sign In Flow

1. User navigates to `/login`
2. Google Sign-In button is rendered
3. User clicks button and selects Google account
4. Google returns ID token
5. Token is decoded and stored in memory
6. Token is sent to backend for verification
7. User is redirected to `/home`

### Protected Routes

Routes protected by `AuthGuard`:
- `/home` - Requires authentication

Public routes:
- `/login` - Login page

### Using AuthService

```typescript
import { AuthService } from '@app/core/services/auth.service';

constructor(private authService: AuthService) {}

// Check authentication
if (this.authService.isAuthenticated()) {
  const token = this.authService.getToken();
  const user = this.authService.getUser();
}

// Subscribe to auth state
this.authService.isAuthenticated$.subscribe(isAuth => {
  // Handle auth state changes
});

// Logout
this.authService.logout();
```

### Using NgRx Store

```typescript
import { Store } from '@ngrx/store';
import { AppState } from '@app/store';
import * as AuthActions from '@app/store/actions/auth.actions';

constructor(private store: Store<AppState>) {}

// Dispatch logout
this.store.dispatch(AuthActions.logout());

// Subscribe to auth state
this.store.select(state => state.auth.isAuthenticated).subscribe(isAuth => {
  // Handle auth state
});
```

## Backend Integration

The frontend sends the ID token to the backend for verification:

**Endpoint**: `POST /api/auth/verify`

**Request Body**:
```json
{
  "token": "google-id-token-here"
}
```

**Expected Response**:
```json
{
  "valid": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Backend Requirements

1. Verify the Google ID token using Google's token verification API
2. Extract user information from the token
3. Create or update user session
4. Return user information

## Security Considerations

1. **Token Storage**: Tokens are stored in memory, not localStorage, for better security
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiration**: Tokens expire automatically (typically 1 hour)
4. **Backend Verification**: Always verify tokens on the backend
5. **CORS**: Configure CORS properly on the backend

## Troubleshooting

### Google Sign-In Button Not Appearing

1. Check that Google Client ID is configured correctly
2. Verify authorized JavaScript origins include your domain
3. Check browser console for errors
4. Ensure Google Identity Services script is loaded

### Token Not Attached to Requests

1. Verify AuthInterceptor is registered in AppModule
2. Check that token exists: `authService.getToken()`
3. Verify request URL is not an auth endpoint

### Authentication State Not Persisting

- Tokens are stored in memory and will be lost on page refresh
- Implement token refresh logic if needed
- Consider using session storage for short-term persistence (less secure)

## Testing

### Manual Testing

1. Navigate to `/login`
2. Click Google Sign-In button
3. Select Google account
4. Verify redirect to `/home`
5. Check that user info is displayed
6. Test logout functionality

### Unit Testing

```typescript
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, ApiService, LoggerService],
    });
    service = TestBed.inject(AuthService);
  });

  it('should initialize Google Sign-In', () => {
    // Test implementation
  });
});
```

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Angular Authentication Guide](https://angular.io/guide/router#preventing-unauthorized-access)


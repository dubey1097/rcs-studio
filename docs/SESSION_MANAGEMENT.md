# Session Management & Token Lifecycle

This document describes how session state, token lifecycle, and logout flow are managed in the GOGL RCS application.

## Overview

The application uses **in-memory token storage** for security and implements comprehensive session management including:

- Token expiry monitoring
- Automatic logout on token expiry
- Session state tracking
- Cleanup on logout
- Logout callbacks

## Token Lifecycle

### Token Storage

- **Location**: In-memory (BehaviorSubject)
- **Type**: Google ID Token (JWT)
- **Security**: Not stored in localStorage or sessionStorage
- **Lifetime**: Managed by token expiry time from JWT

### Token Flow

1. **Login**: User signs in with Google OAuth
2. **Token Received**: ID token is decoded and stored in memory
3. **Expiry Tracking**: Token expiry time is extracted from JWT `exp` claim
4. **Monitoring**: Background process checks token expiry every minute
5. **Expiry Handling**: Automatic logout when token expires
6. **Logout**: Complete cleanup of all session data

## Session State

### State Properties

```typescript
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: GoogleIdToken | null;
  tokenExpiry: number | null;      // Timestamp in milliseconds
  sessionStartTime: number | null;  // Timestamp in milliseconds
  loading: boolean;
  error: string | null;
}
```

### Session Tracking

- **Session Start**: Recorded when user successfully authenticates
- **Token Expiry**: Extracted from JWT `exp` claim (converted to milliseconds)
- **Session Duration**: Calculated as `tokenExpiry - sessionStartTime`

## Token Expiry Monitoring

### Automatic Monitoring

The `AuthService` runs a background process that:

1. Checks token expiry every **60 seconds** (1 minute)
2. Warns when token expires in **5 minutes** or less
3. Automatically logs out when token is expired
4. Stops monitoring when user logs out

### Expiry Detection

```typescript
// Check if token is expired
isTokenExpired(): boolean {
  const expiry = this.tokenExpirySubject.value;
  if (!expiry) return false;
  return Date.now() >= expiry;
}

// Get time until expiry
getTimeUntilExpiry(): number {
  const expiry = this.tokenExpirySubject.value;
  if (!expiry) return 0;
  const timeUntil = expiry - Date.now();
  return timeUntil > 0 ? timeUntil : 0;
}
```

## Logout Flow

### Complete Cleanup Process

When `logout()` is called:

1. **Stop Monitoring**: Stops token expiry monitoring
2. **Clear State**: Clears all in-memory state
   - Token
   - User data
   - Authentication status
   - Token expiry
   - Session start time
3. **Execute Callbacks**: Runs all registered logout callbacks
4. **Google Cleanup**: Disables auto-select and cancels pending prompts
5. **Backend Notification**: Notifies backend of logout (optional)
6. **Navigation**: Redirects to login page

### Logout Callbacks

Components can register callbacks to be executed on logout:

```typescript
this.authService.onLogout(() => {
  // Cleanup component-specific state
  this.clearLocalData();
});
```

## Usage Examples

### Check Authentication

```typescript
// Check if authenticated
if (this.authService.isAuthenticated()) {
  const token = this.authService.getToken();
  const user = this.authService.getUser();
}

// Subscribe to auth state
this.authService.isAuthenticated$.subscribe(isAuth => {
  if (!isAuth) {
    // Handle logout
  }
});
```

### Check Token Expiry

```typescript
// Check if token is expired
if (this.authService.isTokenExpired()) {
  // Token expired, user will be logged out automatically
}

// Get time until expiry
const timeUntilExpiry = this.authService.getTimeUntilExpiry();
const minutesUntilExpiry = Math.floor(timeUntilExpiry / 60000);

if (minutesUntilExpiry < 5) {
  // Show warning to user
  this.showExpiryWarning(minutesUntilExpiry);
}
```

### Register Logout Callback

```typescript
ngOnInit(): void {
  // Register callback to cleanup on logout
  this.authService.onLogout(() => {
    this.clearComponentState();
    this.unsubscribeAll();
  });
}
```

### Manual Logout

```typescript
// Trigger logout
this.authService.logout();

// Or dispatch logout action
this.store.dispatch(AuthActions.logout());
```

## HTTP Interceptor Integration

The `AuthInterceptor` automatically:

1. Checks token expiry before each request
2. Logs out user if token is expired
3. Attaches Bearer token to requests
4. Skips token attachment for auth endpoints

```typescript
intercept(request: HttpRequest<unknown>, next: HttpHandler) {
  const token = this.authService.getToken();
  
  // Check expiry
  if (this.authService.isTokenExpired()) {
    this.authService.logout();
    return next.handle(request);
  }
  
  // Attach token
  const clonedRequest = request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  
  return next.handle(clonedRequest);
}
```

## NgRx Integration

### State Management

Auth state is managed through NgRx:

- **Actions**: `login`, `logout`, `tokenExpired`, `setAuthState`
- **Reducer**: Updates state with token expiry and session info
- **Effects**: Handles navigation and side effects

### Token Expiry Action

When token expires, dispatch `tokenExpired` action:

```typescript
if (this.authService.isTokenExpired()) {
  this.store.dispatch(AuthActions.tokenExpired());
}
```

## Security Considerations

### Token Storage

- ✅ **In-Memory**: Tokens stored in BehaviorSubject (not persisted)
- ✅ **No localStorage**: Avoids XSS vulnerabilities
- ✅ **No sessionStorage**: Avoids tab-based attacks
- ✅ **Automatic Cleanup**: State cleared on logout

### Token Expiry

- ✅ **Automatic Detection**: Background monitoring
- ✅ **Immediate Logout**: User logged out when token expires
- ✅ **No Refresh Tokens**: Single ID token (as per requirements)
- ✅ **Backend Validation**: Token verified on each request

### Session Management

- ✅ **Complete Cleanup**: All state cleared on logout
- ✅ **Callback System**: Components can cleanup on logout
- ✅ **Google Integration**: Proper cleanup of Google Identity Services
- ✅ **Backend Notification**: Optional backend logout notification

## Best Practices

1. **Always Check Expiry**: Before making authenticated requests
2. **Register Callbacks**: Cleanup component state on logout
3. **Handle Expiry**: Show warnings before token expires
4. **Use Observables**: Subscribe to auth state changes
5. **Don't Store Tokens**: Never store tokens in localStorage/sessionStorage

## Troubleshooting

### Token Expires Too Quickly

- Check JWT `exp` claim in decoded token
- Verify system clock is synchronized
- Check token expiry monitoring interval

### Logout Not Working

- Verify logout callbacks are not throwing errors
- Check that all state subjects are being cleared
- Ensure navigation is working correctly

### Session Not Persisting

- Tokens are intentionally not persisted (security)
- Session is lost on page refresh (by design)
- Implement token refresh if persistence is needed

## Configuration

### Token Expiry Check Interval

Default: 60 seconds (1 minute)

```typescript
private readonly TOKEN_EXPIRY_CHECK_INTERVAL = 60000;
```

### Token Expiry Warning Time

Default: 5 minutes before expiry

```typescript
private readonly TOKEN_EXPIRY_WARNING_TIME = 300000;
```

## API Reference

### AuthService Methods

- `getToken()`: Get current token
- `getUser()`: Get current user
- `isAuthenticated()`: Check authentication status
- `isTokenExpired()`: Check if token is expired
- `getTimeUntilExpiry()`: Get milliseconds until expiry
- `getTokenExpiry()`: Get token expiry timestamp
- `getSessionStartTime()`: Get session start timestamp
- `logout()`: Logout and cleanup
- `onLogout(callback)`: Register logout callback


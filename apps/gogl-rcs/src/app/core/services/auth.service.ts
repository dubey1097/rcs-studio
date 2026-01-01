import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, throwError, interval, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { LoggerService } from '@gogl-rcs/shared/logger';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          prompt: (notification?: (notification: unknown) => void) => void;
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
          disableAutoSelect: () => void;
          storeCredential: (credentials: { id: string; password: string }) => void;
          cancel: () => void;
          onGoogleLibraryLoad: () => void;
          revoke: (accessToken: string, done: () => void) => void;
        };
        oauth2: {
          initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
          hasGrantedAllScopes: (tokenResponse: TokenResponse, ...scopes: string[]) => boolean;
          hasGrantedAnyScope: (tokenResponse: TokenResponse, ...scopes: string[]) => boolean;
          revoke: (accessToken: string, done: () => void) => void;
        };
      };
    };
  }
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  itp_support?: boolean;
  login_uri?: string;
  native_callback?: (response: { credential: string }) => void;
  allowed_parent_origin?: string | string[];
  intermediate_iframe_close_callback?: () => void;
  ux_mode?: 'popup' | 'redirect';
  context?: 'signin' | 'signup' | 'use';
  state_cookie_domain?: string;
  ui_locale?: string;
  log_level?: 'debug' | 'info' | 'warn' | 'error';
  nonce?: string;
}

interface CredentialResponse {
  credential: string;
  select_by: 'auto' | 'user' | 'user_1tap' | 'user_2tap' | 'btn' | 'btn_confirm' | 'brn_add_session' | 'btn_confirm_add_session';
}

interface GoogleButtonConfig {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string | number;
  locale?: string;
}

interface GoogleTokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  error_callback?: (error: TokenClientError) => void;
  state?: string;
  enable_granular_consent?: boolean;
  hosted_domain?: string;
  hint?: string;
  prompt?: '' | 'none' | 'consent' | 'select_account';
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: Partial<GoogleTokenClientConfig>) => void;
}

interface TokenResponse {
  access_token: string;
  authuser: string;
  expires_in: number;
  hd?: string;
  prompt: string;
  scope: string;
  state?: string;
  token_type: string;
}

interface TokenClientError {
  type: string;
  message: string;
}

interface GoogleIdToken {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  iat: number;
  exp: number;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: GoogleIdToken | null;
  tokenExpiry: number | null;
  sessionStartTime: number | null;
}

/**
 * Authentication Service
 * Handles Google OAuth authentication flow
 * Manages token lifecycle, session state, and cleanup
 * Stores tokens in memory (not localStorage for security)
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private readonly GOOGLE_CLIENT_ID: string;
  private readonly TOKEN_EXPIRY_CHECK_INTERVAL = 60000; // Check every minute
  private readonly TOKEN_EXPIRY_WARNING_TIME = 300000; // Warn 5 minutes before expiry

  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<GoogleIdToken | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private tokenExpirySubject = new BehaviorSubject<number | null>(null);
  private sessionStartTimeSubject = new BehaviorSubject<number | null>(null);

  public readonly token$ = this.tokenSubject.asObservable();
  public readonly user$ = this.userSubject.asObservable();
  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public readonly tokenExpiry$ = this.tokenExpirySubject.asObservable();
  public readonly sessionStartTime$ = this.sessionStartTimeSubject.asObservable();

  private tokenExpiryCheckSubscription?: Subscription;
  private logoutCallbacks: (() => void)[] = [];

  constructor(
    private apiService: ApiService,
    private logger: LoggerService
  ) {
    this.GOOGLE_CLIENT_ID = environment.googleClientId || '';
    this.loadGoogleIdentityServices();
    this.initializeGoogleSignIn();
    this.startTokenExpiryMonitoring();
  }

  ngOnDestroy(): void {
    this.stopTokenExpiryMonitoring();
    this.cleanup();
  }

  /**
   * Gets the current authentication token
   * @returns Current token or null
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Gets the current user
   * @returns Current user or null
   */
  getUser(): GoogleIdToken | null {
    return this.userSubject.value;
  }

  /**
   * Checks if user is authenticated
   * @returns True if authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Gets current auth state
   * @returns Current auth state
   */
  getAuthState(): AuthState {
    return {
      isAuthenticated: this.isAuthenticatedSubject.value,
      token: this.tokenSubject.value,
      user: this.userSubject.value,
      tokenExpiry: this.tokenExpirySubject.value,
      sessionStartTime: this.sessionStartTimeSubject.value,
    };
  }

  /**
   * Gets token expiry time
   * @returns Token expiry timestamp in milliseconds or null
   */
  getTokenExpiry(): number | null {
    return this.tokenExpirySubject.value;
  }

  /**
   * Gets session start time
   * @returns Session start timestamp in milliseconds or null
   */
  getSessionStartTime(): number | null {
    return this.sessionStartTimeSubject.value;
  }

  /**
   * Checks if token is expired
   * @returns True if token is expired
   */
  isTokenExpired(): boolean {
    const expiry = this.tokenExpirySubject.value;
    if (!expiry) {
      return false;
    }
    return Date.now() >= expiry;
  }

  /**
   * Gets time until token expiry in milliseconds
   * @returns Time until expiry or 0 if expired/not set
   */
  getTimeUntilExpiry(): number {
    const expiry = this.tokenExpirySubject.value;
    if (!expiry) {
      return 0;
    }
    const timeUntil = expiry - Date.now();
    return timeUntil > 0 ? timeUntil : 0;
  }

  /**
   * Registers a callback to be called on logout
   * @param callback - Callback function
   */
  onLogout(callback: () => void): void {
    this.logoutCallbacks.push(callback);
  }

  /**
   * Initializes Google Sign-In
   */
  initializeGoogleSignIn(): void {
    if (!this.GOOGLE_CLIENT_ID) {
      this.logger.warn('Google Client ID not configured');
      return;
    }

    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: this.GOOGLE_CLIENT_ID,
        callback: (response: CredentialResponse) => this.handleCredentialResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      this.logger.info('Google Sign-In initialized');
    }
  }

  /**
   * Handles Google credential response
   * @param response - Credential response from Google
   */
  handleCredentialResponse(response: CredentialResponse): void {
    try {
      this.logger.info('Google credential received');

      // Decode the ID token (JWT)
      const idToken = this.decodeJwt(response.credential);

      if (!idToken) {
        throw new Error('Invalid ID token');
      }

      // Check token expiry
      const expiryTime = idToken.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      if (expiryTime <= now) {
        this.logger.warn('Token already expired', { expiryTime, now });
        this.logout();
        return;
      }

      // Store token in memory
      this.tokenSubject.next(response.credential);
      this.userSubject.next(idToken);
      this.isAuthenticatedSubject.next(true);
      this.tokenExpirySubject.next(expiryTime);
      this.sessionStartTimeSubject.next(now);

      this.logger.info('User authenticated', {
        email: idToken.email,
        expiresAt: new Date(expiryTime).toISOString(),
        sessionDuration: expiryTime - now,
      });

      // Restart token expiry monitoring
      this.startTokenExpiryMonitoring();

      // Send token to backend for verification
      this.verifyTokenWithBackend(response.credential).subscribe({
        next: () => {
          this.logger.info('Token verified with backend');
        },
        error: (error) => {
          this.logger.error('Failed to verify token with backend', error);
          // Optionally clear auth state on backend verification failure
          // this.logout();
        },
      });
    } catch (error) {
      this.logger.error('Error handling credential response', error);
      this.logout();
    }
  }

  /**
   * Prompts Google Sign-In
   */
  signIn(): void {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        this.logger.info('Google Sign-In prompt', { notification });
      });
    } else {
      this.logger.error('Google Identity Services not loaded');
    }
  }

  /**
   * Renders Google Sign-In button
   * @param element - HTML element to render button in
   * @param config - Button configuration
   */
  renderSignInButton(element: HTMLElement, config?: Partial<GoogleButtonConfig>): void {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(element, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        ...config,
      });
    } else {
      this.logger.error('Google Identity Services not loaded');
    }
  }

  /**
   * Verifies token with backend
   * @param token - ID token to verify
   * @returns Observable of verification result
   */
  private verifyTokenWithBackend(token: string): Observable<unknown> {
    return this.apiService.post<{ valid: boolean; user?: unknown }>('auth/verify', { token }).pipe(
      tap((response) => {
        if (!response.valid) {
          throw new Error('Token verification failed');
        }
      }),
      catchError((error) => {
        this.logger.error('Token verification error', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Decodes JWT token
   * @param token - JWT token to decode
   * @returns Decoded token payload or null
   */
  private decodeJwt(token: string): GoogleIdToken | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload) as GoogleIdToken;
    } catch (error) {
      this.logger.error('Error decoding JWT', error);
      return null;
    }
  }

  /**
   * Logs out the user
   * Performs complete cleanup of session state
   */
  logout(): void {
    this.logger.info('User logged out');

    // Stop token expiry monitoring
    this.stopTokenExpiryMonitoring();

    // Clear in-memory tokens and state
    this.tokenSubject.next(null);
    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.tokenExpirySubject.next(null);
    this.sessionStartTimeSubject.next(null);

    // Execute logout callbacks
    this.logoutCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        this.logger.error('Error executing logout callback', error);
      }
    });

    // Clear callbacks
    this.logoutCallbacks = [];

    // Revoke Google token if available
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      try {
        // Disable auto-select for future sign-ins
        window.google.accounts.id.disableAutoSelect();
        // Cancel any pending sign-in prompts
        window.google.accounts.id.cancel();
      } catch (error) {
        this.logger.warn('Error during Google logout cleanup', error);
      }
    }

    // Notify backend of logout (optional)
    this.notifyBackendLogout().subscribe({
      next: () => {
        this.logger.info('Backend notified of logout');
      },
      error: (error) => {
        this.logger.warn('Failed to notify backend of logout', error);
      },
    });
  }

  /**
   * Notifies backend of logout
   * @returns Observable of logout notification result
   */
  private notifyBackendLogout(): Observable<unknown> {
    // Optional: Notify backend to invalidate session
    // This is a no-op if backend doesn't require explicit logout notification
    return this.apiService.post('auth/logout', {}).pipe(
      catchError((error) => {
        // Don't throw error if backend logout fails - frontend logout is complete
        this.logger.debug('Backend logout notification failed (non-critical)', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Starts monitoring token expiry
   */
  private startTokenExpiryMonitoring(): void {
    this.stopTokenExpiryMonitoring();

    this.tokenExpiryCheckSubscription = interval(this.TOKEN_EXPIRY_CHECK_INTERVAL).subscribe(() => {
      if (!this.isAuthenticated()) {
        this.stopTokenExpiryMonitoring();
        return;
      }

      const expiry = this.tokenExpirySubject.value;
      if (!expiry) {
        return;
      }

      const now = Date.now();
      const timeUntilExpiry = expiry - now;

      // Check if token is expired
      if (timeUntilExpiry <= 0) {
        this.logger.warn('Token expired, logging out');
        this.handleTokenExpiry();
        return;
      }

      // Warn if token is about to expire
      if (timeUntilExpiry <= this.TOKEN_EXPIRY_WARNING_TIME) {
        this.logger.warn('Token expiring soon', {
          timeUntilExpiry,
          expiresAt: new Date(expiry).toISOString(),
        });
        // Could emit an event here for UI to show warning
      }
    });
  }

  /**
   * Stops monitoring token expiry
   */
  private stopTokenExpiryMonitoring(): void {
    if (this.tokenExpiryCheckSubscription) {
      this.tokenExpiryCheckSubscription.unsubscribe();
      this.tokenExpiryCheckSubscription = undefined;
    }
  }

  /**
   * Handles token expiry
   */
  private handleTokenExpiry(): void {
    this.logger.info('Handling token expiry');
    this.logout();
    // Could emit an event here for UI to show expiry message
  }

  /**
   * Performs cleanup on service destruction
   */
  private cleanup(): void {
    this.stopTokenExpiryMonitoring();
    this.logoutCallbacks = [];
  }

  /**
   * Loads Google Identity Services script
   */
  private loadGoogleIdentityServices(): void {
    if (typeof window === 'undefined' || window.google) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.logger.info('Google Identity Services loaded');
      this.initializeGoogleSignIn();
    };
    script.onerror = () => {
      this.logger.error('Failed to load Google Identity Services');
    };
    document.head.appendChild(script);
  }
}


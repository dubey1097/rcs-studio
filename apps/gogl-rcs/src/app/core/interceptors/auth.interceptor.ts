import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Auth Interceptor
 * Attaches authentication token to HTTP requests
 * Implements HttpInterceptor interface
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  /**
   * Intercepts HTTP requests and adds authorization header
   * @param request - HTTP request
   * @param next - HTTP handler
   * @returns Observable of HTTP event
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    // Skip adding token for auth endpoints or if no token exists
    if (!token || this.isAuthEndpoint(request.url)) {
      return next.handle(request);
    }

    // Check if token is expired before making request
    if (this.authService.isTokenExpired()) {
      // Token expired, logout user
      this.authService.logout();
      return next.handle(request);
    }

    // Add authorization header
    const clonedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(clonedRequest);
  }

  /**
   * Checks if the request URL is an authentication endpoint
   * @param url - Request URL
   * @returns True if it's an auth endpoint
   */
  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/') || url.includes('/login') || url.includes('/logout');
  }
}


import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AppState } from '../../store';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '@gogl-rcs/shared/logger';

/**
 * Auth Guard
 * Protects routes that require authentication
 * Implements CanActivate interface
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private store: Store<AppState>,
    private authService: AuthService,
    private logger: LoggerService
  ) {}

  /**
   * Determines if a route can be activated
   * @param route - Activated route snapshot
   * @param state - Router state snapshot
   * @returns Observable or boolean indicating if route can be activated
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.store.select((state) => state.auth.isAuthenticated).pipe(
      take(1),
      map((isAuthenticated) => {
        // Also check AuthService as source of truth
        const isAuth = isAuthenticated || this.authService.isAuthenticated();

        if (!isAuth) {
          this.logger.warn('Unauthorized access attempt', { url: state.url });
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        return true;
      })
    );
  }
}


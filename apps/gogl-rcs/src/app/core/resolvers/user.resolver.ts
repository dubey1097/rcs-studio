import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoggerService } from '@gogl-rcs/shared/logger';
import { ApiService } from '../services/api.service';

/**
 * User Resolver
 * Pre-fetches user data before route activation
 * Implements Resolve interface
 */
@Injectable({
  providedIn: 'root',
})
export class UserResolver implements Resolve<unknown> {
  constructor(
    private apiService: ApiService,
    private logger: LoggerService
  ) {}

  /**
   * Resolves user data before route activation
   * @param route - Activated route snapshot
   * @param state - Router state snapshot
   * @returns Observable of user data
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<unknown> {
    const userId = route.params['id'];

    if (!userId) {
      this.logger.warn('User ID not provided in route', { url: state.url });
      return of(null);
    }

    // TODO: Implement actual user fetching
    // return this.apiService.get<User>(`users/${userId}`).pipe(
    //   catchError((error) => {
    //     this.logger.error('Failed to resolve user', error);
    //     return of(null);
    //   })
    // );

    return of(null); // Placeholder
  }
}


import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import * as AuthActions from '../actions/auth.actions';
import { AuthService } from '../../core/services/auth.service';
import { LoggerService } from '@gogl-rcs/shared/logger';

@Injectable()
export class AuthEffects {
  login$: any;
  loginSuccess$: any;
  logout$: any;
  logoutSuccess$: any;
  tokenExpired$: any;

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {
    // Initialize effects in constructor after dependency injection completes
    this.login$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        switchMap(({ token, user }) => {
          this.logger.info('Login effect triggered');
          // Token is already stored in AuthService, just update state
          return of(AuthActions.loginSuccess({ token, user }));
        })
      )
    );

    this.loginSuccess$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.loginSuccess),
          tap(() => {
            this.logger.info('Login successful, redirecting to home');
            this.router.navigate(['/home']);
          })
        ),
      { dispatch: false }
    );

    this.logout$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        switchMap(() => {
          this.authService.logout();
          this.logger.info('Logout effect triggered');
          return of(AuthActions.logoutSuccess());
        })
      )
    );

    this.logoutSuccess$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.logoutSuccess),
          tap(() => {
            this.logger.info('Logout successful, redirecting to login');
            this.router.navigate(['/login']);
          })
        ),
      { dispatch: false }
    );

    this.tokenExpired$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.tokenExpired),
          tap(() => {
            this.logger.warn('Token expired, redirecting to login');
            this.authService.logout();
            this.router.navigate(['/login'], { queryParams: { expired: 'true' } });
          })
        ),
      { dispatch: false }
    );
  }
}


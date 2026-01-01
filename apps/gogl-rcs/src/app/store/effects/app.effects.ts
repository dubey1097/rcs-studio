import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import * as AppActions from '../actions/app.actions';
import { LoggerService } from '@gogl-rcs/shared/logger';

@Injectable()
export class AppEffects {
  initializeApp$: any;

  constructor(
    private actions$: Actions,
    private logger: LoggerService
  ) {
    // Initialize effect in constructor after dependency injection completes
    this.initializeApp$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(AppActions.initializeApp),
        switchMap(() => {
          this.logger.info('Initializing application');
          // Simulate async initialization
          return of(null).pipe(
            map(() => AppActions.initializeAppSuccess()),
            catchError((error) => {
              this.logger.error('Failed to initialize app', error);
              return of(AppActions.initializeAppFailure({ error: error.message }));
            })
          );
        })
      );
    });
  }
}


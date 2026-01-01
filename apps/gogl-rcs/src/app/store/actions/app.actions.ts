import { createAction, props } from '@ngrx/store';

export const initializeApp = createAction('[App] Initialize App');

export const initializeAppSuccess = createAction('[App] Initialize App Success');

export const initializeAppFailure = createAction(
  '[App] Initialize App Failure',
  props<{ error: string }>()
);


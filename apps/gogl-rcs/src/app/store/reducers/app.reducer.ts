import { createReducer, on } from '@ngrx/store';
import * as AppActions from '../actions/app.actions';

export interface State {
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

export const initialState: State = {
  initialized: false,
  loading: false,
  error: null,
};

export const reducer = createReducer(
  initialState,
  on(AppActions.initializeApp, (state) => ({
    ...state,
    loading: true,
  })),
  on(AppActions.initializeAppSuccess, (state) => ({
    ...state,
    initialized: true,
    loading: false,
    error: null,
  })),
  on(AppActions.initializeAppFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);


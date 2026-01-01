import { createReducer, on } from '@ngrx/store';
import * as AuthActions from '../actions/auth.actions';

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: unknown | null;
  tokenExpiry: number | null;
  sessionStartTime: number | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  tokenExpiry: null,
  sessionStartTime: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { token, user }) => {
    // Extract token expiry from user if it's a GoogleIdToken
    const userObj = user as { exp?: number } | null;
    const tokenExpiry = userObj?.exp ? userObj.exp * 1000 : null;
    const sessionStartTime = Date.now();

    return {
      ...state,
      isAuthenticated: true,
      token,
      user,
      tokenExpiry,
      sessionStartTime,
      loading: false,
      error: null,
    };
  }),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false,
    error,
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true,
  })),
  on(AuthActions.logoutSuccess, () => ({
    ...initialState,
  })),
  on(AuthActions.setAuthState, (state, { isAuthenticated, token, user, tokenExpiry, sessionStartTime }) => ({
    ...state,
    isAuthenticated,
    token,
    user,
    tokenExpiry: tokenExpiry ?? state.tokenExpiry,
    sessionStartTime: sessionStartTime ?? state.sessionStartTime,
  })),
  on(AuthActions.tokenExpired, (state) => ({
    ...state,
    isAuthenticated: false,
    token: null,
    user: null,
    tokenExpiry: null,
    sessionStartTime: null,
    error: 'Session expired. Please sign in again.',
  }))
);


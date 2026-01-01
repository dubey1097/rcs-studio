import { createAction, props } from '@ngrx/store';

/**
 * Auth Actions
 * Actions for authentication state management
 */

export const login = createAction('[Auth] Login', props<{ token: string; user: unknown }>());

export const loginSuccess = createAction('[Auth] Login Success', props<{ token: string; user: unknown }>());

export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

export const checkAuth = createAction('[Auth] Check Auth');

export const setAuthState = createAction(
  '[Auth] Set Auth State',
  props<{
    isAuthenticated: boolean;
    token: string | null;
    user: unknown | null;
    tokenExpiry?: number | null;
    sessionStartTime?: number | null;
  }>()
);

export const tokenExpired = createAction('[Auth] Token Expired');


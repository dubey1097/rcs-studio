import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromApp from './reducers/app.reducer';
import * as fromAuth from './reducers/auth.reducer';

export interface AppState {
  app: fromApp.State;
  auth: fromAuth.AuthState;
}

export const reducers: ActionReducerMap<AppState> = {
  app: fromApp.reducer,
  auth: fromAuth.authReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];


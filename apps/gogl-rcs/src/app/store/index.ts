import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromApp from './reducers/app.reducer';
import * as fromAuth from './reducers/auth.reducer';
import * as fromCanvas from './reducers/canvas.reducer';

export interface AppState {
  app: fromApp.State;
  auth: fromAuth.AuthState;
  canvas: fromCanvas.CanvasState;
}

export const reducers: ActionReducerMap<AppState> = {
  app: fromApp.reducer,
  auth: fromAuth.authReducer,
  canvas: fromCanvas.reducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];


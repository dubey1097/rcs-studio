import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CanvasState } from '../reducers/canvas.reducer';

export const selectCanvasState = createFeatureSelector<CanvasState>('canvas');

export const selectSelectedNode = createSelector(
  selectCanvasState,
  (state: CanvasState) => state.selectedNode
);

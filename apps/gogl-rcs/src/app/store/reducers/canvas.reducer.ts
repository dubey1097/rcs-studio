import { createReducer, on } from '@ngrx/store';
import * as CanvasActions from '../actions/canvas.actions';
import { TooltipModel } from '../../features/canvas/tooltip.model';

export interface CanvasState {
  selectedNode: TooltipModel | null;
}

export const initialState: CanvasState = {
  selectedNode: null,
};

export const reducer = createReducer(
  initialState,
  on(CanvasActions.selectNode, (state, { node }) => ({
    ...state,
    selectedNode: node,
  })),
  on(CanvasActions.clearSelectedNode, (state) => ({
    ...state,
    selectedNode: null,
  }))
);

import { createAction, props } from '@ngrx/store';
import { TooltipModel } from '../../features/canvas/tooltip.model';

export const selectNode = createAction(
  '[Canvas] Select Node',
  props<{ node: TooltipModel | null }>()
);

export const clearSelectedNode = createAction('[Canvas] Clear Selected Node');

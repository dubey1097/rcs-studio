import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TooltipComponent } from './tooltip/tooltip.component';
import { PropertyPanelComponent } from './property-panel/property-panel.component';
import { TourOverlayComponent } from './tour-overlay/tour-overlay.component';
import { TransformControlsComponent } from './transform-controls/transform-controls.component';
import { CanvasComponent } from './canvas.component';

const routes: Routes = [
  {
    path: '',
    component: CanvasComponent,
  },
];

@NgModule({
  declarations: [CanvasComponent, TooltipComponent, PropertyPanelComponent, TourOverlayComponent, TransformControlsComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)],
  exports: [CanvasComponent],
})
export class CanvasModule {}

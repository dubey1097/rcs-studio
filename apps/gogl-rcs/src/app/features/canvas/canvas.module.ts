import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TooltipComponent } from './tooltip/tooltip.component';
import { PropertyPanelComponent } from './property-panel/property-panel.component';
import { CanvasComponent } from './canvas.component';

const routes: Routes = [
  {
    path: '',
    component: CanvasComponent,
  },
];

@NgModule({
  declarations: [CanvasComponent, TooltipComponent, PropertyPanelComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)],
  exports: [CanvasComponent],
})
export class CanvasModule {}

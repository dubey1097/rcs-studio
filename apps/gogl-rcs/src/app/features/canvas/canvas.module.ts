import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
// CDK Drag & Drop
import { DragDropModule } from '@angular/cdk/drag-drop';

import { TooltipComponent } from './tooltip/tooltip.component';
import { PropertyPanelComponent } from './property-panel/property-panel.component';
import { FocusedFieldComponent } from './property-panel/focused-field.component';
import { TourOverlayComponent } from './tour-overlay/tour-overlay.component';
import { PreviewComponent } from '../../shared/components/preview/preview.component';
import { CanvasComponent } from './canvas.component';

const routes: Routes = [
  {
    path: '',
    component: CanvasComponent,
  },
];

@NgModule({
  declarations: [CanvasComponent, TooltipComponent, PropertyPanelComponent, FocusedFieldComponent, TourOverlayComponent, PreviewComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    // Angular Material modules
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule
    ,DragDropModule
  ],
  exports: [CanvasComponent],
})
export class CanvasModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SharedUiModule } from '@gogl-rcs/shared/ui';

@NgModule({
  declarations: [],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SharedUiModule],
  exports: [CommonModule, ReactiveFormsModule, FormsModule, SharedUiModule],
})
export class SharedModule {}


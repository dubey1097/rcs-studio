import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ButtonComponent } from './button/button.component';
import { ModalComponent } from './modal/modal.component';
import { FormFieldComponent } from './form-field/form-field.component';

/**
 * Shared UI Module
 * Provides reusable UI components across the application
 * Follows Module pattern for component organization
 */
@NgModule({
  declarations: [ButtonComponent, ModalComponent, FormFieldComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  exports: [ButtonComponent, ModalComponent, FormFieldComponent],
})
export class SharedUiModule {}


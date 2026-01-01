import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  forwardRef,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';

/**
 * Form Field Component
 * Reusable form field component with validation support
 * Implements ControlValueAccessor pattern for reactive forms
 */
@Component({
  selector: 'lib-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true,
    },
  ],
})
export class FormFieldComponent implements ControlValueAccessor, OnInit {
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() errorMessage = '';
  @Input() hint = '';
  @Input() control?: FormControl;
  @Input() autocomplete?: string;
  @Input() ariaLabel?: string;
  @Output() valueChange = new EventEmitter<string>();

  value = '';
  private onChange = (value: string): void => {};
  private onTouched = (): void => {};

  ngOnInit(): void {
    if (this.control) {
      this.value = this.control.value || '';
    }
  }

  /**
   * Handles input value changes
   * @param event - Input event
   */
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  /**
   * Handles blur event
   */
  onBlur(): void {
    this.onTouched();
  }

  /**
   * Writes value from form control
   * @param value - The value to write
   */
  writeValue(value: string): void {
    this.value = value || '';
  }

  /**
   * Registers onChange callback
   * @param fn - The callback function
   */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /**
   * Registers onTouched callback
   * @param fn - The callback function
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Sets disabled state
   * @param isDisabled - Whether the field is disabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Gets error message from control or input
   * @returns Error message string
   */
  getErrorMessage(): string {
    if (this.control && this.control.errors && this.control.touched) {
      if (this.control.errors['required']) {
        return `${this.label || 'This field'} is required`;
      }
      if (this.control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (this.control.errors['minlength']) {
        return `Minimum length is ${this.control.errors['minlength'].requiredLength} characters`;
      }
      if (this.control.errors['maxlength']) {
        return `Maximum length is ${this.control.errors['maxlength'].requiredLength} characters`;
      }
      if (this.control.errors['pattern']) {
        return 'Please enter a valid value';
      }
    }
    return this.errorMessage;
  }

  /**
   * Checks if field has error
   * @returns True if field has error
   */
  hasError(): boolean {
    return !!(this.getErrorMessage() && (this.control?.touched || this.errorMessage));
  }
}


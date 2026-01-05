import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Suggestion } from '../tooltip.model';

@Component({
  selector: 'app-focused-field',
  templateUrl: './focused-field.component.html',
  styleUrls: ['./focused-field.component.scss']
})
export class FocusedFieldComponent {
  @Input() focusedField!: string;
  @Input() form!: FormGroup;
  @Input() suggestions!: Suggestion[];

  @Output() clearFocus = new EventEmitter();
  @Output() updateSuggestion = new EventEmitter<{ index: number; key: string; value: any }>();
  @Output() addSuggestion = new EventEmitter();
  @Output() removeSuggestion = new EventEmitter<number>();
}
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

export type ButtonType = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button Component
 * Reusable button component following Material Design principles
 * Implements Strategy pattern for different button types
 */
@Component({
  selector: 'lib-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() type: ButtonType = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() ariaLabel?: string;
  @Output() clicked = new EventEmitter<MouseEvent>();

  /**
   * Handles button click event
   * @param event - Mouse event
   */
  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }

  /**
   * Gets CSS classes for the button
   * @returns Array of CSS class names
   */
  getButtonClasses(): string[] {
    const classes = ['btn', `btn--${this.type}`, `btn--${this.size}`];
    if (this.disabled) {
      classes.push('btn--disabled');
    }
    if (this.loading) {
      classes.push('btn--loading');
    }
    if (this.fullWidth) {
      classes.push('btn--full-width');
    }
    return classes;
  }
}


import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';

/**
 * Modal Component
 * Reusable modal dialog component following Material Design principles
 * Implements Template Method pattern for modal lifecycle
 */
@Component({
  selector: 'lib-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() show = false;
  @Input() closeOnBackdropClick = true;
  @Input() closeOnEscape = true;
  @Input() size: 'small' | 'medium' | 'large' | 'full' = 'medium';
  @Output() closed = new EventEmitter<void>();
  @Output() shown = new EventEmitter<void>();

  /**
   * Handles escape key press
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.show && this.closeOnEscape) {
      this.close();
    }
  }

  ngOnInit(): void {
    if (this.show) {
      this.onShow();
    }
  }

  ngOnDestroy(): void {
    this.onHide();
  }

  /**
   * Handles backdrop click
   * @param event - Mouse event
   */
  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdropClick && (event.target as HTMLElement).classList.contains('modal__backdrop')) {
      this.close();
    }
  }

  /**
   * Closes the modal
   */
  close(): void {
    this.show = false;
    this.onHide();
    this.closed.emit();
  }

  /**
   * Gets CSS classes for the modal
   * @returns Array of CSS class names
   */
  getModalClasses(): string[] {
    return ['modal', `modal--${this.size}`];
  }

  /**
   * Called when modal is shown
   */
  private onShow(): void {
    document.body.style.overflow = 'hidden';
    this.shown.emit();
  }

  /**
   * Called when modal is hidden
   */
  private onHide(): void {
    document.body.style.overflow = '';
  }
}


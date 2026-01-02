import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tour-overlay',
  templateUrl: './tour-overlay.component.html',
  styleUrls: ['./tour-overlay.component.scss'],
})
export class TourOverlayComponent {
  @Input() tourStep?: number | null;
  @Input() tourTipLeft?: number | null;
  @Input() tourTipTop?: number | null;
  @Output() nextTour = new EventEmitter<void>();
  @Output() skipTour = new EventEmitter<void>();
}
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-transform-controls',
  templateUrl: './transform-controls.component.html',
  styleUrls: ['./transform-controls.component.scss'],
})
export class TransformControlsComponent {
  @Input() selectedId?: string;
  @Input() scalePercent = 100;
  @Output() rotate = new EventEmitter<number>();
  @Output() zoom = new EventEmitter<number>();
  @Output() reset = new EventEmitter<void>();
}
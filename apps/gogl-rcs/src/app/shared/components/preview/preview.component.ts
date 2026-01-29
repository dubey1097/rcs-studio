import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../../store';
import { selectSelectedNode } from '../../../store/selectors/canvas.selectors';
import { TooltipModel } from '../../../features/canvas/tooltip.model';


type Theme = 'light' | 'dark';
type Orientation = 'portrait' | 'landscape';
type Platform = 'android' | 'ios';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Input() tooltip?: TooltipModel;

  selectedNode$: Observable<TooltipModel | null>;

  theme: Theme = 'light';
  orientation: Orientation = 'portrait';
  platform: Platform = 'android';

  constructor(private store: Store<AppState>) {
    this.selectedNode$ = this.store.select(selectSelectedNode);
  }

  ngOnInit(): void { }

  setTheme(value: Theme) {
    this.theme = value;
  }

  setOrientation(value: Orientation) {
    this.orientation = value;
  }

  setPlatform(value: Platform) {
    this.platform = value;
  }

  getDisplayTooltip(): TooltipModel | undefined {
    return this.tooltip;
  }

  getPreviewStyle() {
    const tooltip = this.getDisplayTooltip();
    if (!tooltip) return {};
    return {
      transform: `rotate(${tooltip.rotation || 0}deg) scale(${tooltip.scale || 1})`,
    };
  }
}

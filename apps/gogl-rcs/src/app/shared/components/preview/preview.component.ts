import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../../store';
import { selectSelectedNode } from '../../../store/selectors/canvas.selectors';
import { TooltipModel } from '../../../features/canvas/tooltip.model';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  @Input() tooltip?: TooltipModel;
  
  selectedNode$: Observable<TooltipModel | null>;

  constructor(private store: Store<AppState>) {
    this.selectedNode$ = this.store.select(selectSelectedNode);
  }

  ngOnInit(): void {}

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

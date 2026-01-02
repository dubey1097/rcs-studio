import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { TooltipModel } from './tooltip.model';

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  ngOnInit(): void {
    this.tourStep = 1;
    this.addTooltip();
  }

  ngAfterViewInit(): void {
    // position the tour tip after DOM is ready
    setTimeout(() => this.positionTourTip(), 80);
    window.addEventListener('resize', this._resizeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this._resizeHandler);
  }


  tooltips: TooltipModel[] = [];
  selectedId?: string;
  // which specific field inside the selected tooltip is being edited (when double-clicked)
  focusedField?: 'title' | 'text' | 'suggestion' | 'subText' | null;
  // in-app tour step: 1 = tooltip tip, 2 = property panel tip, null = no tour
  tourStep?: number | null = null;

  // computed position (pixels) for the canvas tour tip. Null leaves CSS fallback.
  tourTipLeft?: number | null = null;
  tourTipTop?: number | null = null;

  private _resizeHandler = () => this.positionTourTip();

  // advance tour to next step
  nextTour() {
    if (!this.tourStep) return;
    if (this.tourStep === 1) this.tourStep = 2;
    else this.finishTour();
  }

  // finish and persist tour seen flag
  finishTour() {
    this.tourStep = null;
    try {
      localStorage.setItem('gogl_canvas_tour_seen', '1');
    } catch (err) {
      // ignore storage errors
    }
  }

  // skip tour immediately
  skipTour() {
    this.finishTour();
  }

  // reset tour (clear flag and restart)
  resetTour() {
    try {
      localStorage.removeItem('gogl_canvas_tour_seen');
    } catch (err) {
      // ignore
    }
    // restart tour after a tick so UI is settled and then reposition tip
    setTimeout(() => {
      this.tourStep = 1;
      setTimeout(() => this.positionTourTip(), 80);
    }, 50);
  }

  get selectedTooltip(): TooltipModel | undefined {
    return this.tooltips.find((t) => t.id === this.selectedId);
  }

  addTooltip() {
    const t: TooltipModel = {
      id: uid(),
  messageName: 'Welcome message',
      x: 50,
      y: 50,
      titleEnabled: false,
      title: '',
      text: `Hello I'm your first message. Single-click here to customize my properties. Double-click hear to edit the text. Hit "Send to phone" in the right upper cornerto test your message on your device. Have fun!`,
      mediaEnabled: false,
      mediaUrl: null,
      mediaOrientation: 'vertical',
      mediaSize: 'medium',
      rotation: 0,
      scale: 1,
      suggestion: { enabled: false, type: 'text', text: 'New suggestion' },
      suggestions: [],
    };
    // Try to center the tooltip inside the canvas if available
    try {
      const canvasEl = document.getElementById('canvas');
      if (canvasEl) {
        const rect = canvasEl.getBoundingClientRect();
        // approximate tooltip width/height to center (half widths)
        const approxW = 260; // matches CSS max-width
        const approxH = 200;
        t.x = Math.max(8, Math.round(rect.width / 2 - approxW / 2));
        t.y = Math.max(8, Math.round(rect.height / 2 - approxH / 2));
      }
    } catch (err) {
      // ignore and use defaults
    }
    this.tooltips.push(t);
    // this.select(t.id);
    // If the tour is visible, reposition the tip after the new tooltip is rendered
    setTimeout(() => {
      if (this.tourStep === 1) this.positionTourTip();
    }, 60);
  }

  // Compute a position for the canvas tour tip so it sits to the left of the first tooltip
  // and is vertically centered relative to that tooltip. Updates tourTipLeft/tourTipTop.
  positionTourTip() {
    try {
      const canvas = document.getElementById('canvas');
      const tooltipEl = document.querySelector('#canvas .tooltip') as HTMLElement | null;
      const tipEl = document.querySelector('.tour-tip.tour-canvas') as HTMLElement | null;
      if (!canvas || !tooltipEl || !tipEl) return;

      const canvasRect = canvas.getBoundingClientRect();
      const ttRect = tooltipEl.getBoundingClientRect();
      const tipRect = tipEl.getBoundingClientRect();

      const gap = 12;
      let left = ttRect.left - canvasRect.left - tipRect.width - gap;
      if (left < 8) left = 16;

      let top = ttRect.top - canvasRect.top + Math.round((ttRect.height - tipRect.height) / 2);
      top = Math.max(8, Math.min(canvasRect.height - tipRect.height - 8, top));

      this.tourTipLeft = Math.round(left);
      this.tourTipTop = Math.round(top);
    } catch (err) {
      // ignore and let CSS fallback take over
    }
  }

  rotateSelected(delta: number) {
    const t = this.selectedTooltip;
    if (!t) return;
    t.rotation = (t.rotation || 0) + delta;
    this.updateTooltip(t);
  }

  zoomSelected(factor: number) {
    const t = this.selectedTooltip;
    if (!t) return;
    const newScale = Math.max(0.3, Math.min(3, (t.scale || 1) * factor));
    t.scale = newScale;
    this.updateTooltip(t);
  }

  resetTransform() {
    const t = this.selectedTooltip;
    if (!t) return;
    t.rotation = 0;
    t.scale = 1;
    this.updateTooltip(t);
  }

  getSelectedScalePercent(): number {
    const t = this.selectedTooltip;
    if (!t) return 100;
    return Math.round((t.scale || 1) * 100);
  }

  select(id: string) {
    this.selectedId = id;
    // debug: log selection to help troubleshoot property panel not opening
    try {
      // eslint-disable-next-line no-console
      console.log('[Canvas] selected tooltip', id);
    } catch (err) {}
    // single-click selection clears any focused field editing
    this.focusedField = undefined;
    this.nextTour();
  }

  clearSelection() {
    this.selectedId = undefined;
    this.finishTour();
  }

  updateTooltip(updated: TooltipModel) {
    const idx = this.tooltips.findIndex((t) => t.id === updated.id);
    if (idx >= 0) {
      this.tooltips[idx] = { ...updated };
    }
  }

  removeTooltip(id: string) {
    this.tooltips = this.tooltips.filter((t) => t.id !== id);
    if (this.selectedId === id) this.selectedId = undefined;
  }

  onEditField(field: 'title' | 'text' | 'suggestion' | 'subText', id: string) {
    // ensure the tooltip is selected and set focused field so property panel shows only that control
    this.selectedId = id;
    this.focusedField = field;
  }

  onClearFocus() {
    this.focusedField = undefined;
  }

  saveJson() {
    const json = JSON.stringify(this.tooltips, null, 2);
    // trigger download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tooltips.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}

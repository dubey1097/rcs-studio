import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { TooltipModel, Relation } from './tooltip.model';
import * as CanvasActions from '../../store/actions/canvas.actions';
import { AppState } from '../../store';
import { convertCanvasToRCSFlow } from './canvas-export.utility';

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(private store: Store<AppState>) { }

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

  agentId: string = "agent-01";
  flowId: string = "flow-01";
  flowName: string = "Sample Flow";
  editing = false;
  tooltips: TooltipModel[] = [];
  selectedId?: string;
  showPropertyPanel: boolean = false;
  // which specific field inside the selected tooltip is being edited (when double-clicked)
  focusedField?: 'title' | 'text' | 'suggestion' | 'subText' | null;
  // in-app tour step: 1 = tooltip tip, 2 = property panel tip, null = no tour
  tourStep?: number | null = null;

  // Transform controls state
  showPreview = false;

  // Phone preview modal
  showPhonePreviewModal = false;

  // Preview tray drag state
  previewTrayPosition = { x: 0, y: 0 };
  private _previewDragStartMouse = { x: 0, y: 0 };
  private _previewDragStartPos = { x: 0, y: 0 };
  isDraggingPreviewTray = false;

  // computed position (pixels) for the canvas tour tip. Null leaves CSS fallback.
  tourTipLeft?: number | null = null;
  tourTipTop?: number | null = null;

  // Controls the visibility of the asset tray
  showAssetTray = false;
  // If the tray was opened at a specific canvas point, make it floating and store coords (px inside workspace)
  assetTrayFloating = false;
  assetTrayLeft: number | null = null;
  assetTrayTop: number | null = null;

  // Relations between nodes: allow linking from a suggestion (connector) to a message
  // Connection from a suggestion/connector in one tooltip to the target tooltip
  relations: Relation[] = [];

  // linking state when user starts drawing a relationship
  linkingSourceId: string | null = null;
  linkingConnectorId: string | null = null;
  tempLinkStart: { x: number; y: number } | null = null;
  tempLinkEnd: { x: number; y: number } | null = null;
  // temporary endpoint marker (when user releases on empty canvas, shows clickable dot + icon)
  pendingLinkEnd: { x: number; y: number } | null = null;
  // temporary relation created when pendingLinkEnd is set (solid arrow to that position)
  pendingRelationId: string | null = null;
  // state for popup menu showing asset items at pending endpoint
  showPendingAssetMenu = false;
  pendingAssetMenuPos: { x: number; y: number } | null = null;
  // source node id when creating a relation from a suggestion
  pendingSourceId: string | null = null;
  // source connector id for the pending relation
  pendingSourceConnectorId: string | null = null;
  // flag to prevent click from clearing pendingLinkEnd right after mouseup sets it
  private _justReleasedLink = false;

  private _resizeHandler = () => this.positionTourTip();

  // advance tour to next step
  nextTour() {
    if (!this.tourStep) return;
    if (this.tourStep === 1) this.tourStep = 2;
    else this.finishTour();
  }

  // Called when a tooltip's link-dot is clicked to begin drawing a relation
  onStartLink(payload: { id: string; connectorId?: string; offsetX?: number; offsetY?: number }) {
    this.linkingSourceId = payload.id;
    this.linkingConnectorId = payload.connectorId || null;
    // Calculate start position using the offset from tooltip's top-left corner
    const fromT = this.tooltips.find((t) => t.id === payload.id);
    if (fromT && typeof payload.offsetX === 'number' && typeof payload.offsetY === 'number') {
      this.tempLinkStart = {
        x: (fromT.x || 0) + payload.offsetX,
        y: (fromT.y || 0) + payload.offsetY
      };
      this.tempLinkEnd = { ...this.tempLinkStart };
    } else {
      // Fallback to center if offset not provided
      this.tempLinkStart = null;
      this.tempLinkEnd = null;
    }
  }

  // Open the asset tray at a specific canvas-local position
  openAssetTrayAtCanvasPos(cnvX: number, cnvY: number) {
    try {
      const canvasEl = document.getElementById('canvas');
      if (!canvasEl) return;
      const canvasRect = canvasEl.getBoundingClientRect();
      const workspaceEl = canvasEl.parentElement as HTMLElement | null;
      const workspaceRect = workspaceEl ? workspaceEl.getBoundingClientRect() : canvasRect;
      // compute left/top relative to workspace
      let left = Math.round(canvasRect.left - workspaceRect.left + cnvX);
      let top = Math.round(canvasRect.top - workspaceRect.top + cnvY);
      // clamp so tray stays visible (assume tray width ~320, height ~260)
      const trayW = 340;
      const trayH = 300;
      left = Math.max(8, Math.min(left, Math.max(8, Math.round(workspaceRect.width - trayW - 8))));
      top = Math.max(8, Math.min(top, Math.max(8, Math.round(workspaceRect.height - trayH - 8))));

      this.assetTrayFloating = true;
      this.assetTrayLeft = left;
      this.assetTrayTop = top;
      this.showAssetTray = true;
      // focus tray after it's visible
      setTimeout(() => {
        const el = document.querySelector('.asset-tray .tray-content') as HTMLElement | null;
        if (el) el.focus();
      }, 40);
    } catch (err) {
      this.assetTrayFloating = false;
      this.assetTrayLeft = null;
      this.assetTrayTop = null;
      this.showAssetTray = true;
    }
  }

  onRelationEndDotClick(r: any, e: MouseEvent) {
    e.stopPropagation();
    if (!r || !r.toPos) return;
    this.openAssetTrayAtCanvasPos(r.toPos.x, r.toPos.y);
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
    return this.selectedId?this.tooltips.find((t) => t.id === this.selectedId): undefined;
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
      suggestion: { enabled: false, type: 'text', text: 'New suggestion', id: uid() },
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

  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  closePreview() {
    this.showPreview = false;
  }

  openPhonePreview() {
    this.showPhonePreviewModal = true;
  }

  closePhonePreview() {
    this.showPreview = false;
  }

  onPreviewTrayMouseDown(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('.tray-close')) return;

    this.isDraggingPreviewTray = true;
    this._previewDragStartMouse = { x: event.clientX, y: event.clientY };
    this._previewDragStartPos = { ...this.previewTrayPosition };
    event.preventDefault();
  }

  onPreviewTrayMouseMove(event: MouseEvent) {
    if (!this.isDraggingPreviewTray) return;

    const deltaX = event.clientX - this._previewDragStartMouse.x;
    const deltaY = event.clientY - this._previewDragStartMouse.y;

    this.previewTrayPosition = {
      x: this._previewDragStartPos.x + deltaX,
      y: this._previewDragStartPos.y + deltaY,
    };
  }

  onPreviewTrayMouseUp() {
    this.isDraggingPreviewTray = false;
  }

  getSelectedScalePercent(): number {
    const t = this.selectedTooltip;
    if (!t) return 100;
    return Math.round((t.scale || 1) * 100);
  }

  select(id: string) {
    // If we're currently drawing a relation, finalize it by creating a relation
    if (this.linkingSourceId) {
      const source = this.linkingSourceId;
      if (id && id !== source) {
        // compute source offset so the link start moves with the node
        const fromNode = this.tooltips.find((t) => t.id === source);
        let fromOffset = undefined as { x: number; y: number } | undefined;
        if (fromNode && this.tempLinkStart) {
          fromOffset = { x: this.tempLinkStart.x - (fromNode.x || 0), y: this.tempLinkStart.y - (fromNode.y || 0) };
        }
        this.relations.push({ fromMessageId: source, fromSuggestionId: this.linkingConnectorId || '', connectionId: uid(), toMessageId: id, fromOffset });
      }
      this.linkingSourceId = null;
      this.linkingConnectorId = null;
      this.tempLinkStart = null;
      this.tempLinkEnd = null;
      this.selectedId = id; // Ensure the node is still selected
    }

    this.selectedId = id;
    this.showPropertyPanel = true;
    const selectedNode = this.tooltips.find((t) => t.id === id);
    this.store.dispatch(CanvasActions.selectNode({ node: selectedNode || null }));
    // debug: log selection to help troubleshoot property panel not opening
    try {
      // eslint-disable-next-line no-console
      console.log('[Canvas] selected tooltip', id);
    } catch (err) { }
    // single-click selection clears any focused field editing
    this.focusedField = undefined;
    this.nextTour();
  }

  clearSelection(showProperty: boolean = false) {
    this.selectedId = undefined;
    this.store.dispatch(CanvasActions.clearSelectedNode());
    this.finishTour();
    // cancel any in-progress linking
    this.linkingSourceId = null;
    this.linkingConnectorId = null;
    this.tempLinkStart = null;
    this.tempLinkEnd = null;
     this.showPropertyPanel = showProperty;
  }

  onCanvasClick(e: MouseEvent) {
    // If clicking on the pending endpoint dot (SVG circle), let that handler fire
    const target = e.target as SVGElement | null;
    if (target && target.tagName === 'circle' && this.pendingLinkEnd) {
      return; // Let the circle click handler on the SVG fire
    }
    if (this.linkingSourceId) return;
    // Don't clear pendingLinkEnd if we just released a link (let user click the dot)
    if (this._justReleasedLink) return;
    try {
      const targetEl = e.target as HTMLElement | null;
      // if click originated inside a tooltip, don't clear selection (protect against bubbling/CDK)
      if (targetEl && targetEl.closest && targetEl.closest('.tooltip')) return;
    } catch (err) { }
    // Clear pending endpoint and remove temporary relation when clicking on actual canvas after some time
    this.onCanvasClearPending();
    this.clearSelection(true);
  }

  // Update temporary link end coords while user moves pointer
  onCanvasMouseMove(e: MouseEvent) {
    if (!this.linkingSourceId) return;
    try {
      const canvasEl = document.getElementById('canvas');
      if (!canvasEl) return;
      const rect = canvasEl.getBoundingClientRect();
      this.tempLinkEnd = { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) };
    } catch (err) {
      this.tempLinkEnd = null;
    }
  }

  // Finalize link if mouse released on canvas (create relation to arbitrary position)
  onCanvasMouseUp(e: MouseEvent) {
    if (!this.linkingSourceId) return;
    try {
      const canvasEl = document.getElementById('canvas');
      if (!canvasEl) return;
      const rect = canvasEl.getBoundingClientRect();

      // If mouseup occurred over another tooltip element, finalize relation to that node
      try {
        const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        const tipEl = el ? el.closest('[data-tooltip-id]') as HTMLElement | null : null;
        const targetId = tipEl ? tipEl.getAttribute('data-tooltip-id') : null;
        if (targetId && targetId !== this.linkingSourceId) {
          // call select to finalize relation to this node (select handles pushing relation and cleanup)
          this.select(targetId);
          return;
        }
      } catch (err) {
        // ignore and fallback to pending endpoint
      }

      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);
      // Set pending endpoint marker to show clickable dot + icon at arrow tip
      this.pendingLinkEnd = { x, y };
      this.pendingSourceId = this.linkingSourceId;
      this.pendingSourceConnectorId = this.linkingConnectorId;
      this._justReleasedLink = true;
      // Create a solid relation to this position so arrow persists
      // Use the actual offset from the link dot click (stored in tempLinkStart)
      const fromT = this.tooltips.find((t) => t.id === this.linkingSourceId);
      const tempRelationId = `_pending_${Math.random().toString(36).slice(2, 9)}`;
      this.pendingRelationId = tempRelationId;
      this.relations.push({ fromMessageId: this.linkingSourceId!, fromSuggestionId: this.linkingConnectorId || '', connectionId: uid(), toPos: { x, y }, fromPos: this.tempLinkStart || undefined });
      // Clear flag after a tick so click handler can detect it
      setTimeout(() => { this._justReleasedLink = false; }, 0);
      // Clear linking state
      this.linkingSourceId = null;
      this.linkingConnectorId = null;
      this.tempLinkStart = null;
      this.tempLinkEnd = null;
    } catch (err) {
      // ignore
    }
  }

  // Handle click on pending endpoint dot to open asset menu
  onPendingEndDotClick(e: MouseEvent) {
    e.stopPropagation();
    if (!this.pendingLinkEnd) return;
    // Show popup menu with asset items next to the + circle
    this.showPendingAssetMenu = true;
    this.pendingAssetMenuPos = { x: this.pendingLinkEnd.x + 40, y: this.pendingLinkEnd.y - 40 };
  }

  // Handle asset selection from pending menu: create asset and finalize relation
  onPendingAssetSelected(type: string) {
    if (!this.pendingLinkEnd || !this.pendingSourceId) return;
    // Create new asset at pending endpoint location, offset so the link dot aligns with the pending position
    const nodePosition = {
      x: this.pendingLinkEnd.x - 30, // Offset so link dot (at +30) aligns with pendingLinkEnd
      y: this.pendingLinkEnd.y - 20  // Offset so link dot (at +20) aligns with pendingLinkEnd
    };
    const newAsset = this.addAssetAtPositionAndReturn(type, nodePosition.x, nodePosition.y);
    if (!newAsset) return;

    // Remove the temporary relation (arrow to position)
    if (this.pendingRelationId) {
      this.relations = this.relations.filter(r => {
        if (r.toPos && this.pendingLinkEnd && r.toPos.x === this.pendingLinkEnd.x && r.toPos.y === this.pendingLinkEnd.y) {
          return false;
        }
        return true;
      });
    }

    // Create a real relation from source to the newly created node
    // Calculate the fromOffset based on the current tooltip position and the stored fromPos
    const pendingRelation = this.relations.find(r =>
      r.fromMessageId === this.pendingSourceId &&
      r.toPos &&
      this.pendingLinkEnd &&
      r.toPos.x === this.pendingLinkEnd.x &&
      r.toPos.y === this.pendingLinkEnd.y
    );
    const fromT = this.tooltips.find((t) => t.id === this.pendingSourceId);
    const fromOffset = pendingRelation?.fromPos && fromT ? {
      x: pendingRelation.fromPos.x - (fromT.x || 0),
      y: pendingRelation.fromPos.y - (fromT.y || 0)
    } : { x: 30, y: 20 }; // fallback to old hardcoded value
    this.relations.push({ fromMessageId: this.pendingSourceId, fromSuggestionId: this.pendingSourceConnectorId || '', connectionId: uid(), toMessageId: newAsset.id, fromOffset });

    // Clear pending state
    this.showPendingAssetMenu = false;
    this.pendingAssetMenuPos = null;
    this.pendingLinkEnd = null;
    this.pendingSourceId = null;
    this.pendingSourceConnectorId = null;
    this.pendingRelationId = null;
  }

  // Create asset and return it (used by pending asset menu)
  private addAssetAtPositionAndReturn(type: string, x: number, y: number) {
    const base: TooltipModel = {
      id: uid(),
      messageName: `${type} - ${Date.now()}`,
      x,
      y,
      titleEnabled: false,
      title: '',
      text: '',
      mediaEnabled: false,
      mediaUrl: null,
      mediaOrientation: 'vertical',
      mediaSize: 'medium',
      rotation: 0,
      scale: 1,
      suggestion: { enabled: false, type: 'text', text: '', id: uid() },
      suggestions: [],
    };

    switch (type) {
      case 'text':
        base.text = 'New text message';
        break;
      case 'reach':
        base.titleEnabled = true;
        base.title = 'Reach Card';
        base.text = 'Tap to learn more';
        break;
      case 'carousel':
        base.text = 'Carousel item (preview)';
        break;
      case 'input':
        base.titleEnabled = true;
        base.title = 'User Input';
        base.text = 'Enter a response';
        break;
      default:
        base.text = 'New asset';
    }

    this.tooltips.push(base);
    setTimeout(() => this.positionTourTip(), 40);
    return base;
  }

  // Clear pending endpoint when clicking elsewhere
  onCanvasClearPending() {
    // Remove the pending relation arrow when canceling
    if (this.pendingRelationId) {
      this.relations = this.relations.filter(r => {
        // Keep all relations except the one we just created with toPos at pendingLinkEnd
        if (r.toPos && this.pendingLinkEnd && r.toPos.x === this.pendingLinkEnd.x && r.toPos.y === this.pendingLinkEnd.y) {
          return false;
        }
        return true;
      });
      this.pendingRelationId = null;
    }
    this.showPendingAssetMenu = false;
    this.pendingAssetMenuPos = null;
    this.pendingLinkEnd = null;
    this.pendingSourceId = null;
    this.pendingSourceConnectorId = null;
  }

  // Compute a smooth cubic-bezier path string between two points
  private _bezierPath(x1: number, y1: number, x2: number, y2: number): string {
    const dx = x2 - x1;
    const curvature = Math.max(40, Math.min(180, Math.abs(dx) * 0.5));
    const cx1 = x1 + curvature;
    const cy1 = y1;
    const cx2 = x2 - curvature;
    const cy2 = y2;
    return `M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`;
  }

  // Return SVG path 'd' for an existing relation
  getRelationPath(r: { fromMessageId: string; toMessageId?: string; toPos?: { x: number; y: number }; fromPos?: { x: number; y: number }; fromOffset?: { x: number; y: number } }): string {
    const fromT = this.tooltips.find((t) => t.id === r.fromMessageId);
    if (!fromT) return '';
    // derive start: prefer a stored relative offset so it follows the node; fall back to previously stored absolute pos for compatibility
    let start = { x: (fromT.x || 0) + 30, y: (fromT.y || 0) + 20 };
    if (r.fromOffset) {
      start = { x: (fromT.x || 0) + r.fromOffset.x, y: (fromT.y || 0) + r.fromOffset.y };
    } else if (r.fromPos) {
      // backward-compatibility: compute offset from absolute pos
      start = { x: r.fromPos.x, y: r.fromPos.y };
      // optionally convert to offset for future usage (not persisted)
    }

    let end = { x: 0, y: 0 };
    if (r.toPos) end = r.toPos;
    else if (r.toMessageId) {
      const toT = this.tooltips.find((t) => t.id === r.toMessageId!);
      if (!toT) return '';
      end = { x: (toT.x || 0) + 30, y: (toT.y || 0) + 20 };
    } else return '';
    return this._bezierPath(start.x, start.y, end.x, end.y);
  }

  // Return SVG path for current temporary link
  getTempPath(): string {
    if (!this.tempLinkStart || !this.tempLinkEnd) return '';
    return this._bezierPath(this.tempLinkStart.x, this.tempLinkStart.y, this.tempLinkEnd.x, this.tempLinkEnd.y);
  }

  // Return pixel coords for relation ends relative to canvas for rendering
  getRelationCoords(r: { fromMessageId: string; toMessageId: string }) {
    const from = this.tooltips.find((t) => t.id === r.fromMessageId);
    const to = this.tooltips.find((t) => t.id === r.toMessageId);
    const defaultPos = { x1: 0, y1: 0, x2: 0, y2: 0 };
    if (!from || !to) return defaultPos;
    const x1 = (from.x || 0) + 30;
    const y1 = (from.y || 0) + 20;
    const x2 = (to.x || 0) + 30;
    const y2 = (to.y || 0) + 20;
    return { x1, y1, x2, y2 };
  }

  updateTooltip(updated: TooltipModel) {
    const idx = this.tooltips.findIndex((t) => t.id === updated.id);
    if (idx >= 0) {
      this.tooltips[idx] = { ...updated };
      // Update the store's selected node if this is the selected one
      if (this.selectedId === updated.id) {
        this.store.dispatch(CanvasActions.selectNode({ node: updated }));
      }
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
    const flow = convertCanvasToRCSFlow(this.agentId, this.flowId, this.tooltips, this.relations, this.flowName);
    const json = JSON.stringify(flow, null, 2);
    // trigger download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-${this.flowId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }


  // Toggle the asset tray visibility
  toggleAssetTray(): void {
    if (this.showAssetTray) {
      // closing
      this.showAssetTray = false;
      this.assetTrayFloating = false;
      this.assetTrayLeft = null;
      this.assetTrayTop = null;
    } else {
      // opening in default bottom-left
      this.showAssetTray = true;
      this.assetTrayFloating = false;
      setTimeout(() => {
        const el = document.querySelector('.asset-tray .tray-content') as HTMLElement | null;
        if (el) el.focus();
      }, 80);
    }
  }

  // Custom asset drag state
  private _isDraggingAsset = false;
  private _draggedAssetType: string | null = null;
  private _dragPreviewElement: HTMLElement | null = null;
  private _dragStartPos: { x: number; y: number } | null = null;
  private _preventClick = false;

  // Custom mouse-based drag for assets (prevents removal from tray)
  onAssetMouseDown(event: MouseEvent, type: string): void {
    // Prevent default to avoid text selection
    event.preventDefault();
    event.stopPropagation();

    // Reset drag state
    this._preventClick = false;
    this._isDraggingAsset = false;
    this._dragStartPos = { x: event.clientX, y: event.clientY };
    this._draggedAssetType = type;

    // Add document listeners for drag
    document.addEventListener('mousemove', this.onAssetMouseMove);
    document.addEventListener('mouseup', this.onAssetMouseUp);
  }

  // Click handler that prevents firing after drag operations
  onAssetClick(type: string): void {
    if (!this._preventClick) {
      this.addAssetAtCenter(type as 'text' | 'reach' | 'carousel' | 'input');
    }
  }

  private onAssetMouseMove = (event: MouseEvent): void => {
    if (!this._isDraggingAsset && this._dragStartPos) {
      // Check if mouse moved enough to start drag (prevent accidental drags)
      const deltaX = Math.abs(event.clientX - this._dragStartPos.x);
      const deltaY = Math.abs(event.clientY - this._dragStartPos.y);
      if (deltaX > 5 || deltaY > 5) {
        this.startAssetDrag(event);
      }
    } else if (this._isDraggingAsset && this._dragPreviewElement) {
      // Update drag preview position
      this._dragPreviewElement.style.left = (event.clientX + 10) + 'px';
      this._dragPreviewElement.style.top = (event.clientY + 10) + 'px';
    }
  };

  private onAssetMouseUp = (event: MouseEvent): void => {
    // Clean up listeners
    document.removeEventListener('mousemove', this.onAssetMouseMove);
    document.removeEventListener('mouseup', this.onAssetMouseUp);

    if (this._isDraggingAsset) {
      this.endAssetDrag(event);
      this._preventClick = true; // Prevent click handler from firing
    } else if (this._draggedAssetType) {
      // If it was just a click (no drag), allow click handler to fire
      this._preventClick = false;
    }

    // Clear drag state
    this._draggedAssetType = null;
    this._dragStartPos = null;
  };

  private startAssetDrag(event: MouseEvent): void {
    this._isDraggingAsset = true;

    // Create drag preview element
    this._dragPreviewElement = document.createElement('div');
    this._dragPreviewElement.className = 'asset-item preview';
    this._dragPreviewElement.textContent = this.getAssetDisplayName(this._draggedAssetType!);
    this._dragPreviewElement.style.position = 'fixed';
    this._dragPreviewElement.style.left = (event.clientX + 10) + 'px';
    this._dragPreviewElement.style.top = (event.clientY + 10) + 'px';
    this._dragPreviewElement.style.zIndex = '9999';
    this._dragPreviewElement.style.pointerEvents = 'none';

    document.body.appendChild(this._dragPreviewElement);
  }

  private endAssetDrag(event: MouseEvent): void {
    this._isDraggingAsset = false;

    // Remove drag preview
    if (this._dragPreviewElement) {
      document.body.removeChild(this._dragPreviewElement);
      this._dragPreviewElement = null;
    }

    // Check if dropped on canvas
    try {
      const canvasEl = document.getElementById('canvas');
      if (!canvasEl || !this._draggedAssetType) return;

      const canvasRect = canvasEl.getBoundingClientRect();
      if (event.clientX >= canvasRect.left && event.clientX <= canvasRect.right &&
        event.clientY >= canvasRect.top && event.clientY <= canvasRect.bottom) {
        const x = Math.max(8, Math.round(event.clientX - canvasRect.left));
        const y = Math.max(8, Math.round(event.clientY - canvasRect.top));
        this.addAssetAtPosition(this._draggedAssetType, x, y);
      }
    } catch (err) {
      // ignore
    }
  }

  private getAssetDisplayName(type: string): string {
    switch (type) {
      case 'text': return 'Text message';
      case 'reach': return 'Reach card';
      case 'carousel': return 'Carousel';
      case 'input': return 'User input';
      default: return 'Asset';
    }
  }

  // --- Node dragging (existing tooltips) via CDK ---
  private _lastNodePointer: { x: number; y: number } | null = null;

  onNodeDragMoved(event: any, t?: TooltipModel): void {
    try {
      // prefer the dragged element root rect so we can set the tooltip top-left to match visual
      const canvasEl = document.getElementById('canvas');
      const canvasRect = canvasEl ? canvasEl.getBoundingClientRect() : null;
      const dragRoot = event && event.source && typeof event.source.getRootElement === 'function' ? event.source.getRootElement() : null;
      if (dragRoot && canvasRect && t) {
        const elRect = dragRoot.getBoundingClientRect();
        const x = Math.max(0, Math.round(elRect.left - canvasRect.left));
        const y = Math.max(0, Math.round(elRect.top - canvasRect.top));
        t.x = x;
        t.y = y;
        this.updateTooltip(t);
        return;
      }

      if (event) {
        if (event.pointerPosition) this._lastNodePointer = { x: event.pointerPosition.x, y: event.pointerPosition.y };
        else if (event.event && typeof event.event.clientX === 'number') this._lastNodePointer = { x: event.event.clientX, y: event.event.clientY };
      }

      // fallback: if we have a tooltip and pointer coords, update its position
      if (t && this._lastNodePointer && canvasRect) {
        const x = Math.max(0, Math.round(this._lastNodePointer.x - canvasRect.left));
        const y = Math.max(0, Math.round(this._lastNodePointer.y - canvasRect.top));
        t.x = x;
        t.y = y;
        this.updateTooltip(t);
      }
    } catch (err) {
      this._lastNodePointer = null;
    }
  }

  onNodeDragEnded(event: any, t: TooltipModel): void {
    try {
      const canvasEl = document.getElementById('canvas');
      if (!canvasEl) return;
      const canvasRect = canvasEl.getBoundingClientRect();
      // Prefer pointer coordinates from CDK event (event.event.clientX/Y), then pointerPosition, then drag element rect
      const px = (event && event.event && typeof event.event.clientX === 'number') ? event.event.clientX : (event && event.pointerPosition ? event.pointerPosition.x : (this._lastNodePointer ? this._lastNodePointer.x : null));
      const py = (event && event.event && typeof event.event.clientY === 'number') ? event.event.clientY : (event && event.pointerPosition ? event.pointerPosition.y : (this._lastNodePointer ? this._lastNodePointer.y : null));
      if (px != null && py != null) {
        if (px >= canvasRect.left && px <= canvasRect.right && py >= canvasRect.top && py <= canvasRect.bottom) {
          const x = Math.max(0, Math.round(px - canvasRect.left));
          const y = Math.max(0, Math.round(py - canvasRect.top));
          t.x = x;
          t.y = y;
          this.updateTooltip(t);
          this._lastNodePointer = null;
          return;
        }
      }
      // fallback: use drag preview element rect
      const dragRoot = event && event.source && typeof event.source.getRootElement === 'function' ? event.source.getRootElement() : null;
      if (dragRoot) {
        const elRect = dragRoot.getBoundingClientRect();
        const px2 = elRect.left;
        const py2 = elRect.top;
        if (px2 >= canvasRect.left && px2 <= canvasRect.right && py2 >= canvasRect.top && py2 <= canvasRect.bottom) {
          const x = Math.max(0, Math.round(px2 - canvasRect.left));
          const y = Math.max(0, Math.round(py2 - canvasRect.top));
          t.x = x;
          t.y = y;
          this.updateTooltip(t);
        }
      }
    } catch (err) {
      // ignore
    } finally {
      this._lastNodePointer = null;
    }
  }

  // Click-to-add at center of canvas
  addAssetAtCenter(type: 'text' | 'reach' | 'carousel' | 'input') {
    try {
      const canvasEl = document.getElementById('canvas');
      if (!canvasEl) {
        this.addTooltip();
        return;
      }
      const rect = canvasEl.getBoundingClientRect();
      const x = Math.max(8, Math.round(rect.width / 2 - 120));
      const y = Math.max(8, Math.round(rect.height / 2 - 80));
      this.addAssetAtPosition(type, x, y);
    } catch (err) {
      this.addTooltip();
    }
  }

  // Create a tooltip/node for given asset type at canvas-relative coordinates
  addAssetAtPosition(type: string, x: number, y: number) {
    const base: TooltipModel = {
      id: uid(),
      messageName: `${type} - ${Date.now()}`,
      x,
      y,
      titleEnabled: false,
      title: '',
      text: '',
      mediaEnabled: false,
      mediaUrl: null,
      mediaOrientation: 'vertical',
      mediaSize: 'medium',
      rotation: 0,
      scale: 1,
      suggestion: { enabled: false, type: 'text', text: '', id: uid() },
      suggestions: [],
    };

    switch (type) {
      case 'text':
        base.text = 'New text message';
        break;
      case 'reach':
        base.titleEnabled = true;
        base.title = 'Reach Card';
        base.text = 'Tap to learn more';
        break;
      case 'carousel':
        base.text = 'Carousel item (preview)';
        break;
      case 'input':
        base.titleEnabled = true;
        base.title = 'User Input';
        base.text = 'Enter a response';
        break;
      default:
        base.text = 'New asset';
    }

    this.tooltips.push(base);
    // ensure UI updates and tour positioning if needed
    setTimeout(() => this.positionTourTip(), 40);
  }
  save(event: Event) {
    this.flowName = (event.target as HTMLInputElement).value;
    this.editing = false;
  }
}

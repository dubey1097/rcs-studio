import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TooltipModel } from '../tooltip.model';

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent implements OnInit {
  @Input() tooltip!: TooltipModel;
  @Input() previewMode = false;
  @Input() selected = false;
  @Output() selectTooltip = new EventEmitter<string>();
  // emitted when user double-clicks a specific element (field name)
  @Output() editField = new EventEmitter<string>();
  @Output() update = new EventEmitter<TooltipModel>();
  @Output() remove = new EventEmitter<string>();
  @Output() startLink = new EventEmitter<{ id: string; connectorId?: string; offsetX?: number; offsetY?: number }>();

  dragging = false;
  offset = { x: 0, y: 0 };
  private canvasRect: DOMRect | null = null;
  @ViewChild('hostEl', { static: true }) hostEl!: ElementRef<HTMLDivElement>;
  // which field is currently editable inline on this tooltip (title, text, suggestion, subText)
  editingField?: 'title' | 'text' | 'suggestion' | 'subText' | null;
  // when editing a suggestion, which suggestion index is being edited
  editingSuggestionIndex?: number | null;

  ngOnInit(): void { }

  onMouseDown(e: MouseEvent) {
    e.stopPropagation();
    this.dragging = true;
    // compute canvas bounding rect to translate client coords to canvas-local coords
    const canvasEl = document.getElementById('canvas');
    this.canvasRect = canvasEl ? canvasEl.getBoundingClientRect() : null;
    if (this.canvasRect) {
      // offset is distance from pointer to the tooltip's top-left within canvas coords
      this.offset.x = e.clientX - (this.canvasRect.left + (this.tooltip.x || 0));
      this.offset.y = e.clientY - (this.canvasRect.top + (this.tooltip.y || 0));
    } else {
      this.offset.x = 0;
      this.offset.y = 0;
    }
    e.preventDefault();
    // selection will be handled on click to avoid duplicate emits
  }

  onPointerDown(e: PointerEvent) {
    // forward pointer events to same handler (MouseEvent shape is similar for our usage)
    this.onMouseDown(e as unknown as MouseEvent);
    // try to capture the pointer on the host element so we receive pointer events reliably
    try {
      this.hostEl?.nativeElement?.setPointerCapture?.((e as any).pointerId);
    } catch (err) {
      // ignore if not supported
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.dragging) return;
    // compute new position relative to canvas
    let newX = e.clientX - (this.canvasRect ? this.canvasRect.left : 0) - this.offset.x;
    let newY = e.clientY - (this.canvasRect ? this.canvasRect.top : 0) - this.offset.y;

    // clamp to canvas bounds
    if (this.canvasRect) {
      const host = this.hostEl?.nativeElement;
      const maxX = Math.max(0, this.canvasRect.width - (host?.offsetWidth || 0));
      const maxY = Math.max(0, this.canvasRect.height - (host?.offsetHeight || 0));
      newX = Math.min(Math.max(0, newX), maxX);
      newY = Math.min(Math.max(0, newY), maxY);
    }

    this.tooltip.x = newX;
    this.tooltip.y = newY;
    this.update.emit(this.tooltip);
  }

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(e: PointerEvent) {
    this.onMouseMove(e as unknown as MouseEvent);
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(_e: MouseEvent) {
    if (this.dragging) {
      this.dragging = false;
      this.update.emit(this.tooltip);
    }
  }

  @HostListener('document:pointerup', ['$event'])
  onPointerUp(e: PointerEvent) {
    // release pointer capture if held
    try {
      this.hostEl?.nativeElement?.releasePointerCapture?.((e as any).pointerId);
    } catch (err) {
      // ignore
    }
    this.onMouseUp(e as unknown as MouseEvent);
  }

  onClick(e: MouseEvent) {
    e.stopPropagation();
    // single click: select tooltip and disable inline editing
    this.editingField = null;
    this.selectTooltip.emit(this.tooltip.id);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    // only trigger delete if this tooltip is selected
    if (!this.selected) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      e.stopPropagation();
      this.remove.emit(this.tooltip.id);
    }
  }

  onDblClick(e: MouseEvent) {
    e.stopPropagation();
    // enable suggestion editing and open in panel (parent will pick selection)
    if (!this.tooltip.suggestion) {
      this.tooltip.suggestion = { enabled: true, type: 'text', text: '', id: uid() };
    } else {
      this.tooltip.suggestion.enabled = true;
    }
    this.selectTooltip.emit(this.tooltip.id);
    this.update.emit(this.tooltip);
  }

  // Called when a specific element (title/text/suggestion/subText) is double-clicked
  onElementDblClick(field: 'title' | 'text' | 'suggestion', e: MouseEvent, suggestionIndex?: number) {
    e.stopPropagation();
    this.editingField = field;
    if (field === 'suggestion') this.editingSuggestionIndex = typeof suggestionIndex === 'number' ? suggestionIndex : 0;
    // ensure this tooltip is selected
    this.selectTooltip.emit(this.tooltip.id);
    // notify parent that a specific field is being edited so the property panel can focus
    this.editField.emit(field);
    // allow updating in case suggestion needs enabling
    if (field === 'suggestion') {
      if (this.tooltip.suggestions && this.tooltip.suggestions.length) {
        const si = this.editingSuggestionIndex ?? 0;
        if (!this.tooltip.suggestions[si]) this.tooltip.suggestions[si] = { enabled: true, type: 'text', text: '' } as any;
        this.tooltip.suggestions[si].enabled = true;
      } else {
        // fallback to legacy suggestion
        if (!this.tooltip.suggestion) this.tooltip.suggestion = { enabled: true, type: 'text', text: '', id: uid() };
        else this.tooltip.suggestion.enabled = true;
      }
      this.update.emit(this.tooltip);
    }
  }

  onStartLink(e: MouseEvent, connectorId?: string) {
    e.stopPropagation();
    // Calculate the offset from the tooltip's top-left corner to the link dot
    const tooltipRect = this.hostEl.nativeElement.getBoundingClientRect();
    const linkDotOffset = {
      x: e.clientX - tooltipRect.left,
      y: e.clientY - tooltipRect.top
    };
    // emit source id, connector id, and offset from tooltip top-left so parent can calculate absolute position
    this.startLink.emit({ id: this.tooltip.id, connectorId, offsetX: linkDotOffset.x, offsetY: linkDotOffset.y });
  }

  onRemove(e: MouseEvent) {
    e.stopPropagation();
    this.remove.emit(this.tooltip.id);
  }

  onInlineEdit(field: 'title' | 'text' | 'suggestion' | 'subText', e: Event, suggestionIndex?: number) {
    const target = e.target as HTMLElement;
    const value = target.innerText || '';
    if (field === 'title') this.tooltip.title = value;
    else if (field === 'text') this.tooltip.text = value;
    else if (field === 'suggestion') {
      const idx = typeof suggestionIndex === 'number' ? suggestionIndex : (this.editingSuggestionIndex ?? 0);
      if (this.tooltip.suggestions && this.tooltip.suggestions.length) {
        if (!this.tooltip.suggestions[idx]) this.tooltip.suggestions[idx] = { enabled: true, type: 'text', text: '' } as any;
        this.tooltip.suggestions[idx].text = value;
      } else if (this.tooltip.suggestion) {
        this.tooltip.suggestion.text = value;
      }
      // clear editing index when done
      this.editingSuggestionIndex = null;
    }
    else if (field === 'subText') this.tooltip.subText = value;
    // clear editing field for all cases (we finished editing)
    this.editingField = null;
    this.update.emit(this.tooltip);
  }

  isEditing(field: 'title' | 'text' | 'suggestion' | 'subText', suggestionIndex?: number) {
    if (field !== 'suggestion') return this.editingField === field;
    // suggestion: ensure the editing index matches
    return this.editingField === 'suggestion' && (this.editingSuggestionIndex === suggestionIndex);
  }

  // Media upload handlers inside tooltip
  onMediaDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer?.files;
    if (files && files.length) {
      this.readFile(files[0]);
    }
  }

  onMediaSelect(e: Event) {
    e.stopPropagation();
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.readFile(input.files[0]);
      // clear input so same file can be re-selected later
      input.value = '';
    }
  }

  private readFile(file: File) {
    // accept images/videos/gif/pdf as data URL preview for now
    const reader = new FileReader();
    reader.onload = () => {
      if (!this.tooltip) return;
      // Create a new object to avoid readonly property issues
      const updatedTooltip = { ...this.tooltip };
      updatedTooltip.mediaUrl = reader.result as string;
      updatedTooltip.mediaEnabled = true;
      this.update.emit(updatedTooltip);
    };
    reader.readAsDataURL(file);
  }

  // media type helpers
  isImage(url?: string | null): boolean {
    if (!url) return false;
    return /^data:image\//.test(url) || /\.(png|jpe?g|gif|bmp|webp)(\?.*)?$/i.test(url);
  }

  isVideo(url?: string | null): boolean {
    if (!url) return false;
    return /^data:video\//.test(url) || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
  }

  isPdf(url?: string | null): boolean {
    if (!url) return false;
    return /^data:application\/pdf/.test(url) || /\.pdf(\?.*)?$/i.test(url);
  }
}

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TooltipModel } from '../tooltip.model';

@Component({
  selector: 'app-property-panel',
  templateUrl: './property-panel.component.html',
  styleUrls: ['./property-panel.component.scss'],
})
export class PropertyPanelComponent implements OnChanges {
  @Input() tooltip?: TooltipModel | null;
  // if set, the panel should show controls only for this specific field
  @Input() focusedField?: 'title' | 'text' | 'suggestion' | 'subText' | null;
  @Output() update = new EventEmitter<TooltipModel>();
  @Output() clearFocus = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  form: FormGroup;
  suggestions: any[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tooltip']) {
      this.buildForm();
    }
  }

  mediaType(url?: string | null): 'image' | 'video' | 'pdf' | 'none' {
    if (!url) return 'none';
    if (/^data:image\//.test(url) || /\.(png|jpe?g|gif|bmp|webp)(\?.*)?$/i.test(url)) return 'image';
    if (/^data:video\//.test(url) || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return 'video';
    if (/^data:application\/pdf/.test(url) || /\.pdf(\?.*)?$/i.test(url)) return 'pdf';
    return 'none';
  }

  mediaIcon(url?: string | null): string {
    const t = this.mediaType(url);
    if (t === 'image') return '🖼️';
    if (t === 'video') return '🎬';
    if (t === 'pdf') return '📄';
    return '';
  }

  // Media preview removed from panel; media helpers intentionally removed to keep panel lightweight.

  buildForm() {
    const t = this.tooltip;
    if (!t) return;
    this.form = this.fb.group({
      messageName: [t.messageName],
      titleEnabled: [t.titleEnabled ?? true],
      title: [t.title],
      textEnabled: [t.textEnabled ?? true],
      text: [t.text],
      subText: [t.subText || ''],
      mediaEnabled: [t.mediaEnabled],
      mediaOrientation: [t.mediaOrientation || 'vertical'],
      mediaSize: [t.mediaSize || 'medium'],
      suggestionEnabled: [t.suggestion?.enabled || false],
      suggestionType: [t.suggestion?.type || 'text'],
      suggestionText: [t.suggestion?.text || 'New suggestion'],
      suggestionAction: [t.suggestion?.actionType || 'open_url'],
      // per-action payloads
      suggestionUrl: [t.suggestion?.payload?.url || ''],
      suggestionPhone: [t.suggestion?.payload?.phone || ''],
      suggestionCalendarTitle: [t.suggestion?.payload?.calendarTitle || ''],
      suggestionCalendarStart: [t.suggestion?.payload?.calendarStart || ''],
      suggestionCalendarEnd: [t.suggestion?.payload?.calendarEnd || ''],
      suggestionCalendarLocation: [t.suggestion?.payload?.calendarLocation || ''],
      suggestionLat: [t.suggestion?.payload?.lat || ''],
      suggestionLng: [t.suggestion?.payload?.lng || ''],
      suggestionAddress: [t.suggestion?.payload?.address || ''],
    });
    // prepare suggestions array (existing suggestions or migrate single suggestion)
    this.suggestions = (t.suggestions && t.suggestions.length) ? [...t.suggestions] : (t.suggestion ? [{ ...t.suggestion }] : []);
    // ensure at least one suggestion exists when suggestions are enabled
    const enabled = t.suggestion?.enabled || (t.suggestions && t.suggestions.length > 0) || false;
    if (enabled && this.suggestions.length === 0) {
      this.suggestions.push({ enabled: true, type: 'text', text: 'New suggestion' });
    }

    this.form.valueChanges.subscribe((v) => {
      if (!this.tooltip) return;
      // merge form values and suggestions into a single tooltip object then emit
      const updated: TooltipModel = { ...this.tooltip } as TooltipModel;
      updated.messageName = v.messageName;
      updated.titleEnabled = !!v.titleEnabled;
      updated.title = v.title;
      updated.textEnabled = !!v.textEnabled;
      updated.text = v.text;
      updated.mediaEnabled = v.mediaEnabled;
      updated.mediaOrientation = v.mediaOrientation;
      updated.mediaSize = v.mediaSize;
      updated.subText = v.subText;
      // keep legacy single suggestion in sync with first suggestion if present
      updated.suggestions = [...this.suggestions];
      updated.suggestion = updated.suggestions[0]? {...updated.suggestions[0], enabled: !!v.suggestionEnabled} : { enabled: !!v.suggestionEnabled, type: 'text', text: 'New Suggestion' };
      this.update.emit(updated);
    });

    // when user toggles suggestionEnabled in the form, ensure there's one suggestion shown
    const se = this.form.controls['suggestionEnabled'];
    se.valueChanges.subscribe((val: boolean) => {
      if (val && this.suggestions.length === 0) {
        this.suggestions.push({ enabled: true, type: 'text', text: 'New suggestion' });
        this.emitSuggestionsChange();
      }
    });
  }

  addSuggestion() {
    const s = { enabled: true, type: 'text', text: 'New suggestion', actionType: 'open_url', payload: {} };
    this.suggestions.push(s);
    // do not toggle suggestionEnabled automatically; keep the control state unchanged
    this.emitSuggestionsChange();
  }

  removeSuggestion(index: number) {
    this.suggestions.splice(index, 1);
    this.emitSuggestionsChange();
  }

  updateSuggestion(index: number, key: string, value: any) {
    const s = this.suggestions[index];
    if (!s) return;
    // Create a copy to avoid readonly property issues
    const updatedSuggestion = { ...s, payload: { ...(s.payload || {}) } };
    // support nested keys like 'payload.url'
    if (key.indexOf('.') !== -1) {
      const parts = key.split('.');
      let cur: any = updatedSuggestion;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (cur[p] == null) cur[p] = {};
        cur = cur[p];
      }
      cur[parts[parts.length - 1]] = value;
    } else {
      (updatedSuggestion as any)[key] = value;
      // when type changes to 'action', set default actionType
      if (key === 'type' && value === 'action' && !updatedSuggestion.actionType) {
        updatedSuggestion.actionType = 'open_url';
        if (!updatedSuggestion.payload) updatedSuggestion.payload = {};
      }
    }
    // Update the suggestions array with the modified copy
    this.suggestions[index] = updatedSuggestion;
    this.emitSuggestionsChange();
  }

  private emitSuggestionsChange() {
    if (!this.tooltip) return;
    const v = this.form.value;
    const updated: TooltipModel = { ...this.tooltip } as TooltipModel;
    updated.messageName = v.messageName;
    updated.titleEnabled = !!v.titleEnabled;
    updated.title = v.title;
    updated.textEnabled = !!v.textEnabled;
    updated.text = v.text;
    updated.mediaEnabled = v.mediaEnabled;
    updated.mediaOrientation = v.mediaOrientation;
    updated.mediaSize = v.mediaSize;
    updated.subText = v.subText;
    updated.suggestions = [...this.suggestions];
    // respect the current suggestionEnabled form control when setting the legacy `suggestion` entry
    const suggestionEnabled = (this.form && this.form.controls && this.form.controls['suggestionEnabled']) ? !!this.form.controls['suggestionEnabled'].value : (this.tooltip?.suggestion?.enabled ?? false);
    updated.suggestion = updated.suggestions[0] ? { ...updated.suggestions[0], enabled: suggestionEnabled } : { enabled: suggestionEnabled, type: 'text', text: 'New suggestion' };
    this.update.emit(updated);
  }

  onFileDrop(e: DragEvent) {
    // Upload is handled on the tooltip card now. This handler is intentionally left empty.
  }

  onFileSelect(e: Event) {
    // Upload is handled on the tooltip card now. This handler is intentionally left empty.
  }

  readFile(file: File) {
    // Upload is handled on the tooltip card now. Keep method stub for compatibility.
  }
}

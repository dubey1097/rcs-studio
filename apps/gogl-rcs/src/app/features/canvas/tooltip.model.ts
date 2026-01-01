export type MediaOrientation = 'vertical' | 'horizontal';
export type MediaSize = 'tall' | 'short' | 'medium';

export interface Suggestion {
  enabled: boolean;
  type: 'text' | 'action';
  text: string;
  // when type === 'action', this holds the selected action key
  actionType?: 'open_url' | 'dial' | 'create_calendar_event' | 'share_location' | 'view_location';
  // optional payload for action types
  payload?: {
    // open_url
    url?: string;
    // dial
    phone?: string;
    // calendar event
    calendarTitle?: string;
    calendarStart?: string; // ISO datetime or date string
    calendarEnd?: string;
    calendarLocation?: string;
    // location
    lat?: string;
    lng?: string;
    address?: string;
  };
}

export interface TooltipModel {
  id: string;
  messageName: string;
  x: number;
  y: number;
  title: string;
  text: string;
  // additional small text field (appears below main text in panel)
  subText?: string;
  titleEnabled?: boolean;
  textEnabled?: boolean;
  mediaEnabled: boolean;
  mediaUrl?: string | null;
  mediaOrientation?: MediaOrientation;
  mediaSize?: MediaSize;
  rotation?: number;
  scale?: number;
  suggestion?: Suggestion;
  // support multiple suggestions
  suggestions?: Suggestion[];
}

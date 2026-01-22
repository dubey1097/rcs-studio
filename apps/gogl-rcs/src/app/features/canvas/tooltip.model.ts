export type MediaOrientation = 'vertical' | 'horizontal';
export type MediaSize = 'tall' | 'short' | 'medium';

export interface Suggestion {
  id: string; // unique identifier for this suggestion/connector
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

export interface Relation {
  fromMessageId: string; // source tooltip/message id
  fromSuggestionId: string; // suggestion id (previously fromConnectorId)
  connectionId?: string; // unique identifier for this connection
  toMessageId?: string; // target message id (optional for temporary position-based relations)
  toPos?: { x: number; y: number }; // fallback position if target is not a message
  fromPos?: { x: number; y: number };
  fromOffset?: { x: number; y: number };
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

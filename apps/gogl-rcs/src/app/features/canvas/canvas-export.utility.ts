import { TooltipModel, Relation } from './tooltip.model';

export interface FlowNodeKey {
  agent_id: string;
  flow_id: string;
  node_id: string;
}

export interface AgentSuggestionKey {
  agent_id: string;
  flow_id: string;
  node_id: string;
  suggestion_id: string;
}

export interface ConnectorKey {
  agent_id: string;
  flow_id: string;
  connector_id: string;
}

export interface RichCardContent {
  title?: string;
  description?: string;
  media?: {
    media_type: string;
    image_media?: {
      image_uri: string;
    };
  };
}

export interface RichCard {
  card_orientation: string;
  thumbnail_image_alignment: string;
  card_content: RichCardContent;
}

export interface SuggestedReply {
  text: string;
}

export interface AgentSuggestion {
  agent_suggestion_key: AgentSuggestionKey;
  suggested_reply: SuggestedReply;
}

export interface AgentMessage {
  content: {
    rich_card: RichCard;
  };
  suggestions: AgentSuggestion[];
}

export interface FlowNode {
  flow_node_key: FlowNodeKey;
  display_name: string;
  operation: {
    agent_message: AgentMessage;
  };
}

export interface ConnectorStart {
  agent_suggestion_key: AgentSuggestionKey;
}

export interface ConnectorEnd {
  flow_node_key: FlowNodeKey;
}

export interface Connection {
  connector_key: ConnectorKey;
  connector_start: ConnectorStart;
  connector_end: ConnectorEnd;
}

export interface RCSFlow {
  flow_key: {
    agent_id: string;
    flow_id: string;
  };
  display_name: string;
  nodes: FlowNode[];
  connections: Connection[];
}

/**
 * Converts canvas tooltips and relations to RCS Flow format
 * @param agentId - Agent identifier
 * @param flowId - Flow identifier
 * @param tooltips - Array of tooltip models
 * @param relations - Array of relation objects
 * @param displayName - Optional display name for the flow (defaults to "My Flow")
 * @returns RCS Flow JSON object
 */
export function convertCanvasToRCSFlow(
  agentId: string,
  flowId: string,
  tooltips: TooltipModel[],
  relations: Relation[],
  displayName: string = 'My Flow'
): RCSFlow {
  // Create nodes from tooltips
  const nodes: FlowNode[] = tooltips.map(tooltip => {
    const suggestions: AgentSuggestion[] = (tooltip.suggestions || []).map(suggestion => ({
      agent_suggestion_key: {
        agent_id: agentId,
        flow_id: flowId,
        node_id: tooltip.id,
        suggestion_id: suggestion.id,
      },
      suggested_reply: {
        text: suggestion.text || '',
      },
    }));

    // Build rich card content
    const cardContent: RichCardContent = {};
    
    if (tooltip.titleEnabled && tooltip.title) {
      cardContent.title = tooltip.title;
    }
    
    if (tooltip.text) {
      cardContent.description = tooltip.text;
    }
    
    if (tooltip.mediaEnabled && tooltip.mediaUrl) {
      cardContent.media = {
        media_type: 'MEDIA_TYPE_IMAGE',
        image_media: {
          image_uri: tooltip.mediaUrl,
        },
      };
    }

    return {
      flow_node_key: {
        agent_id: agentId,
        flow_id: flowId,
        node_id: tooltip.id,
      },
      display_name: tooltip.messageName || 'Untitled Node',
      operation: {
        agent_message: {
          content: {
            rich_card: {
              card_orientation: tooltip.mediaOrientation === 'horizontal' ? 'CARD_ORIENTATION_HORIZONTAL' : 'CARD_ORIENTATION_VERTICAL',
              thumbnail_image_alignment: 'THUMBNAIL_IMAGE_ALIGNMENT_RIGHT',
              card_content: cardContent,
            },
          },
          suggestions,
        },
      },
    };
  });

  // Create connections from relations (only those with toMessageId)
  const connections: Connection[] = relations
    .filter(r => r.toMessageId) // Only include relations that have a target message
    .map((relation) => ({
      connector_key: {
        agent_id: agentId,
        flow_id: flowId,
        connector_id: relation.connectionId || relation.fromSuggestionId,
      },
      connector_start: {
        agent_suggestion_key: {
          agent_id: agentId,
          flow_id: flowId,
          node_id: relation.fromMessageId,
          suggestion_id: relation.fromSuggestionId,
        },
      },
      connector_end: {
        flow_node_key: {
          agent_id: agentId,
          flow_id: flowId,
          node_id: relation.toMessageId!,
        },
      },
    }));

  return {
    flow_key: {
      agent_id: agentId,
      flow_id: flowId,
    },
    display_name: displayName,
    nodes,
    connections,
  };
}

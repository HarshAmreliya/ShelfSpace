import { ChatConversation as PrismaChatConversation, ChatMessage as PrismaChatMessage, MessageRole } from '@prisma/client';

export interface ChatConversation extends PrismaChatConversation {
  messages?: ChatMessage[];
  _count?: {
    messages: number;
  };
}

export interface ChatMessage extends PrismaChatMessage {}

export { MessageRole };

export interface CreateConversationInput {
  title?: string;
}

export interface UpdateConversationInput {
  title?: string;
  isPinned?: boolean;
  isActive?: boolean;
}

export interface CreateMessageInput {
  role: MessageRole;
  content: string;
  bookContext?: string;
  metadata?: any;
}

export interface ConversationListQuery {
  limit?: number;
  offset?: number;
  isPinned?: boolean;
}

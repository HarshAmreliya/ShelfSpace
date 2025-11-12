import apiClient from "./api";

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  timestamp: string;
  createdAt?: string;
}

export class ChatService {
  /**
   * Get message history for a group
   */
  static async getMessages(
    groupId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<ChatMessage[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());

    const response = await apiClient.get<ChatMessage[]>(
      `/api/chat/groups/${groupId}/messages${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  }
}


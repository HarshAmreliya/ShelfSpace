// Group Chat Service (for group discussions, not chatbot)
// This is a stub - actual implementation would connect to group-service

export class ChatService {
  static async getMessages(
    groupId: string,
    options: { limit?: number; offset?: number }
  ): Promise<any[]> {
    // TODO: Implement actual API call to group-service
    console.log("Fetching group chat messages for:", groupId, options);
    return [];
  }
}

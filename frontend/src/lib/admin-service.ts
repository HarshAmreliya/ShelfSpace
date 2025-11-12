import apiClient from "./api";

export type ModerationAction = "DELETE_REVIEW" | "DELETE_POST" | "SUSPEND_USER" | "BAN_USER" | "APPROVE_CONTENT" | "REJECT_CONTENT";
export type ValidationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED" | "DEACTIVATED";

export interface ModerationLog {
  id: string;
  action: ModerationAction;
  targetId: string;
  moderatorId: string;
  reason?: string;
  timestamp: string;
}

export interface BookValidation {
  id: string;
  bookId: string;
  status: ValidationStatus;
  validatorId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class AdminService {
  /**
   * Get all moderation logs
   */
  static async getModerationLogs(options?: { limit?: number; offset?: number }): Promise<ModerationLog[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());

    const response = await apiClient.get<ModerationLog[]>(
      `/api/admin/moderation/logs${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  }

  /**
   * Create a moderation log
   */
  static async createModerationLog(data: {
    action: ModerationAction;
    targetId: string;
    reason?: string;
  }): Promise<ModerationLog> {
    const response = await apiClient.post<ModerationLog>("/api/admin/moderation/log", data);
    return response.data;
  }

  /**
   * Get book validation status
   */
  static async getBookValidation(bookId: string): Promise<BookValidation> {
    const response = await apiClient.get<BookValidation>(`/api/admin/book-validation/${bookId}`);
    return response.data;
  }

  /**
   * Update book validation status
   */
  static async updateBookValidation(
    bookId: string,
    data: { status: ValidationStatus; notes?: string }
  ): Promise<BookValidation> {
    const response = await apiClient.put<BookValidation>(`/api/admin/book-validation/${bookId}`, data);
    return response.data;
  }

  /**
   * Update user status
   */
  static async updateUserStatus(userId: string, status: UserStatus): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(`/api/admin/users/${userId}/status`, { status });
    return response.data;
  }

  /**
   * Reset user preferences
   */
  static async resetUserPreferences(userId: string): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(`/api/admin/users/${userId}/preferences/reset`, {});
    return response.data;
  }
}


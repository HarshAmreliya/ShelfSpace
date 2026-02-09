import axios from "axios";
import { getErrorMessage } from "./api-utils";

const USER_API_BASE =
  process.env["NEXT_PUBLIC_USER_SERVICE_URL"] || "http://localhost:3001/api";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  website?: string | null;
  isPublic: boolean;
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "DEACTIVATED";
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: number;
  userId: string;
  theme: "LIGHT" | "DARK" | "SYSTEM";
  language: string;
  timezone?: string | null;
  notificationsEmail: boolean;
  notificationsSMS: boolean;
  newsletterOptIn: boolean;
  dailyDigest: boolean;
  defaultSortOrder: "MOST_RECENT" | "MOST_POPULAR" | "ALPHABETICAL";
  defaultViewMode: "CARD" | "LIST";
  compactMode: boolean;
  accessibilityFont: boolean;
  reducedMotion: boolean;
  autoPlayMedia: boolean;
  settings?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  booksRead: number;
  pagesRead: number;
  currentStreak: number;
  longestStreak: number;
}

function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const userApi = {
  async verify(token: string) {
    try {
      const { data } = await axios.post(`${USER_API_BASE}/auth/verify`, null, {
        headers: authHeaders(token),
      });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getMe(token: string): Promise<UserProfile> {
    try {
      const { data } = await axios.get(`${USER_API_BASE}/me`, {
        headers: authHeaders(token),
      });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateMe(token: string, input: Partial<UserProfile>) {
    try {
      const { data } = await axios.patch(`${USER_API_BASE}/me`, input, {
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
      });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getPreferences(token: string): Promise<UserPreferences> {
    try {
      const { data } = await axios.get(`${USER_API_BASE}/me/preferences`, {
        headers: authHeaders(token),
      });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updatePreferences(token: string, input: Partial<UserPreferences>) {
    try {
      const { data } = await axios.put(`${USER_API_BASE}/me/preferences`, input, {
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
      });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getStats(token: string): Promise<UserStats> {
    try {
      const { data } = await axios.get(`${USER_API_BASE}/me/stats`, {
        headers: authHeaders(token),
      });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getTokenForUser(userId: string) {
    try {
      const { data } = await axios.get(`${USER_API_BASE.replace(/\/api$/, "")}/api/token/${userId}`);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateUserStatus(token: string, userId: string, status: UserProfile["status"]) {
    try {
      const { data } = await axios.put(
        `${USER_API_BASE}/users/${userId}/status`,
        { status },
        { headers: { "Content-Type": "application/json", ...authHeaders(token) } }
      );
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async resetUserPreferences(token: string, userId: string) {
    try {
      const { data } = await axios.put(
        `${USER_API_BASE}/users/${userId}/preferences/reset`,
        {},
        { headers: { "Content-Type": "application/json", ...authHeaders(token) } }
      );
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

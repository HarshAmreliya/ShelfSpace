import api, { getErrorMessage } from "./api";
import { AxiosError } from "axios";

export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export interface GroupDTO {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  memberships: GroupMembershipDTO[];
}

export interface GroupMembershipDTO {
  id: string;
  groupId: string;
  userId: string;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
}

export class GroupServiceError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = "GroupServiceError";
  }
}

export const GroupService = {
  async list(opts?: { limit?: number; offset?: number }): Promise<GroupDTO[]> {
    try {
      const params: Record<string, any> = {};
      if (opts?.limit) params['limit'] = opts.limit;
      if (opts?.offset) params['offset'] = opts.offset;
      const { data } = await api.get(`/groups`, { params });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new GroupServiceError(message, status);
    }
  },

  async getById(id: string): Promise<GroupDTO> {
    try {
      const { data } = await api.get(`/groups/${id}`);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new GroupServiceError(message, status);
    }
  },

  async create(input: CreateGroupInput): Promise<GroupDTO> {
    try {
      const { data } = await api.post(`/groups`, input);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new GroupServiceError(message, status);
    }
  },

  async update(id: string, input: UpdateGroupInput): Promise<GroupDTO> {
    try {
      const { data } = await api.put(`/groups/${id}`, input);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new GroupServiceError(message, status);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/groups/${id}`);
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new GroupServiceError(message, status);
    }
  },

  async join(id: string): Promise<GroupMembershipDTO> {
    try {
      const { data } = await api.post(`/groups/${id}/join`);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new GroupServiceError(message, status);
    }
  },

  async leave(id: string): Promise<void> {
    try {
      await api.post(`/groups/${id}/leave`);
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new GroupServiceError(message, status);
    }
  },

  async getMembers(groupId: string): Promise<GroupMembershipDTO[]> {
    try {
      const { data } = await api.get(`/groups/${groupId}/members`);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new GroupServiceError(message, status);
    }
  },

  async verifyMembership(groupId: string, userId: string): Promise<{ isMember: boolean }> {
    try {
      const { data } = await api.get(`/groups/${groupId}/members/${userId}/verify`);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new GroupServiceError(message, status);
    }
  },
};


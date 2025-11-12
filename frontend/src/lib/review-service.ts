import api, { getErrorMessage } from "./api";
import { AxiosError } from "axios";

export interface CreateReviewInput {
  bookId: string;
  reviewText: string;
  rating: number;
  tldr?: string;
}

export interface UpdateReviewInput {
  reviewText?: string;
  rating?: number;
  tldr?: string;
}

export interface ReviewDTO {
  id: string;
  userId: string;
  bookId: string;
  reviewText: string;
  tldr?: string | null;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export class ReviewServiceError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = "ReviewServiceError";
  }
}

export const ReviewService = {
  async listByBook(bookId: string, opts?: { limit?: number; offset?: number }): Promise<ReviewDTO[]> {
    try {
      const params: Record<string, any> = {};
      if (opts?.limit) params.limit = opts.limit;
      if (opts?.offset) params.offset = opts.offset;
      const { data } = await api.get(`/reviews/book/${bookId}`, { params });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new ReviewServiceError(message, status);
    }
  },

  async getById(id: string): Promise<ReviewDTO> {
    try {
      const { data } = await api.get(`/reviews/${id}`);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new ReviewServiceError(message, status);
    }
  },

  async create(input: CreateReviewInput): Promise<ReviewDTO> {
    try {
      const { data } = await api.post(`/reviews`, input);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new ReviewServiceError(message, status);
    }
  },

  async update(id: string, input: UpdateReviewInput): Promise<ReviewDTO> {
    try {
      const { data } = await api.put(`/reviews/${id}`, input);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new ReviewServiceError(message, status);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/reviews/${id}`);
    } catch (error) {
      const message = getErrorMessage(error);
      const status = (error as AxiosError)?.response?.status;
      throw new ReviewServiceError(message, status);
    }
  },
};

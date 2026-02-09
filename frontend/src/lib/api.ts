import axios, { AxiosError } from "axios";
import { getSession, signOut } from "next-auth/react";
import { getErrorMessage } from "./api-utils";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

function buildApiClient(baseURL?: string) {
  const client = axios.create({
    baseURL:
      (baseURL ?? process.env["NEXT_PUBLIC_API_URL"]) || "http://localhost:3000",
    timeout: 30000, // 30 second timeout
  });

  client.interceptors.request.use(
    async (config) => {
      try {
        const session = await getSession();
        if (session?.accessToken) {
          config.headers["Authorization"] = `Bearer ${session.accessToken}`;
        }
      } catch (error) {
        // Session not available, continue without auth
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (
        typeof window !== "undefined" &&
        error.response?.status === 401
      ) {
        signOut({ callbackUrl: "/login?error=token_expired" });
      }
      const enhancedError = {
        ...error,
        userMessage: getErrorMessage(error),
      };
      return Promise.reject(enhancedError);
    }
  );

  return client;
}

export const createApiClient = buildApiClient;

const apiClient = buildApiClient();

export default apiClient;

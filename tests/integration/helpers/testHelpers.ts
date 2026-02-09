/**
 * Integration Test Helpers
 * 
 * Utility functions for integration tests
 */

function getAxios(): any {
  // Lazy-load to avoid hard dependency during partial test runs
  return require("axios");
}
import { TEST_CONFIG, getAuthHeaders } from '../setup';

export interface TestUser {
  id: string;
  email: string;
  token: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Create a test user via user service
 */
export async function createTestUser(email: string, name?: string): Promise<TestUser> {
  try {
    const axios = getAxios();
    const response = await axios.post(
      `${TEST_CONFIG.USER_SERVICE_URL}/api/me`,
      {
        email,
        name: name || 'Test User',
      }
    );
    
    // In real implementation, this would return a JWT token
    // For now, we'll need to extract it from the response or make a login call
    const token = response.data.token || 'test-token';
    
    return {
      id: response.data.id || response.data.userId,
      email,
      token,
    };
  } catch (error) {
    const axios = getAxios();
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to create test user: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

/**
 * Make an authenticated API request
 */
export async function authenticatedRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  token: string,
  data?: any
): Promise<ApiResponse<T>> {
  try {
    const axios = getAxios();
    const response = await axios({
      method,
      url,
      headers: getAuthHeaders(token),
      data,
    });
    
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    const axios = getAxios();
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.error || error.message,
        status: error.response?.status || 500,
      };
    }
    throw error;
  }
}

/**
 * Make an unauthenticated API request
 */
export async function unauthenticatedRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any
): Promise<ApiResponse<T>> {
  try {
    const axios = getAxios();
    const response = await axios({
      method,
      url,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    const axios = getAxios();
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.error || error.message,
        status: error.response?.status || 500,
      };
    }
    throw error;
  }
}

/**
 * Wait for a service to be ready
 */
export async function waitForService(url: string, maxRetries = 10, delay = 1000): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const axios = getAxios();
      await axios.get(`${url}/health`, { timeout: 2000 });
      return true;
    } catch (error) {
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}

/**
 * Clean up test data
 */
export async function cleanupTestData(serviceUrl: string, resourcePath: string, token: string): Promise<void> {
  try {
    await authenticatedRequest('DELETE', `${serviceUrl}${resourcePath}`, token);
  } catch (error) {
    // Ignore cleanup errors
    console.warn('Cleanup failed:', error);
  }
}

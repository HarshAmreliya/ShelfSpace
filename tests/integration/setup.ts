/**
 * Integration Test Setup
 * 
 * This file sets up the test environment for integration tests.
 * It handles database connections, service startup, and cleanup.
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';

// Test configuration
export const TEST_CONFIG = {
  // Service URLs - adjust based on your test environment
  USER_SERVICE_URL: process.env.TEST_USER_SERVICE_URL || 'http://localhost:3001',
  REVIEW_SERVICE_URL: process.env.TEST_REVIEW_SERVICE_URL || 'http://localhost:3002',
  GROUP_SERVICE_URL: process.env.TEST_GROUP_SERVICE_URL || 'http://localhost:3005',
  LIBRARY_SERVICE_URL: process.env.TEST_LIBRARY_SERVICE_URL || 'http://localhost:3003',
  BOOK_SERVICE_URL: process.env.TEST_BOOK_SERVICE_URL || 'http://localhost:3004',
  CHAT_SERVICE_URL: process.env.TEST_CHAT_SERVICE_URL || 'http://localhost:3006',
  ADMIN_SERVICE_URL: process.env.TEST_ADMIN_SERVICE_URL || 'http://localhost:3007',
  
  // Database connection for direct testing
  DATABASE_URL: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || '',
  
  // Test user credentials (create test user first)
  TEST_USER_ID: process.env.TEST_USER_ID || '',
  TEST_USER_EMAIL: process.env.TEST_USER_EMAIL || 'test@example.com',
  TEST_JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key',
};

// Prisma client for direct database access in tests
let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    if (!TEST_CONFIG.DATABASE_URL) {
      throw new Error('DATABASE_URL or TEST_DATABASE_URL must be set for integration tests');
    }
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: TEST_CONFIG.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
}

// Helper to create a test JWT token
export async function createTestToken(userId: string): Promise<string> {
  // In a real implementation, use the same JWT signing logic as user-service
  // For now, this is a placeholder - you'd need to import the JWT signing function
  // or make an API call to get a real token
  return 'test-token-' + userId;
}

// Helper to get auth headers
export function getAuthHeaders(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// Cleanup function
export async function cleanup(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

// Global setup (run once before all tests)
export async function globalSetup(): Promise<void> {
  // Wait for services to be ready
  const services = [
    TEST_CONFIG.USER_SERVICE_URL,
    TEST_CONFIG.REVIEW_SERVICE_URL,
    TEST_CONFIG.GROUP_SERVICE_URL,
  ];
  
  for (const serviceUrl of services) {
    try {
      await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
    } catch (error) {
      console.warn(`Service at ${serviceUrl} is not ready:`, error);
    }
  }
}

// Global teardown (run once after all tests)
export async function globalTeardown(): Promise<void> {
  await cleanup();
}


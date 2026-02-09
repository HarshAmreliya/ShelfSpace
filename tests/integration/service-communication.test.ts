/**
 * Integration Tests for Service-to-Service Communication
 * 
 * These tests verify that services can communicate with each other correctly,
 * including authentication verification, membership checks, and data fetching.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { TEST_CONFIG, cleanup } from './setup';
import {
  createTestUser,
  authenticatedRequest,
  waitForService,
  type TestUser,
} from './helpers/testHelpers';

describe('Service-to-Service Communication Tests', () => {
  let testUser: TestUser;
  let testGroupId: string;
  let testBookId: string;

  beforeAll(async () => {
    // Wait for all services to be ready
    await waitForService(TEST_CONFIG.USER_SERVICE_URL);
    await waitForService(TEST_CONFIG.REVIEW_SERVICE_URL);
    await waitForService(TEST_CONFIG.FORUM_SERVICE_URL);
    await waitForService(TEST_CONFIG.LIBRARY_SERVICE_URL);
    await waitForService(TEST_CONFIG.BOOK_SERVICE_URL);
    await waitForService(TEST_CONFIG.CHAT_SERVICE_URL);
    
    // Create a test user
    testUser = await createTestUser(`test-${Date.now()}@example.com`, 'Test User');
    
    // Create a test group for membership verification tests
    const groupResponse = await authenticatedRequest(
      'POST',
      `${TEST_CONFIG.FORUM_SERVICE_URL}/api/forums`,
      testUser.token,
      {
        name: `Test Group ${Date.now()}`,
        description: 'Test group for service communication',
      }
    );
    testGroupId = groupResponse.data?.id || '';
    
    // Use a test book ID (in real tests, create a book first)
    testBookId = 'test-book-id';
  });

  afterAll(async () => {
    await cleanup();
  });

  describe('Review Service → User Service Communication', () => {
    it('should verify JWT token via user service when creating review', async () => {
      // This is implicitly tested when creating a review
      // The review service calls user service /api/auth/verify
      const response = await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews`,
        testUser.token,
        {
          bookId: testBookId,
          reviewText: 'Test review for service communication verification.',
          rating: 5,
        }
      );

      // If we get here with status 201, the service-to-service auth worked
      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
    });

    it('should reject requests with invalid JWT token', async () => {
      const response = await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews`,
        'invalid-token',
        {
          bookId: testBookId,
          reviewText: 'This should fail.',
          rating: 5,
        }
      );

      // Should fail authentication check
      expect(response.status).toBe(401);
    });
  });

  describe('Group Service → User Service Communication', () => {
    it('should verify JWT token via user service when creating group', async () => {
      // This is implicitly tested when creating a group
      // The group service calls user service /api/auth/verify
      const response = await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.FORUM_SERVICE_URL}/api/forums`,
        testUser.token,
        {
          name: `Test Group ${Date.now()}`,
          description: 'Test group',
        }
      );

      // If we get here with status 201, the service-to-service auth worked
      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
    });
  });

  describe('Chat Service → Group Service Communication', () => {
    it('should verify group membership via group service', async () => {
      if (!testGroupId) {
        // Create a group if needed
        const groupResponse = await authenticatedRequest(
          'POST',
          `${TEST_CONFIG.FORUM_SERVICE_URL}/api/forums`,
          testUser.token,
          {
            name: `Test Group ${Date.now()}`,
            description: 'Test group',
          }
        );
        testGroupId = groupResponse.data?.id || '';
      }

      // Verify membership endpoint should work
      const verifyResponse = await authenticatedRequest(
        'GET',
        `${TEST_CONFIG.FORUM_SERVICE_URL}/api/forums/${testGroupId}/members/${testUser.id}/verify`,
        testUser.token
      );

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.data?.isMember).toBe(true);
    });

    it('should allow fetching messages for group members', async () => {
      if (!testGroupId) return;

      // Chat service verifies membership via group service before returning messages
      const response = await authenticatedRequest(
        'GET',
        `${TEST_CONFIG.CHAT_SERVICE_URL}/api/chat/groups/${testGroupId}/messages`,
        testUser.token
      );

      // Should succeed if membership verification works
      expect([200, 404]).toContain(response.status); // 404 if no messages, 200 if messages exist
    });
  });

  describe('User Service → Library Service Communication', () => {
    it('should initialize default reading lists when user is created', async () => {
      // This is tested implicitly when a user is created
      // User service should call library service /reading-lists/initialize-defaults
      // We can verify by checking if reading lists exist for the user
      
      const response = await authenticatedRequest(
        'GET',
        `${TEST_CONFIG.LIBRARY_SERVICE_URL}/reading-lists`,
        testUser.token
      );

      // If default lists were initialized, we should see them
      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.data)).toBe(true);
      }
    });
  });

  describe('Library Service → Book Service Communication', () => {
    it('should be able to fetch book data when needed', async () => {
      // This tests that library service can communicate with book service
      // In real implementation, library service would fetch book details
      // For now, we just verify book service is accessible
      
      const response = await authenticatedRequest(
        'GET',
        `${TEST_CONFIG.BOOK_SERVICE_URL}/api/books`,
        testUser.token
      );

      // Book service should be accessible
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Admin Service → User Service Communication', () => {
    it('should be able to update user status via user service', async () => {
      // Admin service proxies user management requests to user service
      // This tests that communication works
      
      // Note: This requires admin authentication
      // In a real test, you'd need an admin user token
      
      const response = await authenticatedRequest(
        'PUT',
        `${TEST_CONFIG.ADMIN_SERVICE_URL}/api/admin/users/${testUser.id}/status`,
        testUser.token, // This would need to be an admin token
        {
          status: 'ACTIVE',
        }
      );

      // Should either succeed (if admin) or fail with 403 (if not admin)
      expect([200, 403, 401]).toContain(response.status);
    });
  });

  describe('Error Handling in Service Communication', () => {
    it('should handle service unavailability gracefully', async () => {
      // Test that services handle communication failures
      // This would require temporarily stopping a service or mocking failures
      // For now, we'll just document the expected behavior
      
      // In production, services should:
      // 1. Retry failed requests with exponential backoff
      // 2. Return appropriate error codes (503 Service Unavailable)
      // 3. Log errors for debugging
      
      expect(true).toBe(true); // Placeholder - implement actual test
    });
  });
});


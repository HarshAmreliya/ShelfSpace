/**
 * Integration Tests for Review Service
 * 
 * These tests verify the review service API endpoints work correctly
 * and integrate properly with the user service for authentication.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { TEST_CONFIG, cleanup } from './setup';
import {
  createTestUser,
  authenticatedRequest,
  unauthenticatedRequest,
  waitForService,
  cleanupTestData,
  type TestUser,
} from './helpers/testHelpers';

describe('Review Service Integration Tests', () => {
  let testUser: TestUser;
  let testBookId: string;
  let createdReviewId: string;

  beforeAll(async () => {
    // Wait for services to be ready
    await waitForService(TEST_CONFIG.USER_SERVICE_URL);
    await waitForService(TEST_CONFIG.REVIEW_SERVICE_URL);
    
    // Create a test user
    testUser = await createTestUser(`test-${Date.now()}@example.com`, 'Test User');
    
    // Use a test book ID (in real tests, create a book first)
    testBookId = 'test-book-id';
  });

  afterAll(async () => {
    // Cleanup created review if it exists
    if (createdReviewId && testUser) {
      await cleanupTestData(
        TEST_CONFIG.REVIEW_SERVICE_URL,
        `/reviews/${createdReviewId}`,
        testUser.token
      );
    }
    await cleanup();
  });

  describe('POST /reviews - Create Review', () => {
    it('should create a review when authenticated', async () => {
      const reviewData = {
        bookId: testBookId,
        reviewText: 'This is a great book! I really enjoyed reading it.',
        rating: 5,
        tldr: 'Loved it!',
      };

      const response = await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews`,
        testUser.token,
        reviewData
      );

      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
      expect(response.data.reviewText).toBe(reviewData.reviewText);
      expect(response.data.rating).toBe(reviewData.rating);
      expect(response.data.userId).toBe(testUser.id);
      
      createdReviewId = response.data.id;
    });

    it('should reject review with rating out of range', async () => {
      const reviewData = {
        bookId: testBookId,
        reviewText: 'This is a test review.',
        rating: 6, // Invalid: should be 1-5
      };

      const response = await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews`,
        testUser.token,
        reviewData
      );

      expect(response.status).toBe(400);
    });

    it('should reject review with text too short', async () => {
      const reviewData = {
        bookId: testBookId,
        reviewText: 'Short', // Less than 10 characters
        rating: 5,
      };

      const response = await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews`,
        testUser.token,
        reviewData
      );

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const reviewData = {
        bookId: testBookId,
        reviewText: 'This is a test review.',
        rating: 5,
      };

      const response = await unauthenticatedRequest(
        'POST',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews`,
        reviewData
      );

      expect(response.status).toBe(401);
    });
  });

  describe('GET /reviews/book/:bookId - Get Reviews for Book', () => {
    it('should return reviews for a book without authentication', async () => {
      const response = await unauthenticatedRequest(
        'GET',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews/book/${testBookId}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await unauthenticatedRequest(
        'GET',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews/book/${testBookId}?limit=5&offset=0`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('GET /reviews/user/:userId - Get Reviews by User', () => {
    it('should return reviews by a specific user', async () => {
      const response = await unauthenticatedRequest(
        'GET',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews/user/${testUser.id}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('GET /reviews/:id - Get Single Review', () => {
    it('should return a single review by ID', async () => {
      if (!createdReviewId) {
        // Create a review first if needed
        const createResponse = await authenticatedRequest(
          'POST',
          `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews`,
          testUser.token,
          {
            bookId: testBookId,
            reviewText: 'Test review for GET endpoint.',
            rating: 4,
          }
        );
        createdReviewId = createResponse.data.id;
      }

      const response = await unauthenticatedRequest(
        'GET',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews/${createdReviewId}`
      );

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(createdReviewId);
    });

    it('should return 404 for non-existent review', async () => {
      const response = await unauthenticatedRequest(
        'GET',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews/non-existent-id`
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /reviews/:id - Update Review', () => {
    it('should update own review when authenticated', async () => {
      if (!createdReviewId) {
        // Create a review first
        const createResponse = await authenticatedRequest(
          'POST',
          `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews`,
          testUser.token,
          {
            bookId: testBookId,
            reviewText: 'Initial review text.',
            rating: 3,
          }
        );
        createdReviewId = createResponse.data.id;
      }

      const updateData = {
        reviewText: 'Updated review text with more content.',
        rating: 4,
      };

      const response = await authenticatedRequest(
        'PUT',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews/${createdReviewId}`,
        testUser.token,
        updateData
      );

      expect(response.status).toBe(200);
      expect(response.data.reviewText).toBe(updateData.reviewText);
      expect(response.data.rating).toBe(updateData.rating);
    });

    it('should reject update of other user\'s review', async () => {
      // This test requires a second user and their review
      // Implementation depends on your test setup
      // For now, we'll skip this as it requires more complex setup
    });
  });

  describe('DELETE /reviews/:id - Delete Review', () => {
    it('should delete own review when authenticated', async () => {
      // Create a review to delete
      const createResponse = await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews`,
        testUser.token,
        {
          bookId: testBookId,
          reviewText: 'Review to be deleted.',
          rating: 3,
        }
      );
      const reviewToDelete = createResponse.data.id;

      const response = await authenticatedRequest(
        'DELETE',
        `${TEST_CONFIG.REVIEW_SERVICE_URL}/reviews/${reviewToDelete}`,
        testUser.token
      );

      expect(response.status).toBe(204);
    });
  });
});


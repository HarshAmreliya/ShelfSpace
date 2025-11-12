/**
 * Integration Tests for Group Service
 * 
 * These tests verify the group service API endpoints work correctly
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

describe('Group Service Integration Tests', () => {
  let testUser: TestUser;
  let secondUser: TestUser;
  let createdGroupId: string;

  beforeAll(async () => {
    // Wait for services to be ready
    await waitForService(TEST_CONFIG.USER_SERVICE_URL);
    await waitForService(TEST_CONFIG.GROUP_SERVICE_URL);
    
    // Create test users
    testUser = await createTestUser(`test-user-${Date.now()}@example.com`, 'Test User');
    secondUser = await createTestUser(`test-user-2-${Date.now()}@example.com`, 'Test User 2');
  });

  afterAll(async () => {
    // Cleanup created group if it exists
    if (createdGroupId && testUser) {
      await cleanupTestData(
        TEST_CONFIG.GROUP_SERVICE_URL,
        `/api/groups/${createdGroupId}`,
        testUser.token
      );
    }
    await cleanup();
  });

  describe('POST /api/groups - Create Group', () => {
    it('should create a group when authenticated', async () => {
      const groupData = {
        name: `Test Group ${Date.now()}`,
        description: 'This is a test group for integration testing.',
      };

      const response = await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups`,
        testUser.token,
        groupData
      );

      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
      expect(response.data.name).toBe(groupData.name);
      expect(response.data.description).toBe(groupData.description);
      expect(response.data.memberships).toBeDefined();
      expect(response.data.memberships.length).toBe(1);
      expect(response.data.memberships[0].userId).toBe(testUser.id);
      expect(response.data.memberships[0].role).toBe('ADMIN');
      
      createdGroupId = response.data.id;
    });

    it('should require authentication', async () => {
      const groupData = {
        name: 'Unauthenticated Group',
        description: 'This should fail.',
      };

      const response = await unauthenticatedRequest(
        'POST',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups`,
        groupData
      );

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/groups - List Groups', () => {
    it('should return list of groups without authentication', async () => {
      const response = await unauthenticatedRequest(
        'GET',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await unauthenticatedRequest(
        'GET',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups?limit=5&offset=0`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('GET /api/groups/:id - Get Group Details', () => {
    it('should return group details without authentication', async () => {
      if (!createdGroupId) {
        // Create a group first
        const createResponse = await authenticatedRequest(
          'POST',
          `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups`,
          testUser.token,
          {
            name: `Test Group ${Date.now()}`,
            description: 'Test description',
          }
        );
        createdGroupId = createResponse.data.id;
      }

      const response = await unauthenticatedRequest(
        'GET',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}`
      );

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(createdGroupId);
      expect(response.data.memberships).toBeDefined();
    });

    it('should return 404 for non-existent group', async () => {
      const response = await unauthenticatedRequest(
        'GET',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/non-existent-id`
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/groups/:id - Update Group', () => {
    it('should update group when user is admin', async () => {
      if (!createdGroupId) {
        const createResponse = await authenticatedRequest(
          'POST',
          `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups`,
          testUser.token,
          {
            name: `Test Group ${Date.now()}`,
            description: 'Initial description',
          }
        );
        createdGroupId = createResponse.data.id;
      }

      const updateData = {
        name: 'Updated Group Name',
        description: 'Updated description',
      };

      const response = await authenticatedRequest(
        'PUT',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}`,
        testUser.token,
        updateData
      );

      expect(response.status).toBe(200);
      expect(response.data.name).toBe(updateData.name);
      expect(response.data.description).toBe(updateData.description);
    });

    it('should reject update from non-admin member', async () => {
      if (!createdGroupId) return;

      // Join as second user
      await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}/join`,
        secondUser.token
      );

      // Try to update as non-admin
      const response = await authenticatedRequest(
        'PUT',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}`,
        secondUser.token,
        {
          name: 'Unauthorized Update',
        }
      );

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/groups/:id/join - Join Group', () => {
    it('should allow user to join a group', async () => {
      if (!createdGroupId) {
        const createResponse = await authenticatedRequest(
          'POST',
          `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups`,
          testUser.token,
          {
            name: `Test Group ${Date.now()}`,
            description: 'Test description',
          }
        );
        createdGroupId = createResponse.data.id;
      }

      const response = await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}/join`,
        secondUser.token
      );

      expect(response.status).toBe(201);
      expect(response.data.userId).toBe(secondUser.id);
    });

    it('should reject joining a group already joined', async () => {
      if (!createdGroupId) return;

      const response = await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}/join`,
        secondUser.token
      );

      expect(response.status).toBe(409);
    });

    it('should require authentication', async () => {
      const response = await unauthenticatedRequest(
        'POST',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}/join`
      );

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/groups/:id/leave - Leave Group', () => {
    it('should allow user to leave a group', async () => {
      // First join the group
      await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}/join`,
        secondUser.token
      );

      const response = await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}/leave`,
        secondUser.token
      );

      expect(response.status).toBe(204);
    });

    it('should require authentication', async () => {
      const response = await unauthenticatedRequest(
        'POST',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}/leave`
      );

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/groups/:id/members - Get Group Members', () => {
    it('should return group members without authentication', async () => {
      if (!createdGroupId) return;

      const response = await unauthenticatedRequest(
        'GET',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}/members`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('GET /api/groups/:groupId/members/:userId/verify - Verify Membership', () => {
    it('should verify membership status', async () => {
      if (!createdGroupId) return;

      // Join as second user
      await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}/join`,
        secondUser.token
      );

      const response = await unauthenticatedRequest(
        'GET',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}/members/${secondUser.id}/verify`
      );

      expect(response.status).toBe(200);
      expect(response.data.isMember).toBe(true);
    });

    it('should return 404 for non-member', async () => {
      if (!createdGroupId) return;

      const response = await unauthenticatedRequest(
        'GET',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}/members/non-existent-user/verify`
      );

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/groups/:id - Delete Group', () => {
    it('should delete group when user is admin', async () => {
      // Create a new group for deletion
      const createResponse = await authenticatedRequest(
        'POST',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups`,
        testUser.token,
        {
          name: `Group to Delete ${Date.now()}`,
          description: 'This group will be deleted',
        }
      );
      const groupToDelete = createResponse.data.id;

      const response = await authenticatedRequest(
        'DELETE',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${groupToDelete}`,
        testUser.token
      );

      expect(response.status).toBe(204);
    });

    it('should reject deletion from non-admin', async () => {
      if (!createdGroupId) return;

      const response = await authenticatedRequest(
        'DELETE',
        `${TEST_CONFIG.GROUP_SERVICE_URL}/api/groups/${createdGroupId}`,
        secondUser.token
      );

      expect(response.status).toBe(403);
    });
  });
});


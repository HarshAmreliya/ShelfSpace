/**
 * Integration Tests for Book Service
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import { TEST_CONFIG } from "./setup";
import {
  waitForService,
  unauthenticatedRequest,
  authenticatedRequest,
} from "./helpers/testHelpers";

describe("Book Service Routes", () => {
  beforeAll(async () => {
    await waitForService(TEST_CONFIG.BOOK_SERVICE_URL);
  });

  it("should return health status", async () => {
    const response = await unauthenticatedRequest(
      "GET",
      `${TEST_CONFIG.BOOK_SERVICE_URL}/health`
    );
    expect(response.status).toBe(200);
    expect(response.data?.status).toBe("ok");
  });

  it("should return paginated books with default limit", async () => {
    const response = await unauthenticatedRequest(
      "GET",
      `${TEST_CONFIG.BOOK_SERVICE_URL}/api/books`
    );
    expect(response.status).toBe(200);
    expect(response.data?.success).toBe(true);
    expect(Array.isArray(response.data?.books)).toBe(true);
    expect(typeof response.data?.totalBooks).toBe("number");
    expect(typeof response.data?.currentPage).toBe("number");
    expect(typeof response.data?.totalPages).toBe("number");
  });

  it("should respect limit parameter", async () => {
    const response = await unauthenticatedRequest(
      "GET",
      `${TEST_CONFIG.BOOK_SERVICE_URL}/api/books?limit=2&page=1`
    );
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data?.books)).toBe(true);
    expect(response.data?.books.length).toBeLessThanOrEqual(2);
  });

  it("should reject invalid limit parameter", async () => {
    const response = await unauthenticatedRequest(
      "GET",
      `${TEST_CONFIG.BOOK_SERVICE_URL}/api/books?limit=200`
    );
    expect(response.status).toBe(400);
  });

  it("should reject search without query", async () => {
    const response = await unauthenticatedRequest(
      "GET",
      `${TEST_CONFIG.BOOK_SERVICE_URL}/api/books/search`
    );
    expect(response.status).toBe(400);
  });

  it("should allow search with query and limit", async () => {
    const response = await unauthenticatedRequest(
      "GET",
      `${TEST_CONFIG.BOOK_SERVICE_URL}/api/books/search?q=test&limit=2&page=1`
    );
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data?.books)).toBe(true);
    expect(response.data?.books.length).toBeLessThanOrEqual(2);
  });

  it("should require auth for creating a book", async () => {
    const response = await authenticatedRequest(
      "POST",
      `${TEST_CONFIG.BOOK_SERVICE_URL}/api/books`,
      "invalid-token",
      {
        title: "Unauthorized Book",
        authors: [{ name: "No Auth" }],
      }
    );
    expect([401, 403]).toContain(response.status);
  });
});

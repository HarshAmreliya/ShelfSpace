import request from "supertest";
import express from "express";
import userRoutes from "../../routes/user.routes.js";

const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);

describe("User Routes", () => {
  describe("POST /api/users/me", () => {
    it("should reject invalid input", async () => {
      const response = await request(app)
        .post("/api/users/me")
        .send({ invalid: "data" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should require email and name", async () => {
      const response = await request(app)
        .post("/api/users/me")
        .send({ name: "Test User" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/users/me", () => {
    it("should require authentication", async () => {
      const response = await request(app)
        .get("/api/users/me");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/users/me/preferences", () => {
    it("should require authentication", async () => {
      const response = await request(app)
        .get("/api/users/me/preferences");

      expect(response.status).toBe(401);
    });
  });
});


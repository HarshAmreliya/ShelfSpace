import { createUserSchema, updateUserSchema, updatePreferencesSchema } from "../schemas.js";
describe("User Schemas", () => {
    describe("createUserSchema", () => {
        it("should validate valid user data", () => {
            const validData = {
                email: "test@example.com",
                name: "Test User",
                picture: "https://example.com/avatar.jpg",
            };
            const result = createUserSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
        it("should reject invalid email", () => {
            const invalidData = {
                email: "not-an-email",
                name: "Test User",
            };
            const result = createUserSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
        it("should reject missing required fields", () => {
            const invalidData = {
                email: "test@example.com",
            };
            const result = createUserSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
    describe("updateUserSchema", () => {
        it("should accept partial updates", () => {
            const validData = {
                name: "Updated Name",
            };
            const result = updateUserSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
        it("should validate email if provided", () => {
            const invalidData = {
                email: "not-an-email",
            };
            const result = updateUserSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
    describe("updatePreferencesSchema", () => {
        it("should validate theme enum", () => {
            const validData = {
                theme: "DARK",
            };
            const result = updatePreferencesSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
        it("should reject invalid theme", () => {
            const invalidData = {
                theme: "INVALID_THEME",
            };
            const result = updatePreferencesSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import app from "../../../src/index.ts";
/**
 * General idea for testing any endpoint using Vitest + Supertest:
 *
 * 1. Import testing tools from Vitest (describe, it, expect) and Supertest.
 * 2. Initialize Supertest with your Express app instance.
 *
 * 3. (Optional) Prepare shared setup:
 *    - Auth tokens
 *    - Helper functions to avoid repeating request logic
 *
 * 4. Group tests using `describe()` based on behavior:
 *    - Pagination
 *    - Filters
 *    - Sorting
 *    - Response structure
 *    - Edge cases / invalid inputs
 *
 * 5. For each test case:
 *    - Send an HTTP request using Supertest (get, post, put, delete...)
 *    - Pass headers (e.g., Authorization) if needed
 *    - Provide query params or body data
 *
 * 6. Assert the response:
 *    - Check status code (e.g., 200, 422)
 *    - Validate response shape (properties exist)
 *    - Validate specific values when needed
 *
 * 7. Always cover:
 *    - Success scenarios (valid input → expected result)
 *    - Validation errors (invalid input → 4xx)
 *    - Edge cases (limits, boundaries, empty results)
 *
 * This structure keeps tests organized, readable, and scalable for any endpoint.
 */

// simulate HTTP requests
const request = supertest(app);

// ── Auth ──────────────────────────────────────────────────────────────────────
const AUTH_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJtYXJrbWFnZHkxNDhAZ21haWwuY29tIiwidW5pdmVyc2l0eV9uYW1lIjoiQWxleGFuZHJpYSBOYXRpb25hbCBVbml2ZXJzaXR5Iiwicm9sZXMiOlsiUm9vdCJdLCJwZXJtaXNzaW9ucyI6WyJyb2xlLmNyZWF0ZSIsInJvbGUucmVhZCIsInJvbGUudXBkYXRlIiwicm9sZS5kZWxldGUiLCJhY2NvdW50LmNyZWF0ZSIsImFjY291bnQucmVhZCIsImFjY291bnQudXBkYXRlIiwiYWNjb3VudC5kZWxldGUiLCJhY2NvdW50LmFzc2lnbl9yb2xlIiwiZmFjdWx0eS5jcmVhdGUiLCJmYWN1bHR5LnJlYWQiLCJmYWN1bHR5LnVwZGF0ZSIsImZhY3VsdHkuZGVsZXRlIiwicHJvZ3JhbS5jcmVhdGUiLCJwcm9ncmFtLnJlYWQiLCJwcm9ncmFtLnVwZGF0ZSIsInByb2dyYW0uZGVsZXRlIiwiY291cnNlLmNyZWF0ZSIsImNvdXJzZS5yZWFkIiwiY291cnNlLnVwZGF0ZSIsImNvdXJzZS5kZWxldGUiLCJzZW1lc3Rlci5jcmVhdGUiLCJzZW1lc3Rlci5yZWFkIiwic2VtZXN0ZXIudXBkYXRlIiwic2VtZXN0ZXIuZGVsZXRlIl0sImlzU3RhZmYiOmZhbHNlLCJpc1N0dWRlbnQiOmZhbHNlLCJpYXQiOjE3NzUyNTEyMjQsImV4cCI6MTc3NTMzNzYyNH0.clg9LuFeN9zoB0ae1iF_oJ_2tZMlx9xiYqmIcFYaVj4";

// ── Helper ────────────────────────────────────────────────────────────────────
const get = (query: string) =>
  request
    .get(`/api/user/account/student${query}`)
    .set("Authorization", AUTH_TOKEN);

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("GET /account/student", () => {

  describe("Pagination", () => {
    it("returns 200 with default pagination", async () => {
      const res = await get("");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("students");
      expect(res.body.data).toHaveProperty("pagination");
    });

    it("returns 200 with explicit page and limit", async () => {
      const res = await get("?page=1&limit=10");
      expect(res.status).toBe(200);
      expect(res.body.data.pagination.pageSize).toBe(10);
    });

    it("returns 422 when page is 0", async () => {
      const res = await get("?page=0");
      expect(res.status).toBe(422);
      expect(res.body.data).toHaveProperty("page");
    });

    it("returns 422 when limit exceeds 100", async () => {
      const res = await get("?limit=200");
      expect(res.status).toBe(422);
      expect(res.body.data).toHaveProperty("limit");
    });
  });

  describe("Filters", () => {
    it("filters by status", async () => {
      const res = await get("?status=New");
      expect(res.status).toBe(200);
    });

    it("returns 422 for invalid status", async () => {
      const res = await get("?status=InvalidStatus");
      expect(res.status).toBe(422);
      expect(res.body.data).toHaveProperty("status");
    });

    it("filters by programId", async () => {
      const res = await get("?programId=1");
      expect(res.status).toBe(200);
    });

    it("filters by isVerified", async () => {
      const res = await get("?isVerified=true");
      expect(res.status).toBe(200);
    });

    it("filters by isBlocked", async () => {
      const res = await get("?isBlocked=false");
      expect(res.status).toBe(200);
    });

    it("filters by nationalId", async () => {
      const res = await get("?nationalId=29901011234567");
      expect(res.status).toBe(200);
    });
  });

  describe("Sorting", () => {
    it("sorts ascending", async () => {
      const res = await get("?sortOrder=asc");
      expect(res.status).toBe(200);
    });

    it("sorts descending", async () => {
      const res = await get("?sortOrder=desc");
      expect(res.status).toBe(200);
    });

    it("returns 422 for invalid sortOrder", async () => {
      const res = await get("?sortOrder=random");
      expect(res.status).toBe(422);
      expect(res.body.data).toHaveProperty("sortOrder");
    });
  });

  describe("Response shape", () => {
    it("returns correct pagination fields", async () => {
      const res = await get("?page=1&limit=5");
      expect(res.status).toBe(200);

      const { pagination } = res.body.data;
      expect(pagination).toHaveProperty("totalCount");
      expect(pagination).toHaveProperty("pageNumber");
      expect(pagination).toHaveProperty("pageSize");
      expect(pagination).toHaveProperty("totalPages");
      expect(pagination.pageNumber).toBe(1);
      expect(pagination.pageSize).toBe(5);
    });

    it("returns correct student fields", async () => {
      const res = await get("?limit=1");
      expect(res.status).toBe(200);

      const student = res.body.data.students?.[0];
      if (!student) return; 

      expect(student).toHaveProperty("id");
      expect(student).toHaveProperty("username");
      expect(student).toHaveProperty("firstName");
      expect(student).toHaveProperty("lastName");
      expect(student).toHaveProperty("email");
      expect(student).toHaveProperty("universityStudentId");
      expect(student).toHaveProperty("status");
      expect(student).toHaveProperty("programName");
      expect(student).toHaveProperty("programLevelName");
    });
  });

  describe("Combined query", () => {
    it("handles all filters together", async () => {
      const res = await get(
        "?page=1&limit=20&status=New&programId=1&isVerified=true&isBlocked=false&sortOrder=desc"
      );
      expect(res.status).toBe(200);
    });
  });
});
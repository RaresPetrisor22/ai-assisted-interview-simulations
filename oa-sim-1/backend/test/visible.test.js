import request from "supertest";
import app from "../app.js";
import {
  resetTestDatabase,
  startTestDatabase,
  stopTestDatabase,
} from "./helpers/testDb.js";

beforeAll(startTestDatabase, 120000);
beforeEach(resetTestDatabase);
afterAll(stopTestDatabase);

describe("GET /api/movies/search", () => {
  test("returns movies whose title contains the search text, ignoring case", async () => {
    const res = await request(app)
      .get("/api/movies/search")
      .query({ q: "dark", sortBy: "title", order: "asc" });

    expect(res.status).toBe(200);
    expect(res.body.results.map((movie) => movie.title)).toEqual([
      "Dark City",
      "Darkest Hour",
      "The Dark Knight",
      "Zero Dark Thirty",
    ]);
    expect(res.body.results[0]).toEqual({
      id: expect.any(String),
      title: "Dark City",
      genres: ["Sci-Fi", "Thriller"],
      releaseYear: 1998,
      rating: 7.6,
      director: "Alex Proyas",
      runtime: 100,
    });
    expect(res.body).toMatchObject({
      page: 1,
      limit: 10,
      total: 4,
      totalPages: 1,
    });
  });

  test("returns the requested page of results when page and limit are provided", async () => {
    const res = await request(app)
      .get("/api/movies/search")
      .query({ sortBy: "title", order: "asc", page: 2, limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.results.map((movie) => movie.title)).toEqual([
      "Ex Machina",
      "Get Out",
      "Gravity",
      "Inception",
      "Interstellar",
    ]);
    expect(res.body).toMatchObject({
      page: 2,
      limit: 5,
      total: 25,
      totalPages: 5,
    });
  });
});

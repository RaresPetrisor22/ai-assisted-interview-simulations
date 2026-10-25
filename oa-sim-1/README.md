# Movie Database(MERN): Movie Search

## Overview

MovieDB is an IMDb-style movie database built with MongoDB, Express, React and Node.js. Users report that they **are unable to find movies on the search page**: searching for part of a title, filtering by genre or year, sorting, or moving between result pages doesn't return the movies they expect. Your task is to fix this backend issue so that the search endpoint behaves exactly as described below.

- Only the backend (`backend/`) is graded. The React frontend in `frontend/` is provided for convenience and already works.
- Do not modify the test files or the seed data.

---

## Expected API Behavior

### `GET /api/movies/search`

Searches the movie catalogue. Supports a partial, case-insensitive title search, genre and release-year filters, sorting and pagination. All parameters are optional and passed as query-string parameters.

#### Request Headers

| Header      | Required | Notes                                    |
| ----------- | -------- | ---------------------------------------- |
| `x-user-id` | No       | Search is public; the header is ignored. |

#### Request Body

None.

#### Query Parameters

| Field      | Type    | Required | Notes                                                                                                                                                                                  |
| ---------- | ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `q`        | string  | No       | Text to look for in the movie **title**. Partial match ("contains"), case-insensitive. Leading/trailing whitespace is ignored. Characters are matched literally. Omitted or blank = no title filter. |
| `genre`    | string  | No       | One of: `Action`, `Adventure`, `Animation`, `Comedy`, `Crime`, `Drama`, `Fantasy`, `Horror`, `Romance`, `Sci-Fi`, `Thriller`. Case-insensitive (`sci-fi` = `Sci-Fi`). A movie matches if it has this genre among its `genres`. |
| `yearFrom` | integer | No       | Earliest release year, **inclusive**. Must be between 1888 and 2100.                                                                                                                    |
| `yearTo`   | integer | No       | Latest release year, **inclusive**. Must be between 1888 and 2100.                                                                                                                      |
| `sortBy`   | string  | No       | `title`, `releaseYear` or `rating`. Default: `rating`.                                                                                                                                  |
| `order`    | string  | No       | `asc` or `desc`. Default: `desc`.                                                                                                                                                      |
| `page`     | integer | No       | Page number, starting at 1. Default: `1`.                                                                                                                                               |
| `limit`    | integer | No       | Results per page, between 1 and 50 (inclusive). Default: `10`.                                                                                                                          |

All provided filters are combined (a movie must match every filter).

#### Success Response

**Status:** `200 OK`

```json
{
  "results": [
    {
      "id": "6650c1f2a1b2c3d4e5f60789",
      "title": "Dark City",
      "genres": ["Sci-Fi", "Thriller"],
      "releaseYear": 1998,
      "rating": 7.6,
      "director": "Alex Proyas",
      "runtime": 100
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 4,
  "totalPages": 1
}
```

| Field        | Type    | Description                                                                    |
| ------------ | ------- | ------------------------------------------------------------------------------ |
| `results`    | array   | The movies on the requested page, in the requested order.                      |
| `page`       | integer | The requested page number.                                                     |
| `limit`      | integer | The page size that was applied.                                                |
| `total`      | integer | Number of movies matching **all** filters (across all pages, not just this one). |
| `totalPages` | integer | `ceil(total / limit)`; `0` when nothing matches.                               |

Each item in `results` contains **exactly** these fields: `id` (string), `title`, `genres`, `releaseYear`, `rating`, `director`, `runtime`. Internal fields such as `_id`, `__v`, `synopsis` or timestamps must not be included.

#### Error Responses

All errors return a JSON body of the form `{ "message": "<message>" }`.

| Status | Condition                                                         | Message                                              |
| ------ | ----------------------------------------------------------------- | ---------------------------------------------------- |
| 400    | `genre` is not one of the supported genres                        | `Invalid genre`                                      |
| 400    | `yearFrom` is not an integer between 1888 and 2100                | `yearFrom must be a year between 1888 and 2100`      |
| 400    | `yearTo` is not an integer between 1888 and 2100                  | `yearTo must be a year between 1888 and 2100`        |
| 400    | Both years are given and `yearFrom` is greater than `yearTo`      | `yearFrom cannot be greater than yearTo`             |
| 400    | `sortBy` is not one of the supported values                       | `sortBy must be one of: title, releaseYear, rating`  |
| 400    | `order` is not `asc` or `desc`                                    | `order must be one of: asc, desc`                    |
| 400    | `page` is not a positive integer (e.g. `0`, `-1`, `abc`, `1.5`)   | `page must be a positive integer`                    |
| 400    | `limit` is not an integer between 1 and 50                        | `limit must be an integer between 1 and 50`          |

If several parameters are invalid, the first failing check in the order of this table is reported.

---

## Additional Information

- **Title search:** `q=dark` matches "Dark City", "Darkest Hour", "The Dark Knight" and "Zero Dark Thirty". `q=DARK` returns the same movies. Only the title is searched (not the director or synopsis).
- **Year range:** both bounds are inclusive, so `yearFrom=1999&yearTo=2014` includes movies released in 1999 and in 2014. Either bound can be used on its own.
- **Sorting:** results are sorted by `sortBy` in the requested `order`. Ties are broken by `title` in ascending (A→Z) order, regardless of `order`. Without any sort parameters, the highest-rated movies come first.
- **Pagination:** page `n` contains the results at positions `(n - 1) * limit + 1` to `n * limit` of the full, sorted result list. Requesting a page past the last one is not an error: it returns `200` with an empty `results` array and the usual `page`, `limit`, `total` and `totalPages` values.
- **No matches** is not an error: the endpoint returns `200` with `results: []`, `total: 0` and `totalPages: 0`.
- **Seed data:** 3 users (below) and 25 movies are loaded from `backend/data/` every time the server starts.
- To manually reset the database, stop the running server and restart it.
- Running the test cases will also restore the database to its initial state.

### Other endpoints (for reference)

These endpoints are part of the app and are used by the frontend.

| Method | Path                      | Auth            | Description                                                          |
| ------ | ------------------------- | --------------- | -------------------------------------------------------------------- |
| GET    | `/api/health`             | –               | Health check, returns `{ "status": "ok" }`.                          |
| POST   | `/api/auth/login`         | –               | Body `{ "email": "..." }`. Returns `{ "user" }` for a seeded email.  |
| GET    | `/api/auth/me`            | `x-user-id`     | Returns `{ "user" }` for the current user.                           |
| GET    | `/api/movies`             | –               | All movies sorted by title. Optional `?director=` (exact, case-insensitive). |
| GET    | `/api/movies/:id`         | –               | Full details of one movie, `{ "movie" }`.                            |
| POST   | `/api/movies`             | `x-user-id` (admin) | Create a movie. `201 { "movie" }`.                               |
| PUT    | `/api/movies/:id`         | `x-user-id` (admin) | Update a movie. `200 { "movie" }`.                               |
| DELETE | `/api/movies/:id`         | `x-user-id` (admin) | Delete a movie. `200 { "message": "Movie deleted" }`.            |
| GET    | `/api/watchlist`          | `x-user-id`     | The current user's watchlist.                                        |
| POST   | `/api/watchlist/:movieId` | `x-user-id`     | Add a movie to the watchlist.                                        |
| DELETE | `/api/watchlist/:movieId` | `x-user-id`     | Remove a movie from the watchlist.                                   |

Authentication is simplified: send the user's id in the `x-user-id` header. Missing or unknown ids return `401`; non-admins calling admin endpoints get `403`.

---

## How to Run

Requires Node.js 20.19 or later. No local MongoDB installation is needed: when `MONGO_URI` is not set, the server starts an in-memory MongoDB instance (the first run may take a little longer while the MongoDB binary is downloaded).

```bash
cd backend
npm install
npm start              # API on http://localhost:5000 (set PORT / MONGO_URI to override)
npm test               # graded run: 2 visible + 4 hidden test cases
npm run test:visible   # only the visible tests, with full Jest output
```

Optional frontend:

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173 (proxies /api to http://localhost:5000)
```

### Seeded Users

| Name        | Email              | Role  | `x-user-id`                |
| ----------- | ------------------ | ----- | -------------------------- |
| Maya Chen   | `maya@moviedb.dev` | admin | `64f1c0a1b2c3d4e5f6a70001` |
| Leo Park    | `leo@moviedb.dev`  | user  | `64f1c0a1b2c3d4e5f6a70002` |
| Sara Okafor | `sara@moviedb.dev` | user  | `64f1c0a1b2c3d4e5f6a70003` |

### Example

```bash
curl "http://localhost:5000/api/movies/search?q=dark&sortBy=title&order=asc"
curl "http://localhost:5000/api/movies/search?genre=drama&yearFrom=2010&page=2&limit=5"
```

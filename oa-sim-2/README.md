# Car Marketplace(MERN): Wishlist

## Overview

Car Marketplace is a MERN application where users browse car listings and can add any car to their wishlist from the car's page, view their wishlist, and remove cars from it.

Users are unable to add cars to their wishlist. Separately, when they remove a car, the API reports success but the car stays in the wishlist. Your task is to fix the wishlist backend.

The `frontend/` folder contains a small React client for manual testing. It is not graded. All graded work is in `backend/`.

---

## Authentication

Authentication is simplified. Every protected endpoint identifies the user through the `x-user-id` request header, which must contain the id of an existing user.

| Status | Condition | Response body |
| ------ | --------- | ------------- |
| 401 | `x-user-id` header is missing | `{ "message": "Authentication required" }` |
| 401 | `x-user-id` is not a valid id or does not match any user | `{ "message": "Invalid user" }` |

All error responses have the shape `{ "message": string }`.

---

## Expected API Behavior

### 1. Get Wishlist

`GET /api/wishlist`

Returns the authenticated user's wishlist.

**Request Headers**

| Header | Required | Notes |
| ------ | -------- | ----- |
| `x-user-id` | Yes | Id of the authenticated user |

**Success Response** - `200 OK`

```json
{
  "count": 2,
  "items": [
    {
      "carId": "65b000000000000000000005",
      "make": "BMW",
      "model": "X3",
      "year": 2021,
      "price": 38500,
      "status": "available",
      "note": null,
      "addedAt": "2026-05-10T09:30:00.000Z"
    },
    {
      "carId": "65b000000000000000000002",
      "make": "Honda",
      "model": "Civic",
      "year": 2019,
      "price": 17200,
      "status": "available",
      "note": "Low mileage, check service history",
      "addedAt": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

- `items` are sorted by `addedAt` in **descending** order (most recently added car first).
- `count` is the number of items returned.
- `status` is the car's current listing status (a car that was added while available may later become `pending` or `sold`; it stays in the wishlist).
- `note` is `null` when no note was saved.
- An empty wishlist returns `{ "count": 0, "items": [] }`.

**Error Responses**

| Status | Condition | Message |
| ------ | --------- | ------- |
| 401 | Missing / invalid `x-user-id` | See [Authentication](#authentication) |

---

### 2. Add Car to Wishlist

`POST /api/wishlist`

Adds a car to the authenticated user's wishlist.

**Request Headers**

| Header | Required | Notes |
| ------ | -------- | ----- |
| `x-user-id` | Yes | Id of the authenticated user |
| `Content-Type` | Yes | `application/json` |

**Request Body**

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `carId` | string | Yes | Id of the car (24-character hex ObjectId) |
| `note` | string | No | Personal note, at most 200 characters. Defaults to `null` |

```json
{ "carId": "65b000000000000000000001", "note": "Check the tyres" }
```

**Success Response** - `201 Created`

```json
{
  "message": "Car added to wishlist",
  "item": {
    "carId": "65b000000000000000000001",
    "make": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "price": 18500,
    "status": "available",
    "note": "Check the tyres",
    "addedAt": "2026-10-25T12:00:00.000Z"
  }
}
```

The car must appear in subsequent `GET /api/wishlist` responses.

**Error Responses**

Validation is applied in the order below; the first failing check determines the response.

| Status | Condition | Message |
| ------ | --------- | ------- |
| 401 | Missing / invalid `x-user-id` | See [Authentication](#authentication) |
| 400 | `carId` missing or not a valid ObjectId | `Invalid car id` |
| 400 | `note` is not a string or is longer than 200 characters | `Note must be a string of at most 200 characters` |
| 404 | No car exists with `carId` | `Car not found` |
| 400 | Car status is not `available` (i.e. it is `pending` or `sold`) | `Car is no longer available` |
| 409 | Car is already in the user's wishlist | `Car is already in your wishlist` |
| 400 | Wishlist already holds the maximum of 10 cars | `Wishlist cannot contain more than 10 cars` |

A failed request must not modify the wishlist.

---

### 3. Remove Car from Wishlist

`DELETE /api/wishlist/:carId`

Removes a car from the authenticated user's wishlist.

**Request Headers**

| Header | Required | Notes |
| ------ | -------- | ----- |
| `x-user-id` | Yes | Id of the authenticated user |

**URL Parameters**

| Parameter | Type | Notes |
| --------- | ---- | ----- |
| `carId` | string | Id of the car to remove |

**Success Response** - `200 OK`

```json
{ "message": "Car removed from wishlist", "carId": "65b000000000000000000005" }
```

The car must no longer appear in subsequent `GET /api/wishlist` responses.

**Error Responses**

| Status | Condition | Message |
| ------ | --------- | ------- |
| 401 | Missing / invalid `x-user-id` | See [Authentication](#authentication) |
| 400 | `carId` is not a valid ObjectId | `Invalid car id` |
| 404 | The car is not in the user's wishlist | `Car not found in wishlist` |

---

### Other endpoints (working, for reference)

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/api/auth/login` | Body `{ "email" }`. `200 { user }`, `400 Email is required`, `401 Invalid credentials` |
| `GET` | `/api/auth/me` | Requires `x-user-id`. `200 { user }` where `user = { id, name, email, role, wishlistCount }` |
| `GET` | `/api/cars` | List cars. Query: `make` (case-insensitive), `fuelType`, `bodyType`, `status`, `minPrice`, `maxPrice`, `minYear`, `sort` (`price_asc`, `price_desc`, `year_desc`, `mileage_asc`), `page` (default 1), `limit` (default 10, max 50). Returns `{ page, limit, total, totalPages, cars }` |
| `GET` | `/api/cars/:id` | `200 { car }`, `400 Invalid car id`, `404 Car not found` |
| `GET` | `/api/cars/mine` | Requires `x-user-id`. Cars listed by the authenticated seller: `{ count, cars }` |
| `GET` | `/api/health` | `200 { status: "ok" }` |

---

## Additional Information

- A wishlist can hold at most **10** cars.
- A car can appear in a user's wishlist at most once.
- Only cars whose `status` is `available` can be added. Car statuses are `available`, `pending` and `sold`.
- `note` is optional, trimmed, at most 200 characters, and defaults to `null`.
- `addedAt` is set by the server when the car is added (ISO 8601 string in responses).
- Removing a car only affects the authenticated user's wishlist.
- The database is seeded on startup. To manually reset the database, stop the running server and restart it.
- Running the test cases will also restore the database to its initial state.
- If `MONGO_URI` is not set, the server starts an in-memory MongoDB instance automatically, so no MongoDB installation is required.

### Seeded users

| Name | Email | Role | `x-user-id` | Wishlist |
| ---- | ----- | ---- | ----------- | -------- |
| Alice Johnson | alice@example.com | buyer | `64a000000000000000000001` | 3 cars |
| Bob Smith | bob@example.com | buyer | `64a000000000000000000002` | 1 car |
| Dana Lee | dana@example.com | buyer | `64a000000000000000000003` | 10 cars (full) |
| Carlos Diaz | carlos@example.com | buyer | `64a000000000000000000004` | empty |
| Evan Brooks | evan@motors.example.com | seller | `64a000000000000000000005` | empty |
| Fiona Chen | fiona@motors.example.com | seller | `64a000000000000000000006` | empty |

Seeded cars have ids `65b000000000000000000001` to `65b000000000000000000014` (see `backend/data/cars.json`).

---

## How to run

```bash
cd backend
npm install
npm start          # API on http://localhost:5000
npm test           # graded run: visible + hidden test cases
npm run test:visible   # visible tests only, full Jest output
```

Optional frontend (not graded):

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173, proxies /api to http://localhost:5000
```

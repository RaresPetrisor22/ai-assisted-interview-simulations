import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  GENRES,
  MAX_LIMIT,
  MAX_RELEASE_YEAR,
  MIN_RELEASE_YEAR,
  SORT_FIELDS,
  SORT_ORDERS,
} from "../config/constants.js";
import { badRequest } from "./httpError.js";

const INTEGER_PATTERN = /^-?\d+$/;

// "sci-fi" -> "Sci-Fi", "DRAMA" -> "Drama", ...
const GENRE_LOOKUP = new Map(
  GENRES.map((genre) => [genre.toLowerCase(), genre]),
);

const toInteger = (value) => {
  if (typeof value !== "string" && typeof value !== "number") return NaN;

  const text = String(value).trim();
  return INTEGER_PATTERN.test(text) ? Number(text) : NaN;
};

const parseYear = (value, name) => {
  if (value === undefined) return null;

  const year = toInteger(value);
  if (
    !Number.isInteger(year) ||
    year < MIN_RELEASE_YEAR ||
    year > MAX_RELEASE_YEAR
  ) {
    throw badRequest(
      `${name} must be a year between ${MIN_RELEASE_YEAR} and ${MAX_RELEASE_YEAR}`,
    );
  }

  return year;
};

const parseGenre = (value) => {
  if (value === undefined) return null;

  const genre =
    typeof value === "string"
      ? GENRE_LOOKUP.get(value.trim().toLowerCase())
      : undefined;
  if (!genre) {
    throw badRequest("Invalid genre");
  }

  return genre;
};

/**
 * Validates the raw query string of GET /api/movies/search and returns
 * normalised values with defaults applied.
 */
export const parseSearchParams = (query = {}) => {
  const q = typeof query.q === "string" ? query.q.trim() : "";
  const genre = parseGenre(query.genre);

  const yearFrom = parseYear(query.yearFrom, "yearFrom");
  const yearTo = parseYear(query.yearTo, "yearTo");
  if (yearFrom != null && yearTo != null && yearFrom > yearTo) {
    throw badRequest("yearFrom cannot be greater than yearTo");
  }

  const sortBy = query.sortBy ?? DEFAULT_SORT_BY;
  if (!SORT_FIELDS.includes(sortBy)) {
    throw badRequest(`sortBy must be one of: ${SORT_FIELDS.join(", ")}`);
  }

  const order = query.order ?? DEFAULT_SORT_ORDER;
  if (!SORT_ORDERS.includes(order)) {
    throw badRequest(`order must be one of: ${SORT_ORDERS.join(", ")}`);
  }

  const page = query.page === undefined ? DEFAULT_PAGE : toInteger(query.page);
  if (!Number.isInteger(page) || page < 1) {
    throw badRequest("page must be a positive integer");
  }

  const limit =
    query.limit === undefined ? DEFAULT_LIMIT : toInteger(query.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw badRequest(`limit must be an integer between 1 and ${MAX_LIMIT}`);
  }

  return { q, genre, yearFrom, yearTo, sortBy, order, page, limit };
};

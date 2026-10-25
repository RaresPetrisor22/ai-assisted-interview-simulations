import { escapeRegex } from "./regex.js";

/**
 * Translates validated search parameters into a MongoDB filter.
 */
export const buildSearchFilter = ({ q, genre, yearFrom, yearTo }) => {
  const filter = {};

  if (q) {
    filter.title = new RegExp(escapeRegex(q.trim()), "i");
  }

  if (genre) {
    // `genres` is an array; matching a single value matches any element.
    filter.genres = genre;
  }

  if (yearFrom != null || yearTo != null) {
    filter.releaseYear = {};
    if (yearFrom != null) filter.releaseYear.$gte = yearFrom;
    if (yearTo != null) filter.releaseYear.$lte = yearTo;
  }

  return filter;
};

/**
 * Primary sort on the requested field, then title A-Z, then _id so that
 * pagination is stable across requests.
 */
export const buildSort = (sortBy, order) => {
  const sort = { [sortBy]: order === "asc" ? 1 : -1 };

  if (sortBy !== "title") {
    sort.title = 1;
  }
  sort._id = 1;

  return sort;
};

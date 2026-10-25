import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants.js';

export class QueryParamError extends Error {
  constructor(param) {
    super(`Invalid query parameter: ${param}`);
    this.status = 400;
  }
}

function parseInteger(value, param, { min }) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min) {
    throw new QueryParamError(param);
  }
  return parsed;
}

function parseNumber(value, param) {
  const parsed = Number(value);
  if (value === '' || Number.isNaN(parsed) || parsed < 0) {
    throw new QueryParamError(param);
  }
  return parsed;
}

export function parsePagination(query) {
  const page = query.page === undefined ? 1 : parseInteger(query.page, 'page', { min: 1 });
  const limit =
    query.limit === undefined
      ? DEFAULT_PAGE_SIZE
      : Math.min(parseInteger(query.limit, 'limit', { min: 1 }), MAX_PAGE_SIZE);

  return { page, limit };
}

export function parseCarFilters(query) {
  const filters = {
    make: query.make,
    fuelType: query.fuelType,
    bodyType: query.bodyType,
    status: query.status,
  };

  if (query.minPrice !== undefined) filters.minPrice = parseNumber(query.minPrice, 'minPrice');
  if (query.maxPrice !== undefined) filters.maxPrice = parseNumber(query.maxPrice, 'maxPrice');
  if (query.minYear !== undefined) filters.minYear = parseInteger(query.minYear, 'minYear', { min: 1900 });

  return filters;
}

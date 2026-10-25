export const GENRES = Object.freeze([
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
]);

export const USER_ROLES = Object.freeze(['user', 'admin']);

export const MIN_RELEASE_YEAR = 1888;
export const MAX_RELEASE_YEAR = 2100;

export const SORT_FIELDS = Object.freeze(['title', 'releaseYear', 'rating']);
export const SORT_ORDERS = Object.freeze(['asc', 'desc']);
export const DEFAULT_SORT_BY = 'rating';
export const DEFAULT_SORT_ORDER = 'desc';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

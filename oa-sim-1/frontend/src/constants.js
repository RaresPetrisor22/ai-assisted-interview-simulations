export const GENRES = [
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
];

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'title', label: 'Title' },
  { value: 'releaseYear', label: 'Release year' },
];

export const PAGE_SIZES = [5, 10, 20, 50];

export const DEMO_ACCOUNTS = [
  { email: 'maya@moviedb.dev', label: 'Maya Chen (admin)' },
  { email: 'leo@moviedb.dev', label: 'Leo Park' },
  { email: 'sara@moviedb.dev', label: 'Sara Okafor' },
];

export const INITIAL_FILTERS = {
  q: '',
  genre: '',
  yearFrom: '',
  yearTo: '',
  sortBy: 'rating',
  order: 'desc',
  limit: 10,
};

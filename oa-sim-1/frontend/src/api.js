const request = async (path, { method = 'GET', userId, body } = {}) => {
  const headers = {};
  if (userId) headers['x-user-id'] = userId;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

const toQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, String(value).trim());
    }
  });
  return query.toString();
};

export const api = {
  searchMovies: (params) => request(`/movies/search?${toQueryString(params)}`),
  getMovie: (id) => request(`/movies/${id}`),
  login: (email) => request('/auth/login', { method: 'POST', body: { email } }),
  getWatchlist: (userId) => request('/watchlist', { userId }),
  addToWatchlist: (userId, movieId) => request(`/watchlist/${movieId}`, { method: 'POST', userId }),
  removeFromWatchlist: (userId, movieId) => request(`/watchlist/${movieId}`, { method: 'DELETE', userId }),
};

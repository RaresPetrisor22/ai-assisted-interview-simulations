async function request(path, { userId, method = 'GET', body } = {}) {
  const headers = {};
  if (userId) headers['x-user-id'] = userId;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  login: (email) => request('/api/auth/login', { method: 'POST', body: { email } }),
  listCars: (params) => request(`/api/cars?${new URLSearchParams(params)}`),
  getCar: (id) => request(`/api/cars/${id}`),
  getWishlist: (userId) => request('/api/wishlist', { userId }),
  addToWishlist: (userId, carId, note) =>
    request('/api/wishlist', { userId, method: 'POST', body: note ? { carId, note } : { carId } }),
  removeFromWishlist: (userId, carId) =>
    request(`/api/wishlist/${carId}`, { userId, method: 'DELETE' }),
};

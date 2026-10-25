import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Wishlist({ user, onSelect }) {
  const [wishlist, setWishlist] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api
      .getWishlist(user.id)
      .then((data) => {
        setWishlist(data);
        setError('');
      })
      .catch((err) => setError(err.message));
  }, [user.id]);

  useEffect(load, [load]);

  async function handleRemove(carId) {
    try {
      await api.removeFromWishlist(user.id, carId);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h2>My wishlist {wishlist && `(${wishlist.count})`}</h2>
      {error && <p className="error">{error}</p>}
      {wishlist?.count === 0 && <p>Your wishlist is empty.</p>}
      <ul className="wishlist">
        {wishlist?.items.map((item) => (
          <li key={item.carId} className="card">
            <div className="clickable" onClick={() => onSelect(item.carId)}>
              <strong>
                {item.year} {item.make} {item.model}
              </strong>{' '}
              <span className="price">${item.price.toLocaleString()}</span>{' '}
              <span className={`badge ${item.status}`}>{item.status}</span>
              {item.note && <p className="note">{item.note}</p>}
              <small>Added {new Date(item.addedAt).toLocaleDateString()}</small>
            </div>
            <button onClick={() => handleRemove(item.carId)}>Remove</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

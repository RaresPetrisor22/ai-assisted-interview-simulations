import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function CarDetails({ id, user, onBack }) {
  const [car, setCar] = useState(null);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getCar(id)
      .then((data) => setCar(data.car))
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleAdd() {
    setMessage('');
    setError('');
    try {
      const data = await api.addToWishlist(user.id, id, note.trim());
      setMessage(data.message);
      setNote('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <button onClick={onBack}>&larr; Back</button>
      {car && (
        <div className="card details">
          <h2>
            {car.year} {car.make} {car.model}
          </h2>
          <p className="price">${car.price.toLocaleString()}</p>
          <ul>
            <li>Mileage: {car.mileage.toLocaleString()} mi</li>
            <li>Fuel: {car.fuelType}</li>
            <li>Body: {car.bodyType}</li>
            <li>Color: {car.color}</li>
            <li>Location: {car.location}</li>
            <li>
              Status: <span className={`badge ${car.status}`}>{car.status}</span>
            </li>
          </ul>
          <div className="add">
            <input
              placeholder="Optional note"
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button onClick={handleAdd}>Add to wishlist</button>
          </div>
        </div>
      )}
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}

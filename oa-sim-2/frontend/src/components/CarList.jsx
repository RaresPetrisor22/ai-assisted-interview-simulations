import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function CarList({ onSelect }) {
  const [filters, setFilters] = useState({ make: '', fuelType: '', maxPrice: '' });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = { page, limit: 6 };
    for (const [key, value] of Object.entries(filters)) {
      if (value) params[key] = value;
    }
    api
      .listCars(params)
      .then((data) => {
        setResult(data);
        setError('');
      })
      .catch((err) => setError(err.message));
  }, [filters, page]);

  function update(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  return (
    <section>
      <div className="filters">
        <input placeholder="Make" value={filters.make} onChange={(e) => update('make', e.target.value)} />
        <select value={filters.fuelType} onChange={(e) => update('fuelType', e.target.value)}>
          <option value="">Any fuel</option>
          <option value="petrol">Petrol</option>
          <option value="diesel">Diesel</option>
          <option value="hybrid">Hybrid</option>
          <option value="electric">Electric</option>
        </select>
        <input
          placeholder="Max price"
          type="number"
          value={filters.maxPrice}
          onChange={(e) => update('maxPrice', e.target.value)}
        />
      </div>

      {error && <p className="error">{error}</p>}

      <div className="grid">
        {result?.cars.map((car) => (
          <article key={car.id} className="card clickable" onClick={() => onSelect(car.id)}>
            <h3>
              {car.year} {car.make} {car.model}
            </h3>
            <p className="price">${car.price.toLocaleString()}</p>
            <p>
              {car.mileage.toLocaleString()} mi · {car.fuelType} · {car.location}
            </p>
            <span className={`badge ${car.status}`}>{car.status}</span>
          </article>
        ))}
      </div>

      {result && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span>
            Page {result.page} of {Math.max(result.totalPages, 1)}
          </span>
          <button disabled={page >= result.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}
    </section>
  );
}

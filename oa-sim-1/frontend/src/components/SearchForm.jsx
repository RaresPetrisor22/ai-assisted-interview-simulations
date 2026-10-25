import { useState } from 'react';
import { GENRES, PAGE_SIZES, SORT_OPTIONS } from '../constants.js';

export default function SearchForm({ initialValues, onSearch }) {
  const [values, setValues] = useState(initialValues);

  const update = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(values);
  };

  const handleReset = () => {
    setValues(initialValues);
    onSearch(initialValues);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-row">
        <input
          className="search-input"
          type="search"
          placeholder="Search by title…"
          value={values.q}
          onChange={update('q')}
          aria-label="Title"
        />
        <button type="submit" className="button primary">
          Search
        </button>
      </div>

      <div className="filter-row">
        <label>
          Genre
          <select value={values.genre} onChange={update('genre')}>
            <option value="">Any</option>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>

        <label>
          From
          <input type="number" placeholder="1888" value={values.yearFrom} onChange={update('yearFrom')} />
        </label>

        <label>
          To
          <input type="number" placeholder="2100" value={values.yearTo} onChange={update('yearTo')} />
        </label>

        <label>
          Sort by
          <select value={values.sortBy} onChange={update('sortBy')}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Order
          <select value={values.order} onChange={update('order')}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>

        <label>
          Per page
          <select value={values.limit} onChange={update('limit')}>
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="button ghost" onClick={handleReset}>
          Reset
        </button>
      </div>
    </form>
  );
}

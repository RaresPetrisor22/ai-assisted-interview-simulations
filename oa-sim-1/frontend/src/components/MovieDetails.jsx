import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function MovieDetails({ movieId, onClose }) {
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setMovie(null);
    setError('');

    api
      .getMovie(movieId)
      .then((result) => !cancelled && setMovie(result.movie))
      .catch((err) => !cancelled && setError(err.message));

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {error && <div className="alert">{error}</div>}
        {!movie && !error && <p className="muted">Loading…</p>}

        {movie && (
          <>
            <h2>{movie.title}</h2>
            <p className="muted">
              {movie.releaseYear} · {movie.director} · {movie.runtime} min · ★ {Number(movie.rating).toFixed(1)}
            </p>
            <div className="tags">
              {movie.genres.map((genre) => (
                <span key={genre} className="tag">
                  {genre}
                </span>
              ))}
            </div>
            <p>{movie.synopsis || 'No synopsis available.'}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function Watchlist({ user, movies, onSelect, onRemove }) {
  return (
    <div className="watchlist">
      <h3>Watchlist</h3>

      {!user && <p className="muted">Sign in to keep a watchlist.</p>}
      {user && movies.length === 0 && <p className="muted">Nothing here yet.</p>}

      {user && movies.length > 0 && (
        <ul>
          {movies.map((movie) => (
            <li key={movie.id}>
              <button type="button" className="link" onClick={() => onSelect(movie.id)}>
                {movie.title}
              </button>
              <span className="muted"> ({movie.releaseYear})</span>
              <button type="button" className="icon-button" onClick={() => onRemove(movie.id)} aria-label="Remove">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

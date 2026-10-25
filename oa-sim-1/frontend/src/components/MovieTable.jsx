export default function MovieTable({ movies, loading, watchlistIds, canEditWatchlist, onSelect, onToggleWatchlist }) {
  if (loading && movies.length === 0) {
    return <p className="muted">Loading…</p>;
  }

  if (movies.length === 0) {
    return <p className="muted">No movies found.</p>;
  }

  return (
    <table className={`movie-table${loading ? ' is-loading' : ''}`}>
      <thead>
        <tr>
          <th>Title</th>
          <th>Year</th>
          <th>Genres</th>
          <th>Director</th>
          <th className="numeric">Rating</th>
          <th className="numeric">Runtime</th>
          {canEditWatchlist && <th aria-label="Watchlist" />}
        </tr>
      </thead>
      <tbody>
        {movies.map((movie) => (
          <tr key={movie.id}>
            <td>
              <button type="button" className="link" onClick={() => onSelect(movie.id)}>
                {movie.title}
              </button>
            </td>
            <td>{movie.releaseYear}</td>
            <td>
              <div className="tags">
                {movie.genres.map((genre) => (
                  <span key={genre} className="tag">
                    {genre}
                  </span>
                ))}
              </div>
            </td>
            <td>{movie.director}</td>
            <td className="numeric">★ {Number(movie.rating).toFixed(1)}</td>
            <td className="numeric">{movie.runtime ? `${movie.runtime} min` : '—'}</td>
            {canEditWatchlist && (
              <td>
                <button type="button" className="button small" onClick={() => onToggleWatchlist(movie.id)}>
                  {watchlistIds.has(movie.id) ? 'Remove' : '+ Watchlist'}
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

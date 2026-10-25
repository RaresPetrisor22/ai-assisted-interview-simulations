import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import AccountBar from './components/AccountBar.jsx';
import MovieDetails from './components/MovieDetails.jsx';
import MovieTable from './components/MovieTable.jsx';
import Pagination from './components/Pagination.jsx';
import SearchForm from './components/SearchForm.jsx';
import Watchlist from './components/Watchlist.jsx';
import { INITIAL_FILTERS } from './constants.js';

const STORAGE_KEY = 'moviedb:user';

const loadStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null;
  } catch {
    return null;
  }
};

export default function App() {
  const [query, setQuery] = useState({ ...INITIAL_FILTERS, page: 1 });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [user, setUser] = useState(loadStoredUser);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .searchMovies(query)
      .then((result) => !cancelled && setData(result))
      .catch((err) => {
        if (cancelled) return;
        setData(null);
        setError(err.message);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [query]);

  const refreshWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      return;
    }
    try {
      const result = await api.getWatchlist(user.id);
      setWatchlist(result.movies);
    } catch {
      setWatchlist([]);
    }
  }, [user]);

  useEffect(() => {
    refreshWatchlist();
  }, [refreshWatchlist]);

  const handleLogin = async (email) => {
    const { user: loggedIn } = await api.login(email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn));
    setUser(loggedIn);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const toggleWatchlist = async (movieId) => {
    if (!user) return;
    const inList = watchlist.some((movie) => movie.id === movieId);
    const result = inList
      ? await api.removeFromWatchlist(user.id, movieId)
      : await api.addToWatchlist(user.id, movieId);
    setWatchlist(result.movies);
  };

  const watchlistIds = new Set(watchlist.map((movie) => movie.id));

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">▶</span> MovieDB
        </div>
        <AccountBar user={user} onLogin={handleLogin} onLogout={handleLogout} />
      </header>

      <main className="layout">
        <section className="panel search-panel">
          <SearchForm
            initialValues={INITIAL_FILTERS}
            onSearch={(filters) => setQuery({ ...filters, page: 1 })}
          />

          {error && <div className="alert">{error}</div>}

          <MovieTable
            movies={data?.results ?? []}
            loading={loading}
            watchlistIds={watchlistIds}
            canEditWatchlist={Boolean(user)}
            onSelect={setSelectedId}
            onToggleWatchlist={toggleWatchlist}
          />

          {data && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              onChange={(page) => setQuery((current) => ({ ...current, page }))}
            />
          )}
        </section>

        <aside className="panel side-panel">
          <Watchlist user={user} movies={watchlist} onSelect={setSelectedId} onRemove={toggleWatchlist} />
        </aside>
      </main>

      {selectedId && <MovieDetails movieId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

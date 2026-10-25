import Movie from '../models/Movie.js';
import User from '../models/User.js';
import { notFound } from '../utils/httpError.js';

const toWatchlistResponse = async (user) => {
  await user.populate({ path: 'watchlist', options: { sort: { title: 1 } } });

  return {
    movies: user.watchlist.map((movie) => movie.toSummary()),
    count: user.watchlist.length,
  };
};

// GET /api/watchlist
export const getWatchlist = async (req, res) => {
  res.status(200).json(await toWatchlistResponse(req.user));
};

// POST /api/watchlist/:movieId
export const addToWatchlist = async (req, res) => {
  const movie = await Movie.findById(req.params.movieId);
  if (!movie) {
    throw notFound('Movie not found');
  }

  const user = await User.addToWatchlist(req.user._id, movie._id);

  res.status(200).json(await toWatchlistResponse(user));
};

// DELETE /api/watchlist/:movieId
export const removeFromWatchlist = async (req, res) => {
  const movie = await Movie.findById(req.params.movieId);
  if (!movie) {
    throw notFound('Movie not found');
  }

  const user = await User.removeFromWatchlist(req.user._id, movie._id);

  res.status(200).json(await toWatchlistResponse(user));
};

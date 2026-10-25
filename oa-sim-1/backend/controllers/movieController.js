import Movie from "../models/Movie.js";
import User from "../models/User.js";
import { notFound } from "../utils/httpError.js";
import { buildPageMeta, getPagination } from "../utils/pagination.js";
import { parseSearchParams } from "../utils/searchParams.js";
import { buildSearchFilter, buildSort } from "../utils/searchFilters.js";

const EDITABLE_FIELDS = [
  "title",
  "director",
  "releaseYear",
  "genres",
  "rating",
  "runtime",
  "synopsis",
];

const pickEditableFields = (body = {}) =>
  Object.fromEntries(
    EDITABLE_FIELDS.filter((field) => body[field] !== undefined).map(
      (field) => [field, body[field]],
    ),
  );

// GET /api/movies
export const getMovies = async (req, res) => {
  const { director } = req.query;
  const movies = director
    ? await Movie.findByDirector(String(director))
    : await Movie.findAll();

  res.status(200).json({
    movies: movies.map((movie) => movie.toSummary()),
    count: movies.length,
  });
};

// GET /api/movies/search
export const searchMovies = async (req, res) => {
  const params = parseSearchParams(req.query);
  const { skip, limit } = getPagination(params.page, params.limit);

  const { movies, total } = await Movie.search(buildSearchFilter(params), {
    sort: buildSort(params.sortBy, params.order),
    skip,
    limit,
  });

  res.status(200).json({
    results: movies.map((movie) => movie.toSummary()),
    ...buildPageMeta({ page: params.page, limit, total }),
  });
};

// GET /api/movies/:id
export const getMovieById = async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    throw notFound("Movie not found");
  }

  res.status(200).json({ movie });
};

// POST /api/movies
export const createMovie = async (req, res) => {
  const movie = await Movie.create({
    ...pickEditableFields(req.body),
    createdBy: req.user._id,
  });

  res.status(201).json({ movie });
};

// PUT /api/movies/:id
export const updateMovie = async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    throw notFound("Movie not found");
  }

  movie.set(pickEditableFields(req.body));
  await movie.save();

  res.status(200).json({ movie });
};

// DELETE /api/movies/:id
export const deleteMovie = async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) {
    throw notFound("Movie not found");
  }

  await User.updateMany(
    { watchlist: movie._id },
    { $pull: { watchlist: movie._id } },
  );

  res.status(200).json({ message: "Movie deleted" });
};

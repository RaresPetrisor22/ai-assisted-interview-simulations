import { Router } from "express";
import {
  createMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  searchMovies,
  updateMovie,
} from "../controllers/movieController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

router.route("/").get(getMovies).post(requireAuth, requireAdmin, createMovie);

router.get("/search", searchMovies);

router
  .route("/:id")
  .get(getMovieById)
  .put(requireAuth, requireAdmin, updateMovie)
  .delete(requireAuth, requireAdmin, deleteMovie);

export default router;

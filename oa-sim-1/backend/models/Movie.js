import mongoose from "mongoose";
import {
  GENRES,
  MAX_RELEASE_YEAR,
  MIN_RELEASE_YEAR,
} from "../config/constants.js";
import { escapeRegex } from "../utils/regex.js";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title must be at most 200 characters"],
    },
    director: {
      type: String,
      required: [true, "Director is required"],
      trim: true,
    },
    releaseYear: {
      type: Number,
      required: [true, "Release year is required"],
      min: [
        MIN_RELEASE_YEAR,
        `Release year must be ${MIN_RELEASE_YEAR} or later`,
      ],
      max: [
        MAX_RELEASE_YEAR,
        `Release year must be ${MAX_RELEASE_YEAR} or earlier`,
      ],
    },
    genres: {
      type: [
        {
          type: String,
          enum: { values: GENRES, message: "{VALUE} is not a supported genre" },
        },
      ],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one genre is required",
      },
    },
    rating: {
      type: Number,
      min: [0, "Rating must be between 0 and 10"],
      max: [10, "Rating must be between 0 and 10"],
      default: 0,
    },
    runtime: {
      type: Number,
      min: [1, "Runtime must be a positive number of minutes"],
    },
    synopsis: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  },
);

movieSchema.index({ title: 1 });
movieSchema.index({ genres: 1, releaseYear: 1 });

movieSchema.statics.findAll = function findAll() {
  return this.find().sort({ title: 1 });
};

movieSchema.statics.findByDirector = function findByDirector(name) {
  const director = new RegExp(`^${escapeRegex(name.trim())}$`, "i");
  return this.find({ director }).sort({ releaseYear: 1 });
};

/**
 * Runs a paginated query and returns the page of movies along with the
 * total count, so callers can build pagination metadata.
 */
movieSchema.statics.search = async function search(
  filter,
  { sort, skip, limit },
) {
  const [movies, total] = await Promise.all([
    this.find(filter).sort(sort).skip(skip).limit(limit),
    this.find(filter).countDocuments(),
  ]);

  return { movies, total };
};

movieSchema.methods.toSummary = function toSummary() {
  return {
    id: this.id,
    title: this.title,
    genres: [...this.genres],
    releaseYear: this.releaseYear,
    rating: this.rating,
    director: this.director,
    runtime: this.runtime,
  };
};

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;

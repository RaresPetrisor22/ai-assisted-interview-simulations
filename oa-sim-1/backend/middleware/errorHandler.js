import mongoose from "mongoose";
import { HttpError } from "../utils/httpError.js";

export const notFoundHandler = (req, res) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res
      .status(400)
      .json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const [firstError] = Object.values(err.errors);
    return res
      .status(400)
      .json({ message: firstError?.message ?? "Validation failed" });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON body" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value" });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};

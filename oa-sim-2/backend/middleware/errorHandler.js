import mongoose from 'mongoose';

export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON body' });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const [first] = Object.values(err.errors);
    return res.status(400).json({ message: first.message });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Invalid ${err.path}` });
  }

  if (err.status && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  res.status(500).json({ message: 'Internal server error' });
}

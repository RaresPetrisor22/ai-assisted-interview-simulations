import { isObjectId } from '../utils/validators.js';

/**
 * Rejects the request with 400 when req[source][field] is not a valid ObjectId.
 */
export function validateObjectId(source, field, message) {
  return (req, res, next) => {
    const value = req[source]?.[field];

    if (!isObjectId(value)) {
      return res.status(400).json({ message });
    }

    next();
  };
}

export function toWishlistItem(car, entry) {
  return {
    carId: car._id.toString(),
    make: car.make,
    model: car.model,
    year: car.year,
    price: car.price,
    status: car.status,
    note: entry.note ?? null,
    addedAt: entry.addedAt,
  };
}

/**
 * Converts populated wishlist entries into the API representation.
 * Entries whose car no longer exists are skipped.
 */
export function formatWishlist(entries) {
  return entries
    .filter((entry) => entry.car)
    .map((entry) => toWishlistItem(entry.car, entry))
    .sort((a, b) => b.addedAt - a.addedAt);
}

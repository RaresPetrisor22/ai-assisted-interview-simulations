export function serializeCar(car) {
  return {
    id: car._id.toString(),
    make: car.make,
    model: car.model,
    year: car.year,
    price: car.price,
    mileage: car.mileage,
    fuelType: car.fuelType,
    bodyType: car.bodyType,
    color: car.color,
    location: car.location,
    status: car.status,
    sellerId: car.seller.toString(),
  };
}

export function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    wishlistCount: user.wishlist.length,
  };
}

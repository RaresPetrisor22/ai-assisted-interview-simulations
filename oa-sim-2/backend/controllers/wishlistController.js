import { NOTE_MAX_LENGTH, WISHLIST_LIMIT } from "../config/constants.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import { formatWishlist, toWishlistItem } from "../utils/wishlist.js";

export async function getWishlist(req, res) {
  const user = await User.findWithWishlist(req.user._id);
  const items = formatWishlist(user.wishlist);

  res.status(200).json({ count: items.length, items });
}

export async function addToWishlist(req, res) {
  const { carId, note = null } = req.body;

  if (
    note !== null &&
    (typeof note !== "string" || note.length > NOTE_MAX_LENGTH)
  ) {
    return res.status(400).json({
      message: `Note must be a string of at most ${NOTE_MAX_LENGTH} characters`,
    });
  }

  const car = await Car.findById(carId);
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  if (!car.isAvailable()) {
    return res.status(400).json({ message: "Car is no longer available" });
  }

  const user = req.user;

  if (user.hasInWishlist(car._id)) {
    return res.status(409).json({ message: "Car is already in your wishlist" });
  }

  if (user.isWishlistFull()) {
    return res.status(400).json({
      message: `Wishlist cannot contain more than ${WISHLIST_LIMIT} cars`,
    });
  }

  user.wishlist.push({ car: car._id, note, addedAt: new Date() });
  await user.save();

  const entry = user.wishlist[user.wishlist.length - 1];

  res.status(201).json({
    message: "Car added to wishlist",
    item: toWishlistItem(car, entry),
  });
}

export async function removeFromWishlist(req, res) {
  const { carId } = req.params;

  if (!req.user.hasInWishlist(carId)) {
    return res.status(404).json({ message: "Car not found in wishlist" });
  }

  await User.updateOne(
    { _id: req.user._id },
    { $pull: { wishlist: { car: carId } } },
  );

  res.status(200).json({ message: "Car removed from wishlist", carId });
}

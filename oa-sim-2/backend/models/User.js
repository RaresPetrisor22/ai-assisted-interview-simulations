import mongoose from 'mongoose';
import { NOTE_MAX_LENGTH, USER_ROLES, WISHLIST_LIMIT } from '../config/constants.js';

const wishlistItemSchema = new mongoose.Schema(
  {
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    note: { type: String, trim: true, maxlength: NOTE_MAX_LENGTH, default: null },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: USER_ROLES, default: 'buyer' },
    wishlist: { type: [wishlistItemSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: String(email).trim().toLowerCase() });
};

userSchema.statics.findWithWishlist = function (userId) {
  return this.findById(userId).populate('wishlist.car');
};

userSchema.methods.hasInWishlist = function (carId) {
  return this.wishlist.some((item) => item.car.toString() === carId);
};

userSchema.methods.isWishlistFull = function () {
  return this.wishlist.length > WISHLIST_LIMIT;
};

const User = mongoose.model('User', userSchema);

export default User;

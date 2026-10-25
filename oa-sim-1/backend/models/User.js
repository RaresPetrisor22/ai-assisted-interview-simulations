import mongoose from 'mongoose';
import { USER_ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
    },
    watchlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.watchlist;
        return ret;
      },
    },
  },
);

userSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email: String(email).trim().toLowerCase() });
};

userSchema.statics.addToWatchlist = function addToWatchlist(userId, movieId) {
  return this.findByIdAndUpdate(userId, { $addToSet: { watchlist: movieId } }, { new: true });
};

userSchema.statics.removeFromWatchlist = function removeFromWatchlist(userId, movieId) {
  return this.findByIdAndUpdate(userId, { $pull: { watchlist: movieId } }, { new: true });
};

userSchema.methods.isAdmin = function isAdmin() {
  return this.role === 'admin';
};

const User = mongoose.model('User', userSchema);

export default User;

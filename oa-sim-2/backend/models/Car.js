import mongoose from "mongoose";
import {
  BODY_TYPES,
  CAR_SORT_OPTIONS,
  CAR_STATUSES,
  DEFAULT_PAGE_SIZE,
  FUEL_TYPES,
} from "../config/constants.js";
import { escapeRegex } from "../utils/validators.js";

const carSchema = new mongoose.Schema(
  {
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1950 },
    price: { type: Number, required: true, min: 0 },
    mileage: { type: Number, default: 0, min: 0 },
    fuelType: { type: String, enum: FUEL_TYPES, required: true },
    bodyType: { type: String, enum: BODY_TYPES, required: true },
    color: { type: String, trim: true },
    location: { type: String, trim: true },
    status: { type: String, enum: CAR_STATUSES, default: "available" },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

carSchema.index({ make: 1, model: 1 });
carSchema.index({ price: 1 });

carSchema.methods.isAvailable = function () {
  return this.status !== "sold" && this.status !== "pending";
};

carSchema.statics.buildFilter = function (filters = {}) {
  const { make, fuelType, bodyType, status, minPrice, maxPrice, minYear } =
    filters;
  const query = {};

  if (make) query.make = new RegExp(`^${escapeRegex(make)}$`, "i");
  if (fuelType) query.fuelType = fuelType;
  if (bodyType) query.bodyType = bodyType;
  if (status) query.status = status;
  if (minYear !== undefined) query.year = { $gte: minYear };

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  return query;
};

carSchema.statics.findAll = async function (
  filters = {},
  { page = 1, limit = DEFAULT_PAGE_SIZE, sort } = {},
) {
  const query = this.buildFilter(filters);
  const order = CAR_SORT_OPTIONS[sort] ?? { _id: 1 };

  const [cars, total] = await Promise.all([
    this.find(query)
      .sort(order)
      .skip((page - 1) * limit)
      .limit(limit),
    this.countDocuments(query),
  ]);

  return { cars, total };
};

carSchema.statics.findBySeller = function (sellerId) {
  return this.find({ seller: sellerId }).sort({ createdAt: -1, _id: 1 });
};

const Car = mongoose.model("Car", carSchema);

export default Car;

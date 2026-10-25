import Car from '../models/Car.js';
import { parseCarFilters, parsePagination } from '../utils/query.js';
import { serializeCar } from '../utils/serializers.js';

export async function listCars(req, res) {
  const filters = parseCarFilters(req.query);
  const { page, limit } = parsePagination(req.query);

  const { cars, total } = await Car.findAll(filters, { page, limit, sort: req.query.sort });

  res.status(200).json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    cars: cars.map(serializeCar),
  });
}

export async function getCarById(req, res) {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return res.status(404).json({ message: 'Car not found' });
  }

  res.status(200).json({ car: serializeCar(car) });
}

export async function listMyCars(req, res) {
  const cars = await Car.findBySeller(req.user._id);

  res.status(200).json({ count: cars.length, cars: cars.map(serializeCar) });
}

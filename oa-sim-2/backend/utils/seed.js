import { readFileSync } from 'node:fs';
import Car from '../models/Car.js';
import User from '../models/User.js';

function loadJson(file) {
  return JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
}

const users = loadJson('users.json');
const cars = loadJson('cars.json');

/**
 * Restores the database to its initial state.
 */
export async function seedDatabase() {
  await Promise.all([User.deleteMany({}), Car.deleteMany({})]);
  await User.insertMany(users);
  await Car.insertMany(cars);
}

import { readFile } from 'node:fs/promises';
import Movie from '../models/Movie.js';
import User from '../models/User.js';

const loadJson = async (fileName) => {
  const contents = await readFile(new URL(`../data/${fileName}`, import.meta.url), 'utf8');
  return JSON.parse(contents);
};

/**
 * Wipes the users and movies collections and reloads them from data/*.json.
 * Runs on every server start and before every test.
 */
export const seedDatabase = async () => {
  const [users, movies] = await Promise.all([loadJson('users.json'), loadJson('movies.json')]);

  await Promise.all([User.deleteMany({}), Movie.deleteMany({})]);

  const admin = users.find((user) => user.role === 'admin');
  await User.insertMany(users);
  await Movie.insertMany(movies.map((movie) => ({ ...movie, createdBy: admin?._id })));

  return { users: users.length, movies: movies.length };
};

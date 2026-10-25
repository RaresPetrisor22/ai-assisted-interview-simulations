import 'express-async-errors';
import cors from 'cors';
import express from 'express';
import { connectDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';
import { seedDatabase } from './utils/seed.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

const start = async () => {
  await connectDatabase();

  const seeded = await seedDatabase();
  console.log(`Database seeded with ${seeded.users} users and ${seeded.movies} movies`);

  app.listen(PORT, () => {
    console.log(`Movie API listening on http://localhost:${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  start().catch((error) => {
    console.error('Failed to start the server:', error);
    process.exit(1);
  });
}

export default app;

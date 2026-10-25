import 'express-async-errors';
import express from 'express';
import { connectDatabase } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import carRoutes from './routes/carRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import { seedDatabase } from './utils/seed.js';

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  const port = process.env.PORT || 5000;

  await connectDatabase();
  await seedDatabase();

  app.listen(port, () => {
    console.log(`Car marketplace API listening on http://localhost:${port}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;

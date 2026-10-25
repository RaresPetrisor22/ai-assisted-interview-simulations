import { connectDatabase, disconnectDatabase } from '../../config/database.js';
import { seedDatabase } from '../../utils/seed.js';

export const USERS = {
  alice: '64a000000000000000000001',
  bob: '64a000000000000000000002',
  dana: '64a000000000000000000003',
  carlos: '64a000000000000000000004',
};

export const carId = (n) => `65b0${'0'.repeat(18)}${String(n).padStart(2, '0')}`;

/**
 * Starts an in-memory MongoDB for the test file and restores the seed data before every test.
 */
export function useTestDatabase() {
  beforeAll(async () => {
    await connectDatabase({ uri: null });
  }, 120000);

  beforeEach(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });
}

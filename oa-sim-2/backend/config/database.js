import mongoose from 'mongoose';

let memoryServer = null;

/**
 * Connects Mongoose to MongoDB.
 * When no URI is available an in-memory MongoDB instance is started instead,
 * so the API can run without a local MongoDB installation.
 */
export async function connectDatabase({ uri = process.env.MONGO_URI } = {}) {
  let connectionUri = uri;

  if (!connectionUri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    connectionUri = memoryServer.getUri();
  }

  await mongoose.connect(connectionUri, {
    dbName: process.env.MONGO_DB_NAME || 'car_marketplace',
  });

  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

import mongoose from 'mongoose';

let memoryServer = null;

/**
 * Connects Mongoose to MONGO_URI, or to a throwaway in-memory MongoDB
 * instance when no URI is configured.
 */
export const connectDatabase = async (uri = process.env.MONGO_URI) => {
  let connectionUri = uri;

  if (!connectionUri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    connectionUri = memoryServer.getUri();
    console.log('MONGO_URI is not set, using an in-memory MongoDB instance');
  }

  await mongoose.connect(connectionUri);
  return mongoose.connection;
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

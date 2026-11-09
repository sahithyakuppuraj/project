import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/financetracker';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected to: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err: any) {
    console.warn(`[Database] Failed to connect to primary MongoDB URI (${uri}): ${err.message}`);
    
    // In development mode, fallback to in-memory MongoDB if local MongoDB isn't running
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Starting in-memory MongoDB server for local development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        console.log(`[Database] Connected to In-Memory MongoDB at: ${memUri}`);
        return;
      } catch (memErr: any) {
        console.error('[Database] In-memory MongoDB failed to start:', memErr.message);
      }
    }

    console.error('[Database] Could not connect to MongoDB. Please ensure MONGODB_URI is valid in .env');
    // We do not exit immediately in dev so developers see API documentation/healthcheck
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};


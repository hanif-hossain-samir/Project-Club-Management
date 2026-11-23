import mongoose from 'mongoose';

let mongoConnected = false;

export const isMongoConnected = () => mongoConnected && mongoose.connection.readyState === 1;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cucc_portal';

  if (process.env.USE_IN_MEMORY_DB === 'true') {
    mongoConnected = false;
    return { connected: false, mode: 'in-memory' };
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500
    });
    mongoConnected = true;
    console.log(`[CUEC DB] Connected to MongoDB at ${uri}`);
    return { connected: true, mode: 'mongodb' };
  } catch (err) {
    mongoConnected = false;
    console.log(`[CUEC DB] MongoDB daemon not active (${err.message}); using seeded in-memory store with Mongoose schemas.`);
    return { connected: false, mode: 'in-memory' };
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    mongoConnected = false;
  }
}

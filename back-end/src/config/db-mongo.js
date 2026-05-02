import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

export async function connectMongo() {
  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
    serverSelectionTimeoutMS: 10_000,
  });
  logger.info({ db: env.MONGODB_DB_NAME }, 'MongoDB connected');
}

export async function disconnectMongo() {
  await mongoose.disconnect();
}

export { mongoose };

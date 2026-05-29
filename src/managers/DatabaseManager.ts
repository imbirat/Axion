import mongoose from 'mongoose';
import { AxionClient } from '../structures/AxionClient';

export class DatabaseManager {
  private client: AxionClient;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async connect(): Promise<void> {
    if (!this.client.config.mongodbUri) {
      this.client.logger.error('MongoDB URI not configured');
      throw new Error('MONGODB_URI is required');
    }

    try {
      await mongoose.connect(this.client.config.mongodbUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      mongoose.connection.on('error', (err) => {
        this.client.logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        this.client.logger.warn('MongoDB disconnected');
      });

      this.client.logger.info('Connected to MongoDB');
    } catch (error) {
      this.client.logger.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  public async isConnected(): Promise<boolean> {
    return mongoose.connection.readyState === 1;
  }
}

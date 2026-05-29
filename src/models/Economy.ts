import mongoose, { Schema, Document } from 'mongoose';

export interface IEconomy extends Document {
  userId: string;
  guildId: string;
  wallet: number;
  bank: number;
  bankCapacity: number;
  lastDaily: Date | null;
  lastWork: Date | null;
  lastFish: Date | null;
  lastRob: Date | null;
  totalEarned: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const EconomySchema = new Schema<IEconomy>(
  {
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    bankCapacity: { type: Number, default: 100000 },
    lastDaily: { type: Date, default: null },
    lastWork: { type: Date, default: null },
    lastFish: { type: Date, default: null },
    lastRob: { type: Date, default: null },
    totalEarned: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  { timestamps: true },
);

EconomySchema.index({ guildId: 1, userId: 1 }, { unique: true });
EconomySchema.index({ guildId: 1, wallet: -1 });

export const EconomyModel = mongoose.model<IEconomy>('Economy', EconomySchema);

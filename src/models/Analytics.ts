import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  guildId: string;
  date: string;
  messages: number;
  joins: number;
  leaves: number;
  activeUsers: number;
  commandUsage: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    guildId: { type: String, required: true },
    date: { type: String, required: true },
    messages: { type: Number, default: 0 },
    joins: { type: Number, default: 0 },
    leaves: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    commandUsage: { type: Map, of: Number, default: new Map() },
  },
  { timestamps: true },
);

AnalyticsSchema.index({ guildId: 1, date: 1 }, { unique: true });
AnalyticsSchema.index({ date: 1 });

export const AnalyticsModel = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

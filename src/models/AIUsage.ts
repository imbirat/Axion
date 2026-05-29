import mongoose, { Schema, Document } from 'mongoose';

export interface IAIUsage extends Document {
  userId: string;
  date: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

const AIUsageSchema = new Schema<IAIUsage>(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

AIUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

export const AIUsageModel = mongoose.model<IAIUsage>('AIUsage', AIUsageSchema);

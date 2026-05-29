import mongoose, { Schema, Document } from 'mongoose';

export interface IAFK extends Document {
  userId: string;
  guildId: string;
  reason: string;
  since: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AFKSchema = new Schema<IAFK>(
  {
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    reason: { type: String, default: 'AFK' },
    since: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

AFKSchema.index({ guildId: 1, userId: 1 }, { unique: true });

export const AFKModel = mongoose.model<IAFK>('AFK', AFKSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface ITempVC extends Document {
  guildId: string;
  channelId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const TempVCSchema = new Schema<ITempVC>(
  {
    guildId: { type: String, required: true },
    channelId: { type: String, required: true, unique: true },
    ownerId: { type: String, required: true },
  },
  { timestamps: true },
);

TempVCSchema.index({ guildId: 1, ownerId: 1 });

export const TempVCModel = mongoose.model<ITempVC>('TempVC', TempVCSchema);

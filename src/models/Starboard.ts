import mongoose, { Schema, Document } from 'mongoose';

export interface IStarboard extends Document {
  guildId: string;
  messageId: string;
  channelId: string;
  starboardMessageId: string | null;
  starCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const StarboardSchema = new Schema<IStarboard>(
  {
    guildId: { type: String, required: true },
    messageId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    starboardMessageId: { type: String, default: null },
    starCount: { type: Number, default: 1 },
  },
  { timestamps: true },
);

StarboardSchema.index({ guildId: 1, messageId: 1 }, { unique: true });

export const StarboardModel = mongoose.model<IStarboard>('Starboard', StarboardSchema);

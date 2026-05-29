import mongoose, { Schema, Document } from 'mongoose';

export interface IGiveaway extends Document {
  messageId: string;
  channelId: string;
  guildId: string;
  prize: string;
  winnerCount: number;
  duration: number;
  endTime: Date;
  ended: boolean;
  requiredRole: string | null;
  requiredInvites: number;
  bonusEntries: number;
  entrants: string[];
  winners: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GiveawaySchema = new Schema<IGiveaway>(
  {
    messageId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    guildId: { type: String, required: true },
    prize: { type: String, required: true },
    winnerCount: { type: Number, required: true, min: 1 },
    duration: { type: Number, required: true },
    endTime: { type: Date, required: true },
    ended: { type: Boolean, default: false },
    requiredRole: { type: String, default: null },
    requiredInvites: { type: Number, default: 0 },
    bonusEntries: { type: Number, default: 0 },
    entrants: { type: [String], default: [] },
    winners: { type: [String], default: [] },
  },
  { timestamps: true },
);

GiveawaySchema.index({ guildId: 1, ended: 1 });
GiveawaySchema.index({ endTime: 1, ended: 1 });

export const GiveawayModel = mongoose.model<IGiveaway>('Giveaway', GiveawaySchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IXP extends Document {
  userId: string;
  guildId: string;
  xp: number;
  level: number;
  totalXp: number;
  weeklyXp: number;
  prestige: number;
  lastMessage: Date | null;
  lastReaction: Date | null;
  lastVoice: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const XPSchema = new Schema<IXP>(
  {
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    totalXp: { type: Number, default: 0 },
    weeklyXp: { type: Number, default: 0 },
    prestige: { type: Number, default: 0 },
    lastMessage: { type: Date, default: null },
    lastReaction: { type: Date, default: null },
    lastVoice: { type: Date, default: null },
  },
  { timestamps: true },
);

XPSchema.index({ guildId: 1, userId: 1 }, { unique: true });
XPSchema.index({ guildId: 1, xp: -1 });
XPSchema.index({ guildId: 1, weeklyXp: -1 });

export const XPModel = mongoose.model<IXP>('XP', XPSchema);

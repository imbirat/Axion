import mongoose, { Schema, Document } from 'mongoose';

export interface IWarning extends Document {
  caseId: number;
  guildId: string;
  userId: string;
  moderatorId: string;
  type: 'warn' | 'mute' | 'kick' | 'ban' | 'timeout';
  reason: string;
  duration: number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WarningSchema = new Schema<IWarning>(
  {
    caseId: { type: Number, required: true },
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    moderatorId: { type: String, required: true },
    type: {
      type: String,
      enum: ['warn', 'mute', 'kick', 'ban', 'timeout'],
      required: true,
    },
    reason: { type: String, default: 'No reason provided' },
    duration: { type: Number, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

WarningSchema.index({ guildId: 1, caseId: 1 }, { unique: true });
WarningSchema.index({ guildId: 1, userId: 1 });
WarningSchema.index({ guildId: 1, active: 1 });

export const WarningModel = mongoose.model<IWarning>('Warning', WarningSchema);

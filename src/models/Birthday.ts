import mongoose, { Schema, Document } from 'mongoose';

export interface IBirthday extends Document {
  userId: string;
  guildId: string;
  day: number;
  month: number;
  year: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const BirthdaySchema = new Schema<IBirthday>(
  {
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    day: { type: Number, required: true, min: 1, max: 31 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, default: null, min: 1900 },
  },
  { timestamps: true },
);

BirthdaySchema.index({ guildId: 1, userId: 1 }, { unique: true });
BirthdaySchema.index({ guildId: 1, month: 1, day: 1 });

export const BirthdayModel = mongoose.model<IBirthday>('Birthday', BirthdaySchema);

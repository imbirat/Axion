import mongoose, { Schema, Document } from 'mongoose';

export interface IPoll extends Document {
  messageId: string;
  channelId: string;
  guildId: string;
  question: string;
  options: string[];
  votes: Map<string, string>;
  voteCounts: Map<string, number>;
  multiChoice: boolean;
  requiredRole: string | null;
  endTime: Date | null;
  ended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PollSchema = new Schema<IPoll>(
  {
    messageId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    guildId: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true, validate: [(v: string[]) => v.length >= 2 && v.length <= 10, 'Options must be 2-10'] },
    votes: { type: Map, of: String, default: new Map() },
    voteCounts: { type: Map, of: Number, default: new Map() },
    multiChoice: { type: Boolean, default: false },
    requiredRole: { type: String, default: null },
    endTime: { type: Date, default: null },
    ended: { type: Boolean, default: false },
  },
  { timestamps: true },
);

PollSchema.index({ guildId: 1, ended: 1 });
PollSchema.index({ endTime: 1, ended: 1 });

export const PollModel = mongoose.model<IPoll>('Poll', PollSchema);

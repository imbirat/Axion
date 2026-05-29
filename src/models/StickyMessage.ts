import mongoose, { Schema, Document } from 'mongoose';

export interface IStickyMessage extends Document {
  channelId: string;
  guildId: string;
  content: string;
  isEmbed: boolean;
  embedTitle: string;
  embedColor: string;
  lastMessageId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const StickyMessageSchema = new Schema<IStickyMessage>(
  {
    channelId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    content: { type: String, required: true },
    isEmbed: { type: Boolean, default: false },
    embedTitle: { type: String, default: '' },
    embedColor: { type: String, default: '#5865F2' },
    lastMessageId: { type: String, default: null },
  },
  { timestamps: true },
);

StickyMessageSchema.index({ channelId: 1 });
StickyMessageSchema.index({ guildId: 1 });

export const StickyMessageModel = mongoose.model<IStickyMessage>('StickyMessage', StickyMessageSchema);

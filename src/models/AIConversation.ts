import mongoose, { Schema, Document } from 'mongoose';

interface IConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IAIConversation extends Document {
  userId: string;
  guildId: string;
  messages: IConversationMessage[];
  context: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationMessageSchema = new Schema<IConversationMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const AIConversationSchema = new Schema<IAIConversation>(
  {
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    messages: { type: [ConversationMessageSchema], default: [] },
    context: { type: String, default: null },
  },
  { timestamps: true },
);

AIConversationSchema.index({ userId: 1, guildId: 1 }, { unique: true });

export const AIConversationModel = mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketMessage {
  authorId: string;
  authorTag: string;
  content: string;
  timestamp: Date;
  attachments: string[];
}

export interface ITicket extends Document {
  ticketId: string;
  guildId: string;
  channelId: string;
  userId: string;
  category: string;
  status: 'open' | 'claimed' | 'closed';
  claimedBy: string | null;
  messages: ITicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketMessageSchema = new Schema<ITicketMessage>(
  {
    authorId: { type: String, required: true },
    authorTag: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    attachments: { type: [String], default: [] },
  },
  { _id: false },
);

const TicketSchema = new Schema<ITicket>(
  {
    ticketId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    userId: { type: String, required: true },
    category: { type: String, default: 'general' },
    status: {
      type: String,
      enum: ['open', 'claimed', 'closed'],
      default: 'open',
    },
    claimedBy: { type: String, default: null },
    messages: { type: [TicketMessageSchema], default: [] },
  },
  { timestamps: true },
);

TicketSchema.index({ guildId: 1, ticketId: 1 });
TicketSchema.index({ guildId: 1, userId: 1, status: 1 });

export const TicketModel = mongoose.model<ITicket>('Ticket', TicketSchema);

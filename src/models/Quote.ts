import mongoose, { Schema, Document } from 'mongoose';

export interface IQuote extends Document {
  quoteId: string;
  guildId: string;
  content: string;
  authorId: string;
  authorTag: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    quoteId: { type: String, required: true },
    guildId: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: String, required: true },
    authorTag: { type: String, required: true },
  },
  { timestamps: true },
);

QuoteSchema.index({ guildId: 1, quoteId: 1 }, { unique: true });
QuoteSchema.index({ guildId: 1 });

export const QuoteModel = mongoose.model<IQuote>('Quote', QuoteSchema);

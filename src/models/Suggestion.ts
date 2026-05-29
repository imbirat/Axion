import mongoose, { Schema, Document } from 'mongoose';

export interface ISuggestion extends Document {
  suggestionId: string;
  guildId: string;
  userId: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  upvotes: string[];
  downvotes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SuggestionSchema = new Schema<ISuggestion>(
  {
    suggestionId: { type: String, required: true },
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'implemented'],
      default: 'pending',
    },
    upvotes: { type: [String], default: [] },
    downvotes: { type: [String], default: [] },
  },
  { timestamps: true },
);

SuggestionSchema.index({ guildId: 1, suggestionId: 1 }, { unique: true });

export const SuggestionModel = mongoose.model<ISuggestion>('Suggestion', SuggestionSchema);

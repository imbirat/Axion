import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  guildId: string;
  name: string;
  content: string;
  authorId: string;
  uses: number;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: String, required: true },
    uses: { type: Number, default: 0 },
  },
  { timestamps: true },
);

TagSchema.index({ guildId: 1, name: 1 }, { unique: true });

export const TagModel = mongoose.model<ITag>('Tag', TagSchema);

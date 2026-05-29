import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  inventory: { itemId: string; amount: number }[];
  blacklisted: boolean;
  blacklistReason: string | null;
  totalCommands: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    inventory: {
      type: [{ itemId: String, amount: Number }],
      default: [],
    },
    blacklisted: { type: Boolean, default: false },
    blacklistReason: { type: String, default: null },
    totalCommands: { type: Number, default: 0 },
  },
  { timestamps: true },
);

UserSchema.index({ userId: 1 });

export const UserModel = mongoose.model<IUser>('User', UserSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IQueuedTrack {
  title: string;
  uri: string;
  identifier: string;
  length: number;
  author: string;
  requester: string;
  thumbnail: string | null;
}

export interface IMusicQueue extends Document {
  guildId: string;
  voiceChannelId: string;
  textChannelId: string;
  volume: number;
  loop: 'none' | 'track' | 'queue';
  shuffle: boolean;
  autoplay: boolean;
  tracks: IQueuedTrack[];
  currentTrack: IQueuedTrack | null;
  position: number;
  paused: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QueuedTrackSchema = new Schema<IQueuedTrack>(
  {
    title: { type: String, required: true },
    uri: { type: String, required: true },
    identifier: { type: String, required: true },
    length: { type: Number, required: true },
    author: { type: String, required: true },
    requester: { type: String, required: true },
    thumbnail: { type: String, default: null },
  },
  { _id: false },
);

const MusicQueueSchema = new Schema<IMusicQueue>(
  {
    guildId: { type: String, required: true, unique: true },
    voiceChannelId: { type: String, required: true },
    textChannelId: { type: String, required: true },
    volume: { type: Number, default: 80 },
    loop: { type: String, enum: ['none', 'track', 'queue'], default: 'none' },
    shuffle: { type: Boolean, default: false },
    autoplay: { type: Boolean, default: false },
    tracks: { type: [QueuedTrackSchema], default: [] },
    currentTrack: { type: QueuedTrackSchema, default: null },
    position: { type: Number, default: 0 },
    paused: { type: Boolean, default: false },
  },
  { timestamps: true },
);

MusicQueueSchema.index({ guildId: 1 });

export const MusicQueueModel = mongoose.model<IMusicQueue>('MusicQueue', MusicQueueSchema);

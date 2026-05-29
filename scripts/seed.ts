import 'dotenv/config';
import mongoose from 'mongoose';

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  // Seed default data
  // Example: Create indexes
  await db.collection('guilds').createIndex({ guildId: 1 }, { unique: true });
  await db.collection('xps').createIndex({ guildId: 1, userId: 1 }, { unique: true });
  await db.collection('economies').createIndex({ guildId: 1, userId: 1 }, { unique: true });

  console.log('Seed complete');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

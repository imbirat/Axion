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

  // Add any migration steps here
  // Example: await db.collection('guilds').updateMany({}, { $set: { prefix: ['.'] } });

  console.log('Migration complete');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

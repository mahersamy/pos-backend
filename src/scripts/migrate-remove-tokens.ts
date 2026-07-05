import 'dotenv/config';
import mongoose from 'mongoose';

/**
 * Migration: Removes the `token` array from the users collection
 * since FCM tokens have been separated into their own FcmToken collection.
 *
 * Safe to run multiple times (idempotent).
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/migrate-remove-tokens.ts
 */

async function migrate() {
  const uri = process.env.DATABASE_URI;
  if (!uri) throw new Error('DATABASE_URI is not set in .env');

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection not established');
  const collection = db.collection('users');

  // Find all users that still have a `fcmTokens` array field
  const query = { fcmTokens: { $exists: true } };

  const usersCount = await collection.countDocuments(query);
  console.log(`Found ${usersCount} user(s) with the 'fcmTokens' field.`);

  if (usersCount === 0) {
    console.log('Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  try {
    // Unset the token field from all matching users
    const result = await collection.updateMany(
      query,
      { $unset: { fcmTokens: "" } } // "" or 1 can be used to remove the field
    );
    
    console.log(`\nMigration complete. Successfully removed 'fcmTokens' field from ${result.modifiedCount} user(s).`);
  } catch (err) {
    console.error('Migration failed during update:', err);
  }

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

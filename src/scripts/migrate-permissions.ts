import 'dotenv/config';
import mongoose from 'mongoose';

/**
 * One-shot migration: converts permissions from
 *   OLD: [{ resource: "staff", actions: ["read","write"] }]
 *   NEW: { staff: { read: true, write: true, delete: false } }
 *
 * Safe to run multiple times (idempotent).
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/migrate-permissions.ts
 */

async function migrate() {
  const uri = process.env.DATABASE_URI;
  if (!uri) throw new Error('DATABASE_URI is not set in .env');

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection not established');
  const collection = db.collection('users');


  // Find all users whose permissions field is an array (old format)
  const users = await collection
    .find({ permissions: { $type: 'array' } })
    .toArray();

  console.log(`Found ${users.length} user(s) with old array permissions.`);

  if (users.length === 0) {
    console.log('Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    const oldPerms: { resource: string; actions: string[] }[] =
      user.permissions ?? [];

    // Convert array -> map
    const newPerms: Record<string, Record<string, boolean>> = {};

    for (const item of oldPerms) {
      if (!item.resource) continue;
      newPerms[item.resource] = {
        read:   (item.actions ?? []).includes('read'),
        write:  (item.actions ?? []).includes('write'),
        delete: (item.actions ?? []).includes('delete'),
      };
    }

    try {
      await collection.updateOne(
        { _id: user._id },
        { $set: { permissions: newPerms } },
      );
      migrated++;
      console.log(`  OK: ${user.email ?? String(user._id)} -> migrated`);
    } catch (err) {
      skipped++;
      console.error(`  FAIL: ${user.email ?? String(user._id)} ->`, err);
    }
  }

  console.log(`\nMigration complete. Migrated: ${migrated}, Failed: ${skipped}`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

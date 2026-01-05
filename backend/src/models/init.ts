import fs from 'fs';
import path from 'path';
import { pool } from './database';

/**
 * Initialize database with schema
 * Run this to create all tables and setup the database
 */
export const initializeDatabase = async () => {
  try {
    console.log('📦 Initializing database...');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Database initialized successfully');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - user_profiles');
    console.log('   - schools');
    console.log('   - applications');
    console.log('   - application_events');
    console.log('   - community_data');
    console.log('   - decision_timeline');
    console.log('   - discussion_posts');
    console.log('   - discussion_replies');
    console.log('   - notification_preferences');

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

/**
 * Drop all tables (use with caution!)
 */
export const dropAllTables = async () => {
  try {
    console.log('⚠️  Dropping all tables...');

    const dropSQL = `
      DROP TABLE IF EXISTS discussion_replies CASCADE;
      DROP TABLE IF EXISTS discussion_posts CASCADE;
      DROP TABLE IF EXISTS decision_timeline CASCADE;
      DROP TABLE IF EXISTS community_data CASCADE;
      DROP TABLE IF EXISTS application_events CASCADE;
      DROP TABLE IF EXISTS applications CASCADE;
      DROP TABLE IF EXISTS notification_preferences CASCADE;
      DROP TABLE IF EXISTS user_profiles CASCADE;
      DROP TABLE IF EXISTS schools CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TYPE IF EXISTS application_status CASCADE;
    `;

    await pool.query(dropSQL);
    console.log('✅ All tables dropped');

    return true;
  } catch (error) {
    console.error('❌ Failed to drop tables:', error);
    throw error;
  }
};

/**
 * Reset database (drop and recreate)
 */
export const resetDatabase = async () => {
  await dropAllTables();
  await initializeDatabase();
};

// Allow running as script
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'init':
      initializeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    case 'drop':
      dropAllTables()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    case 'reset':
      resetDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    default:
      console.log('Usage: ts-node init.ts [init|drop|reset]');
      process.exit(1);
  }
}

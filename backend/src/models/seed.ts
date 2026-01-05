import fs from 'fs';
import path from 'path';
import { pool } from './database';
import { SchoolModel } from './School';

/**
 * Seed the database with initial data
 */

export const seedSchools = async () => {
  try {
    console.log('🌱 Seeding schools data...');

    // Read seed file
    const seedPath = path.join(__dirname, 'seed-schools.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf-8');

    // Execute seed SQL
    await pool.query(seedSQL);

    // Verify
    const schools = await SchoolModel.findAll();
    console.log(`✅ Seeded ${schools.length} schools successfully`);

    // Show summary
    const byCity = await SchoolModel.getCountByCity();
    console.log('\n📍 Schools by city:');
    byCity.forEach(({ city, count }) => {
      console.log(`   ${city}: ${count}`);
    });

    const byType = await SchoolModel.getCountByType();
    console.log('\n🏫 Schools by type:');
    byType.forEach(({ school_type, count }) => {
      console.log(`   ${school_type}: ${count}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to seed schools:', error);
    throw error;
  }
};

/**
 * Clear all schools
 */
export const clearSchools = async () => {
  try {
    console.log('🗑️  Clearing schools data...');
    await pool.query('DELETE FROM schools');
    console.log('✅ Schools cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear schools:', error);
    throw error;
  }
};

/**
 * Reseed schools (clear and seed)
 */
export const reseedSchools = async () => {
  await clearSchools();
  await seedSchools();
};

// Allow running as script
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'seed':
      seedSchools()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    case 'clear':
      clearSchools()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    case 'reseed':
      reseedSchools()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    default:
      console.log('Usage: ts-node seed.ts [seed|clear|reseed]');
      process.exit(1);
  }
}

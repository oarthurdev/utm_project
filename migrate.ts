
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db } from './server/db';

async function runMigration() {
  console.log('🔄 Running database migration...');
  
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

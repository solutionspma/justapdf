import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from '../backend/database/connection.js';

dotenv.config({ path: process.env.ENV_FILE || '.env' });
dotenv.config({ path: 'config/.env', override: false });

if (!(process.env.DATABASE_URL || process.env.YAHBASE_DATABASE_URL)) {
  console.error('DATABASE_URL or YAHBASE_DATABASE_URL is required for migrations.');
  process.exitCode = 1;
} else {
  try {
    await initializeDatabase();
    console.log('Database schema applied successfully.');
  } catch (error) {
    console.error(`Database migration failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}


import dotenv from 'dotenv';
import { checkDatabaseHealth, closeDatabase } from '../backend/database/connection.js';

dotenv.config({ path: process.env.ENV_FILE || '.env' });
dotenv.config({ path: 'config/.env', override: false });

const health = await checkDatabaseHealth();
console.log(JSON.stringify(health, null, 2));
await closeDatabase();
if (!health.healthy) process.exitCode = 1;


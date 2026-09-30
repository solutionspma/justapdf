import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV_FILE || '.env' });
dotenv.config({ path: 'config/.env', override: false });

const REQUIRED_PRODUCTION_VARS = ['DATABASE_URL', 'JWT_SECRET', 'SUPRA_ADMIN_EMAIL', 'ROOT_PASSWORD'];

export function validateEnvironment({ strict = process.env.NODE_ENV === 'production' } = {}) {
  const databaseUrl = process.env.DATABASE_URL || process.env.YAHBASE_DATABASE_URL;
  const missing = REQUIRED_PRODUCTION_VARS.filter((name) => {
    if (name === 'DATABASE_URL') return !databaseUrl;
    return !process.env[name];
  });

  if (strict && missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }

  if (!databaseUrl) {
    console.warn('⚠️  DATABASE_URL is not configured; database-backed routes will be unavailable.');
  }
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET is not configured; authentication routes will reject token issuance.');
  }

  return { databaseUrl, missing };
}

export function getJwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return process.env.JWT_SECRET;
}

/**
 * JustaPDF PostgreSQL and owner-controlled storage authority.
 *
 * All server-side data access goes through this module. Identifiers are
 * validated before interpolation and all values are sent as query parameters.
 */

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: process.env.ENV_FILE || '.env' });
dotenv.config({ path: 'config/.env', override: false });

const DATABASE_URL = process.env.DATABASE_URL || process.env.YAHBASE_DATABASE_URL;
const STORAGE_ROOT = path.resolve(process.env.STORAGE_ROOT || path.join(process.cwd(), 'var', 'storage'));

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30_000),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 5_000),
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' } : undefined
});

const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;
const TABLES = new Set([
  'registry', 'users', 'user_profiles', 'organizations', 'credit_ledger', 'events', 'sessions',
  'campaigns', 'ads', 'seo_keywords', 'content_nodes', 'documents', 'document_revisions',
  'operation_jobs', 'billing_transactions', 'subscriptions', 'audit_logs', 'shares', 'folders'
]);

function assertIdentifier(value, label) {
  if (!IDENTIFIER.test(value)) throw new Error(`Invalid ${label}: ${value}`);
  return value;
}

function assertTable(table) {
  if (!TABLES.has(table)) throw new Error(`Unsupported database table: ${table}`);
  return table;
}

function assertColumns(columns) {
  for (const column of columns) assertIdentifier(column, 'column');
}

function normalizeValue(value) {
  return value === undefined ? null : value;
}

function whereClause(conditions = {}, startIndex = 1) {
  const entries = Object.entries(conditions);
  assertColumns(entries.map(([key]) => key));
  return {
    text: entries.length
      ? ` WHERE ${entries.map(([key], index) => `"${key}" IS NOT DISTINCT FROM $${startIndex + index}`).join(' AND ')}`
      : '',
    values: entries.map(([, value]) => normalizeValue(value))
  };
}

function selectClause(select = '*') {
  if (select === '*') return '*';
  const columns = String(select).split(',').map((column) => column.trim()).filter(Boolean);
  assertColumns(columns);
  return columns.map((column) => `"${column}"`).join(', ');
}

export async function query(text, values = [], client = pool) {
  return client.query(text, values);
}

export async function checkDatabaseHealth() {
  const startedAt = Date.now();
  if (!DATABASE_URL) {
    return { healthy: false, latency: Date.now() - startedAt, provider: 'postgresql', error: 'DATABASE_URL is not configured', timestamp: new Date().toISOString() };
  }
  try {
    await query('SELECT 1');
    return { healthy: true, latency: Date.now() - startedAt, provider: 'postgresql', timestamp: new Date().toISOString() };
  } catch (error) {
    return { healthy: false, latency: Date.now() - startedAt, provider: 'postgresql', error: error.message || error.code || error.name || 'database connection failed', timestamp: new Date().toISOString() };
  }
}

export async function initializeDatabase() {
  const schemaUrl = new URL('./schema.sql', import.meta.url);
  const schema = await fs.readFile(schemaUrl, 'utf8');
  await query(schema);
  return true;
}

export const db = {
  async findOne(table, conditions = {}, select = '*') {
    const safeTable = assertTable(table);
    const where = whereClause(conditions);
    const result = await query(`SELECT ${selectClause(select)} FROM "${safeTable}"${where.text} LIMIT 1`, where.values);
    return result.rows[0] || null;
  },

  async findMany(table, conditions = {}, options = {}) {
    const safeTable = assertTable(table);
    const { select = '*', orderBy, limit = 100, offset = 0 } = options;
    const where = whereClause(conditions);
    let order = '';
    if (orderBy) {
      const [column, direction = 'asc'] = String(orderBy).split(':');
      assertIdentifier(column, 'order column');
      order = ` ORDER BY "${column}" ${direction.toLowerCase() === 'desc' ? 'DESC' : 'ASC'}`;
    }
    const values = [...where.values, Math.max(0, Number(limit) || 100), Math.max(0, Number(offset) || 0)];
    const result = await query(
      `SELECT ${selectClause(select)} FROM "${safeTable}"${where.text}${order} LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return result.rows;
  },

  async create(table, data, client = pool) {
    const safeTable = assertTable(table);
    const entries = Object.entries(data);
    assertColumns(entries.map(([key]) => key));
    if (!entries.length) throw new Error('Cannot insert an empty record');
    const columns = entries.map(([key]) => `"${key}"`).join(', ');
    const values = entries.map(([, value]) => normalizeValue(value));
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const result = await query(`INSERT INTO "${safeTable}" (${columns}) VALUES (${placeholders}) RETURNING *`, values, client);
    return result.rows[0];
  },

  async update(table, conditions, data, client = pool) {
    const safeTable = assertTable(table);
    const updates = Object.entries(data);
    assertColumns(updates.map(([key]) => key));
    if (!updates.length) throw new Error('Cannot update an empty record');
    const where = whereClause(conditions, updates.length + 1);
    const values = [...updates.map(([, value]) => normalizeValue(value)), ...where.values];
    const setClause = updates.map(([key], index) => `"${key}" = $${index + 1}`).join(', ');
    const result = await query(`UPDATE "${safeTable}" SET ${setClause}${where.text} RETURNING *`, values, client);
    return result.rows[0] || null;
  },

  async delete(table, conditions, client = pool) {
    const safeTable = assertTable(table);
    const where = whereClause(conditions);
    const result = await query(`DELETE FROM "${safeTable}"${where.text}`, where.values, client);
    return result.rowCount > 0;
  },

  async count(table, conditions = {}) {
    const safeTable = assertTable(table);
    const where = whereClause(conditions);
    const result = await query(`SELECT COUNT(*)::int AS count FROM "${safeTable}"${where.text}`, where.values);
    return result.rows[0]?.count || 0;
  }
};

function safeStoragePath(bucket, relativePath) {
  assertIdentifier(bucket.replace(/-/g, '_'), 'storage bucket');
  if (typeof relativePath !== 'string' || !relativePath || path.isAbsolute(relativePath)) {
    throw new Error('Invalid storage path');
  }
  const bucketRoot = path.resolve(STORAGE_ROOT, bucket);
  const candidate = path.resolve(bucketRoot, relativePath);
  if (candidate !== bucketRoot && !candidate.startsWith(`${bucketRoot}${path.sep}`)) {
    throw new Error('Storage path escapes storage root');
  }
  return { bucketRoot, candidate };
}

export const storage = {
  root: STORAGE_ROOT,

  async upload(bucket, relativePath, file, { contentType, upsert = false } = {}) {
    const { candidate } = safeStoragePath(bucket, relativePath);
    if (!upsert) {
      try { await fs.access(candidate); throw new Error('Storage object already exists'); } catch (error) {
        if (error.message === 'Storage object already exists') throw error;
      }
    }
    await fs.mkdir(path.dirname(candidate), { recursive: true, mode: 0o750 });
    await fs.writeFile(candidate, file, { mode: 0o640 });
    return { bucket, path: relativePath, size: Buffer.byteLength(file), contentType: contentType || 'application/octet-stream' };
  },

  async download(bucket, relativePath) {
    const { candidate } = safeStoragePath(bucket, relativePath);
    return fs.readFile(candidate);
  },

  getPublicUrl() { return null; },

  async createSignedUrl(bucket, relativePath, expiresIn = 3600) {
    safeStoragePath(bucket, relativePath);
    return `/api/storage/${encodeURIComponent(bucket)}/${encodeURIComponent(relativePath)}?expires=${Date.now() + expiresIn * 1000}`;
  },

  async delete(bucket, paths) {
    const list = Array.isArray(paths) ? paths : [paths];
    await Promise.all(list.map(async (relativePath) => {
      const { candidate } = safeStoragePath(bucket, relativePath);
      await fs.rm(candidate, { force: true });
    }));
    return true;
  },

  async list(bucket, folder = '', { limit = 100, offset = 0 } = {}) {
    const directory = folder ? safeStoragePath(bucket, folder).candidate : path.resolve(STORAGE_ROOT, bucket);
    let names = [];
    try { names = await fs.readdir(directory); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    return names.slice(offset, offset + limit).map((name) => ({ name }));
  }
};

export async function transaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (typeof work === 'function') {
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    }
    const results = [];
    for (const operation of work) results.push(await operation.execute(client));
    await client.query('COMMIT');
    return { success: true, results };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export function newStorageKey(userId, filename = 'document.pdf') {
  const extension = path.extname(filename).toLowerCase() === '.pdf' ? '.pdf' : '.bin';
  return `uploads/users/${userId}/${crypto.randomUUID()}${extension}`;
}

export const STORAGE_BUCKETS = Object.freeze({ DOCUMENTS: 'documents', EXPORTS: 'exports', THUMBNAILS: 'thumbnails', MEDIA: 'media' });

export async function closeDatabase() {
  await pool.end();
}

export default { pool, query, db, storage, transaction, initializeDatabase, checkDatabaseHealth, closeDatabase, newStorageKey, STORAGE_BUCKETS };

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - GLOBAL REGISTRY SERVICE
 * Tracks tools, actions, UI, CMS blocks, ads, SEO entities, and more.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { db, query } from '../database/connection.js';

const VALID_TYPES = [
  'tool',
  'ui',
  'action',
  'cms',
  'ad',
  'seo',
  'marketing',
  'page',
  'pricing',
  'feature',
  'event'
];

function normalizeKey(key) {
  return key?.trim().toLowerCase();
}

export function validateRegistryPayload(payload) {
  const normalized = {
    ...payload,
    type: payload?.type?.toLowerCase(),
    key: normalizeKey(payload?.key),
    active: payload?.active !== false
  };

  if (!normalized.type || !VALID_TYPES.includes(normalized.type)) {
    return { error: `Invalid type. Expected one of: ${VALID_TYPES.join(', ')}` };
  }

  if (!normalized.key) {
    return { error: 'Registry key is required' };
  }

  if (!normalized.name) {
    return { error: 'Registry name is required' };
  }

  return { value: normalized };
}

export async function registerEntity(payload) {
  const { error, value } = validateRegistryPayload(payload);
  if (error) {
    throw new Error(error);
  }

  const existing = await db.findOne('registry', { key: value.key });
  if (existing) {
    return db.update('registry', { id: existing.id }, {
      ...value,
      version: value.version || existing.version || '1.0.0',
      metadata: value.metadata || existing.metadata || {}
    });
  }

  return db.create('registry', {
    id: crypto.randomUUID(),
    ...value,
    version: value.version || '1.0.0',
    metadata: value.metadata || {},
    created_at: new Date().toISOString()
  });
}

export async function getRegistryEntry(key) {
  return db.findOne('registry', { key: normalizeKey(key) });
}

export async function listRegistryEntries({ type, active, search, limit = 100, offset = 0 } = {}) {
  const conditions = {};
  if (type) conditions.type = type;
  if (typeof active === 'boolean') conditions.active = active;
  const values = [];
  const clauses = [];
  if (type) { values.push(type); clauses.push(`type = $${values.length}`); }
  if (typeof active === 'boolean') { values.push(active); clauses.push(`active = $${values.length}`); }
  if (search) { values.push(`%${search}%`); clauses.push(`(name ILIKE $${values.length} OR key ILIKE $${values.length})`); }
  values.push(Math.max(0, Number(limit) || 100), Math.max(0, Number(offset) || 0));
  const result = await query(
    `SELECT * FROM registry${clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );
  return result.rows;
}

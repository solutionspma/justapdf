/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - CRM EVENT LOGGER
 * Writes user/system events into the CRM events table.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { db } from '../database/connection.js';

export async function logEvent({ userId, type, source = 'system', metadata = {} }) {
  try {
    return await db.create('events', {
      id: crypto.randomUUID(),
      user_id: userId || null,
      type,
      source,
      metadata,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    return null;
  }
}


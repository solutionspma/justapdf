/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - SUPRA ADMIN BOOTSTRAP
 * Ensures the immutable supra admin account exists on deploy
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../database/connection.js';
import { SUPRA_ADMIN_EMAIL, SUPRA_ADMIN_ROLE } from '../config/security.js';
import { getAllPermissions } from '../config/permissions.js';

export async function ensureSupraAdmin() {
  try {
    if (!process.env.ROOT_PASSWORD) {
      console.warn('⚠️  Supra admin bootstrap skipped: ROOT_PASSWORD is not configured.');
      return { created: false, error: 'ROOT_PASSWORD is not configured' };
    }
    const existing = await db.findOne('users', { email: SUPRA_ADMIN_EMAIL });
    if (existing) {
      return { created: false, user: existing };
    }

    const user = {
      id: crypto.randomUUID(),
      email: SUPRA_ADMIN_EMAIL,
      password_hash: process.env.ROOT_PASSWORD ? await bcrypt.hash(process.env.ROOT_PASSWORD, 12) : null,
      role: SUPRA_ADMIN_ROLE,
      permissions: getAllPermissions(),
      status: 'active',
      created_at: new Date().toISOString()
    };

    const created = await db.create('users', user);

    try {
      await db.create('user_profiles', {
        id: crypto.randomUUID(),
        user_id: created.id,
        phone: null,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      // Profile table might not exist yet.
    }

    return { created: true, user: created };
  } catch (error) {
    console.warn('⚠️  Supra admin bootstrap skipped:', error.message);
    return { created: false, error: error.message };
  }
}

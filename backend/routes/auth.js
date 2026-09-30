import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { db, query, transaction } from '../database/connection.js';
import { getJwtSecret } from '../config/env.js';
import { SUPRA_ADMIN_EMAIL, SUPRA_ADMIN_ROLE, isSupraAdminEmail } from '../config/security.js';
import { getAllPermissions, getDefaultPermissions, getPlanSeats } from '../config/permissions.js';

const router = express.Router();
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function publicUser(user, organization = null) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name || null,
    lastName: user.last_name || null,
    role: user.role,
    plan: organization?.billing_plan || null,
    orgId: user.organization_id || organization?.id || null,
    isSupraAdmin: isSupraAdminEmail(user.email),
    isGenesis: isSupraAdminEmail(user.email)
  };
}

function signUser(user, organization) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: organization?.id || user.organization_id || null,
      plan: organization?.billing_plan || null
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRY }
  );
}

router.post('/register', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const { firstName = '', lastName = '', company, plan = 'starter' } = req.body;
    if (!email || !email.includes('@') || password.length < 8) {
      return res.status(400).json({ success: false, error: 'A valid email and password of at least 8 characters are required.' });
    }

    const user = await transaction(async (client) => {
      const existing = await client.query('SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1', [email]);
      if (existing.rows[0]) {
        const error = new Error('An account with that email already exists');
        error.code = 'EMAIL_EXISTS';
        throw error;
      }
      const organization = await db.create('organizations', {
        id: crypto.randomUUID(),
        name: company || `${firstName || email.split('@')[0]}'s Organization`,
        billing_plan: plan,
        seats: getPlanSeats(plan),
        status: 'active',
        created_at: new Date().toISOString()
      }, client);
      const created = await db.create('users', {
        id: crypto.randomUUID(),
        organization_id: organization.id,
        email,
        password_hash: await bcrypt.hash(password, 12),
        first_name: firstName || null,
        last_name: lastName || null,
        role: isSupraAdminEmail(email) ? SUPRA_ADMIN_ROLE : 'user',
        permissions: isSupraAdminEmail(email) ? getAllPermissions() : getDefaultPermissions(plan),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, client);
      await db.create('user_profiles', {
        id: crypto.randomUUID(),
        user_id: created.id,
        first_name: firstName || null,
        last_name: lastName || null,
        company: company || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, client);
      return { user: created, organization };
    });

    const token = signUser(user.user, user.organization);
    return res.status(201).json({ success: true, message: 'Account created successfully', user: publicUser(user.user, user.organization), token });
  } catch (error) {
    if (error.code === 'EMAIL_EXISTS') return res.status(409).json({ success: false, error: error.message });
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const result = await query(
      `SELECT u.*, o.id AS organization_id_joined, o.name AS organization_name, o.billing_plan
       FROM users u LEFT JOIN organizations o ON o.id = u.organization_id
       WHERE lower(u.email) = lower($1) AND u.status = 'active' LIMIT 1`,
      [email]
    );
    const user = result.rows[0];
    if (!user?.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    await query('UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1', [user.id]);
    const organization = user.organization_id_joined ? { id: user.organization_id_joined, name: user.organization_name, billing_plan: user.billing_plan } : null;
    const token = signUser(user, organization);
    return res.json({ success: true, user: publicUser(user, organization), token, redirectTo: '/editor' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
});

router.post('/genesis/setup', async (req, res) => {
  try {
    const password = String(req.body.password || '');
    if (password.length < 12) return res.status(400).json({ success: false, error: 'A password of at least 12 characters is required.' });
    const result = await transaction(async (client) => {
      const existing = await client.query('SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1', [SUPRA_ADMIN_EMAIL]);
      if (existing.rows[0]) {
        const error = new Error('Supra admin already exists');
        error.code = 'ALREADY_EXISTS';
        throw error;
      }
      const organization = await db.create('organizations', {
        id: crypto.randomUUID(), name: 'JustaPDF', billing_plan: 'enterprise', seats: -1, status: 'active', created_at: new Date().toISOString()
      }, client);
      const user = await db.create('users', {
        id: crypto.randomUUID(), organization_id: organization.id, email: SUPRA_ADMIN_EMAIL,
        password_hash: await bcrypt.hash(password, 12), role: SUPRA_ADMIN_ROLE, permissions: getAllPermissions(), status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, client);
      return { user, organization };
    });
    return res.status(201).json({ success: true, user: publicUser(result.user, result.organization), token: signUser(result.user, result.organization) });
  } catch (error) {
    if (error.code === 'ALREADY_EXISTS') return res.status(409).json({ success: false, error: error.message });
    console.error('Genesis setup error:', error);
    return res.status(500).json({ success: false, error: 'Genesis setup failed' });
  }
});

router.post('/forgot-password', (_req, res) => res.json({ success: true, message: 'If an account exists, a reset link has been sent' }));

router.get('/verify', (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ valid: false });
    const decoded = jwt.verify(header.slice(7), getJwtSecret());
    return res.json({ valid: true, user: { id: decoded.userId, email: decoded.email, role: decoded.role, orgId: decoded.orgId, plan: decoded.plan } });
  } catch {
    return res.status(401).json({ valid: false });
  }
});

export default router;

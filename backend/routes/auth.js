/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOD PDF - AUTHENTICATION ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../database/connection.js';

const router = express.Router();

const GENESIS_EMAIL = 'solutions@pitchmarketing.agency';
const JWT_EXPIRY = '7d';

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, company, plan } = req.body;
    
    // Check if Genesis account
    const isGenesis = email.toLowerCase() === GENESIS_EMAIL.toLowerCase();
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create user
    const user = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role: isGenesis ? 'root_master_admin' : 'admin',
      permissions: isGenesis ? getAllPermissions() : getDefaultPermissions(plan),
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    // Create organization
    const org = {
      id: crypto.randomUUID(),
      name: company || `${firstName}'s Organization`,
      billing_plan: plan || 'starter',
      seats: getPlanSeats(plan),
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    // In production, save to database
    // await db.users.insert(user);
    // await db.organizations.insert(org);
    
    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        orgId: org.id
      },
      process.env.JWT_SECRET || 'default-secret-change-in-production',
      { expiresIn: JWT_EXPIRY }
    );
    
    res.status(201).json({
      success: true,
      message: isGenesis ? 'Genesis account created' : 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isGenesis
      },
      organization: {
        id: org.id,
        name: org.name,
        plan: org.billing_plan
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if Genesis account
    const isGenesis = email.toLowerCase() === GENESIS_EMAIL.toLowerCase();
    
    // In production, fetch from database
    // const user = await db.users.findByEmail(email);
    
    // For demo, create mock user
    const user = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      password_hash: await bcrypt.hash(password, 12), // Demo only
      role: isGenesis ? 'root_master_admin' : 'admin',
      orgId: crypto.randomUUID()
    };
    
    // Verify password
    // const isValid = await bcrypt.compare(password, user.password_hash);
    // if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        orgId: user.orgId
      },
      process.env.JWT_SECRET || 'default-secret-change-in-production',
      { expiresIn: JWT_EXPIRY }
    );
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isGenesis
      },
      token,
      redirectTo: isGenesis ? '/admin/dashboard.html' : '/dashboard.html'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS FIRST-TIME SETUP
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/genesis/setup', async (req, res) => {
  try {
    const { password, stripePublicKey, stripeSecretKey } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Generate JWT secret
    const jwtSecret = crypto.randomBytes(64).toString('hex');
    
    // In production, write to .env file or secrets manager
    const envUpdates = {
      ROOT_PASSWORD: passwordHash,
      JWT_SECRET: jwtSecret,
      STRIPE_PUBLIC_KEY: stripePublicKey || '<USER_PROVIDED>',
      STRIPE_SECRET_KEY: stripeSecretKey || '<USER_PROVIDED>'
    };
    
    // Create Genesis user in database
    const genesisUser = {
      id: crypto.randomUUID(),
      email: GENESIS_EMAIL,
      password_hash: passwordHash,
      role: 'root_master_admin',
      permissions: getAllPermissions(),
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    // Create default organization
    const org = {
      id: crypto.randomUUID(),
      name: 'Pitch Modular',
      billing_plan: 'enterprise',
      seats: -1, // Unlimited
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    // Generate token
    const token = jwt.sign(
      { 
        userId: genesisUser.id, 
        email: genesisUser.email, 
        role: genesisUser.role,
        orgId: org.id
      },
      jwtSecret,
      { expiresIn: JWT_EXPIRY }
    );
    
    res.json({
      success: true,
      message: 'Genesis setup complete',
      user: {
        id: genesisUser.id,
        email: genesisUser.email,
        role: genesisUser.role
      },
      organization: org,
      token
    });
    
  } catch (error) {
    console.error('Genesis setup error:', error);
    res.status(500).json({ success: false, error: 'Genesis setup failed' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PASSWORD RESET
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    // In production, save token and send email
    
    res.json({
      success: true,
      message: 'If an account exists, a reset link has been sent'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: 'Password reset failed' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Verify token and update password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: 'Password reset failed' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// VERIFY TOKEN
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-in-production');
    
    res.json({
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        orgId: decoded.orgId
      }
    });
    
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getAllPermissions() {
  return {
    pdf: { read: true, edit: true, create: true, delete: true, passwordOverride: true },
    signatures: { create: true, verify: true, request: true, blockchain: true },
    design: { full: true },
    ai: { contracts: true, analysis: true, chat: true },
    web3: { smartContracts: true, deploy: true },
    crm: { full: true },
    admin: { users: true, orgs: true, billing: true, features: true, system: true },
    billing: { view: true, manage: true },
    dialer: { sms: true, voice: true },
    cms: { full: true },
    ads: { manage: true, view: true }
  };
}

function getDefaultPermissions(plan) {
  const base = {
    pdf: { read: true, edit: true, create: true, delete: true, passwordOverride: false },
    signatures: { create: true, verify: true, request: false, blockchain: false },
    design: { full: false },
    ai: { contracts: false, analysis: false, chat: false },
    web3: { smartContracts: false, deploy: false },
    crm: { full: false },
    admin: { users: false, orgs: false, billing: false, features: false, system: false },
    billing: { view: true, manage: false }
  };
  
  switch (plan) {
    case 'pro':
      base.signatures.request = true;
      base.ai.contracts = true;
      base.ai.chat = true;
      base.crm.full = true;
      break;
    case 'business':
      base.signatures = { create: true, verify: true, request: true, blockchain: true };
      base.ai = { contracts: true, analysis: true, chat: true };
      base.web3 = { smartContracts: true, deploy: true };
      base.pdf.passwordOverride = true;
      base.design.full = true;
      base.crm.full = true;
      break;
    case 'enterprise':
      return getAllPermissions();
  }
  
  return base;
}

function getPlanSeats(plan) {
  const seats = {
    starter: 2,
    pro: 5,
    business: -1, // Unlimited
    enterprise: -1 // Unlimited
  };
  return seats[plan] || 2;
}

export default router;

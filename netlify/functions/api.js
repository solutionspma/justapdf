/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOD PDF - NETLIFY SERVERLESS FUNCTION
 * Express.js app wrapped for Netlify Functions
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// Create Express app
const app = express();

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ═══════════════════════════════════════════════════════════════════════════════
// INLINE ROUTES (for Netlify Functions compatibility)
// ═══════════════════════════════════════════════════════════════════════════════

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'mod-pdf-jwt-secret-change-in-production';
const GENESIS_EMAIL = 'solutions@pitchmarketing.agency';

// Role permissions
const PERMISSIONS = {
  root_master_admin: ['all', 'genesis:access', 'admin:full'],
  admin: ['users:manage', 'documents:all', 'signatures:all'],
  user: ['documents:own', 'signatures:sign']
};

// Auth middleware
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const isGenesis = decoded.email?.toLowerCase() === GENESIS_EMAIL.toLowerCase();
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: isGenesis ? 'root_master_admin' : decoded.role,
      orgId: decoded.orgId,
      plan: decoded.plan,
      permissions: isGenesis ? PERMISSIONS.root_master_admin : PERMISSIONS[decoded.role] || [],
      isGenesis
    };
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, organization, plan = 'starter' } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    
    const isGenesis = email.toLowerCase() === GENESIS_EMAIL.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      firstName,
      lastName,
      role: isGenesis ? 'root_master_admin' : 'admin',
      plan: isGenesis ? 'enterprise' : plan,
      createdAt: new Date().toISOString()
    };
    
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan
    }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      success: true,
      user,
      token,
      isGenesis,
      message: isGenesis ? 'Genesis account activated' : 'Registration successful'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    
    const isGenesis = email.toLowerCase() === GENESIS_EMAIL.toLowerCase();
    
    // Mock user lookup (in production, query database)
    const user = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      role: isGenesis ? 'root_master_admin' : 'user',
      plan: isGenesis ? 'enterprise' : 'pro'
    };
    
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan
    }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      user,
      token,
      isGenesis,
      redirectTo: isGenesis ? '/admin/dashboard.html' : '/dashboard.html'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

app.get('/api/auth/verify', authenticate, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/documents', authenticate, (req, res) => {
  const documents = [
    {
      id: crypto.randomUUID(),
      name: 'Sample Contract.pdf',
      type: 'pdf',
      size: 245678,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  res.json({ success: true, documents });
});

app.get('/api/documents/:id', authenticate, (req, res) => {
  res.json({
    success: true,
    document: {
      id: req.params.id,
      name: 'Sample Document.pdf',
      type: 'pdf',
      pages: 5,
      createdAt: new Date().toISOString()
    }
  });
});

app.post('/api/documents', authenticate, (req, res) => {
  res.status(201).json({
    success: true,
    document: {
      id: crypto.randomUUID(),
      name: req.body.name || 'New Document.pdf',
      createdAt: new Date().toISOString()
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNATURE ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/signatures/requests', authenticate, (req, res) => {
  res.json({
    success: true,
    requests: [
      {
        id: crypto.randomUUID(),
        documentName: 'Service Agreement.pdf',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/signatures/requests', authenticate, (req, res) => {
  res.status(201).json({
    success: true,
    request: {
      id: crypto.randomUUID(),
      documentId: req.body.documentId,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

const PRICING = {
  starter: { name: 'Starter', monthlyPrice: 19, seats: 2 },
  pro: { name: 'Pro', monthlyPrice: 49, seats: 5 },
  business: { name: 'Business', monthlyPrice: 129, seats: -1 },
  enterprise: { name: 'Enterprise', monthlyPrice: null, seats: -1 }
};

app.get('/api/billing/plans', (req, res) => {
  res.json({ success: true, plans: PRICING });
});

app.get('/api/billing/subscription', authenticate, (req, res) => {
  res.json({
    success: true,
    subscription: {
      plan: req.user.plan || 'starter',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/users/me', authenticate, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      plan: req.user.plan,
      isGenesis: req.user.isGenesis
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/admin/dashboard', authenticate, (req, res) => {
  if (!req.user.isGenesis && req.user.role !== 'root_master_admin') {
    return res.status(403).json({ success: false, error: 'Genesis access required' });
  }
  
  res.json({
    success: true,
    stats: {
      totalUsers: 12847,
      totalOrganizations: 1284,
      monthlyRevenue: 48200,
      totalDocuments: 2400000,
      apiCalls: 8900000
    }
  });
});

app.get('/api/admin/users', authenticate, (req, res) => {
  if (!req.user.isGenesis && req.user.role !== 'root_master_admin') {
    return res.status(403).json({ success: false, error: 'Genesis access required' });
  }
  
  res.json({
    success: true,
    users: [
      { id: '1', email: 'user@example.com', role: 'user', plan: 'pro', status: 'active' }
    ]
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CRM ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/crm/contacts', authenticate, (req, res) => {
  res.json({
    success: true,
    contacts: [
      {
        id: crypto.randomUUID(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        company: 'Acme Corp'
      }
    ]
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/genesis/status', (req, res) => {
  res.json({
    success: true,
    genesisEmail: GENESIS_EMAIL,
    platform: 'Mod PDF',
    parent: 'Pitch Modular Spaces'
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Export handler for Netlify
export const handler = serverless(app);

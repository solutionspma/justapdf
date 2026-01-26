/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOD PDF - AUTHENTICATION MIDDLEWARE
 * JWT verification, role-based access, Genesis account detection
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import jwt from 'jsonwebtoken';
import { SUPRA_ADMIN_EMAIL, SUPRA_ADMIN_ROLE, isSupraAdminEmail } from '../config/security.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mod-pdf-jwt-secret-change-in-production';
// Role hierarchy
const ROLE_HIERARCHY = {
  supra_admin: 110,
  root_master_admin: 100,
  delegate: 90,
  enterprise_admin: 80,
  org_admin: 70,
  admin: 60,
  manager: 50,
  editor: 40,
  user: 30,
  viewer: 20,
  guest: 10
};

// Permission definitions
const PERMISSIONS = {
  supra_admin: [
    'all',
    'supra:access',
    'admin:full',
    'users:manage',
    'orgs:manage',
    'billing:manage',
    'features:toggle',
    'documents:all',
    'signatures:all',
    'design:all',
    'ai:all',
    'blockchain:all',
    'api:unlimited',
    'password:override',
    'audit:view',
    'logs:view',
    'impersonation:all'
  ],
  root_master_admin: [
    'all',
    'genesis:access',
    'admin:full',
    'users:manage',
    'orgs:manage',
    'billing:manage',
    'features:toggle',
    'documents:all',
    'signatures:all',
    'design:all',
    'ai:all',
    'blockchain:all',
    'api:unlimited',
    'password:override',
    'audit:view',
    'logs:view'
  ],
  delegate: [
    'admin:delegated',
    'users:manage',
    'orgs:view',
    'billing:view',
    'documents:all',
    'signatures:all',
    'design:all',
    'ai:all',
    'audit:view'
  ],
  enterprise_admin: [
    'org:admin',
    'users:manage',
    'billing:manage',
    'documents:all',
    'signatures:all',
    'design:all',
    'ai:all',
    'blockchain:all',
    'api:full'
  ],
  org_admin: [
    'org:admin',
    'users:manage',
    'billing:view',
    'documents:all',
    'signatures:all',
    'design:all',
    'ai:limited'
  ],
  admin: [
    'users:view',
    'documents:all',
    'signatures:all',
    'design:all',
    'ai:limited'
  ],
  manager: [
    'team:manage',
    'documents:team',
    'signatures:team',
    'design:limited'
  ],
  editor: [
    'documents:write',
    'signatures:create',
    'design:limited'
  ],
  user: [
    'documents:own',
    'signatures:sign',
    'design:view'
  ],
  viewer: [
    'documents:read',
    'signatures:view'
  ],
  guest: [
    'documents:limited',
    'signatures:sign-only'
  ]
};

/**
 * Main authentication middleware
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authorization header provided'
      });
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization format. Use: Bearer <token>'
      });
    }
    
    const token = parts[1];
    
    // Check if it's an API key (starts with mpdf_)
    if (token.startsWith('mpdf_')) {
      return handleApiKeyAuth(token, req, res, next);
    }
    
    // JWT authentication
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if Genesis account
    const isSupraAdmin = isSupraAdminEmail(decoded.email);
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: isSupraAdmin ? SUPRA_ADMIN_ROLE : decoded.role,
      orgId: decoded.orgId,
      plan: decoded.plan,
      permissions: isSupraAdmin ? PERMISSIONS.supra_admin : PERMISSIONS[decoded.role] || [],
      isSupraAdmin,
      isGenesis: isSupraAdmin
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Handle API key authentication
 */
async function handleApiKeyAuth(apiKey, req, res, next) {
  try {
    // In production, validate API key against database
    // For now, extract info from key format
    
    // Mock API key validation
    req.user = {
      userId: 'api-user',
      email: 'api@example.com',
      role: 'user',
      orgId: 'api-org',
      plan: 'business',
      permissions: PERMISSIONS.user,
      isApiKey: true
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid API key'
    });
  }
}

/**
 * Optional authentication - continues even without token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const isSupraAdmin = isSupraAdminEmail(decoded.email);
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: isSupraAdmin ? SUPRA_ADMIN_ROLE : decoded.role,
      orgId: decoded.orgId,
      plan: decoded.plan,
      permissions: isSupraAdmin ? PERMISSIONS.supra_admin : PERMISSIONS[decoded.role] || [],
      isSupraAdmin,
      isGenesis: isSupraAdmin
    };
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Require specific role(s)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Genesis always passes
    if (req.user.isSupraAdmin) {
      return next();
    }
    
    const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevels = roles.map(r => ROLE_HIERARCHY[r] || 0);
    const minRequired = Math.min(...requiredLevels);
    
    if (userRoleLevel >= minRequired) {
      return next();
    }
    
    res.status(403).json({
      success: false,
      error: 'Insufficient role permissions',
      required: roles,
      current: req.user.role
    });
  };
};

/**
 * Require specific permission(s)
 */
export const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Genesis always passes
    if (req.user.isSupraAdmin || req.user.permissions.includes('all')) {
      return next();
    }
    
    const hasPermission = permissions.some(p => 
      req.user.permissions.includes(p) ||
      req.user.permissions.includes(p.split(':')[0] + ':all')
    );
    
    if (hasPermission) {
      return next();
    }
    
    res.status(403).json({
      success: false,
      error: 'Insufficient permissions',
      required: permissions
    });
  };
};

/**
 * Require Genesis account
 */
export const requireSupraAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  if (!req.user.isSupraAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Supra admin account required',
      code: 'SUPRA_ADMIN_REQUIRED'
    });
  }
  
  next();
};

/**
 * Require minimum plan
 */
export const requirePlan = (...plans) => {
  const planLevels = {
    starter: 1,
    pro: 2,
    business: 3,
    enterprise: 4
  };
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Genesis bypasses plan restrictions
    if (req.user.isSupraAdmin) {
      return next();
    }
    
    const userPlanLevel = planLevels[req.user.plan] || 0;
    const requiredLevels = plans.map(p => planLevels[p] || 0);
    const minRequired = Math.min(...requiredLevels);
    
    if (userPlanLevel >= minRequired) {
      return next();
    }
    
    res.status(403).json({
      success: false,
      error: `This feature requires ${plans.join(' or ')} plan`,
      code: 'PLAN_REQUIRED',
      required: plans,
      current: req.user.plan,
      upgradeUrl: '/billing/upgrade'
    });
  };
};

/**
 * Check if user owns resource or has admin access
 */
export const requireOwnership = (getOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Genesis and admins bypass ownership
    if (req.user.isSupraAdmin || ROLE_HIERARCHY[req.user.role] >= ROLE_HIERARCHY.admin) {
      return next();
    }
    
    try {
      const ownerId = await getOwnerId(req);
      
      if (ownerId === req.user.userId || ownerId === req.user.orgId) {
        return next();
      }
      
      res.status(403).json({
        success: false,
        error: 'You do not have access to this resource'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to verify ownership'
      });
    }
  };
};

/**
 * Rate limiting by user/IP
 */
export const rateLimit = (options = {}) => {
  const {
    windowMs = 60000,
    max = 100,
    keyGenerator = (req) => req.user?.userId || req.ip
  } = options;
  
  const requests = new Map();
  
  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Clean old entries
    for (const [k, v] of requests) {
      if (v.resetAt < now) {
        requests.delete(k);
      }
    }
    
    let record = requests.get(key);
    
    if (!record || record.resetAt < now) {
      record = { count: 0, resetAt: now + windowMs };
      requests.set(key, record);
    }
    
    record.count++;
    
    // Genesis gets higher limits
    const effectiveMax = req.user?.isSupraAdmin ? max * 10 : max;
    
    if (record.count > effectiveMax) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil((record.resetAt - now) / 1000)
      });
    }
    
    res.setHeader('X-RateLimit-Limit', effectiveMax);
    res.setHeader('X-RateLimit-Remaining', effectiveMax - record.count);
    res.setHeader('X-RateLimit-Reset', record.resetAt);
    
    next();
  };
};

export default {
  authenticate,
  optionalAuth,
  requireRole,
  requirePermission,
  requireSupraAdmin,
  requireGenesis: requireSupraAdmin,
  requirePlan,
  requireOwnership,
  rateLimit,
  ROLE_HIERARCHY,
  PERMISSIONS
};

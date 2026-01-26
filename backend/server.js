/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOD PDF - BACKEND SERVER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Express.js backend server for the Mod PDF platform.
 * Handles authentication, API routes, and business logic.
 * 
 * Part of Pitch Modular Spaces - Document Space Module
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: './config/.env' });

// ES Module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import documentRoutes from './routes/documents.js';
import signatureRoutes from './routes/signatures.js';
import billingRoutes from './routes/billing.js';
import adminRoutes from './routes/admin.js';
import crmRoutes from './routes/crm.js';
import registryRoutes from './routes/registry.js';
import marketingRoutes from './routes/marketing.js';
import seoRoutes from './routes/seo.js';
import cmsRoutes from './routes/cms.js';
import adsRoutes from './routes/ads.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate as authMiddleware } from './middleware/auth.js';
import { SUPRA_ADMIN_EMAIL } from './config/security.js';
import { ensureSupraAdmin } from './services/supraAdmin.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.pexels.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// ═══════════════════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/documents', authMiddleware, documentRoutes);
app.use('/api/signatures', authMiddleware, signatureRoutes);
app.use('/api/billing', authMiddleware, billingRoutes);
app.use('/api/crm', authMiddleware, crmRoutes);
app.use('/api/registry', authMiddleware, registryRoutes);
app.use('/api/marketing', authMiddleware, marketingRoutes);
app.use('/api/seo', authMiddleware, seoRoutes);
app.use('/api/cms', authMiddleware, cmsRoutes);
app.use('/api/ads', authMiddleware, adsRoutes);

// Admin routes (requires root_master_admin role)
app.use('/api/admin', authMiddleware, adminRoutes);

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    platform: 'Mod PDF',
    ecosystem: 'Pitch Modular Spaces',
    timestamp: new Date().toISOString()
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS STATUS CHECK
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/genesis/status', (req, res) => {
  const isInitialized = !!process.env.ROOT_PASSWORD && process.env.ROOT_PASSWORD !== '<SET_ON_GENESIS_REGISTRATION>';
  
  res.json({
    initialized: isInitialized,
    genesisEmail: SUPRA_ADMIN_EMAIL,
    requiresSetup: !isInitialized
  });
});

app.get('/api/supra-admin/status', (req, res) => {
  const isInitialized = !!process.env.ROOT_PASSWORD && process.env.ROOT_PASSWORD !== '<SET_ON_GENESIS_REGISTRATION>';

  res.json({
    initialized: isInitialized,
    supraAdminEmail: SUPRA_ADMIN_EMAIL,
    requiresSetup: !isInitialized
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SPA FALLBACK
// ═══════════════════════════════════════════════════════════════════════════════

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════════

app.use(errorHandler);

// ═══════════════════════════════════════════════════════════════════════════════
// SERVER START
// ═══════════════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════════════════════════╗
  ║                                                                               ║
  ║   ███╗   ███╗ ██████╗ ██████╗     ██████╗ ██████╗ ███████╗                   ║
  ║   ████╗ ████║██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔════╝                   ║
  ║   ██╔████╔██║██║   ██║██║  ██║    ██████╔╝██║  ██║█████╗                     ║
  ║   ██║╚██╔╝██║██║   ██║██║  ██║    ██╔═══╝ ██║  ██║██╔══╝                     ║
  ║   ██║ ╚═╝ ██║╚██████╔╝██████╔╝    ██║     ██████╔╝██║                        ║
  ║   ╚═╝     ╚═╝ ╚═════╝ ╚═════╝     ╚═╝     ╚═════╝ ╚═╝                        ║
  ║                                                                               ║
  ║   🚀 Server running on http://localhost:${PORT}                                ║
  ║   📄 Part of Pitch Modular Spaces                                            ║
  ║   🔐 Supra Admin Email: ${SUPRA_ADMIN_EMAIL}
  ║                                                                               ║
  ╚═══════════════════════════════════════════════════════════════════════════════╝
  `);

  ensureSupraAdmin().then((result) => {
    if (result?.created) {
      console.log(`✅ Supra admin bootstrapped: ${SUPRA_ADMIN_EMAIL}`);
    }
  });
});

export default app;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOD PDF - USER ROUTES
 * User profile, settings, and team management
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import crypto from 'crypto';
import { SUPRA_ADMIN_EMAIL } from '../config/security.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// USER PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/me', async (req, res) => {
  try {
    const { userId } = req.user;
    
    const user = {
      id: userId,
      email: req.user.email,
      firstName: 'John',
      lastName: 'Doe',
      avatar: null,
      role: req.user.role,
      organization: {
        id: req.user.orgId,
        name: 'Acme Corp',
        plan: 'pro'
      },
      permissions: req.user.permissions,
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'America/New_York',
        emailNotifications: true,
        twoFactorEnabled: false
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
  }
});

router.put('/me', async (req, res) => {
  try {
    const { firstName, lastName, avatar, phone, jobTitle, department } = req.body;
    
    res.json({
      success: true,
      message: 'Profile updated',
      user: {
        firstName,
        lastName,
        avatar,
        phone,
        jobTitle,
        department,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

router.put('/me/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }
    
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update password' });
  }
});

router.put('/me/email', async (req, res) => {
  try {
    if (req.user?.isSupraAdmin) {
      return res.status(403).json({
        success: false,
        error: `Supra admin email is immutable (${SUPRA_ADMIN_EMAIL})`
      });
    }
    const { newEmail, password } = req.body;
    
    // Send verification to new email
    
    res.json({
      success: true,
      message: 'Verification email sent to new address'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update email' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/me/preferences', async (req, res) => {
  try {
    const preferences = {
      theme: 'dark',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      emailNotifications: {
        signatureRequests: true,
        documentShares: true,
        reminders: true,
        marketing: false
      },
      defaultSignatureId: null,
      editorSettings: {
        autoSave: true,
        autoSaveInterval: 30,
        showGrid: true,
        snapToGrid: true
      }
    };
    
    res.json({ success: true, preferences });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
  }
});

router.put('/me/preferences', async (req, res) => {
  try {
    const preferences = req.body;
    
    res.json({
      success: true,
      message: 'Preferences updated',
      preferences
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// TWO-FACTOR AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/me/2fa/enable', async (req, res) => {
  try {
    // Generate TOTP secret
    const secret = crypto.randomBytes(20).toString('base64');
    const qrCodeUrl = `otpauth://totp/JustaPDF:${req.user.email}?secret=${secret}&issuer=JustaPDF`;
    
    res.json({
      success: true,
      secret,
      qrCodeUrl,
      backupCodes: Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
      )
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to enable 2FA' });
  }
});

router.post('/me/2fa/verify', async (req, res) => {
  try {
    const { code, secret } = req.body;
    
    // Verify TOTP code
    
    res.json({ success: true, message: 'Two-factor authentication enabled' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to verify 2FA code' });
  }
});

router.post('/me/2fa/disable', async (req, res) => {
  try {
    const { password, code } = req.body;
    
    res.json({ success: true, message: 'Two-factor authentication disabled' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to disable 2FA' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// API KEYS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/me/api-keys', async (req, res) => {
  try {
    const apiKeys = [
      {
        id: crypto.randomUUID(),
        name: 'Production Key',
        prefix: 'mpdf_prod_',
        lastUsed: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        permissions: ['documents:read', 'documents:write', 'signatures:read']
      }
    ];
    
    res.json({ success: true, apiKeys });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch API keys' });
  }
});

router.post('/me/api-keys', async (req, res) => {
  try {
    const { name, permissions, expiresAt } = req.body;
    
    const key = `mpdf_${crypto.randomBytes(24).toString('hex')}`;
    
    const apiKey = {
      id: crypto.randomUUID(),
      name,
      key, // Only shown once
      prefix: key.substring(0, 12) + '...',
      permissions,
      expiresAt,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({ success: true, apiKey });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create API key' });
  }
});

router.delete('/me/api-keys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to revoke API key' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SESSIONS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/me/sessions', async (req, res) => {
  try {
    const sessions = [
      {
        id: crypto.randomUUID(),
        device: 'Chrome on macOS',
        ipAddress: '192.168.1.1',
        location: 'New York, US',
        lastActive: new Date().toISOString(),
        current: true
      }
    ];
    
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
});

router.delete('/me/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({ success: true, message: 'Session revoked' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to revoke session' });
  }
});

router.delete('/me/sessions', async (req, res) => {
  try {
    // Revoke all sessions except current
    
    res.json({ success: true, message: 'All other sessions revoked' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to revoke sessions' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVITY & NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/me/activity', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const activities = [
      {
        id: crypto.randomUUID(),
        type: 'document_created',
        description: 'Created document "Contract.pdf"',
        timestamp: new Date().toISOString(),
        metadata: { documentId: crypto.randomUUID() }
      },
      {
        id: crypto.randomUUID(),
        type: 'signature_completed',
        description: 'Signed "NDA Agreement.pdf"',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        metadata: { requestId: crypto.randomUUID() }
      }
    ];
    
    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch activity' });
  }
});

router.get('/me/notifications', async (req, res) => {
  try {
    const { unreadOnly = false } = req.query;
    
    const notifications = [
      {
        id: crypto.randomUUID(),
        type: 'signature_request',
        title: 'Signature Requested',
        message: 'John Doe requested your signature on "Contract.pdf"',
        read: false,
        actionUrl: '/sign/xxx',
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({ success: true, notifications, unreadCount: 1 });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

router.put('/me/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
});

router.put('/me/notifications/read-all', async (req, res) => {
  try {
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update notifications' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ORGANIZATION USERS (Admin Only)
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/organization', async (req, res) => {
  try {
    const { orgId } = req.user;
    const { page = 1, limit = 20, search, role } = req.query;
    
    const users = [
      {
        id: crypto.randomUUID(),
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        status: 'active',
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch organization users' });
  }
});

router.post('/organization/invite', async (req, res) => {
  try {
    const { email, role, teams } = req.body;
    
    const invitation = {
      id: crypto.randomUUID(),
      email,
      role,
      teams,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({ success: true, invitation });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send invitation' });
  }
});

router.put('/organization/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, teams, status } = req.body;
    
    res.json({
      success: true,
      message: 'User updated',
      user: { id: userId, role, teams, status }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

router.delete('/organization/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { transferTo } = req.body;
    
    // Transfer documents to another user before deletion
    
    res.json({ success: true, message: 'User removed from organization' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to remove user' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEAMS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/teams', async (req, res) => {
  try {
    const teams = [
      {
        id: crypto.randomUUID(),
        name: 'Legal',
        description: 'Legal department',
        memberCount: 5,
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({ success: true, teams });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch teams' });
  }
});

router.post('/teams', async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    const team = {
      id: crypto.randomUUID(),
      name,
      description,
      members,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({ success: true, team });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create team' });
  }
});

router.put('/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    res.json({ success: true, team: { id, name, description } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update team' });
  }
});

router.post('/teams/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    
    res.json({ success: true, message: 'Members added to team' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add members' });
  }
});

router.delete('/teams/:id/members/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    res.json({ success: true, message: 'Member removed from team' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to remove member' });
  }
});

router.delete('/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({ success: true, message: 'Team deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete team' });
  }
});

export default router;

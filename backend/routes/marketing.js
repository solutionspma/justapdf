/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - MARKETING AUTOMATION ROUTES
 * Segmentation, campaigns, and automation triggers
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import crypto from 'crypto';
import { db } from '../database/connection.js';
import { registerEntity } from '../services/registry.js';
import { logEvent } from '../services/events.js';

const router = express.Router();

router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await db.findMany('campaigns', {}, { orderBy: 'created_at:desc', limit: 50 });
    res.json({ success: true, campaigns });
  } catch (error) {
    res.json({ success: true, campaigns: [] });
  }
});

router.post('/campaigns', async (req, res) => {
  try {
    const { name, status = 'draft', metadata = {} } = req.body;
    const campaign = {
      id: crypto.randomUUID(),
      name,
      status,
      metadata,
      created_at: new Date().toISOString()
    };

    const saved = await db.create('campaigns', campaign);
    await registerEntity({
      type: 'marketing',
      key: `campaign:${saved.id}`,
      name: saved.name,
      description: `Marketing campaign: ${saved.name}`,
      metadata: saved.metadata
    });
    await logEvent({
      userId: req.user?.userId,
      type: 'campaign_created',
      source: 'marketing',
      metadata: saved
    });

    res.status(201).json({ success: true, campaign: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create campaign' });
  }
});

router.get('/segments', async (req, res) => {
  res.json({
    success: true,
    segments: [
      { id: 'new_users', name: 'New Users', criteria: ['first_login < 7d'] },
      { id: 'inactive', name: 'Inactive Users', criteria: ['last_activity > 30d'] }
    ]
  });
});

export default router;


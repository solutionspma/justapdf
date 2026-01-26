/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - ADS ROUTES
 * Ad placements, impressions, and click tracking
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import crypto from 'crypto';
import { db } from '../database/connection.js';
import { registerEntity } from '../services/registry.js';
import { logEvent } from '../services/events.js';

const router = express.Router();

router.get('/placements', async (req, res) => {
  try {
    const ads = await db.findMany('ads', {}, { orderBy: 'created_at:desc', limit: 50 });
    res.json({ success: true, ads });
  } catch (error) {
    res.json({ success: true, ads: [] });
  }
});

router.post('/placements', async (req, res) => {
  try {
    const { placement, destinationUrl, status = 'active', metadata = {} } = req.body;
    const ad = {
      id: crypto.randomUUID(),
      placement,
      destination_url: destinationUrl,
      status,
      metadata,
      created_at: new Date().toISOString()
    };

    const saved = await db.create('ads', ad);
    await registerEntity({
      type: 'ad',
      key: `ad:${saved.id}`,
      name: `${saved.placement} placement`,
      description: `Ad placement for ${saved.placement}`,
      metadata: saved.metadata
    });

    res.status(201).json({ success: true, ad: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create ad placement' });
  }
});

router.post('/impressions', async (req, res) => {
  try {
    const impression = {
      id: crypto.randomUUID(),
      ad_id: req.body.adId || null,
      placement: req.body.placement,
      user_id: req.user?.userId || null,
      created_at: new Date().toISOString()
    };

    await logEvent({
      userId: req.user?.userId,
      type: 'ad_impression',
      source: 'ads',
      metadata: impression
    });

    res.status(201).json({ success: true, impression });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to log impression' });
  }
});

router.post('/clicks', async (req, res) => {
  try {
    const click = {
      id: crypto.randomUUID(),
      ad_id: req.body.adId || null,
      placement: req.body.placement,
      user_id: req.user?.userId || null,
      created_at: new Date().toISOString()
    };

    await logEvent({
      userId: req.user?.userId,
      type: 'ad_click',
      source: 'ads',
      metadata: click
    });

    res.status(201).json({ success: true, click });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to log click' });
  }
});

export default router;


/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - SEO INTELLIGENCE ROUTES
 * Keyword tracking, metadata overrides, and SEO entities
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import crypto from 'crypto';
import { db } from '../database/connection.js';
import { registerEntity } from '../services/registry.js';
import { logEvent } from '../services/events.js';

const router = express.Router();

router.get('/keywords', async (req, res) => {
  try {
    const keywords = await db.findMany('seo_keywords', {}, { orderBy: 'created_at:desc', limit: 50 });
    res.json({ success: true, keywords });
  } catch (error) {
    res.json({ success: true, keywords: [] });
  }
});

router.post('/keywords', async (req, res) => {
  try {
    const { keyword, intent, metadata = {} } = req.body;
    const record = {
      id: crypto.randomUUID(),
      keyword,
      intent,
      metadata,
      created_at: new Date().toISOString()
    };

    const saved = await db.create('seo_keywords', record);
    await registerEntity({
      type: 'seo',
      key: `keyword:${saved.keyword}`,
      name: saved.keyword,
      description: `SEO keyword (${saved.intent || 'unspecified'})`,
      metadata: saved.metadata
    });
    await logEvent({
      userId: req.user?.userId,
      type: 'seo_keyword_created',
      source: 'seo',
      metadata: saved
    });

    res.status(201).json({ success: true, keyword: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create keyword' });
  }
});

export default router;


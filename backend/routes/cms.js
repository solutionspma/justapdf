/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - CMS ROUTES
 * Content nodes, blocks, and theme overrides
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import crypto from 'crypto';
import { db } from '../database/connection.js';
import { registerEntity } from '../services/registry.js';
import { logEvent } from '../services/events.js';

const router = express.Router();

router.get('/content', async (req, res) => {
  try {
    const nodes = await db.findMany('content_nodes', {}, { orderBy: 'created_at:desc', limit: 50 });
    res.json({ success: true, nodes });
  } catch (error) {
    res.json({ success: true, nodes: [] });
  }
});

router.post('/content', async (req, res) => {
  try {
    const { title, slug, type = 'page', metadata = {} } = req.body;
    const node = {
      id: crypto.randomUUID(),
      title,
      slug,
      type,
      status: 'draft',
      metadata,
      created_at: new Date().toISOString()
    };

    const saved = await db.create('content_nodes', node);
    await registerEntity({
      type: 'cms',
      key: `content:${saved.slug || saved.id}`,
      name: saved.title,
      description: `CMS content node (${saved.type})`,
      metadata: saved.metadata
    });
    await logEvent({
      userId: req.user?.userId,
      type: 'cms_content_created',
      source: 'cms',
      metadata: saved
    });

    res.status(201).json({ success: true, node: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create content node' });
  }
});

export default router;


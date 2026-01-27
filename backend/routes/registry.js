/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - REGISTRY ROUTES
 * Global registry for tools, actions, UI, CMS blocks, ads, SEO, marketing, etc.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import { requireRole } from '../middleware/auth.js';
import { registerEntity, getRegistryEntry, listRegistryEntries } from '../services/registry.js';
import { getAllOperations } from '../services/operationRegistry.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type, active, search, limit, offset } = req.query;
    const entries = await listRegistryEntries({
      type,
      active: active === undefined ? undefined : active === 'true',
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined
    });

    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch registry entries' });
  }
});

router.get('/operations', async (req, res) => {
  try {
    res.json({ success: true, operations: getAllOperations() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch operations' });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const entry = await getRegistryEntry(req.params.key);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'Registry entry not found' });
    }

    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch registry entry' });
  }
});

router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const entry = await registerEntity(req.body);
    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Failed to register entry' });
  }
});

router.put('/:key', requireRole('admin'), async (req, res) => {
  try {
    const entry = await registerEntity({ ...req.body, key: req.params.key });
    res.json({ success: true, entry });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Failed to update entry' });
  }
});

export default router;


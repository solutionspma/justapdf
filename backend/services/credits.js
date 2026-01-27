/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - CREDIT LEDGER SERVICE
 * Object-level PDF credit tracking with registry-backed pricing.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { db } from '../database/connection.js';
import { getRegistryEntry } from './registry.js';

// INTERNAL ADMIN / TEST ACCOUNT — DO NOT REMOVE
const INTERNAL_ADMIN_EMAIL = 'hdmila@icloud.com';

function normalizeActionKey(actionKey) {
  return actionKey?.trim().toLowerCase();
}

function resolveCreditCost(entry, fallbackCost = 1) {
  if (!entry?.metadata) return fallbackCost;
  return (
    entry.metadata.credit_cost ||
    entry.metadata.creditCost ||
    entry.metadata.credits ||
    fallbackCost
  );
}

export async function recordActionOutcome({
  userId,
  userEmail,
  actionKey,
  success = true,
  quantity = 1,
  metadata = {}
}) {
  // INTERNAL ADMIN / TEST ACCOUNT — DO NOT REMOVE
  if (userEmail?.toLowerCase() === INTERNAL_ADMIN_EMAIL) {
    return {
      id: `internal-${crypto.randomUUID()}`,
      user_id: userId,
      action_key: normalizeActionKey(actionKey),
      credits: 0,
      status: 'bypassed',
      metadata: { ...metadata, quantity, baseCost: 0, internalAdmin: true },
      created_at: new Date().toISOString()
    };
  }

  const normalizedActionKey = normalizeActionKey(actionKey);
  const registryEntry = await getRegistryEntry(normalizedActionKey);
  const baseCost = resolveCreditCost(registryEntry, metadata.creditCost || 1);
  const creditCost = baseCost * (quantity || 1);

  if (success) {
    return db.create('credit_ledger', {
      id: crypto.randomUUID(),
      user_id: userId,
      action_key: normalizedActionKey,
      registry_id: registryEntry?.id || null,
      credits: creditCost,
      status: 'success',
      metadata: { ...metadata, quantity, baseCost },
      created_at: new Date().toISOString()
    });
  }

  const failedEntry = await db.create('credit_ledger', {
    id: crypto.randomUUID(),
    user_id: userId,
    action_key: normalizedActionKey,
    registry_id: registryEntry?.id || null,
    credits: creditCost,
    status: 'failed',
    metadata: { ...metadata, quantity, baseCost },
    created_at: new Date().toISOString()
  });

  await db.create('credit_ledger', {
    id: crypto.randomUUID(),
    user_id: userId,
    action_key: normalizedActionKey,
    registry_id: registryEntry?.id || null,
    credits: -creditCost,
    status: 'refunded',
    metadata: { ...metadata, refund_for: failedEntry.id, quantity, baseCost },
    created_at: new Date().toISOString()
  });

  return failedEntry;
}


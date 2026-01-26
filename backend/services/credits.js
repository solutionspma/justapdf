/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - CREDIT LEDGER SERVICE
 * Object-level PDF credit tracking with registry-backed pricing.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { db } from '../database/connection.js';
import { getRegistryEntry } from './registry.js';

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
  actionKey,
  success = true,
  metadata = {}
}) {
  const normalizedActionKey = normalizeActionKey(actionKey);
  const registryEntry = await getRegistryEntry(normalizedActionKey);
  const creditCost = resolveCreditCost(registryEntry, metadata.creditCost || 1);

  if (success) {
    return db.create('credit_ledger', {
      id: crypto.randomUUID(),
      user_id: userId,
      action_key: normalizedActionKey,
      registry_id: registryEntry?.id || null,
      credits: creditCost,
      status: 'success',
      metadata,
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
    metadata,
    created_at: new Date().toISOString()
  });

  await db.create('credit_ledger', {
    id: crypto.randomUUID(),
    user_id: userId,
    action_key: normalizedActionKey,
    registry_id: registryEntry?.id || null,
    credits: -creditCost,
    status: 'refunded',
    metadata: { ...metadata, refund_for: failedEntry.id },
    created_at: new Date().toISOString()
  });

  return failedEntry;
}


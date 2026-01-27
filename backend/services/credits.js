/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - CREDIT LEDGER SERVICE
 * Object-level PDF credit tracking with registry-backed pricing.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { db } from '../database/connection.js';
import { calculateCredits } from './operationRegistry.js';

const INTERNAL_ADMIN_UID = process.env.INTERNAL_ADMIN_UID;

function normalizeActionKey(actionKey) {
  return actionKey?.trim().toLowerCase();
}

export async function getCreditBalance(userId) {
  if (INTERNAL_ADMIN_UID && userId === INTERNAL_ADMIN_UID) {
    return Number.MAX_SAFE_INTEGER;
  }
  const entries = await db.findMany(
    'credit_ledger',
    { user_id: userId },
    { limit: 1000, offset: 0 }
  );
  return entries.reduce((sum, entry) => sum + (entry.credits || 0), 0);
}

export async function consumeCredits({ userId, userEmail, operationId, quantity = 1, metadata = {} }) {
  if (!operationId) {
    throw new Error('operationId is required to consume credits');
  }

  if (INTERNAL_ADMIN_UID && userId === INTERNAL_ADMIN_UID) {
    return {
      id: `internal-${crypto.randomUUID()}`,
      user_id: userId,
      action_key: normalizeActionKey(operationId),
      credits: 0,
      status: 'bypassed',
      metadata: { ...metadata, quantity, baseCost: 0, internalAdmin: true },
      created_at: new Date().toISOString()
    };
  }

  const baseCost = calculateCredits(operationId, 1);
  if (baseCost === null) {
    throw new Error('Unknown operation for credit consumption');
  }
  const creditCost = baseCost * Math.max(1, Number(quantity) || 1);
  const balance = await getCreditBalance(userId);

  if (balance < creditCost) {
    const error = new Error('Insufficient credits');
    error.code = 'INSUFFICIENT_CREDITS';
    throw error;
  }

  return db.create('credit_ledger', {
    id: crypto.randomUUID(),
    user_id: userId,
    action_key: normalizeActionKey(operationId),
    registry_id: null,
    credits: -creditCost,
    status: 'success',
    metadata: { ...metadata, quantity, baseCost },
    created_at: new Date().toISOString()
  });
}

export async function recordActionOutcome({
  userId,
  userEmail,
  actionKey,
  success = true,
  quantity = 1,
  metadata = {}
}) {
  if (INTERNAL_ADMIN_UID && userId === INTERNAL_ADMIN_UID) {
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
  const baseCost = calculateCredits(normalizedActionKey, 1);
  if (baseCost === null) {
    throw new Error('Unknown operation for credit tracking');
  }
  const creditCost = baseCost * Math.max(1, Number(quantity) || 1);

  if (success) {
    return db.create('credit_ledger', {
      id: crypto.randomUUID(),
      user_id: userId,
      action_key: normalizedActionKey,
      registry_id: null,
      credits: -creditCost,
      status: 'success',
      metadata: { ...metadata, quantity, baseCost },
      created_at: new Date().toISOString()
    });
  }

  const failedEntry = await db.create('credit_ledger', {
    id: crypto.randomUUID(),
    user_id: userId,
    action_key: normalizedActionKey,
    registry_id: null,
    credits: -creditCost,
    status: 'failed',
    metadata: { ...metadata, quantity, baseCost },
    created_at: new Date().toISOString()
  });

  await db.create('credit_ledger', {
    id: crypto.randomUUID(),
    user_id: userId,
    action_key: normalizedActionKey,
    registry_id: null,
    credits: creditCost,
    status: 'refunded',
    metadata: { ...metadata, refund_for: failedEntry.id, quantity, baseCost },
    created_at: new Date().toISOString()
  });

  return failedEntry;
}


/** Transactional credit ledger for paid PDF operations. */

import crypto from 'node:crypto';
import { db, query, transaction } from '../database/connection.js';
import { calculateCredits } from './operationRegistry.js';

const INTERNAL_ADMIN_UID = process.env.INTERNAL_ADMIN_UID;

function normalizeActionKey(actionKey) {
  return actionKey?.trim().toLowerCase();
}

export async function getCreditBalance(userId, client = null) {
  if (INTERNAL_ADMIN_UID && userId === INTERNAL_ADMIN_UID) return Number.MAX_SAFE_INTEGER;
  const result = await query(
    `SELECT COALESCE(SUM(credits), 0)::int AS balance
     FROM credit_ledger WHERE user_id = $1 AND status IN ('success', 'refunded')`,
    [userId],
    client || undefined
  );
  return Number(result.rows[0]?.balance || 0);
}

export async function consumeCredits({ userId, operationId, quantity = 1, metadata = {} }) {
  if (!operationId) throw new Error('operationId is required to consume credits');
  if (INTERNAL_ADMIN_UID && userId === INTERNAL_ADMIN_UID) {
    return { id: `internal-${crypto.randomUUID()}`, user_id: userId, action_key: normalizeActionKey(operationId), credits: 0, status: 'bypassed', metadata: { ...metadata, quantity, internalAdmin: true }, created_at: new Date().toISOString() };
  }
  const baseCost = calculateCredits(operationId, 1);
  if (baseCost === null) throw new Error('Unknown operation for credit consumption');
  const creditCost = baseCost * Math.max(1, Number(quantity) || 1);

  return transaction(async (client) => {
    // Lock the user's ledger rows while checking balance so concurrent jobs
    // cannot spend the same credits twice.
    await query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [String(userId)], client);
    const balance = await getCreditBalance(userId, client);
    if (balance < creditCost) {
      const error = new Error('Insufficient credits');
      error.code = 'INSUFFICIENT_CREDITS';
      throw error;
    }
    return db.create('credit_ledger', {
      id: crypto.randomUUID(), user_id: userId, action_key: normalizeActionKey(operationId), registry_id: null,
      credits: -creditCost, status: 'success', metadata: { ...metadata, quantity, baseCost }, created_at: new Date().toISOString()
    }, client);
  });
}

export async function recordActionOutcome({ userId, actionKey, success = true, quantity = 1, metadata = {} }) {
  if (INTERNAL_ADMIN_UID && userId === INTERNAL_ADMIN_UID) {
    return { id: `internal-${crypto.randomUUID()}`, user_id: userId, action_key: normalizeActionKey(actionKey), credits: 0, status: 'bypassed', metadata: { ...metadata, quantity, internalAdmin: true }, created_at: new Date().toISOString() };
  }
  const normalizedActionKey = normalizeActionKey(actionKey);
  const baseCost = calculateCredits(normalizedActionKey, 1);
  if (baseCost === null) throw new Error('Unknown operation for credit tracking');
  const creditCost = baseCost * Math.max(1, Number(quantity) || 1);
  return transaction(async (client) => {
    const failedEntry = await db.create('credit_ledger', {
      id: crypto.randomUUID(), user_id: userId, action_key: normalizedActionKey, registry_id: null,
      credits: success ? -creditCost : 0, status: success ? 'success' : 'failed', metadata: { ...metadata, quantity, baseCost }, created_at: new Date().toISOString()
    }, client);
    if (!success && creditCost > 0) {
      await db.create('credit_ledger', {
        id: crypto.randomUUID(), user_id: userId, action_key: normalizedActionKey, registry_id: null,
        credits: creditCost, status: 'refunded', metadata: { ...metadata, refund_for: failedEntry.id, quantity, baseCost }, created_at: new Date().toISOString()
      }, client);
    }
    return failedEntry;
  });
}

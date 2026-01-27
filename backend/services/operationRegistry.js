import { OPERATION_CATALOG } from '../config/operations.js';
import { OPERATION_PRICING } from '../config/pricing.js';
import { registerEntity } from './registry.js';

export function getAllOperations() {
  return OPERATION_CATALOG.map((operation) => ({
    ...operation,
    creditCost: OPERATION_PRICING[operation.id] ?? operation.creditCost ?? 0
  }));
}

export function getOperationById(id) {
  if (!id) return null;
  return getAllOperations().find((operation) => operation.id === id) || null;
}

export function calculateCredits(operationId, quantity = 1) {
  const operation = getOperationById(operationId);
  if (!operation) return null;
  const baseCost = OPERATION_PRICING[operation.id] ?? operation.creditCost ?? 0;
  return baseCost * Math.max(1, Number(quantity) || 1);
}

export async function seedOperationRegistry() {
  for (const operation of getAllOperations()) {
    await registerEntity({
      type: 'action',
      key: operation.id,
      name: operation.name,
      description: operation.description,
      metadata: {
        creditCost: operation.creditCost,
        requiresUpload: operation.requiresUpload,
        requiresSecondFile: operation.requiresSecondFile
      }
    });
  }
}

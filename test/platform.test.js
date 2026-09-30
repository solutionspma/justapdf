import test from 'node:test';
import assert from 'node:assert/strict';
import { getOperationById, calculateCredits } from '../backend/services/operationRegistry.js';
import { newStorageKey } from '../backend/database/connection.js';

test('credit catalog charges only configured PDF operations', () => {
  assert.equal(calculateCredits('upload_pdf'), 0);
  assert.equal(calculateCredits('export_pdf'), 0);
  assert.equal(calculateCredits('merge_documents', 2), 2);
  assert.equal(calculateCredits('not-an-operation'), null);
  assert.equal(getOperationById('split_pages').requiresUpload, true);
});

test('storage keys are randomized, user-scoped, and do not use original names', () => {
  const first = newStorageKey('00000000-0000-0000-0000-000000000001', 'invoice.pdf');
  const second = newStorageKey('00000000-0000-0000-0000-000000000001', 'invoice.pdf');
  assert.match(first, /^uploads\/users\/00000000-0000-0000-0000-000000000001\/[0-9a-f-]+\.pdf$/);
  assert.notEqual(first, second);
  assert.doesNotMatch(first, /invoice/);
});

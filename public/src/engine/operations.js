import { db, doc, getDoc, setDoc } from '../firebase.js';
import { apiFetch } from '../api.js';

export async function seedOperations() {
  const response = await apiFetch('/registry/operations');
  const operations = response.operations || [];

  for (const operation of operations) {
    const ref = doc(db, 'operations', operation.id);
    const existing = await getDoc(ref);
    if (existing.exists()) continue;
    await setDoc(ref, {
      ...operation,
      createdAt: Date.now()
    });
  }
}

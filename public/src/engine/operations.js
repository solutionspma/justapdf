import { OPERATIONS } from '../operations.js';
import { db, doc, getDoc, setDoc } from '../firebase.js';

export async function seedOperations() {
  for (const operation of OPERATIONS) {
    const ref = doc(db, 'operations', operation.id);
    const existing = await getDoc(ref);
    if (existing.exists()) continue;
    await setDoc(ref, {
      ...operation,
      requires: [],
      produces: [],
      createdAt: Date.now()
    });
  }
}

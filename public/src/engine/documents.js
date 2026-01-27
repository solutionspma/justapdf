import {
  db,
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion
} from '../firebase.js';

export async function createDocumentRecord({ id, ownerType, ownerId, filename, storagePathOriginal, availableOperations }) {
  const ref = doc(db, 'documents', id);
  const payload = {
    id,
    ownerType,
    ownerId,
    filename,
    storagePathOriginal,
    storagePathWorking: null,
    pageCount: null,
    status: 'uploaded',
    availableOperations,
    operationsRun: [],
    originalHash: '',
    createdAt: serverTimestamp()
  };
  await setDoc(ref, payload);
  return payload;
}

export async function updateDocumentStatus(id, status) {
  const ref = doc(db, 'documents', id);
  await updateDoc(ref, { status });
}

export async function updateDocumentRecord(id, updates) {
  const ref = doc(db, 'documents', id);
  await updateDoc(ref, updates);
}

export async function logOperation(id, operation) {
  const ref = doc(db, 'documents', id);
  await updateDoc(ref, {
    operationsRun: arrayUnion({
      operation,
      timestamp: Date.now()
    })
  });
}

export async function listUserDocuments(userId) {
  const q = query(
    collection(db, 'documents'),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => docSnap.data());
}

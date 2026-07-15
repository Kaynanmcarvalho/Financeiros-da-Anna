import {
  collection,
  doc,
  getDoc as firestoreGetDoc,
  getDocs,
  setDoc as firestoreSetDoc,
  addDoc as firestoreAddDoc,
  updateDoc as firestoreUpdateDoc,
  deleteDoc as firestoreDeleteDoc,
  query,
  type QueryConstraint,
  type DocumentData,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Get a single document by path.
 */
export async function getDocument<T>(path: string): Promise<T | null> {
  const docRef = doc(db, path);
  const snapshot = await firestoreGetDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as unknown as T;
}

/**
 * Set a document (create or overwrite) at a given path.
 */
export async function setDocument(
  path: string,
  data: DocumentData,
  merge = false
): Promise<void> {
  const docRef = doc(db, path);
  await firestoreSetDoc(docRef, data, { merge });
}

/**
 * Add a document to a collection (auto-generated ID).
 */
export async function addDocument(
  collectionPath: string,
  data: DocumentData
): Promise<string> {
  const colRef = collection(db, collectionPath);
  const docRef = await firestoreAddDoc(colRef, data);
  return docRef.id;
}

/**
 * Update fields on a document.
 */
export async function updateDocument(
  path: string,
  data: Record<string, unknown>
): Promise<void> {
  const docRef = doc(db, path);
  await firestoreUpdateDoc(docRef, data);
}

/**
 * Delete a document at a given path.
 */
export async function deleteDocument(path: string): Promise<void> {
  const docRef = doc(db, path);
  await firestoreDeleteDoc(docRef);
}

/**
 * Query documents from a collection with constraints.
 */
export async function queryDocuments<T>(
  collectionPath: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const colRef = collection(db, collectionPath);
  const q = query(colRef, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as T);
}

/**
 * Batch delete all documents in a collection (for subcollections cleanup).
 */
export async function deleteCollection(collectionPath: string): Promise<void> {
  const colRef = collection(db, collectionPath);
  const snapshot = await getDocs(colRef);

  const batchSize = 500;
  let batch = writeBatch(db);
  let count = 0;

  for (const docSnap of snapshot.docs) {
    batch.delete(docSnap.ref);
    count++;
    if (count % batchSize === 0) {
      await batch.commit();
      batch = writeBatch(db);
    }
  }

  if (count % batchSize !== 0) {
    await batch.commit();
  }
}

export { serverTimestamp };

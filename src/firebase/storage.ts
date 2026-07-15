import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a file to Firebase Storage under the user's folder.
 * @returns The download URL of the uploaded file.
 */
export async function uploadFile(
  userId: string,
  path: string,
  file: File
): Promise<string> {
  const storageRef = ref(storage, `users/${userId}/${path}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/**
 * Get the download URL of a file in Storage.
 */
export async function getFileURL(
  userId: string,
  path: string
): Promise<string> {
  const storageRef = ref(storage, `users/${userId}/${path}`);
  return getDownloadURL(storageRef);
}

/**
 * Delete a file from Storage.
 */
export async function deleteFile(
  userId: string,
  path: string
): Promise<void> {
  const storageRef = ref(storage, `users/${userId}/${path}`);
  await deleteObject(storageRef);
}

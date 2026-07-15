import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  updateProfile,
  type User,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export async function signInWithEmail(email: string, password: string, rememberMe: boolean): Promise<User> {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string, name: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  return result.user;
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function reauthenticate(password: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Usuário não autenticado');
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
}

export async function updateUserPassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  await updatePassword(user, newPassword);
}

export async function updateUserEmail(newEmail: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  await updateEmail(user, newEmail);
}

export async function updateUserProfile(data: { displayName?: string; photoURL?: string }): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  await updateProfile(user, data);
}

export async function deleteUserAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  await deleteUser(user);
}

export function isGoogleProvider(): boolean {
  const user = auth.currentUser;
  if (!user) return false;
  return user.providerData.some((p) => p.providerId === 'google.com');
}

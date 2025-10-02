import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';

// Authentication service
export const authService = {
  signIn: (email: string, password: string) => 
    signInWithEmailAndPassword(auth, email, password),
  
  signUp: (email: string, password: string) => 
    createUserWithEmailAndPassword(auth, email, password),
  
  signOut: () => firebaseSignOut(auth),
  
  onAuthStateChanged: (callback: (user: User | null) => void) => 
    onAuthStateChanged(auth, callback)
};

// Firestore service
export const firestoreService = {
  saveUserConfig: async (userId: string, config: Record<string, unknown>) => {
    const userConfigRef = doc(db, 'userConfigs', userId);
    await setDoc(userConfigRef, {
      ...config,
      updatedAt: Timestamp.now()
    }, { merge: true });
  },
  
  getUserConfig: async (userId: string) => {
    const userConfigRef = doc(db, 'userConfigs', userId);
    const docSnap = await getDoc(userConfigRef);
    return docSnap.exists() ? docSnap.data() : null;
  },
  
  subscribeToUserConfig: (userId: string, callback: (config: Record<string, unknown>) => void) => {
    const userConfigRef = doc(db, 'userConfigs', userId);
    return onSnapshot(userConfigRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  }
};
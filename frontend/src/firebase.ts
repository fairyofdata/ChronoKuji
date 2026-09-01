import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";

// Your web app's Firebase configuration
const fbApiKey = import.meta.env.VITE_FIREBASE_API_KEY || ['AIzaSyAytnAvv5Ow8', 'zMnpE_Ek3_ZTef97gxqHso'].join('');

const firebaseConfig = {
  apiKey: fbApiKey,
  authDomain: "my-archetier.firebaseapp.com",
  projectId: "my-archetier",
  storageBucket: "my-archetier.firebasestorage.app",
  messagingSenderId: "429604956307",
  appId: "1:429604956307:web:3b9154b963b59b54db4566",
  measurementId: "G-309YNGTEZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In helper
export const loginWithGoogle = async (): Promise<FirebaseUser | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code !== 'auth/popup-closed-by-user') {
      console.error("Firebase Google Auth Error:", error);
    }
    throw error;
  }
};

// Sign-Out helper
export const logoutFirebase = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Firebase Sign-Out Error:", error);
    throw error;
  }
};

export { onAuthStateChanged };
export type { FirebaseUser };

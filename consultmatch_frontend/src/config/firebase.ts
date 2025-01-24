import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc,
  enableIndexedDbPersistence,
  connectFirestoreEmulator,
  collection,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore
let db = getFirestore(app);

// Enable persistence if supported
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
}

// Initialize Analytics only in production
let analytics = null;
if (import.meta.env.PROD) {
  analytics = getAnalytics(app);
}

// Initialize Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Handle popup behavior
  close_popup: 'false',
  return_scopes: 'true'
});

// Set language to browser preference
auth.useDeviceLanguage();

// Constants for retry logic
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 5000;

// Helper function to wait with exponential backoff
const wait = (attempt: number) => {
  const delay = Math.min(
    INITIAL_RETRY_DELAY * Math.pow(2, attempt),
    MAX_RETRY_DELAY
  );
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Enhanced retry operation with exponential backoff
const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  let lastError;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(
        `Attempt ${attempt + 1}/${retries} failed:`,
        error.message || error
      );
      
      // Check if we should retry based on the error
      if (!shouldRetry(error) || attempt === retries - 1) {
        break;
      }
      
      // Wait before retrying with exponential backoff
      await wait(attempt);
    }
  }
  
  throw lastError;
};

// Helper to determine if we should retry based on the error
const shouldRetry = (error: any): boolean => {
  const retriableErrors = [
    'failed-precondition',
    'unavailable',
    'deadline-exceeded',
    'cancelled',
    'network-request-failed'
  ];
  
  return retriableErrors.includes(error.code) || 
         error.message?.includes('transport errored') ||
         error.message?.includes('offline');
};

export const getUserProfile = async (userId: string) => {
  return retryOperation(async () => {
    console.log('Attempting to fetch user profile:', userId);
    const userRef = doc(db, 'users', userId);
    
    try {
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        console.log('User profile found:', userSnap.data());
        return {
          id: userSnap.id,
          ...userSnap.data()
        };
      }
      
      console.log('No user profile found');
      return null;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to access this profile');
      }
      throw error;
    }
  });
};

export const createUserProfile = async (user: User, role: 'consultant' | 'pm' | 'partner') => {
  if (!user) throw new Error('User is required to create profile');

  return retryOperation(async () => {
    const userRef = doc(db, 'users', user.uid);
    
    try {
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const userData = {
          email: user.email,
          role,
          createdAt: new Date().toISOString(),
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          lastUpdated: new Date().toISOString()
        };

        await setDoc(userRef, userData);
        console.log('Created new user profile:', userData);
        return {
          id: user.uid,
          ...userData
        };
      }

      console.log('User profile already exists');
      return {
        id: userSnap.id,
        ...userSnap.data()
      };
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to create a profile');
      }
      throw error;
    }
  });
};

// Auth functions with better error handling
export const signUpWithEmail = async (email: string, password: string, role: 'consultant' | 'pm' | 'partner') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential.user, role);
    return userCredential;
  } catch (error: any) {
    console.error('Error in signUpWithEmail:', error);
    throw new Error(getReadableErrorMessage(error.code));
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('Error in signInWithEmail:', error);
    throw new Error(getReadableErrorMessage(error.code));
  }
};

export const signInWithGooglePopup = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Check if user profile exists
    const profile = await getUserProfile(result.user.uid);
    if (!profile) {
      // Create profile only if it doesn't exist
      await createUserProfile(result.user, 'consultant');
    }
    return result;
  } catch (error: any) {
    console.error('Error in signInWithGoogle:', error);
    // Handle specific popup errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please enable popups for this site.');
    }
    throw new Error(getReadableErrorMessage(error.code));
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error in signOut:', error);
    throw new Error(getReadableErrorMessage(error.code));
  }
};

// Helper function to convert Firebase error codes to readable messages
const getReadableErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in or use a different email.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign in is not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Please choose a stronger password (at least 6 characters).';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};

// Test Firestore connection without requiring authentication
export const testFirestoreConnection = async () => {
  try {
    // Get the current user
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      // If authenticated, try to access the user's profile
      const userRef = doc(db, 'users', currentUser.uid);
      await getDoc(userRef);
    } else {
      // If not authenticated, just check if Firestore is accessible
      const dbRef = collection(db, 'users');
      await getDoc(doc(dbRef, 'test-connection'));
    }
    return true;
  } catch (error: any) {
    // Ignore permission-denied errors when not authenticated
    if (error.code === 'permission-denied' && !auth.currentUser) {
      console.log('Firestore is accessible but requires authentication');
      return true;
    }
    console.error('Firestore connection test failed:', error);
    throw new Error('Firestore connection failed: ' + error.message);
  }
};

export { app, auth, db, analytics }; 
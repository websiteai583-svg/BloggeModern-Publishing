import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  UserCredential 
} from 'firebase/auth';

// Pure environment variable based configuration (No hardcoded credentials)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId
);

let app: any = null;
let auth: any = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

export { app, auth, googleProvider };

// Map Firebase auth errors to clear, actionable messages
export function formatFirebaseAuthError(errorCode?: string, defaultMsg = 'Google Sign-In failed'): string {
  switch (errorCode) {
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups or try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before finishing.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Authentication settings.';
    case 'auth/operation-not-allowed':
      return 'Google Sign-In provider is disabled in Firebase Console.';
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API Key configured.';
    case 'auth/network-request-failed':
      return 'Network error occurred. Please check your internet connection.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email using a different sign-in method.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    default:
      return defaultMsg;
  }
}

let redirectResultProcessed = false;

export async function checkRedirectResult(): Promise<{
  success: boolean;
  email?: string;
  name?: string;
  avatar?: string;
  idToken?: string;
  error?: string;
} | null> {
  if (!isFirebaseConfigured || !auth) return null;
  if (redirectResultProcessed) return null;
  try {
    const result = await getRedirectResult(auth);
    redirectResultProcessed = true;
    if (!result || !result.user) return null;
    const user = result.user;
    const idToken = await user.getIdToken();
    return {
      success: true,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'Google User',
      avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email || 'google')}`,
      idToken
    };
  } catch (err: any) {
    redirectResultProcessed = true;
    console.error('Firebase redirect result error:', err);
    return { 
      success: false, 
      error: formatFirebaseAuthError(err?.code, err?.message || 'Google redirect sign-in failed') 
    };
  }
}

export async function loginWithGoogleFirebase(): Promise<{
  success: boolean;
  email?: string;
  name?: string;
  avatar?: string;
  idToken?: string;
  error?: string;
}> {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    return {
      success: false,
      error: 'Firebase is not yet configured. Please set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, and VITE_FIREBASE_PROJECT_ID.'
    };
  }

  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    return {
      success: true,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'Google User',
      avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email || 'google')}`,
      idToken
    };
  } catch (err: any) {
    console.warn('Firebase Google popup attempt warning:', err);
    
    // On mobile if popup is blocked, attempt redirect flow
    if (err?.code === 'auth/popup-blocked') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return {
          success: false,
          error: 'Redirecting to Google Sign-In...'
        };
      } catch (redirectErr: any) {
        return {
          success: false,
          error: formatFirebaseAuthError(redirectErr?.code, redirectErr?.message || 'Google Sign-In failed')
        };
      }
    }
    
    return {
      success: false,
      error: formatFirebaseAuthError(err?.code, err?.message || 'Google Sign-In failed')
    };
  }
}


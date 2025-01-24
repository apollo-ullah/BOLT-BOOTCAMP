import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, signUpWithEmail, signInWithEmail, signInWithGooglePopup, signOutUser, getUserProfile, createUserProfile, testFirestoreConnection } from '../config/firebase';

export interface UserProfile {
  id: string;
  email: string | null;
  role: 'consultant' | 'pm' | 'partner';
  createdAt: string;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailAndPassword: (email: string, password: string, role: 'consultant' | 'pm' | 'partner') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('AuthProvider rendering');

  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Test Firestore connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        await testFirestoreConnection();
        console.log('Firestore connection test passed');
      } catch (err: any) {
        console.error('Firestore connection test failed:', err);
        // Only set error if it's not a permission error
        if (!err.message?.includes('permission')) {
          setError('Failed to connect to database. Please check your internet connection.');
        }
      }
    };

    testConnection();
  }, []);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout reached, forcing loading state to false');
        setLoading(false);
        setError('Loading timeout reached. Please refresh the page.');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Loading component
  const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
        <p className="mt-2 text-sm text-gray-500">
          {user ? 'Fetching user profile...' : 'Checking authentication...'}
        </p>
      </div>
    </div>
  );

  useEffect(() => {
    console.log('Setting up auth listener');
    let mounted = true;
    let profileTimeout: NodeJS.Timeout;

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user?.email);
      
      if (!mounted) {
        console.log('Component unmounted, skipping updates');
        return;
      }

      // Clear any existing profile timeout
      if (profileTimeout) {
        clearTimeout(profileTimeout);
      }

      try {
        if (user) {
          setUser(user);
          console.log('Fetching user profile for:', user.uid);
          
          // Set a timeout for profile fetching
          profileTimeout = setTimeout(() => {
            if (mounted && loading) {
              console.warn('Profile fetch timeout reached');
              setLoading(false);
              setError('Failed to fetch user profile. Please refresh the page.');
            }
          }, 5000); // 5 second timeout for profile fetch

          const profile = await getUserProfile(user.uid);
          console.log('Fetched profile:', profile);
          
          if (mounted) {
            if (profile) {
              setUserProfile(profile as UserProfile);
            } else {
              console.log('No profile found, creating default profile');
              try {
                const newProfile = await createUserProfile(user, 'consultant');
                setUserProfile(newProfile as UserProfile);
              } catch (err: any) {
                console.error('Error creating user profile:', err);
                setError('Failed to create user profile. Please try again.');
              }
            }
            // Clear the profile timeout since we're done
            clearTimeout(profileTimeout);
          }
        } else {
          console.log('No user found, clearing states');
          setUser(null);
          setUserProfile(null);
        }
      } catch (err: any) {
        console.error('Error in auth state change:', err);
        setError(err.message || 'An error occurred during authentication');
      } finally {
        if (mounted) {
          console.log('Setting loading to false');
          setLoading(false);
        }
      }
    });

    return () => {
      console.log('Cleaning up auth listener');
      mounted = false;
      if (profileTimeout) {
        clearTimeout(profileTimeout);
      }
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithGooglePopup();
      // Profile will be fetched by the auth state change listener
    } catch (err: any) {
      console.error('Error signing in with Google:', err);
      setError(err.message);
      throw err;
    }
  };

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmail(email, password);
      // Profile will be fetched by the auth state change listener
    } catch (err: any) {
      console.error('Error signing in with email:', err);
      setError(err.message);
      throw err;
    }
  };

  const signUpWithEmailAndPassword = async (email: string, password: string, role: 'consultant' | 'pm' | 'partner') => {
    try {
      setError(null);
      await signUpWithEmail(email, password, role);
      // Profile will be fetched by the auth state change listener
    } catch (err: any) {
      console.error('Error signing up with email:', err);
      setError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await signOutUser();
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err.message);
      throw err;
    }
  };

  // Show error screen if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600">Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    signInWithGoogle,
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
    signOut
  };

  console.log('Current state:', { 
    user: user?.email, 
    userProfile: userProfile?.role, 
    loading, 
    error 
  });

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 
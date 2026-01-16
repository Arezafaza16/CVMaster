// CV Master - Authentication Context
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { User } from '../types';
import { Collections, createUserDocument, getUserDocument } from '../services/firebase';

// Configure Google Sign-In
GoogleSignin.configure({
    webClientId: '513580473772-4hb3u3lncejr1srlbgdk2vr7b57bv1qk.apps.googleusercontent.com',
});

interface AuthContextType {
    user: FirebaseAuthTypes.User | null;
    userData: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
    signInWithGoogle: () => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    updateProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch user data from Firestore
                const { data } = await getUserDocument(firebaseUser.uid);
                setUserData(data as User | null);
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Listen for user data changes
    useEffect(() => {
        if (!user) return;

        const unsubscribe = firestore()
            .collection(Collections.USERS)
            .doc(user.uid)
            .onSnapshot((doc) => {
                if (doc.exists()) {
                    setUserData({ id: doc.id, ...doc.data() } as User);
                }
            });

        return unsubscribe;
    }, [user]);

    const signIn = async (email: string, password: string) => {
        try {
            await auth().signInWithEmailAndPassword(email, password);
            return { error: null };
        } catch (error: any) {
            let errorMessage = 'Login gagal. Silakan coba lagi.';

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Email tidak valid.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Akun telah dinonaktifkan.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Email tidak terdaftar.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Password salah.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Email atau password salah.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Metode login ini belum diaktifkan. Silakan hubungi admin.';
                    break;
            }

            return { error: errorMessage };
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        try {
            const { user: newUser } = await auth().createUserWithEmailAndPassword(email, password);

            // Update display name
            await newUser.updateProfile({ displayName });

            // Create user document in Firestore
            await createUserDocument(newUser.uid, {
                email: newUser.email,
                displayName,
                photoURL: null,
                subscriptionStatus: 'free',
                subscriptionExpiry: null,
                cvCount: 0,
                scansToday: 0,
            });

            return { error: null };
        } catch (error: any) {
            let errorMessage = 'Registrasi gagal. Silakan coba lagi.';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email sudah terdaftar.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email tidak valid.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password terlalu lemah. Minimal 6 karakter.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Metode registrasi ini belum diaktifkan. Silakan hubungi admin.';
                    break;
            }

            return { error: errorMessage };
        }
    };

    const signInWithGoogle = async () => {
        try {
            // Check if device supports Google Play Services
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Get the user's ID token
            const signInResult = await GoogleSignin.signIn();

            // Get the ID token
            const idToken = signInResult.data?.idToken;
            if (!idToken) {
                return { error: 'Gagal mendapatkan token dari Google.' };
            }

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            const userCredential = await auth().signInWithCredential(googleCredential);

            // Check if this is a new user
            const { data: existingUser } = await getUserDocument(userCredential.user.uid);

            if (!existingUser) {
                // Create user document in Firestore for new users
                await createUserDocument(userCredential.user.uid, {
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName,
                    photoURL: userCredential.user.photoURL,
                    subscriptionStatus: 'free',
                    subscriptionExpiry: null,
                    cvCount: 0,
                    scansToday: 0,
                });
            }

            return { error: null };
        } catch (error: any) {
            console.error('Google Sign-In Error:', error);

            let errorMessage = 'Login dengan Google gagal. Silakan coba lagi.';

            if (error.code === 'SIGN_IN_CANCELLED') {
                errorMessage = 'Login dibatalkan.';
            } else if (error.code === 'IN_PROGRESS') {
                errorMessage = 'Login sedang berlangsung.';
            } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
                errorMessage = 'Google Play Services tidak tersedia.';
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'Akun sudah terdaftar dengan metode login lain.';
            }

            return { error: errorMessage };
        }
    };

    const signOutUser = async () => {
        try {
            // Sign out from Google if signed in
            const isSignedIn = await GoogleSignin.hasPreviousSignIn();
            if (isSignedIn) {
                await GoogleSignin.signOut();
            }
        } catch (error) {
            // Ignore Google sign out errors
        }
        await auth().signOut();
    };

    const updateProfile = async (displayName: string) => {
        if (user) {
            await user.updateProfile({ displayName });
            await firestore()
                .collection(Collections.USERS)
                .doc(user.uid)
                .update({ displayName });
        }
    };

    const value = {
        user,
        userData,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut: signOutUser,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;


// CV Master - Firebase Configuration
// Note: @react-native-firebase/app is auto-configured from google-services.json
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Firebase will be configured automatically from google-services.json
// Make sure to add google-services.json to android/app/


// Auth service
export const firebaseAuth = auth;

// Firestore service
export const db = firestore;

// Storage service
export const firebaseStorage = storage;

// Collection references
export const Collections = {
    USERS: 'users',
    CVS: 'cvs',
    SCANS: 'scans',
};

// Helper functions
export const getCurrentUser = () => {
    return auth().currentUser;
};

export const signInWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        return { user: userCredential.user, error: null };
    } catch (error: any) {
        return { user: null, error: error.message };
    }
};

export const signUpWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        return { user: userCredential.user, error: null };
    } catch (error: any) {
        return { user: null, error: error.message };
    }
};

export const signOut = async () => {
    try {
        await auth().signOut();
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
};

export const updateUserProfile = async (displayName: string, photoURL?: string) => {
    try {
        const user = auth().currentUser;
        if (user) {
            await user.updateProfile({ displayName, photoURL: photoURL || null });
        }
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
};

// Firestore helpers
export const createUserDocument = async (userId: string, userData: any) => {
    try {
        await firestore().collection(Collections.USERS).doc(userId).set({
            ...userData,
            createdAt: firestore.FieldValue.serverTimestamp(),
        });
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
};

export const getUserDocument = async (userId: string) => {
    try {
        const doc = await firestore().collection(Collections.USERS).doc(userId).get();
        if (doc.exists()) {
            return { data: { id: doc.id, ...doc.data() }, error: null };
        }
        return { data: null, error: 'User not found' };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
};

export const updateUserDocument = async (userId: string, data: any) => {
    try {
        await firestore().collection(Collections.USERS).doc(userId).update({
            ...data,
            updatedAt: firestore.FieldValue.serverTimestamp(),
        });
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
};

// CV helpers
export const saveCv = async (userId: string, cvData: any) => {
    try {
        console.log('Saving CV for user:', userId, cvData);
        const docRef = await firestore().collection(Collections.CVS).add({
            userId,
            ...cvData,
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
        });
        console.log('CV saved with ID:', docRef.id);

        // Update user's CV count
        await firestore().collection(Collections.USERS).doc(userId).update({
            cvCount: firestore.FieldValue.increment(1),
        });

        return { id: docRef.id, error: null };
    } catch (error: any) {
        console.error('saveCv error:', error);
        return { id: null, error: error.message };
    }
};

export const getUserCvs = async (userId: string) => {
    try {
        console.log('Fetching CVs for user:', userId);
        const snapshot = await firestore()
            .collection(Collections.CVS)
            .where('userId', '==', userId)
            .get();

        const cvs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Found CVs:', cvs.length);
        return { data: cvs, error: null };
    } catch (error: any) {
        console.error('getUserCvs error:', error);
        return { data: [], error: error.message };
    }
};

// CV Image Storage helpers
export const uploadCvImage = async (userId: string, cvId: string, base64Image: string) => {
    try {
        const imagePath = `cv-images/${userId}/${cvId}.png`;
        const reference = storage().ref(imagePath);

        // Upload base64 string
        await reference.putString(base64Image, 'base64', { contentType: 'image/png' });

        // Get download URL
        const downloadUrl = await reference.getDownloadURL();
        console.log('CV image uploaded:', downloadUrl);

        return { url: downloadUrl, error: null };
    } catch (error: any) {
        console.error('uploadCvImage error:', error);
        return { url: null, error: error.message };
    }
};

export const getCvImageUrl = async (userId: string, cvId: string) => {
    try {
        const imagePath = `cv-images/${userId}/${cvId}.png`;
        const reference = storage().ref(imagePath);
        const downloadUrl = await reference.getDownloadURL();
        return { url: downloadUrl, error: null };
    } catch (error: any) {
        return { url: null, error: error.message };
    }
};

export const deleteCvImage = async (userId: string, cvId: string) => {
    try {
        const imagePath = `cv-images/${userId}/${cvId}.png`;
        const reference = storage().ref(imagePath);
        await reference.delete();
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
};

export const updateCv = async (cvId: string, cvData: any) => {
    try {
        await firestore().collection(Collections.CVS).doc(cvId).update({
            ...cvData,
            updatedAt: firestore.FieldValue.serverTimestamp(),
        });
        return { error: null };
    } catch (error: any) {
        console.error('updateCv error:', error);
        return { error: error.message };
    }
};

export const getCvById = async (cvId: string) => {
    try {
        const doc = await firestore().collection(Collections.CVS).doc(cvId).get();
        if (doc.exists()) {
            return { data: { id: doc.id, ...doc.data() }, error: null };
        }
        return { data: null, error: 'CV not found' };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
};

export default {
    auth: firebaseAuth,
    db,
    storage: firebaseStorage,
    Collections,
};

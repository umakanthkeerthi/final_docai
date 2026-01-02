import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfiles, setUserProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sign up with email/password
    async function signup(email, password) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: email,
            profiles: [],
            createdAt: new Date().toISOString()
        });

        return userCredential;
    }

    // Login with email/password
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Login with Google
    async function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);

        // Check if user document exists, create if not
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: userCredential.user.email,
                profiles: [],
                createdAt: new Date().toISOString()
            });
        }

        return userCredential;
    }

    // Logout
    function logout() {
        return signOut(auth);
    }

    // Load user profiles from Firestore
    async function loadUserProfiles(uid) {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserProfiles(data.profiles || []);
                return data.profiles || [];
            }
            return [];
        } catch (error) {
            console.error('Error loading profiles:', error);
            return [];
        }
    }

    // Add profile to Firestore
    async function addProfile(profileData) {
        if (!currentUser) return { success: false, error: 'Not logged in' };

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);

            const profiles = userDoc.exists() ? (userDoc.data().profiles || []) : [];
            const newProfile = {
                ...profileData,
                id: profiles.length + 1
            };

            profiles.push(newProfile);

            await setDoc(userRef, { profiles }, { merge: true });
            setUserProfiles(profiles);

            return { success: true, profile: newProfile };
        } catch (error) {
            console.error('Error adding profile:', error);
            return { success: false, error: error.message };
        }
    }

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await loadUserProfiles(user.uid);
            } else {
                setUserProfiles([]);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfiles,
        signup,
        login,
        loginWithGoogle,
        logout,
        addProfile,
        loadUserProfiles
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

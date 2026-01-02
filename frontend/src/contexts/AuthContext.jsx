import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
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

        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // Use Redirect for mobile (better UX, no popup blocking)
            await signInWithRedirect(auth, provider);
            // Result will be handled in useEffect via getRedirectResult or onAuthStateChanged
            return;
        } else {
            // Use Popup for desktop
            const userCredential = await signInWithPopup(auth, provider);
            await ensureUserDocument(userCredential.user);
            return userCredential;
        }
    }

    // Helper to ensure user doc exists
    async function ensureUserDocument(user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                profiles: [],
                createdAt: new Date().toISOString()
            });
        }
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

    // Listen for auth state changes & handle redirect result
    useEffect(() => {
        // Handle Redirect Result (for mobile login)
        getRedirectResult(auth).then(async (result) => {
            if (result) {
                // User just signed in via redirect
                await ensureUserDocument(result.user);
            }
        }).catch((error) => {
            console.error("Redirect auth error:", error);
        });

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

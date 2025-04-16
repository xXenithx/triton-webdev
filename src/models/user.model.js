import { firebaseDB } from '../services/firebase.service.js';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Reference the 'triton-users' collection
const userCollection = collection(firebaseDB, 'triton-users');

// Create a new user
export const createUser = async (uid, userData) => {
    try {
        const userDoc = doc(userCollection, uid); // Reference a specific document in the collection
        await setDoc(userDoc, userData);
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Get a user by ID
export const getUserById = async (uid) => {
    try {
        const userDoc = doc(userCollection, uid); // Reference a specific document
        const docSnap = await getDoc(userDoc);
        if (!docSnap.exists()) {
            throw new Error('User not found');
        }
        return docSnap.data();
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

// Update a user
export const updateUser = async (uid, updates) => {
    try {
        const userDoc = doc(userCollection, uid); // Reference a specific document
        await updateDoc(userDoc, updates);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};
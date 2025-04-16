import { firebaseAuth } from '../services/firebase.service.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import * as userModel from '../models/user.model.js';

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const user = userCredential.user;

        const userData = await userModel.getUserById(user.uid);

        if (!userData.emailVerified) {
            await userModel.updateUser(user.uid, { emailVerified: user.emailVerified });
        }

        req.session.user = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
        };

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error logging in user:', error);
        res.redirect(`/?error=${encodeURIComponent('Invalid email or password.')}`);
    }
};

export const signUpUser = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const user = userCredential.user;

         // Update the user's profile with their display name
         await updateProfile(user, { displayName: `${firstName} ${lastName}` });

         // Send an email verification to the user
         await sendEmailVerification(user);

         // Save user data to Firestore
        await userModel.createUser(user.uid, {
            firstName,
            lastName,
            email,
            emailVerified: false,
            createdAt: new Date(),
        });

        req.session.user = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
        };

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).send('Error signing up user');
    }
};

export const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/protected-route');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};
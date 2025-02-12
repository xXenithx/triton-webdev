// import 'dotenv/config';
import Particle from 'particle-api-js'
import path from 'path';
import express from 'express';
import argv from 'yargs'
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import firebaseAdmin from 'firebase-admin';
import { fileURLToPath } from 'url';
import fs from 'fs';
import morgan from 'morgan';

// Resolve __dirname and __filename in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = import.meta.dirname;
const date = new Date();
const timestamp = date.getTime();
const APP_CREDENTIALS = process.env.APP_CREDENTIALS || argv.appCredentials;

// Import the service account key file
import serviceAccount from APP_CREDENTIALS with { type: 'json' };
console.log('serviceAccount:', serviceAccount);
// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount)
});

const firebaseConfig = {
    apiKey: "AIzaSyAiEkQG-e6AeTl4lmPgnWB01qmMWHKZhkg",
    authDomain: "triton-dev-6a93a.firebaseapp.com",
    projectId: "triton-dev-6a93a",
    storageBucket: "triton-dev-6a93a.firebasestorage.app",
    messagingSenderId: "305101687936",
    appId: "1:305101687936:web:8fd1ba01c231cb0970ea65",
    measurementId: "G-LWH7HNC6ZR"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const token = process.env.AUTH_TOKEN || argv.authToken;
const port = process.env.PORT || argv.port || 3000;

// const __dirname = import.meta.dirname;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './public')));
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

var accessLogStream = fs.createWriteStream(path.join(__dirname, `/logs/access_${timestamp}.log`), { flags: 'a' })

app.use(morgan('combined', { stream: accessLogStream }));
// // Initialize Firebase Admin SDK
// firebaseAdmin.initializeApp({
//     credential: firebaseAdmin.credential.applicationDefault(),
//     databaseURL: "firebase-adminsdk-e6w0w@triton-dev-6a93a.iam.gserviceaccount.com"
// });

// Configure Passport with Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5050/auth/google/callback" // Ensure this matches the URI in Google Cloud Console
},
    async (accessToken, tokenSecret, profile, done) => {
        try {
            // Authenticate with Firebase using Google OAuth token
            const firebaseToken = await firebaseAdmin.auth().verifyIdToken(accessToken);
            const userCredential = await firebase.auth().signInWithCredential(credential);
            const firebaseUser = userCredential.user;

            // Check if user exists in Firestore
            const userDoc = await db.collection('triton-users').doc(firebaseUser.uid).get();
            if (!userDoc.exists) {
                // Create new user in Firestore
                await db.collection('triton-users').doc(firebaseUser.uid).set({
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: profile.emails[0].value,
                    emailVerified: profile.emails[0].verified,
                    createdAt: new Date()
                });
            }
            return done(null, firebaseUser);
        } catch (error) {
            return done(error, null);
        }
    }
));

// Serialize user into the session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

// Debug middleware
app.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    //console.log('Session data:', req.session);
    next();
});


// Function to update email verification status
const updateEmailVerificationStatus = async (user) => {
    try {
        const userDoc = db.collection('triton-users').doc(user.uid);
        await userDoc.update({
            emailVerified: user.emailVerified
        });
    } catch (error) {
        console.error('Error updating email verification status:', error);
    }
};

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/?error=' + encodeURIComponent('Please log in to access this page.'));
    }
};

app.enable('trust proxy')
app.get('/', function (req, res) {
    //console.log('Session data on /:', req.session.user);
    console.log("\nIncoming request from: " + req.connection.remoteAddress);
    if (req.session.user) {
        res.redirect('/protected-route');
    } else {
        //console.log('req.session.user:', req.session.user);
        res.sendFile(path.join(__dirname, './public/home.html'));
    }
});

app.get('/signup', function (req, res) {
    res.sendFile(path.join(__dirname, './public/signup.html'));
});

app.get('/forgot-password', function (req, res) {
    res.sendFile(path.join(__dirname, './public/forgot-password.html'));
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Sign in the user with Firebase Auth
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('User logged in:', user.uid, user);
        // Retrieve user data from Firestore
        const userDoc = await db.collection('triton-users').doc(user.uid).get();
        if (!userDoc.exists) {
            throw new Error('User data not found in Firestore');
        }
        const userData = userDoc.data();

        if (!userData.emailVerified) {
            // Update email verification status
            console.log('Email not verified, checking Firebase Auth...');
            await updateEmailVerificationStatus(user);
        }

        // Store user session
        req.session.user = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        };

        console.log('Session data set:', req.session.user);

        // Redirect to the dashboard
        res.redirect('/protected-route');
    } catch (error) {
        console.error('Error logging in user:', error);
        let errorMessage = 'Error logging in user';

        if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        }

        res.redirect(`/?error=${encodeURIComponent(errorMessage)}`);
    }
});

app.post('/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        // Create user with Firebase Auth
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update user profile with display name
        const displayName = `${firstName} ${lastName}`;
        await user.updateProfile({
            displayName: displayName
        });

        // Send email verification
        await user.sendEmailVerification();

        // Store user data in Firestore
        await db.collection('triton-users').doc(user.uid).set({
            firstName: firstName,
            lastName: lastName,
            email: email,
            emailVerified: false, // Initially set to false
            createdAt: new Date()
        });

        req.session.user = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        };

        // res.send(`<div align='center'><h2>Signup Successful!</h2><h3>Welcome ${displayName}. Please verify your email address.</h3></div>`);
        res.redirect('/protected-route');

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Send password reset email
        await firebase.auth().sendPasswordResetEmail(email);
        res.send(`<div align='center'><h2>Password Reset</h2><h3>A password reset link has been sent to ${email}.</h3></div>`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).send('Error sending password reset email');
    }
});

app.get('/protected-route', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, './public/dashboard.html'));
});

app.get('/user-data', isAuthenticated, async (req, res) => {
    try {
        const userDoc = await db.collection('triton-users').doc(req.session.user.uid).get();
        if (!userDoc.exists) {
            throw new Error('User data not found in Firestore');
        }
        const userData = userDoc.data();
        res.json({
            fullName: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            emailVerified: userData.emailVerified
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/protected-route');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/?error=Failed to authenticate with Google' }),
    (req, res) => {
        // Store user session
        req.session.user = {
            uid: req.user.id,
            email: req.user.emails[0].value,
            displayName: `${req.user.name.givenName} ${req.user.name.familyName}`
        };
        res.redirect('/protected-route');
    }
);

app.listen(port, function () {
    console.log('server: http://localhost:' + port);
});

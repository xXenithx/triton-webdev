// import firebase from 'firebase/compat/app';
// import 'firebase/compat/auth';
// import 'firebase/compat/firestore';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseAdmin from 'firebase-admin';

// Firebase Client SDK Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAiEkQG-e6AeTl4lmPgnWB01qmMWHKZhkg",
    authDomain: "triton-dev-6a93a.firebaseapp.com",
    projectId: "triton-dev-6a93a",
    storageBucket: "triton-dev-6a93a.firebasestorage.app",
    messagingSenderId: "305101687936",
    appId: "1:305101687936:web:8fd1ba01c231cb0970ea65",
    measurementId: "G-LWH7HNC6ZR"
};

// Intialize Firebase Client SDK

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firebaseDB = getFirestore(firebaseApp);

// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();

// Firebase Admin SDK Configuration
const serviceAccount = {
    "type": "service_account",
    "project_id": process.env.PROJECT_ID,
    "private_key_id": process.env.PRIVATE_KEY_ID,
    "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.CLIENT_EMAIL,
    "client_id": process.env.CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL,
    "universe_domain": "googleapis.com"
}

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});

export {firebaseAuth, firebaseDB, firebaseAdmin}
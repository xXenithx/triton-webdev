import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//////////////////////////// GET Routes \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
export const getHomePage = (req, res) => {
    // Check to see if the request has an existing session
    if (req.session && req.session.user){
        // If the user is already logged in, redirect to the dashboard page
        res.redirect('/dashboard');
    } else {
        // If the user is not logged in, render the login page
        res.sendFile(path.join(__dirname, '../../public/index.html'));
    }
}

export const getSignUpPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/signup.html'));
}

export const getFogotPasswordPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/forgot-password.html'));
}

export const getLoggedInPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
}

export const getLogoutPage = (req, res) => {
    // Destroy the session and redirect to the home page
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.redirect('/home');
        }
    });
}

export const getDashboardPage = (req, res) => {
    // Check if the user is logged in
    if (req.session && req.session.user) {
        // Render the dashboard page
        res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
    } else {
        // If not logged in, redirect to the home page
        res.redirect('/home');
    }
}

//////////////////////////// POST Routes \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
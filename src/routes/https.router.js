import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import * as httpsController from '../controllers/https.controller.js';
import * as userModel from '../models/user.model.js';
const router = express.Router();

//////////////Web API Routes\\\\\\\\\\\\\\\\\\\\
// GET Routes
router.get('/home', httpsController.getHomePage);
router.get('/signup', httpsController.getSignUpPage);
router.get('/forgot-password', httpsController.getFogotPasswordPage);
router.get('/dashboard', isAuthenticated, httpsController.getDashboardPage);
router.get('/user-data', isAuthenticated, async (req, res) => {
    try {
        //Fetch user data from Firestore using the user ID from the session
        const userData = await userModel.getUserById(req.session.user.uid);
        if(!userData) {
            throw new Error('User not found in database!');
        }

        // Respond with the user's data
        res.json({
            fullName: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            emailVerified: userData.emailVerified,
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// POST Routes

// PUT Routes

// DELETE Routes


// Export the router
export default router;
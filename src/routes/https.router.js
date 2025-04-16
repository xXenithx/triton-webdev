import express from 'express';
import * as httpsController from '../controllers/https.controller.js'; 
const router = express.Router();

//////////////Web API Routes\\\\\\\\\\\\\\\\\\\\


// GET Routes
router.get('/', httpsController.getHomePage);
router.get('/signup', httpsController.getSignUpPage);
router.get('/forgot-password', httpsController.getFogotPasswordPage);
// POST Routes

// PUT Routes

// DELETE Routes


// Export the router
export default router;
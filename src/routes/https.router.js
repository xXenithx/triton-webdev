import express from 'express';
import { getHomePage, getSignUpPage, getFogotPasswordPage} from '../controllers/https.controller.js'; 
const router = express.Router();

//Web API Routes//


// GET Routes
router.get('/', getHomePage);
router.get('/signup', getSignUpPage);
router.get('/forgot-password', getFogotPasswordPage);
// POST Routes

// PUT Routes

// DELETE Routes


// Export the router
export default router;
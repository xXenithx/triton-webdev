import express from 'express';
import * as auth from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', auth.loginUser);
router.post('/signup', auth.signUpUser);
router.get('/logout', auth.logoutUser);

export default router;
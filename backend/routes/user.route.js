import express from 'express';
import { registerUser, loginUser, getUser, updateUser, deleteUser, logoutUser, getMe } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected routes
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);


router.get('/me', protect, getMe);

export default router;

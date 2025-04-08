import express from 'express';
import { registerUser, loginUser, getUser, updateUser, deleteUser, logoutUser } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Route to get the authenticated user's details
router.get('/me', protect, async (req, res) => {
  try {
    // `req.user` is set by the `protect` middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message,
    });
  }
});

// Protected routes
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

export default router;

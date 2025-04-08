import express from 'express';
import passport from 'passport';
import { googleAuthCallback, facebookAuthCallback } from '../controllers/user.controller.js';

const router = express.Router();

// Google auth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false
  }),
  googleAuthCallback
);

// Facebook auth routes
router.get('/facebook', passport.authenticate('facebook', { 
  scope: ['email']
}));

router.get('/facebook/callback',
  passport.authenticate('facebook', { 
    failureRedirect: '/login',
    session: false
  }),
  facebookAuthCallback
);

export default router;
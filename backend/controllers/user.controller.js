import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';

// Configure Passport strategies
export const configurePassport = () => {
  // Google Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists in database
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // Check if email already exists
        const existingEmail = await User.findOne({ email: profile.emails[0].value });
        if (existingEmail) {
          // Link Google account to existing user
          existingEmail.googleId = profile.id;
          await existingEmail.save();
          return done(null, existingEmail);
        }
        
        // Create new user
        const randomPassword = Math.random().toString(36).slice(-10);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);
        
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: hashedPassword,
          googleId: profile.id,
          profileImage: profile.photos[0].value || 'default-profile.jpg'
        });
        
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Facebook Strategy
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({ facebookId: profile.id });
      
      if (!user) {
        // Check if email already exists
        const existingEmail = await User.findOne({ email: profile.emails[0].value });
        if (existingEmail) {
          // Link Facebook account to existing user
          existingEmail.facebookId = profile.id;
          await existingEmail.save();
          return done(null, existingEmail);
        }
        
        // Create new user
        const randomPassword = Math.random().toString(36).slice(-10);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);
        
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: hashedPassword,
          facebookId: profile.id,
          profileImage: profile.photos[0].value || 'default-profile.jpg'
        });
        
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'mydefaultsecret',
    { expiresIn: '1h' }
  );
};

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImage } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const newUser = new User({
            name,
            email,
            password,
            profileImage: profileImage || 'default-profile.jpg'
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// LOGIN USER FUNCTION
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create JWT token
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// Handle Google Authentication Success
export const googleAuthCallback = (req, res) => {
    const token = generateToken(req.user);
    
    // Make sure FRONTEND_URL is properly defined
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/oauth-success?token=${token}`);
  };

// Handle Facebook Authentication Success
export const facebookAuthCallback = (req, res) => {
  const token = generateToken(req.user);
  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
};

// Fetch user details
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user details', error: error.message });
    }
};

// In user.controller.js
export const getMe = async (req, res) => {
    try {
      // The user is already attached to req by the protect middleware
      const user = req.user;
      
      // Make sure user exists
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      
      // Return user data without password
      res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || 'default-profile.jpg'
      });
    } catch (error) {
      console.error('Error in getMe:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error fetching user details', 
        error: error.message 
      });
    }
  };

// Update user details
export const updateUser = async (req, res) => {
    try {
        const { name, email, password, profileImage } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (profileImage) user.profileImage = profileImage;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// Logout function (optional - JWT is stateless)
export const logoutUser = async (req, res) => {
    try {
        // On frontend you will remove the token from localStorage/sessionStorage
        res.json({ message: 'User logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error during logout', error: error.message });
    }
};
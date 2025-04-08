import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from 'passport';
import { connectDB } from "./config/db.js";

// Import routes
import productRoutes from "./routes/product.route.js";
import userRoutes from "./routes/user.route.js";
import recipeRoutes from "./routes/recipe.route.js";
import paymentRoutes from "./routes/payment.route.js";

import { configurePassport } from './controllers/user.controller.js';
import authRoutes from './routes/auth.route.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());

// Configure passport
configurePassport();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging in development mode
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parse JSON request bodies
app.use(express.json());
app.use(passport.initialize());

// API routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Server is running!',
    version: '1.0.0'
  });
});

// Mount route modules
app.use("/api/products", productRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use('/api/auth', authRoutes);

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error',
    message: "Endpoint not found",
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Uncaught exception:', err);
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    status: 'error',
    message: err.message || "Server Error",
    stack: NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server and connect to database
const startServer = async () => {
  try {
    await connectDB();
    console.log('📦 Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});
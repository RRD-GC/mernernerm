import express from 'express';
import { getRecipes, getUserRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, upload } from '../controllers/recipe.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getRecipes);

// Protected routes - apply protect middleware
router.get('/user', protect, getUserRecipes);
router.get('/:id', getRecipeById);
router.post('/', protect, upload.single('image'), createRecipe);
router.put('/:id', protect, upload.single('image'), updateRecipe);
router.delete('/:id', protect, deleteRecipe);

export default router;
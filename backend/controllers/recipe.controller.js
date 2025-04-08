import mongoose from "mongoose";
import Recipe from "../models/recipe.model.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Set up directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "../../frontend/src/assets/images/recipes");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `recipe-${uniqueSuffix}${extension}`);
  }
});

// Setup multer upload with image filter
export const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith('image/') 
      ? cb(null, true) 
      : cb(new Error('Only image files are allowed!'), false);
  },
  limits: { fileSize: 20 * 1024 * 1024 } // 5MB limit
});

// Helper functions
const handleFileCleanup = (filePath) => {
  if (filePath) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  }
};

const parseRecipeData = (body) => {
  try {
    return typeof body.recipeData === 'string' 
      ? JSON.parse(body.recipeData) 
      : body;
  } catch (error) {
    throw new Error("Invalid JSON format for recipe data");
  }
};

const validateRecipeData = ({ name, description, category, ingredients, steps }) => {
  if (!name || !description || !category || !ingredients || !steps) {
    throw new Error("Please provide all required fields: name, description, category, ingredients, and steps.");
  }
  
  return {
    name,
    description,
    category,
    ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
    steps: Array.isArray(steps) ? steps : [steps]
  };
};

const checkAuthentication = (req) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }
  return req.user.id;
};

const checkOwnership = (recipe, userId) => {
  if (recipe.user.toString() !== userId) {
    throw new Error("Not authorized to modify this recipe");
  }
};

// Controller methods
export const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({});
    res.status(200).json({ success: true, data: recipes });
  } catch (error) {
    console.error("Error fetching recipes:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }
    res.status(200).json({ success: true, data: recipe });
  } catch (error) {
    console.error("Error fetching recipe:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// Assuming you have an auth middleware that adds req.user
export const getUserRecipes = async (req, res) => {
  try {
    console.log('🔍 req.user:', req.user);

    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID missing in token.' });
    }

    const recipes = await Recipe.find({ user: userId });
    
    res.status(200).json({ recipes });
  } catch (error) {
    console.error('🔥 getUserRecipes Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



export const createRecipe = async (req, res) => {
  try {
    // Verify authentication
    const userId = checkAuthentication(req);
    
    // Check for image upload
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Image is required to create a recipe" 
      });
    }
    
    // Parse and validate recipe data
    const recipeData = parseRecipeData(req.body);
    const validatedData = validateRecipeData(recipeData);
    
    // Create and save new recipe
    const newRecipe = new Recipe({
      ...validatedData,
      imagePath: `/src/assets/images/recipes/${req.file.filename}`,
      user: userId
    });
    
    await newRecipe.save();
    res.status(201).json({ success: true, data: newRecipe });
    
  } catch (error) {
    if (req.file) handleFileCleanup(req.file.path);
    
    console.error("Error creating recipe:", error.message);
    res.status(error.message.includes("authenticated") ? 401 : 400).json({ 
      success: false, 
      message: error.message || "Server Error" 
    });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    // Verify authentication
    const userId = checkAuthentication(req);
    
    const { id } = req.params;
    
    // Validate recipe ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ 
        success: false, 
        message: "Invalid Recipe ID" 
      });
    }

    // Get existing recipe and verify ownership
    const existingRecipe = await Recipe.findById(id);
    if (!existingRecipe) {
      return res.status(404).json({ 
        success: false, 
        message: "Recipe not found" 
      });
    }
    
    checkOwnership(existingRecipe, userId);

    // Parse and validate recipe data
    const recipeData = parseRecipeData(req.body);
    const validatedData = validateRecipeData(recipeData);

    // Handle image update
    let imagePath = existingRecipe.imagePath;
    
    if (req.file) {
      imagePath = `/src/assets/images/recipes/${req.file.filename}`;
      
      // Delete old image if it exists
      if (existingRecipe.imagePath && existingRecipe.imagePath.includes('/src/assets/images/recipes/')) {
        const oldImagePath = path.join(UPLOAD_DIR, path.basename(existingRecipe.imagePath));
        if (fs.existsSync(oldImagePath)) {
          handleFileCleanup(oldImagePath);
        }
      }
    }

    // Update recipe
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      { ...validatedData, imagePath },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedRecipe });
    
  } catch (error) {
    if (req.file) handleFileCleanup(req.file.path);
    
    console.error("Error updating recipe:", error.message);
    
    const statusCode = 
      error.message.includes("authenticated") ? 401 :
      error.message.includes("authorized") ? 403 : 
      error.message.includes("Invalid Recipe ID") || error.message.includes("not found") ? 404 : 
      400;
    
    res.status(statusCode).json({ 
      success: false, 
      message: error.message || "Server Error" 
    });
  }
};

export const deleteRecipe = async (req, res) => {
  const { id } = req.params;

  try {
    // Verify authentication
    const userId = checkAuthentication(req);

    // Validate recipe ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid Recipe ID");
    }

    // Get recipe and verify ownership
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    
    checkOwnership(recipe, userId);

    // Delete recipe
    await Recipe.findByIdAndDelete(id);

    // Delete associated image
    if (recipe.imagePath && recipe.imagePath.includes('/src/assets/images/recipes/')) {
      const imagePath = path.join(UPLOAD_DIR, path.basename(recipe.imagePath));
      if (fs.existsSync(imagePath)) {
        handleFileCleanup(imagePath);
      }
    }

    res.status(200).json({ success: true, message: "Recipe Deleted" });
  } catch (error) {
    console.error("Error deleting recipe:", error.message);
    
    const statusCode = 
      error.message.includes("authenticated") ? 401 :
      error.message.includes("Invalid Recipe ID") || error.message.includes("not found") ? 404 :
      error.message.includes("authorized") ? 403 : 500;
    
    res.status(statusCode).json({ success: false, message: error.message || "Server Error" });
  }
};
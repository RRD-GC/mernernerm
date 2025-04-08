import mongoose from "mongoose";
import Ingredient from './ingredient.model.js';
import Category from './category.model.js';
const { Schema, model } = mongoose;

// Capitalize first letter utility
const capitalizeFirst = (val) => {
  if (typeof val !== 'string') return val;
  return val.charAt(0).toUpperCase() + val.slice(1);
};

// Extract clean ingredient names (keeps only the name, no amount/unit)
const extractIngredientName = (item) => {
  if (typeof item !== 'string') return item;
  const words = item.split(' ');
  const filtered = words.filter(word => !/^\d+$/.test(word) && !/^(cup|cups|tsp|tbsp|grams?|kg|ml|oz|pounds?|lbs?)$/i.test(word));
  return capitalizeFirst(filtered.join(' '));
};

const stepSchema = new Schema({
  stepNumber: {
    type: Number,
    required: true
  },
  instruction: {
    type: String,
    required: true,
    set: capitalizeFirst
  }
});

const recipeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      set: capitalizeFirst,
      trim: true
    },
    description: {
      type: String,
      required: true,
      set: capitalizeFirst,
      trim: true
    },
    category: {
      type: String,
      required: true,
      set: capitalizeFirst,
      trim: true
    },
    ingredients: {
      type: [String],
      required: true,
      set: (items) => items.map(item => extractIngredientName(item)),
      validate: [arr => arr.length > 0, 'At least one ingredient is required']
    },
    steps: {
      type: [stepSchema],
      required: true,
      validate: [arr => arr.length > 0, 'At least one step is required']
    },
    imagePath: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Capitalize steps before validation
recipeSchema.pre('validate', function(next) {
  if (this.steps && Array.isArray(this.steps)) {
    this.steps.forEach(step => {
      if (step.instruction && typeof step.instruction === 'string') {
        step.instruction = capitalizeFirst(step.instruction);
      }
    });
  }
  next();
});

// Sync ingredient names to Ingredient collection
recipeSchema.pre('save', async function(next) {
  const cleanedIngredients = [...new Set(this.ingredients)];
  for (const name of cleanedIngredients) {
    await Ingredient.updateOne(
      { name: name },
      { $set: { name: name } },
      { upsert: true }
    );
  }

  // Sync category name to Category collection
  if (this.category) {
    await Category.updateOne(
      { name: this.category },
      { $set: { name: this.category } },
      { upsert: true }
    );
  }

  next();
});

const Recipe = model('Recipe', recipeSchema);

export default Recipe;

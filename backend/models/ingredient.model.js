import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const ingredientSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true, // prevents duplicates
    trim: true,
    set: val => val.charAt(0).toUpperCase() + val.slice(1),
  }
}, { timestamps: true });

const Ingredient = model('Ingredient', ingredientSchema);
export default Ingredient;

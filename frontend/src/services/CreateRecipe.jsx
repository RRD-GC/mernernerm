import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/api';

const CreateRecipe = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);
  
  // Predefined values
  const predefinedCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer', 'Salad', 'Beverage', 'Other'];  
  const predefinedUnits = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'pinch'];

  // Ingredients state
  const [ingredients, setIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState({ amount: '', unit: '', customUnit: '', name: '' });

  // Steps state
  const [steps, setSteps] = useState([]);
  const [stepInput, setStepInput] = useState({ description: '', procedure: '' });

  // Handle form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Ingredient handlers
  const addIngredient = () => {
    const { amount, unit, customUnit, name } = ingredientInput;
    const finalUnit = unit === 'custom' ? customUnit : unit;
    if (amount && finalUnit && name) {
      setIngredients([...ingredients, `${amount} ${finalUnit} ${name}`]);
      setIngredientInput({ amount: '', unit: '', customUnit: '', name: '' });
    }
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Step handlers
  const addStep = () => {
    const { description, procedure } = stepInput;
    if (description && procedure) {
      setSteps([
        ...steps, 
        { stepNumber: steps.length + 1, instruction: `${description}: ${procedure}` }
      ]);
      setStepInput({ description: '', procedure: '' });
    }
  };

  const removeStep = (index) => {
    const updated = steps.filter((_, i) => i !== index);
    setSteps(updated.map((step, i) => ({ ...step, stepNumber: i + 1 })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, description, category } = formData;
    
    // Validate required fields
    if (!name || !description || !category || ingredients.length === 0 || steps.length === 0 || !imageFile) {
      setErrorMessage('Please fill in all required fields and add at least one ingredient and step');
      return;
    }
    
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
  
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', imageFile);
  
      // Create recipe data object
      const recipeData = { name, description, category, ingredients, steps };
      formData.append('recipeData', JSON.stringify(recipeData));
  
      // Get the JWT token
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      
      if (!token) {
        setErrorMessage('You must be logged in to create a recipe');
        setIsSubmitting(false);
        return;
      }
  
      // Send the request
      const res = await axios.post('http://localhost:5000/api/recipes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSuccessMessage('Recipe created successfully!');
      
      // Reset form
      setFormData({ name: '', description: '', category: '' });
      setImageFile(null);
      setImagePreview('');
      setIngredients([]);
      setSteps([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      navigate('/recipe-page');
    } catch (err) {
      console.error('Error creating recipe:', err);
      if (err.response) {
        setErrorMessage(err.response.data.message || 'Server error: ' + err.response.status);
      } else if (err.request) {
        setErrorMessage('No response received from the server. Please try again.');
      } else {
        setErrorMessage('Error preparing request: ' + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white shadow-2xl rounded-2xl transition-all duration-300 hover:shadow-orange-100">
        <h1 className="text-3xl font-bold mb-8 text-center text-orange-600 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-1/2 after:w-20 after:h-1 after:bg-orange-400 after:rounded-full after:transform after:-translate-x-1/2">Create a New Recipe</h1>
        
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 animate-fadeIn">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 animate-fadeIn">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="transition-all duration-300 transform hover:scale-[1.01]">
            <label className="block mb-2 font-medium text-gray-700">Recipe Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
              placeholder="e.g., Spaghetti Bolognese"
              required
            />
          </div>
    
          <div className="transition-all duration-300 transform hover:scale-[1.01]">
            <label className="block mb-2 font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 appearance-none bg-white"
              required
            >
              <option value="">Select Category</option>
              {predefinedCategories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
    
          <div className="transition-all duration-300 transform hover:scale-[1.01]">
            <label className="block mb-2 font-medium text-gray-700">Short Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
              placeholder="Briefly describe the dish"
              required
            ></textarea>
          </div>
    
          {/* Ingredients */}
          <div className="p-6 bg-orange-50 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-bold mb-4 text-orange-600">Ingredients</h2>
            <div className="flex gap-2 mb-4 flex-wrap">
              <input
                type="number"
                placeholder="Amount"
                value={ingredientInput.amount}
                onChange={(e) => setIngredientInput({ ...ingredientInput, amount: e.target.value })}
                className="w-1/5 border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
              />
              <select
                value={ingredientInput.unit}
                onChange={(e) => setIngredientInput({ ...ingredientInput, unit: e.target.value })}
                className="w-1/4 border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
              >
                <option value="">Unit</option>
                {predefinedUnits.map((unit, i) => (
                  <option key={i} value={unit}>{unit}</option>
                ))}
                <option value="custom">Other</option>
              </select>
              {ingredientInput.unit === 'custom' && (
                <input
                  type="text"
                  placeholder="Custom Unit"
                  value={ingredientInput.customUnit}
                  onChange={(e) => setIngredientInput({ ...ingredientInput, customUnit: e.target.value })}
                  className="w-1/4 border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                />
              )}
              <input
                type="text"
                placeholder="Ingredient Name"
                value={ingredientInput.name}
                onChange={(e) => setIngredientInput({ ...ingredientInput, name: e.target.value })}
                className="w-1/3 border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
              />
              <button 
                type="button" 
                onClick={addIngredient} 
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                Add
              </button>
            </div>
            <ul className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="flex justify-between items-center bg-white px-4 py-2 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
                  <span>{ingredient}</span>
                  <button 
                    type="button" 
                    onClick={() => removeIngredient(index)} 
                    className="text-red-500 hover:text-red-600 transition-all duration-300 transform hover:scale-110 bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            {ingredients.length === 0 && <p className="text-sm text-orange-500 mt-2">Add at least one ingredient</p>}
          </div>
    
          {/* Steps */}
          <div className="p-6 bg-orange-50 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-bold mb-4 text-orange-600">Steps</h2>
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                placeholder="Step Description"
                value={stepInput.description}
                onChange={(e) => setStepInput({ ...stepInput, description: e.target.value })}
                className="w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
              />
              <textarea
                placeholder="Procedure"
                value={stepInput.procedure}
                onChange={(e) => setStepInput({ ...stepInput, procedure: e.target.value })}
                className="w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
              ></textarea>
              <button 
                type="button" 
                onClick={addStep} 
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md w-fit"
              >
                Add Step
              </button>
            </div>
            <ol className="space-y-3 list-decimal pl-5">
              {steps.map((step, index) => (
                <li key={index} className="bg-white px-4 py-3 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
                  <strong className="text-orange-600">Step {step.stepNumber}:</strong> {step.instruction}
                  <button 
                    type="button" 
                    onClick={() => removeStep(index)} 
                    className="text-red-500 hover:text-red-600 transition-all duration-300 transform hover:scale-110 bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center ml-2 float-right"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ol>
            {steps.length === 0 && <p className="text-sm text-orange-500 mt-2">Add at least one step</p>}
          </div>
    
          {/* Image Upload */}
          <div className="transition-all duration-300 transform hover:scale-[1.01]">
            <label className="block mb-2 font-medium text-gray-700">Dish Image</label>
            <div className="flex flex-col items-center space-y-4">
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="bg-orange-100 hover:bg-orange-200 text-orange-600 px-5 py-3 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {imageFile ? 'Change Image' : 'Upload Image'}
              </button>
              
              {imagePreview ? (
                <div className="mt-3 relative transition-all duration-300 transform hover:scale-[1.02]">
                  <img src={imagePreview} alt="Recipe preview" className="max-h-64 rounded-lg shadow-md" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center -mt-2 -mr-2 shadow-md transition-all duration-300 transform hover:scale-110"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-orange-200 rounded-lg p-10 text-center text-gray-400 transition-all duration-300 hover:border-orange-300 w-full">
                  No image selected
                </div>
              )}
              {!imageFile && <p className="text-sm text-orange-500">An image is required</p>}
            </div>
          </div>
    
          <button 
            type="submit" 
            className={`w-full py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg ${isSubmitting ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'} text-white font-medium`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Recipe'}
          </button>
        </form>
      </div>
    );
};

export default CreateRecipe;
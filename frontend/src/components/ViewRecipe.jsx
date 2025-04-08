import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ViewRecipe = () => {
  const { user } = useAuth();
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(state?.recipe || null);
  const [isLoading, setIsLoading] = useState(!state?.recipe);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // Fetch recipe if not passed through state
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!recipe && id) {
        try {
          setIsLoading(true);
          const response = await api.get(`/recipes/${id}`);
          setRecipe(response.data.data);
        } catch (error) {
          console.error('Error fetching recipe:', error);
          setError('Recipe not found or you do not have permission to view it.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchRecipe();
  }, [id, recipe]); 

  // Check if current user is the recipe owner
  useEffect(() => {
    if (user && recipe) {
      const userId = user.id || user._id;
      
      // Handle different possible recipe.user formats
      let recipeUserId;
      if (typeof recipe.user === 'object' && recipe.user !== null) {
        recipeUserId = recipe.user._id || recipe.user.id;
      } else {
        recipeUserId = recipe.user;
      }
      
      // Convert both to strings for comparison
      const isMatch = String(userId) === String(recipeUserId);
      console.log('User ID:', userId);
      console.log('Recipe User ID:', recipeUserId);
      console.log('Is Owner:', isMatch);
      
      setIsOwner(isMatch);
    } else {
      setIsOwner(false);
    }
  }, [user, recipe]);

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl text-red-700 mb-2">Error</h2>
        <p>{error || "Recipe not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { name, category, imagePath, description, ingredients, steps } = recipe;

  const handleEdit = () => {
    navigate(`/edit-recipe/${recipe._id}`, { state: { recipe } });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await api.delete(`/recipes/${recipe._id}`);
        alert('✅ Recipe deleted successfully.');
        navigate('/');
      } catch (error) {
        console.error('❌ Error deleting recipe:', error);
        alert('Failed to delete recipe. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Recipe image */}
        <img
          src={imagePath}
          alt={name}
          className="w-full h-64 sm:h-80 object-cover"
        />
        
        {/* Recipe content */}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{name}</h1>
              <p className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mb-4">
                {category}
              </p>
            </div>
            
            {/* Owner actions */}
            {isOwner && (
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <div className="my-4">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{description}</p>
          </div>
          
          <div className="my-6">
            <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
            <ul className="bg-gray-50 p-4 rounded-lg">
              {Array.isArray(ingredients) ? (
                ingredients.map((ingredient, index) => (
                  <li key={index} className="mb-1 flex items-start">
                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2 mt-1.5"></span>
                    {ingredient}
                  </li>
                ))
              ) : (
                <li className="mb-1">{ingredients}</li>
              )}
            </ul>
          </div>
          
          <div className="my-6">
            <h2 className="text-xl font-semibold mb-2">Steps</h2>
            <ol className="space-y-4">
              {steps.map((step) => (
                <li key={step._id || step.stepNumber} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-1">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold mr-2">
                      {step.stepNumber}
                    </span>
                    <span className="font-medium">{step.instruction}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded inline-flex items-center transition"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Recipes
      </button>
    </div>
  );
};

export default ViewRecipe;
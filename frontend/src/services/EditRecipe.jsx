import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../utils/api';

const EditRecipe = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(() => {
    const initialRecipe = state?.recipe || {};
    return {
      ...initialRecipe,
      ingredients: initialRecipe.ingredients?.map((ingredient) =>
        typeof ingredient === 'string'
          ? { amount: '', unit: '', name: ingredient } // Convert strings to objects
          : ingredient
      ) || [],
      steps: initialRecipe.steps || [],
    };
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(recipe.imagePath || '');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Predefined values
  const predefinedCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer', 'Salad', 'Beverage', 'Other'];
  const predefinedUnits = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'pinch'];

  useEffect(() => {
    if (!state?.recipe) {
      setError('No recipe data provided.');
    }
  }, [state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Ingredient handlers
  const addIngredient = () => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), { amount: '', unit: '', name: '' }],
    }));
  };

  const updateIngredient = (index, field, value) => {
    setRecipe((prev) => {
      const updatedIngredients = [...prev.ingredients];
      if (typeof updatedIngredients[index] !== 'object') {
        updatedIngredients[index] = { amount: '', unit: '', name: '' }; // Ensure it's an object
      }
      updatedIngredients[index][field] = value;
      return { ...prev, ingredients: updatedIngredients };
    });
  };

  const removeIngredient = (index) => {
    setRecipe((prev) => {
      const updatedIngredients = [...prev.ingredients];
      updatedIngredients.splice(index, 1);
      return { ...prev, ingredients: updatedIngredients };
    });
  };

  // Step handlers
  const addStep = () => {
    setRecipe((prev) => ({
      ...prev,
      steps: [...(prev.steps || []), { stepNumber: prev.steps.length + 1, instruction: '' }],
    }));
  };

  const updateStep = (index, value) => {
    setRecipe((prev) => {
      const updatedSteps = [...prev.steps];
      updatedSteps[index].instruction = value;
      return { ...prev, steps: updatedSteps };
    });
  };

  const removeStep = (index) => {
    setRecipe((prev) => {
      const updatedSteps = [...prev.steps];
      updatedSteps.splice(index, 1);
      return { ...prev, steps: updatedSteps.map((step, i) => ({ ...step, stepNumber: i + 1 })) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', recipe.name);
    formData.append('description', recipe.description);
    formData.append('category', recipe.category);

    // Convert ingredients to strings (e.g., "1 cup sugar")
    const formattedIngredients = recipe.ingredients.map(
      (ingredient) => `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`.trim()
    );
    formattedIngredients.forEach((ingredient, index) => {
      formData.append(`ingredients[${index}]`, ingredient); // Send as array
    });

    // Send steps as an array of objects
    recipe.steps.forEach((step, index) => {
      formData.append(`steps[${index}][stepNumber]`, step.stepNumber);
      formData.append(`steps[${index}][instruction]`, step.instruction);
    });

    if (image) {
      formData.append('image', image);
    }

    try {
      await api.put(`/recipes/${recipe._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Swal.fire('✅ Recipe updated successfully!', '', 'success');
      navigate('/');
    } catch (err) {
      console.error('❌ Error updating recipe:', err);
      Swal.fire('❌ Failed to update recipe', err.response?.data?.message || 'Please try again.', 'error');
    }
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">Edit Recipe</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={recipe.name || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            name="category"
            value={recipe.category || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Category</option>
            {predefinedCategories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={recipe.description || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Ingredients</label>
          {recipe.ingredients?.map((ingredient, index) => (
            <div key={index} className="flex items-center mb-2 gap-2">
              <input
                type="number"
                placeholder="Amount"
                value={ingredient.amount}
                onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                className="w-1/4 p-2 border rounded"
              />
              <select
                value={ingredient.unit}
                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                className="w-1/4 p-2 border rounded"
              >
                <option value="">Unit</option>
                {predefinedUnits.map((unit, i) => (
                  <option key={i} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Ingredient Name"
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                className="w-1/2 p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="text-blue-500"
          >
            Add Ingredient
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Steps</label>
          {recipe.steps?.map((step, index) => (
            <div key={index} className="flex items-center mb-2 gap-2">
              <textarea
                placeholder={`Step ${index + 1}`}
                value={step.instruction}
                onChange={(e) => updateStep(index, e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            className="text-blue-500"
          >
            Add Step
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Image</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="text-blue-500"
          >
            {image ? 'Change Image' : 'Upload Image'}
          </button>
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditRecipe;
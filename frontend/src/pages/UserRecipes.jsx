import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'; // Custom axios instance

const UserRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        const res = await api.get('/recipes/user'); // ✅ using api here
        setRecipes(res.data.recipes || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRecipes();
  }, []);

  if (loading) return <p>Loading recipes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Your Recipes</h1>
      {recipes.length === 0 ? (
        <p>You haven't created any recipes yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <div 
              key={recipe._id} 
              onClick={() => navigate('/view-recipe', { state: { recipe } })}
              className="border p-4 rounded shadow-md cursor-pointer hover:shadow-lg transition"
            >
              <img
                src={recipe.imagePath}
                alt={recipe.name}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <h2 className="text-lg font-semibold">{recipe.name}</h2>
              <p className="text-sm text-gray-600">{recipe.description}</p>
              <p className="text-xs text-gray-400 mt-1">{recipe.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserRecipes;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // For confirmation and alerts
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

  const handleDelete = async (recipeId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/recipes/${recipeId}`); // Call delete API
        setRecipes((prev) => prev.filter((recipe) => recipe._id !== recipeId)); // Remove from state
        Swal.fire('Deleted!', 'Your recipe has been deleted.', 'success');
      } catch (err) {
        console.error('Error deleting recipe:', err);
        Swal.fire('Error!', 'Failed to delete the recipe. Please try again.', 'error');
      }
    }
  };

  if (loading) return <p>Loading recipes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Your Recipes</h1>
      {recipes.length === 0 ? (
        <p>You haven&apos;t created any recipes yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <div 
              key={recipe._id} 
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
              <div className="flex justify-between mt-2">
                <button 
                  onClick={() => navigate('/view-recipe', { state: { recipe } })}
                  className="text-blue-500 hover:underline"
                >
                  View
                </button>
                <button 
                  onClick={() => navigate('/edit-recipe', { state: { recipe } })}
                  className="text-green-500 hover:underline"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(recipe._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserRecipes;

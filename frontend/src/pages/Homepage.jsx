import React from 'react';
import NavBar from '../components/NavBar'; // adjust path if needed
import { BookOpen, UploadCloud, Heart } from 'lucide-react'; // Lucide icons

const Homepage = () => {
  return (
    <div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-24 px-8 text-center text-white shadow-lg">
        <h1 className="text-5xl font-bold mb-6 animate-fadeIn">Welcome to DishCraft</h1>
        <p className="text-xl mb-8 opacity-90 max-w-xl mx-auto animate-slideUp">
          Discover amazing recipes and share your culinary creations with food lovers worldwide!
        </p>
        <a href="/register">
        <button className="bg-white text-orange-600 py-3 px-8 rounded-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-medium animate-bounce">
          Get Started
        </button>
        </a>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white text-gray-800 text-center">
        <h2 className="text-3xl font-semibold mb-12">Why DishCraft?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center">
            <BookOpen className="w-12 h-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Curated Recipes</h3>
            <p>Explore a wide range of delicious recipes handpicked by our community.</p>
          </div>
          <div className="p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center">
            <UploadCloud className="w-12 h-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Upload & Share</h3>
            <p>Share your own dishes and get feedback from food enthusiasts across the globe.</p>
          </div>
          <div className="p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center">
            <Heart className="w-12 h-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Save Favorites</h3>
            <p>Bookmark your favorite meals and access them anytime, anywhere.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-orange-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Join the DishCraft Community</h2>
        <p className="mb-6">Create, share, and connect with passionate foodies just like you.</p>
        <a href="/register">
        <button className="bg-white text-orange-600 py-3 px-8 rounded-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-medium">
          Sign Up Now
        </button>
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 text-center">
        <p>© 2025 DishCraft. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;
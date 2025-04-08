import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'

const NavBar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    alert('You have been logged out.');
    navigate('/login');
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg sticky top-0 z-50 transition-all duration-300">
      {/* Left side - Links */}
      <div className="flex space-x-8 items-center">
        <Link to="/" className="hover:text-orange-100 transition-all duration-300 font-medium">Home</Link>
        <Link to="/recipe-page" className="hover:text-orange-100 transition-all duration-300 font-medium">Recipes</Link>
        <Link to="/about" className="hover:text-orange-100 transition-all duration-300 font-medium">About</Link>
      </div>
  
      {/* Right side - Always visible */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/create-recipe" 
          className="bg-white text-orange-600 px-5 py-2 rounded-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md font-medium"
        >
          Create Recipe
        </Link>
  
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md font-medium border border-orange-300"
          >
            Account
          </button>
  
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 overflow-hidden animate-fadeIn">
              <Link to="/user-profile" className="block px-4 py-3 hover:bg-orange-50 text-gray-700 transition-all duration-200">User Profile</Link>
              <Link to="/user-recipe" className="block px-4 py-3 hover:bg-orange-50 text-gray-700 transition-all duration-200">Your Recipes</Link>
              <Link to="/edit" className="block px-4 py-3 hover:bg-orange-50 text-gray-700 transition-all duration-200">Edit Profile</Link>
              <Link to="/register" className="block px-4 py-3 hover:bg-orange-50 text-gray-700 transition-all duration-200">Register</Link>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-orange-50 text-gray-700 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

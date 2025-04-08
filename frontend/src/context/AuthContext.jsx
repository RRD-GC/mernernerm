import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing user data in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setCurrentUser(parsedData);
      
      // Set default authorization header for all future requests
      if (parsedData.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedData.token}`;
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
    
    // Set authorization header for future requests
    if (userData.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    }
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    currentUser,
    loading,
    error,
    setError, // Expose setError here
    login,
    logout,
    isAuthenticated: !!currentUser
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};


export const useAuth = () => {
  return useContext(AuthContext);
};
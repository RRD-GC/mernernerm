// OAuthSuccess.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  useEffect(() => {
    const token = searchParams.get('token');
    console.log("Token received on frontend:", token);
    
    if (token) {
      // Get user info using the token
      const fetchUserData = async () => {
        try {
          // Set the authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          console.log("Making request with headers:", {
            Authorization: `Bearer ${token}`
          });
          
          const response = await axios.get('http://localhost:5000/api/user/me');
          console.log("User data response:", response.data);
          
          // Store user data and token in context/localStorage
          login({
            token,
            user: response.data
          });
          
          // Redirect to home or dashboard
          navigate('/dashboard');
        } catch (error) {
          console.error('Failed to fetch user data:', error.response || error);
          navigate('/login', { 
            state: { error: `Authentication error: ${error.response?.data?.message || error.message}` } 
          });
        }
      };
      
      fetchUserData();
    } else {
      navigate('/login', { state: { error: 'No authentication token received' } });
    }
  }, [searchParams, login, navigate]);
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-pulse">
        <h2 className="text-2xl font-bold mb-4 text-center text-orange-600">
          Completing authentication...
        </h2>
      </div>
    </div>
  );
};

export default OAuthSuccess;
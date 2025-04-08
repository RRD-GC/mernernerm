import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profileImage: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = "Valid email is required";
    if (!formData.password || !passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters, contain an uppercase letter, a number, and a special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/user/register', formData);

      if (res.data && res.data.userId) {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => {
          navigate('/login');
        }, 1500); // Wait for 1.5 seconds before redirecting
      } else {
        setErrors({ api: res.data.message || 'Unknown error occurred' });
      }

    } catch (err) {
      // Handle Axios errors properly
      if (err.response) {
        if (err.response.status === 400) {
          setErrors({ api: err.response.data.message || 'Bad Request - Please check your inputs.' });
        } else if (err.response.status === 500) {
          setErrors({ api: 'Server error - please try again later.' });
        } else {
          setErrors({ api: err.response.data.message || `Error: ${err.response.status}` });
        }
      } else if (err.request) {
        setErrors({ api: 'No response from server. Please check your internet or try again later.' });
      } else {
        setErrors({ api: `Unexpected error: ${err.message}` });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      // You'll need to replace this URL with your actual Google OAuth endpoint
      window.location.href = 'http://localhost:5000/api/auth/google';
    } catch (error) {
      setErrors({ api: 'Failed to initialize Google Sign-In' });
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setLoading(true);
      // You'll need to replace this URL with your actual Facebook OAuth endpoint
      window.location.href = 'http://localhost:5000/api/auth/facebook';
    } catch (error) {
      setErrors({ api: 'Failed to initialize Facebook Sign-In' });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 shadow-2xl rounded-2xl bg-white mt-16 transition-all duration-300 hover:shadow-orange-100">
      <h2 className="text-2xl font-bold mb-6 text-center text-orange-600 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-1/2 after:w-16 after:h-1 after:bg-orange-400 after:rounded-full after:transform after:-translate-x-1/2">Register</h2>

      {success && <p className="text-green-600 mb-4 p-3 bg-green-50 rounded-lg animate-fadeIn">{success}</p>}
      {errors.api && <p className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg animate-fadeIn">{errors.api}</p>}

      {/* Social Login Buttons */}
      <div className="mb-6 space-y-3">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg bg-white border border-gray-300 text-gray-700 font-medium flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Register with Google
        </button>
        
        {/* <button
          onClick={handleFacebookSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg bg-[#1877F2] text-white font-medium flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24">
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
          </svg>
          Register with Facebook
        </button> */}
      </div>

      <div className="relative flex items-center justify-center my-6">
        <div className="border-t border-gray-300 absolute w-full"></div>
        <div className="bg-white px-4 relative z-10 text-sm text-gray-500">or register with email</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="transition-all duration-300 transform hover:scale-[1.01]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 ${errors.name ? 'border-red-500' : 'border-gray-200'}`} 
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="transition-all duration-300 transform hover:scale-[1.01]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 ${errors.email ? 'border-red-500' : 'border-gray-200'}`} 
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="transition-all duration-300 transform hover:scale-[1.01]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 ${errors.password ? 'border-red-500' : 'border-gray-200'}`} 
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div className="transition-all duration-300 transform hover:scale-[1.01]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL (Optional)</label>
          <input 
            type="text" 
            name="profileImage" 
            value={formData.profileImage} 
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300" 
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'} text-white font-medium`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-orange-600 hover:text-orange-700 transition-all duration-300 font-medium">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;
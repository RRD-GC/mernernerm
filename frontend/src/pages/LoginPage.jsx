import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import GoogleLoginButton from '../components/GoogleLoginButton';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Check for error messages passed from OAuth redirect
  useEffect(() => {
    if (location.state?.error) {
      setErrors({ api: location.state.error });
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
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
    if (!validateForm()) return;
  
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/user/login', formData);
      setSuccess('Login successful!');
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/');
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 shadow-2xl rounded-2xl bg-white mt-16 transition-all duration-300 hover:shadow-orange-100">
      <h2 className="text-2xl font-bold mb-6 text-center text-orange-600 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-1/2 after:w-16 after:h-1 after:bg-orange-400 after:rounded-full after:transform after:-translate-x-1/2">Login</h2>
  
      {success && <p className="text-green-600 mb-4 p-3 bg-green-50 rounded-lg animate-fadeIn">{success}</p>}
      {errors.api && <p className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg animate-fadeIn">{errors.api}</p>}
      
      {/* Google Login Button */}
      <GoogleLoginButton />
      
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="px-3 text-gray-500 text-sm">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
  
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="transition-all duration-300 transform hover:scale-[1.01]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300" 
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
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300" 
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>
  
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg ${loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'} text-white font-medium`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
  
      {/* Redirect to Register */}
      <p className="mt-6 text-sm text-center text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-orange-600 hover:text-orange-700 transition-all duration-300 font-medium">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Home, ChevronDown, UserCircle } from 'lucide-react';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    type: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  const types = [
    { value: 'Patient', label: 'Patient' },
    { value: 'Doctor', label: 'Doctor' },
    { value: 'Hospital', label: 'Hospital' },
    { value: 'Labs', label: 'Labs' }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.password || !formData.confirmPassword || !formData.type) {
      alert('Please fill in all fields!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.username,
          email: formData.username + '@medicarehub.com', // Generate email from username
          password: formData.password,
          role: formData.type
        })
      });

      const result = await response.json();

      if (result.success) {
        sessionStorage.setItem('userData', JSON.stringify(result.user));
        //alert(`Account created successfully as ${formData.type}!`);
        navigate('/success');
      } else {
        alert(`Registration failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Cannot connect to server. Please make sure backend is running.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <div className="text-center mb-8 mt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <User className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-600 mt-2">Join our healthcare platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-transparent"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-transparent"
                placeholder="Min. 6 characters"
                required
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-transparent"
                placeholder="Re-enter password"
                required
              />
            </div>
          </div>

          {/* Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Register As
            </label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:border-transparent appearance-none bg-white"
                required
              >
                <option value="">Select your type</option>
                {types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-200 disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Submit'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
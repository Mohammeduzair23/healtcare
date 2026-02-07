import { useState, useEffect } from 'react';
import { X, User, AlertCircle, Building2 } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

/**
 * REUSABLE Profile Modal - Works for both Patient and Doctor
 * 
 * Patient fields: Name, Age, Gender, Date of Birth
 * Doctor fields: Name, Age, Gender, Date of Birth, Hospital Name
 */

function ProfileModal({ show, userId, userRole, onClose, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    dateOfBirth: '',
    hospitalName: ''
  });

  useEffect(() => {
    if (show && userId) {
      fetchUserData();
    }
  }, [show, userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/user/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        const user = result.user;
        setFormData({
          name: user.name || '',
          age: user.age || '',
          gender: user.gender || '',
          dateOfBirth: user.dateOfBirth || '',
          hospitalName: user.hospitalName || ''
        });
        setIsProfileComplete(result.isProfileComplete || false);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      onError('Name is required');
      return;
    }
    
    if (!formData.age || formData.age < 1 || formData.age > 150) {
      onError('Please enter a valid age');
      return;
    }
    
    if (!formData.gender) {
      onError('Please select a gender');
      return;
    }
    
    if (!formData.dateOfBirth) {
      onError('Date of birth is required');
      return;
    }
    
    // Doctor-specific validation
    if (userRole === 'Doctor' && !formData.hospitalName.trim()) {
      onError('Hospital name is required for doctors');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/user/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update session storage with new user data
        const storedData = sessionStorage.getItem('userData');
        if (storedData) {
          const userData = JSON.parse(storedData);
          const updatedUser = {
            ...userData,
            ...formData
          };
          sessionStorage.setItem('userData', JSON.stringify(updatedUser));
        }
        onSuccess('Profile updated successfully!');
        onClose();
      } else {
        onError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      onError('Server error');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const isDoctor = userRole === 'Doctor';
  const isIncomplete = !isProfileComplete;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${isDoctor ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-purple-600 to-purple-700'} text-white px-6 py-4 flex justify-between items-center rounded-t-xl`}>
          <div className="flex items-center gap-3">
            {isDoctor ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
            <div>
              <h3 className="text-lg font-bold">
                {isDoctor ? 'Doctor Profile' : 'Patient Profile'}
              </h3>
              <p className="text-sm text-blue-100">
                {isIncomplete ? 'Complete your profile' : 'Update your information'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={`${isDoctor ? 'hover:bg-blue-800' : 'hover:bg-purple-800'} rounded-full p-2 transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Incomplete Profile Warning */}
        {isIncomplete && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 m-6 mb-0">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-800">Profile Incomplete</p>
                <p className="text-xs text-orange-700 mt-1">
                  Please fill in all fields to complete your profile
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
            
            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your age"
                min="1"
                max="150"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Hospital Name - ONLY FOR DOCTORS */}
            {isDoctor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="In which hospital are you working?"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the name of the hospital or clinic where you practice
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 px-6 py-2 ${isDoctor ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400`}
          >
            {loading ? 'Saving...' : (isIncomplete ? 'Complete Profile' : 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
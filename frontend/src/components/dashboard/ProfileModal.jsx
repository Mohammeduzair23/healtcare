import { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

/**
 * Profile Modal - ONLY Basic Info
 * - Name
 * - Age
 * - Gender
 * - Date of Birth
 */

function ProfileModal({ show, userId, onClose, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    dateOfBirth: ''
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
          dateOfBirth: user.dateOfBirth || ''
        });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/user/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-bold">Edit Profile</h3>
              <p className="text-sm text-purple-100">Update basic information</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-purple-800 rounded-full p-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
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
            className="flex-1 px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
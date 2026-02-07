import { useState, useEffect } from 'react';
import { LogOut, User, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

function DashboardLayout({ userData, onLogout, onOpenProfile, children }) {
  const[isProfileComplete, setIsProfileComplete] = useState(true);

  useEffect(() => {
    if (userData?.id) {
      checkProfileCompleteness();
    }
  }, [userData]);

  const checkProfileCompleteness = async () => {
    try {
      const response = await fetch(`${API_URL}/user/${userData.id}`);
      const result = await response.json;

      if (result.success) {
        setIsProfileComplete(result.isProfileComplete || false);
      }
    } catch (err) {
      console.error('Error checking profile completeness:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-800">
              {userData.role} Dashboard
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Profile Button with Complete/Incomplete Indicator */}
              <button
                onClick={onOpenProfile}
                className="relative flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors group"
                title={isProfileComplete ? "View Profile" : "Complete your profile"}
              >
                <div className="relative">
                  <User className="w-5 h-5 text-gray-600" />
                  {/* Profile Status Indicator */}
                  {!isProfileComplete && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {userData.name}
                </span>
                
                {/* Tooltip for incomplete profile */}
                {!isProfileComplete && (
                  <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-50">
                    <div className="bg-orange-500 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Complete your profile</span>
                      </div>
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-orange-500 transform rotate-45"></div>
                    </div>
                  </div>
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Incomplete Profile Banner - Shows at top of content */}
      {!isProfileComplete && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Your profile is incomplete</p>
                  <p className="text-sm text-orange-100">
                    Please complete your profile to get the full experience
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenProfile}
                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Complete Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function SuccessPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from sessionStorage
    const data = sessionStorage.getItem('userData');
    if (!data) {
      // If no user data, redirect to login
      navigate('/');
      return;
    }
    const user = JSON.parse(data);
    setUserData(user);

    // Auto redirect to dashboard after 2 seconds
    /*const timer = setTimeout(() => {
      if (user.role === 'Patient') {
        navigate('/patient-dashboard', {replace: true});
      } else if (user.role === 'Doctor') {
        alert('Doctor dashboard coming soon!');
      } else if (user.role === 'Administrator') {
        alert('Admin dashboard coming soon!');
      }
    },);*/


    return () => clearTimeout(true);
  }, [navigate]);

  const handleGoToDashboard = () => {
    if (userData.role === 'Patient') {
      navigate('/patient-dashboard');
    } else if (userData.role === 'Doctor') {
      navigate('/doctor-dashboard');
    } 
    else {
      alert(`${userData.role} dashboard coming soon!`);
    }
  };

  if (!userData) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Success!</h1>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-gray-600 mb-4">
            {userData.role 
              ? `Your account has been created successfully!`
              : 'You have successfully logged in!'}
          </p>
          
          <div className="text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold text-gray-800">{userData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold text-gray-800">{userData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="font-semibold text-green-600">{userData.role}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
        
          {/*<Link to="/patient-dashboard" 
            className="w-full bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200"
            >Go to Dashboard
          </Link>*/}
          {(userData?.role === "Patient" || userData.role === "Doctor") ? (
            <button
              onClick={handleGoToDashboard}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200"
            >
              Go to Dashboard
            </button>
          ) : (
            <Link to="/" 
            className="w-full bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200"
            >Go to Home, {userData.role} Not Ready Yet
          </Link>
          )}
          
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;
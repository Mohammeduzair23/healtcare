import { useState, useEffect } from 'react';
import { Activity, Heart, Pill, AlertCircle, Search, X as CloseIcon } from 'lucide-react';
import PatientAccessModal from './PatientAccessModal';

/**
 * Complete PatientOverview with Passkey System
 * - Empty by default
 * - "View Patient" button opens passkey modal
 * - Shows patient data after passkey verification
 * - Displays medications and allergies (no hardcoded vitals)
 */

function PatientOverview({ loading, onViewFullRecord, doctorId }) {
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [notification, setNotification] = useState(null);

  // Listen for successful passkey verification
  useEffect(() => {
    const handleAccessGranted = (event) => {
      console.log('✅ Access granted, patient data:', event.detail);
      setCurrentPatient(event.detail);
    };

    window.addEventListener('patientAccessGranted', handleAccessGranted);
    return () => window.removeEventListener('patientAccessGranted', handleAccessGranted);
  }, []);

  const handleClearPatient = () => {
    setCurrentPatient(null);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Empty state - no patient selected
  if (!currentPatient && !loading) {
    return (
      <>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Overview</h2>
          
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-4 text-center">
              No patient selected
            </p>
            <p className="text-xs text-gray-400 mb-6 text-center max-w-xs">
              Search for a patient by email and request secure access to their medical records
            </p>
            
            <button 
              onClick={() => setShowAccessModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              View Patient Records
            </button>
          </div>
        </div>

        {/* Passkey Modal */}
        <PatientAccessModal
          show={showAccessModal}
          doctorId={doctorId}
          onClose={() => setShowAccessModal(false)}
          onSuccess={(msg) => showNotification('success', msg)}
          onError={(msg) => showNotification('error', msg)}
        />

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-lg shadow-lg p-4 ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </div>
        )}
      </>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Overview</h2>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Patient data view
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Patient Overview</h2>
        <button
          onClick={handleClearPatient}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          title="Clear patient view"
        >
          <CloseIcon className="w-3 h-3" />
          Clear
        </button>
      </div>
      
      {/* Patient Header */}
      <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {currentPatient.photo ? (
            <img 
              src={currentPatient.photo} 
              alt={currentPatient.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-gray-400">
              {currentPatient.name?.charAt(0) || '?'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {currentPatient.name || 'Unknown Patient'}
            {currentPatient.age && (
              <span className="text-gray-600 font-normal">, Age: {currentPatient.age}</span>
            )}
          </h3>
          {currentPatient.condition && (
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Condition:</span> {currentPatient.condition}
            </p>
          )}
          {currentPatient.lastVisit && (
            <p className="text-xs text-gray-500">
              Last Visit: {formatDate(currentPatient.lastVisit)}
            </p>
          )}
        </div>
      </div>

      {/* Medications & Allergies */}
      <div className="mb-6 space-y-3">
        {/* Medications */}
        {currentPatient.medications && currentPatient.medications.length > 0 && (
          <div className="flex items-start gap-2">
            <Pill className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-gray-700 block mb-1">Medications:</span>
              <span className="text-sm text-gray-600">
                {Array.isArray(currentPatient.medications) 
                  ? currentPatient.medications.join(', ')
                  : currentPatient.medications}
              </span>
            </div>
          </div>
        )}

        {/* Allergies */}
        {currentPatient.allergies && currentPatient.allergies.length > 0 && (
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-gray-700 block mb-1">Allergies:</span>
              <span className="text-sm text-red-600 font-medium">
                {Array.isArray(currentPatient.allergies)
                  ? currentPatient.allergies.join(', ')
                  : currentPatient.allergies}
              </span>
            </div>
          </div>
        )}

        {/* No medications or allergies */}
        {(!currentPatient.medications || currentPatient.medications.length === 0) && 
         (!currentPatient.allergies || currentPatient.allergies.length === 0) && (
          <p className="text-sm text-gray-500 italic text-center py-4">
            No medications or allergies recorded
          </p>
        )}
      </div>

      {/* View Full Record Button */}
      <button 
        onClick={() => onViewFullRecord && onViewFullRecord(currentPatient.id)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
      >
        View Full Medical Record
      </button>
    </div>
  );
}

// Helper function to format date
function formatDate(dateValue) {
  if (!dateValue) return 'Never';
  try {
    if (Array.isArray(dateValue)) {
      const [year, month, day] = dateValue;
      return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return new Date(dateValue).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Unknown';
  }
}

export default PatientOverview;
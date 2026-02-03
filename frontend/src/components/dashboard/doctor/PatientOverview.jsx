import { Activity, Heart, Pill, AlertCircle, Search } from 'lucide-react';

/**
 * FIXED PatientOverview Component
 * - Fixed onViewFullRecord error
 * - Shows empty state by default
 * - Has "View Patient" button for future passkey system
 */

function PatientOverview({ patient, loading, onViewFullRecord }) {
  
  // Empty state when no patient selected
  if (!patient && !loading) {
    return (
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
            Click "View Patient" to search for a patient by email and request access to their records
          </p>
          
          {/* Future: This will open passkey modal */}
          <button 
            onClick={() => {
              // TODO: Open patient access modal (passkey system)
              alert('Patient access system coming soon!\nDoctor will:\n1. Enter patient email\n2. System generates 5-char code\n3. Patient receives code\n4. Doctor enters code to view records');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            View Patient Records
          </button>
        </div>
      </div>
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
        {/* Clear button to go back to empty state */}
        <button
          onClick={() => window.location.reload()}  // Temporary - will be improved
          className="text-xs text-gray-500 hover:text-gray-700"
          title="Clear patient view"
        >
          ✕ Clear
        </button>
      </div>
      
      {/* Patient Header */}
      <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {patient.photo ? (
            <img 
              src={patient.photo} 
              alt={patient.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-gray-400">
              {patient.name?.charAt(0) || '?'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {patient.name}
            {patient.age && <span className="text-gray-600 font-normal">, Age: {patient.age}</span>}
          </h3>
          {patient.condition && (
            <p className="text-sm text-gray-600 mb-1">Condition: {patient.condition}</p>
          )}
          {patient.lastVisit && (
            <p className="text-xs text-gray-500">Last Visit: {patient.lastVisit}</p>
          )}
        </div>
      </div>

      {/* Medications & Allergies */}
      <div className="mb-6 space-y-3">
        {(patient.medications && patient.medications.length > 0) && (
          <div className="flex items-start gap-2">
            <Pill className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-gray-700 block mb-1">Medications:</span>
              <span className="text-sm text-gray-600">{patient.medications.join(', ')}</span>
            </div>
          </div>
        )}
        {(patient.allergies && patient.allergies.length > 0) && (
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-gray-700 block mb-1">Allergies:</span>
              <span className="text-sm text-red-600 font-medium">{patient.allergies.join(', ')}</span>
            </div>
          </div>
        )}
        {(!patient.medications || patient.medications.length === 0) && (!patient.allergies || patient.allergies.length === 0) && (
          <p className="text-sm text-gray-500 italic text-center py-4">
            No medications or allergies recorded
          </p>
        )}
      </div>

      {/* View Full Record Button */}
      <button 
        onClick={() => onViewFullRecord && onViewFullRecord(patient.id)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
      >
        View Full Record
      </button>
    </div>
  );
}

export default PatientOverview;
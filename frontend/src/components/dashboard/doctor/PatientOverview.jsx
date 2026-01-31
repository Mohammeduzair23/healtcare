import { Activity, Heart, Pill, AlertCircle } from 'lucide-react';

function PatientOverview({ patient, loading }) {
  if (loading || !patient) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Overview</h2>
        <div className="flex justify-center py-8">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          ) : (
            <p className="text-sm text-gray-500">No patient selected</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Overview</h2>
      
      {/* Patient Header */}
      <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
          <img 
            src={patient.photo || '/api/placeholder/64/64'} 
            alt={patient.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{patient.name}, <span className="text-gray-600 font-normal">Age: {patient.age}</span></h3>
          <p className="text-sm text-gray-600 mb-1">Condition: {patient.condition}</p>
          <p className="text-xs text-gray-500">Last Visit: {patient.lastVisit}</p>
        </div>
      </div>

      {/* Medications & Allergies */}
      <div className="mb-6 space-y-3">
        <div className="flex items-start gap-2">
          <Pill className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-gray-700 block mb-1">Medications:</span>
            <span className="text-sm text-gray-600">{patient.medications?.join(', ') || 'None'}</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-gray-700 block mb-1">Allergies:</span>
            <span className="text-sm text-gray-600">{patient.allergies?.join(', ') || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Vitals */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-600 mb-2">Blood Pressure</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{patient.bloodPressure?.systolic || '--'}</span>
            <span className="text-lg text-gray-600">/</span>
            <span className="text-2xl font-bold text-gray-900">{patient.bloodPressure?.diastolic || '--'}</span>
            <span className="text-xs text-gray-500 ml-1">mmHg</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
            Heart Rate
            <Activity className="w-3 h-3" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{patient.heartRate || '--'}</span>
            <span className="text-xs text-gray-500">bpm</span>
          </div>
        </div>
      </div>

      {/* View Full Record Button */}
      <button 
      onClick={() => onViewFullRecord && onViewFullRecord(patient.id)}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors">
        View Full Record
      </button>
    </div>
  );
}

export default PatientOverview;
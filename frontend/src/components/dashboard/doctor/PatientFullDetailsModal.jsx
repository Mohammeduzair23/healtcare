import { useState, useEffect } from 'react';
import { X, User, FileText, Pill, TestTube, Calendar, Activity } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

function PatientFullDetailsModal({ show, doctorId, patientId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (show && patientId) {
      fetchFullDetails();
    }
  }, [show, patientId]);

  const fetchFullDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/doctor/${doctorId}/patient/${patientId}/full-details`);
      const result = await response.json();
      
      if (result.success) {
        setPatientData(result.patient);
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">Patient Full Record</h3>
              <p className="text-sm text-blue-100">
                {patientData?.name || 'Loading...'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-3 px-4 border-b-2 font-medium transition ${
                    activeTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  className={`py-3 px-4 border-b-2 font-medium transition flex items-center gap-2 ${
                    activeTab === 'records'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Medical Records ({patientData?.medicalRecordsCount || 0})
                </button>
                <button
                  onClick={() => setActiveTab('prescriptions')}
                  className={`py-3 px-4 border-b-2 font-medium transition flex items-center gap-2 ${
                    activeTab === 'prescriptions'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Pill className="w-4 h-4" />
                  Prescriptions ({patientData?.prescriptionsCount || 0})
                </button>
                <button
                  onClick={() => setActiveTab('labs')}
                  className={`py-3 px-4 border-b-2 font-medium transition flex items-center gap-2 ${
                    activeTab === 'labs'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TestTube className="w-4 h-4" />
                  Lab Results ({patientData?.labResultsCount || 0})
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`py-3 px-4 border-b-2 font-medium transition flex items-center gap-2 ${
                    activeTab === 'appointments'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Appointments ({patientData?.appointmentsCount || 0})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-4">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Patient ID</p>
                        <p className="font-medium">{patientData?.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{patientData?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="font-medium">{patientData?.age || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Visit</p>
                        <p className="font-medium">{patientData?.lastVisit || 'Never'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-2">Current Condition</h4>
                    <p className="text-gray-700">{patientData?.condition || 'Not specified'}</p>
                  </div>

                  {/* Medications */}
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Pill className="w-5 h-5" />
                      Current Medications
                    </h4>
                    {patientData?.medications && patientData.medications.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {patientData.medications.map((med, idx) => (
                          <li key={idx} className="text-gray-700">{med}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">No medications recorded</p>
                    )}
                  </div>

                  {/* Allergies */}
                  <div className="bg-red-50 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Allergies
                    </h4>
                    {patientData?.allergies && patientData.allergies.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {patientData.allergies.map((allergy, idx) => (
                          <li key={idx} className="text-red-700 font-medium">{allergy}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">No known allergies</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'records' && (
                <div className="space-y-4">
                  {patientData?.medicalRecords && patientData.medicalRecords.length > 0 ? (
                    patientData.medicalRecords.map((record) => (
                      <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold">{record.recordType || 'Medical Record'}</h5>
                          <span className="text-sm text-gray-500">{record.recordDate}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Hospital:</strong> {record.hospital}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Doctor:</strong> {record.doctorName}
                        </p>
                        <p className="text-sm text-gray-700">{record.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No medical records found</p>
                  )}
                </div>
              )}

              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  {patientData?.prescriptions && patientData.prescriptions.length > 0 ? (
                    patientData.prescriptions.map((prescription) => (
                      <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold">{prescription.medicineName}</h5>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            prescription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {prescription.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Instructions:</strong> {prescription.instructions}
                        </p>
                        <p className="text-sm text-gray-500">
                          Prescribed on: {prescription.prescriptionDate}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No prescriptions found</p>
                  )}
                </div>
              )}

              {activeTab === 'labs' && (
                <div className="space-y-4">
                  {patientData?.labResults && patientData.labResults.length > 0 ? (
                    patientData.labResults.map((lab) => (
                      <div key={lab.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold">{lab.report || 'Lab Test'}</h5>
                          <span className="text-sm text-gray-500">{lab.labResultDate}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Hospital:</strong> {lab.hospitalName}
                        </p>
                        <p className="text-sm text-gray-700">{lab.instructions}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No lab results found</p>
                  )}
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  {patientData?.appointments && patientData.appointments.length > 0 ? (
                    patientData.appointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold">{appointment.type}</h5>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            appointment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Date:</strong> {appointment.appointmentDate} at {appointment.appointmentTime}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Reason:</strong> {appointment.reason}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No appointments found</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <button
                onClick={onClose}
                className="w-full md:w-auto px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PatientFullDetailsModal;
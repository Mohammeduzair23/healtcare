import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Pill, TestTube, Calendar } from 'lucide-react';

// Import components
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardCards from '../components/dashboard/DashboardCards';
import UnifiedRecordCard from '../components/dashboard/UnifiedRecordCard';
import RecordSection from '../components/dashboard/RecordSection';
import AppointmentCard from '../components/dashboard/AppointmentCard';
import Notification from '../components/common/Notification';

// Import UNIFIED modal with constants
import UnifiedRecordModal, { RECORD_TYPES, MODES } from '../components/dashboard/UnifiedRecordModal';
import AppointmentRequestModal from '../components/dashboard/AppointmentRequestModal';

function PatientDashboard() {
  const navigate = useNavigate();

  // States
  const [userData, setUserData] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  // Single unified modal state
  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: MODES.ADD,
    type: null,
    recordId: null,
    existingData: null
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  // ============================================
  // MODAL HELPER FUNCTIONS
  // ============================================
  
  const openAddModal = (type) => {
    setModalConfig({
      show: true,
      mode: MODES.ADD,
      type: type,
      recordId: null,
      existingData: null
    });
  };

  const openEditModal = (type, record) => {
    setModalConfig({
      show: true,
      mode: MODES.EDIT,
      type: type,
      recordId: record.id,
      existingData: record
    });
  };

  const closeModal = () => {
    setModalConfig({
      show: false,
      mode: MODES.ADD,
      type: null,
      recordId: null,
      existingData: null
    });
  };

  // ============================================
  // NOTIFICATION HELPER
  // ============================================
  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  // ============================================
  // AUTH CHECK
  // ============================================
  useEffect(() => {
    const data = sessionStorage.getItem('userData');
    if (!data) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(data);

    if (user.role !== 'Patient') {
      showNotification('error', 'Access denied. This page is for patients only.');
      setTimeout(() => navigate('/success'), 2000);
      return;
    }

    setUserData(user);
    fetchPatientData(user.id);
  }, [navigate]);

  // ============================================
  // FETCH DATA
  // ============================================
  const fetchPatientData = async (patientId) => {
    setLoading(true);
    try {
      // Fetch Medical Records
      let recordsData = { records: [] };
      try {
        const recordsRes = await fetch(`${API_URL}/patient/${patientId}/medical/records`);
        if (recordsRes.ok) {
          recordsData = await recordsRes.json();
          console.log('📋 Medical Records (unified):', recordsData);
        }
      } catch {
        const recordsRes = await fetch(`${API_URL}/patient/${patientId}/records/Medical Record`);
        if (recordsRes.ok) {
          recordsData = await recordsRes.json();
          console.log('📋 Medical Records (old):', recordsData);
        }
      }
      setMedicalRecords(recordsData.records || []);

      // Fetch Prescriptions
      let prescriptionsData = { records: [] };
      try {
        const prescriptionsRes = await fetch(`${API_URL}/patient/${patientId}/prescription/records`);
        if (prescriptionsRes.ok) {
          prescriptionsData = await prescriptionsRes.json();
          console.log('💊 Prescriptions (unified):', prescriptionsData);
        }
      } catch {
        const prescriptionsRes = await fetch(`${API_URL}/patient/${patientId}/prescriptions`);
        if (prescriptionsRes.ok) {
          prescriptionsData = await prescriptionsRes.json();
          console.log('💊 Prescriptions (old):', prescriptionsData);
        }
      }
      const prescriptionsList = prescriptionsData.records || 
                               prescriptionsData.prescriptions || 
                               prescriptionsData.data || 
                               [];
      setPrescriptions(prescriptionsList);

      // Fetch Lab Results
      let labData = { records: [] };
      try {
        const labRes = await fetch(`${API_URL}/patient/${patientId}/lab/records`);
        if (labRes.ok) {
          labData = await labRes.json();
          console.log('🧪 Lab Results (unified):', labData);
        }
      } catch {
        const labRes = await fetch(`${API_URL}/patient/${patientId}/lab-results`);
        if (labRes.ok) {
          labData = await labRes.json();
          console.log('🧪 Lab Results (old):', labData);
        }
      }
      const labsList = labData.records || 
                       labData.results || 
                       labData.data || 
                       [];
      setLabResults(labsList);

       // Fetch Appointments
      try {
        const appointmentsRes = await fetch(`${API_URL}/patient/${patientId}/appointments`);
        if (appointmentsRes.ok) {
          const appointmentsData = await appointmentsRes.json();
          setAppointments(appointmentsData.appointments || []);
          console.log('📅 Appointments:', appointmentsData);
        }
      } catch (err) {
        console.error('⚠️ Appointments fetch error:', err);
      }

    } catch (err) {
      console.error('❌ Fetch error:', err);
      showNotification('error', 'Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOGOUT
  // ============================================
  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      sessionStorage.clear();
      navigate('/');
    }, 1000);
  };

  // ============================================
  // SUCCESS/ERROR HANDLERS
  // ============================================
  const handleSuccess = (message) => {
    showNotification('success', message);
    fetchPatientData(userData.id);
    closeModal();
  };

  const handleError = (message) => {
    showNotification('error', message);
  };

  // ============================================
  // UNIFIED EDIT HANDLER
  // ============================================
  const handleEdit = (type, record) => {
    openEditModal(type, record);
  };

  // ============================================
  // UNIFIED DELETE HANDLER
  // ============================================
  const handleDelete = async (type, recordId) => {
    console.log(`🗑️ Deleting ${type} record:`, recordId);

    try {
      const response = await fetch(`${API_URL}/${type}/records/${recordId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      console.log('📥 Delete response:', result);

      if (response.ok && result.success) {
        const recordTypeName = type === 'medical' ? 'Medical record' :
                              type === 'prescription' ? 'Prescription' :
                              'Lab result';
        showNotification('success', `${recordTypeName} deleted successfully!`);
        await fetchPatientData(userData.id);
      } else {
        showNotification('error', result.error || 'Failed to delete record');
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      showNotification('error', 'Server error during deletion.');
    }
  };

  // ============================================
  // LOADING STATES
  // ============================================
  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-800">Logging out...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <DashboardLayout userData={userData} onLogout={handleLogout}>
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}

      {/* Dashboard View */}
      {activeSection === 'dashboard' && (
        <DashboardCards
          medicalRecordsCount={medicalRecords.length}
          appointmentsCount={appointments.length}
          prescriptionsCount={prescriptions.length}
          labResultsCount={labResults.length}
          onNavigate={setActiveSection}
          onNotification={showNotification}
          onRequestAppointment={() => setShowAppointmentModal(true)}
        />
      )}

      {/* Medical Records Section */}
      {activeSection === 'records' && (
        <RecordSection
          title="Medical Records"
          loading={loading}
          records={medicalRecords}
          onAdd={() => openAddModal(RECORD_TYPES.MEDICAL)}
          onBack={() => setActiveSection('dashboard')}
          emptyIcon={FileText}
          emptyMessage="No medical records found"
          renderRecord={(record) => (
            <UnifiedRecordCard 
              key={record.id}
              type="medical"
              record={record}
              onEdit={(rec) => handleEdit(RECORD_TYPES.MEDICAL, rec)}
              onDelete={(id) => handleDelete(RECORD_TYPES.MEDICAL, id)}
            />
          )}
        />
      )}

      {/* Prescriptions Section */}
      {activeSection === 'prescriptions' && (
        <RecordSection
          title="Prescriptions"
          loading={loading}
          records={prescriptions}
          onAdd={() => openAddModal(RECORD_TYPES.PRESCRIPTION)}
          onBack={() => setActiveSection('dashboard')}
          emptyIcon={Pill}
          emptyMessage="No prescriptions found"
          renderRecord={(record) => (
            <UnifiedRecordCard 
              key={record.id}
              type="prescription"
              record={record}
              onEdit={(rec) => handleEdit(RECORD_TYPES.PRESCRIPTION, rec)}
              onDelete={(id) => handleDelete(RECORD_TYPES.PRESCRIPTION, id)}
            />
          )}
        />
      )}

      {/* Lab Results Section */}
      {activeSection === 'lab' && (
        <RecordSection
          title="Lab Results"
          loading={loading}
          records={labResults}
          onAdd={() => openAddModal(RECORD_TYPES.LAB)}
          onBack={() => setActiveSection('dashboard')}
          emptyIcon={TestTube}
          emptyMessage="No lab results found"
          renderRecord={(record) => (
            <UnifiedRecordCard 
              key={record.id}
              type="lab"
              record={record}
              onEdit={(rec) => handleEdit(RECORD_TYPES.LAB, rec)}
              onDelete={(id) => handleDelete(RECORD_TYPES.LAB, id)}
            />
          )}
        />
      )}

      {/* Appointments Section */}
      {activeSection === 'appointments' && (
        <RecordSection
          title="My Appointments"
          loading={loading}
          records={appointments}
          onAdd={() => setShowAppointmentModal(true)}
          onBack={() => setActiveSection('dashboard')}
          emptyIcon={Calendar}
          emptyMessage="No appointments found"
          addButtonText="Book Appointment"
          renderRecord={(appointment) => (
            <AppointmentCard 
              key={appointment.id}
              appointment={appointment}
            />
          )}
        />
      )}

      {/* SINGLE UNIFIED MODAL */}
      <UnifiedRecordModal
        show={modalConfig.show}
        mode={modalConfig.mode}
        type={modalConfig.type}
        patientId={userData?.id}
        recordId={modalConfig.recordId}
        existingData={modalConfig.existingData}
        onClose={closeModal}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      {/* APPOINTMENT REQUEST MODAL */}
      <AppointmentRequestModal
        show={showAppointmentModal}
        patientId={userData?.id}
        onClose={() => setShowAppointmentModal(false)}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </DashboardLayout>
  );
}

export default PatientDashboard;
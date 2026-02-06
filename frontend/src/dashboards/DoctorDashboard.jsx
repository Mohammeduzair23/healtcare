import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, TestTube, ClipboardList } from 'lucide-react';

// Import reusable components
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Notification from '../components/common/Notification';

// Import doctor-specific components
import DoctorStatsCards from '../components/dashboard/doctor/DoctorStatsCards';
import AppointmentsList from '../components/dashboard/doctor/AppointmentsList';
import PatientOverview from '../components/dashboard/doctor/PatientOverview';
import TaskList from '../components/dashboard/doctor/TaskList';
import RecentLabResults from '../components/dashboard/doctor/RecentLabResults';
import PatientFullDetailsModal from '../components/dashboard/doctor/PatientFullDetailsModal';

function DoctorDashboard() {
  const navigate = useNavigate();

  // States
  const [userData, setUserData] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Doctor-specific data states
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [newPatients, setNewPatients] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [showFullDetailsModal, setShowFullDetailsModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const API_URL = 'http://localhost:8080/api';

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

    if (user.role !== 'Doctor') {
      showNotification('error', 'Access denied. This page is for doctors only.');
      setTimeout(() => navigate('/success'), 2000);
      return;
    }

    setUserData(user);
    fetchDoctorData(user.id);
  }, [navigate]);

  // ============================================
  // FETCH DATA
  // ============================================
  const fetchDoctorData = async (doctorId) => {
    setLoading(true);
    try {
      // Fetch Today's Appointments
      const todayRes = await fetch(`${API_URL}/doctor/${doctorId}/appointments/today`);
      if (todayRes.ok) {
        const data = await todayRes.json();
        setTodayAppointments(data.appointments || []);
      }

      // Fetch Upcoming Appointments (includes pending requests)
      const upcomingRes = await fetch(`${API_URL}/doctor/${doctorId}/appointments/upcoming`);
      if (upcomingRes.ok) {
        const data = await upcomingRes.json();
        setUpcomingAppointments(data.appointments || []);
      }

      // Fetch New Patients This Week
      const newPatientsRes = await fetch(`${API_URL}/doctor/${doctorId}/patients/new`);
      if (newPatientsRes.ok) {
        const data = await newPatientsRes.json();
        setNewPatients(data.patients || []);
      }

      // Fetch Pending Lab Results
      const labRes = await fetch(`${API_URL}/doctor/${doctorId}/lab-results/pending`);
      if (labRes.ok) {
        const data = await labRes.json();
        setLabResults(data.results || []);
      }

      // Fetch Tasks
      const tasksRes = await fetch(`${API_URL}/doctor/${doctorId}/tasks`);
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.tasks || []);
      }

      // Fetch Featured Patient (first patient with recent activity)
      if (upcomingAppointments.length > 0) {
        const patientId = upcomingAppointments[0].patientId;
        const patientRes = await fetch(`${API_URL}/doctor/${doctorId}/patient/${patientId}/overview`);
        if (patientRes.ok) {
          const data = await patientRes.json();
          setCurrentPatient(data.patient || null);
        }
      }

    } catch (err) {
      console.error('❌ Fetch error:', err);
      showNotification('error', 'Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullRecord = (patientId) => {
    setSelectedPatientId(patientId);
    setShowFullDetailsModal(true);
  };

  // ============================================
  // APPOINTMENT HANDLERS
  // ============================================
  const handleAcceptAppointment = async (appointmentId) => {
    console.log('✅ Accepting appointment:', appointmentId);
    
    try {
      const response = await fetch(
        `${API_URL}/doctor/${userData.id}/appointments/${appointmentId}/accept`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification('success', 'Appointment accepted successfully!');
        await fetchDoctorData(userData.id);
      } else {
        showNotification('error', result.error || 'Failed to accept appointment');
      }
    } catch (err) {
      console.error('❌ Accept appointment error:', err);
      showNotification('error', 'Server error during acceptance.');
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    console.log('❌ Rejecting appointment:', appointmentId);
    
    if (!window.confirm('Are you sure you want to reject this appointment request?')) {
      return;
    }
    
    try {
      const response = await fetch(
        `${API_URL}/doctor/${userData.id}/appointments/${appointmentId}/reject`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification('success', 'Appointment rejected.');
        await fetchDoctorData(userData.id);
      } else {
        showNotification('error', result.error || 'Failed to reject appointment');
      }
    } catch (err) {
      console.error('❌ Reject appointment error:', err);
      showNotification('error', 'Server error during rejection.');
    }
  };

  // ============================================
  // NEW: MARK APPOINTMENT AS COMPLETED
  // ============================================
  const handleMarkComplete = async (appointmentId) => {
    console.log('✓ Marking appointment as completed:', appointmentId);
    
    if (!window.confirm('Mark this appointment as completed? It will be removed from the list.')) {
      return;
    }
    
    try {
      const response = await fetch(
        `${API_URL}/doctor/${userData.id}/appointments/${appointmentId}/complete`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification('success', 'Appointment marked as completed!');
        await fetchDoctorData(userData.id);
      } else {
        showNotification('error', result.error || 'Failed to mark appointment as completed');
      }
    } catch (err) {
      console.error('❌ Mark complete error:', err);
      showNotification('error', 'Server error. Please try again.');
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

      {/* Stats Cards Row */}
      <DoctorStatsCards
        todayAppointmentsCount={todayAppointments.length}
        newPatientsCount={newPatients.length}
        labResultsCount={labResults.length}
        pendingTasksCount={tasks.filter(t => !t.completed).length}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column - 1/3 width */}
        <div className="lg:col-span-1 space-y-6">
          {/* Appointments List with all handlers */}
          <AppointmentsList 
            appointments={upcomingAppointments.slice(0, 5)}
            loading={loading}
            onAccept={handleAcceptAppointment}
            onReject={handleRejectAppointment}
            onMarkComplete={handleMarkComplete}
          />
          <TaskList 
            tasks={tasks.slice(0, 3)}
            loading={loading}
            onTaskComplete={(taskId) => {
              console.log('Complete task:', taskId);
            }}
          />
        </div>

        {/* Middle Column - 1/3 width */}
        <div className="lg:col-span-1">
          {/* FIXED: Pass onViewFullRecord prop */}
          <PatientOverview 
            //patient={currentPatient}
            loading={loading}
            onViewFullRecord={handleViewFullRecord}
            doctorId={userData.id}
          />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="lg:col-span-1">
          <RecentLabResults 
            results={labResults.slice(0, 3)}
            loading={loading}
          />
        </div>
      </div>

      {/* PATIENT FULL DETAILS MODAL */}
      <PatientFullDetailsModal
        show={showFullDetailsModal}
        doctorId={userData?.id}
        patientId={selectedPatientId}
        onClose={() => setShowFullDetailsModal(false)}
      />
    </DashboardLayout>
  );
}

export default DoctorDashboard;
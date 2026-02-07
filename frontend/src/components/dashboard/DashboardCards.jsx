import { FileText, Pill, Bell, TestTube, Calendar } from 'lucide-react';

const DashboardCard = ({ icon, title, count, label, onClick }) => (
  <div
    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-start space-x-4 mb-6">
      <div className="bg-blue-100 p-3 rounded-lg">{icon}</div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-500">{count > 0 ? `${count} ${label}` : `No ${label} Yet`}</p>
      </div>
    </div>
    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2">
      <span>View {title}</span>
      <span>›</span>
    </button>
  </div>
);

function DashboardCards({ 
  medicalRecordsCount, 
  labResultsCount, 
  prescriptionsCount,
  appointmentsCount = 0,
  notificationsCount = 0,
  onNavigate,
  onRequestAppointment
}) {
  return (
    <>
      {/* WELCOME SECTION */}
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome to your <span className="text-blue-600">Patient Dashboard!</span>
        </h2>
        <p className="text-gray-600 text-lg">
          It's great to have you here. Let's start by adding your health information.
        </p>
      </div>

      {/* REQUEST APPOINTMENT BUTTON - PROMINENT PLACEMENT 
      <div className="mb-8 flex justify-end">
        <button
          onClick={onRequestAppointment}
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition duration-200 flex items-center justify-center gap-3 shadow-md"
        >
          <Calendar className="w-5 h-5" />
          Book Appointment
        </button>
      </div> */}

      {/* DASHBOARD CARDS */}
      <div className="grid md:grid-cols-2 gap-6">
        <DashboardCard
          icon={<FileText className="w-8 h-8 text-blue-600" />}
          title="Medical Records"
          count={medicalRecordsCount}
          label="Documents"
          onClick={() => onNavigate('records')}
        />
        <DashboardCard
          icon={<Calendar className='w-8 h-8 text-blue-600' />}
          title="My Appointments"
          count={appointmentsCount}
          label="Appointments"
          onClick={() => onNavigate('appointments')}
        />
        <DashboardCard
          icon={<Pill className="w-8 h-8 text-blue-600" />}
          title="Prescriptions"
          count={prescriptionsCount}
          label="Prescriptions"
          onClick={() => onNavigate('prescriptions')}
        />
        <DashboardCard
          icon={<TestTube className="w-8 h-8 text-blue-600" />}
          title="Lab Results"
          count={labResultsCount}
          label="Results"
          onClick={() => onNavigate('lab')}
        />  
        <DashboardCard
          icon={<Bell className="w-8 h-8 text-blue-600" />}
          title="Notifications"
          count={notificationsCount}
          label="Updates"
          onClick={() => onNavigate('notifications')}
        />  
      </div>
    </>
  );
}

export default DashboardCards;
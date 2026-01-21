import { ChevronRight } from 'lucide-react';

function AppointmentsList({ appointments, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
      
      {appointments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No upcoming appointments</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{apt.time}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{apt.period}</span>
                </div>
                <div className="text-sm text-gray-700 font-medium">{apt.patientName}</div>
                <div className="text-xs text-gray-500">{apt.type}</div>
              </div>
            </div>
          ))}
          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 pt-2">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default AppointmentsList;
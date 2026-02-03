import { ChevronRight, CheckCircle, XCircle, Clock, X as CloseIcon } from 'lucide-react';

/**
 * Enhanced Appointments List
 * - Small accept/reject icons (12px - notification size)
 * - Mark appointment as completed (X button)
 * - View all appointments option
 */

function AppointmentsList({ appointments, loading, onAccept, onReject, onMarkComplete }) {
  
  // Format time from array [hour, minute, second] or string
  const formatTime = (timeValue) => {
    if (!timeValue) return 'N/A';
    
    try {
      if (Array.isArray(timeValue)) {
        const [hour, minute] = timeValue;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
      }
      
      if (typeof timeValue === 'string') {
        const [hour, minute] = timeValue.split(':').map(Number);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
      }
      
      return timeValue;
    } catch (error) {
      console.error('Time formatting error:', error);
      return 'N/A';
    }
  };

  // Format date
  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    
    try {
      let dateObj;
      if (Array.isArray(dateValue)) {
        const [year, month, day] = dateValue;
        dateObj = new Date(year, month - 1, day);
      } else {
        dateObj = new Date(dateValue);
      }
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (dateObj.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (dateObj.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return dateObj.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          text: 'Pending',
          className: 'bg-yellow-100 text-yellow-800',
          icon: Clock
        };
      case 'accepted':
        return {
          text: 'Accepted',
          className: 'bg-green-100 text-green-800',
          icon: CheckCircle
        };
      case 'rejected':
        return {
          text: 'Rejected',
          className: 'bg-red-100 text-red-800',
          icon: XCircle
        };
      default:
        return {
          text: status || 'Unknown',
          className: 'bg-gray-100 text-gray-800',
          icon: Clock
        };
    }
  };

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
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Upcoming Appointments
        {appointments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({appointments.length})
          </span>
        )}
      </h2>
      
      {appointments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No upcoming appointments</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => {
            const statusBadge = getStatusBadge(apt.status);
            const StatusIcon = statusBadge.icon;
            const isPending = apt.status?.toLowerCase() === 'pending';
            const isAccepted = apt.status?.toLowerCase() === 'accepted';
            
            return (
              <div 
                key={apt.id} 
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow relative"
              >
                {/* Close button for accepted appointments (after meeting) */}
                {isAccepted && (
                  <button
                    onClick={() => onMarkComplete && onMarkComplete(apt.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Mark as completed"
                  >
                    <CloseIcon className="w-3 h-3" />
                  </button>
                )}

                {/* Header with Time and Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {formatTime(apt.time)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(apt.appointmentDate)}
                    </span>
                  </div>
                  
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusBadge.text}
                  </span>
                </div>

                {/* Patient Info */}
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-900">{apt.patientName}</div>
                  <div className="text-xs text-gray-500">{apt.type}</div>
                  {apt.reason && (
                    <div className="text-xs text-gray-600 mt-1 line-clamp-1">
                      {apt.reason}
                    </div>
                  )}
                </div>

                {/* Action Buttons for Pending (SMALL ICONS - 12px) */}
                {isPending && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => onAccept(apt.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                      title="Accept appointment"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Accept
                    </button>
                    <button
                      onClick={() => onReject(apt.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                      title="Reject appointment"
                    >
                      <XCircle className="w-3 h-3" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          
          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 pt-2">
            View All Appointments <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default AppointmentsList;
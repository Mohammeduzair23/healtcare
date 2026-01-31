import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Clock as Pending } from 'lucide-react';

function AppointmentCard({ appointment }) {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Accepted'
        };
      case 'pending':
        return {
          icon: Pending,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          label: 'Pending'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          label: 'Rejected'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          label: 'Completed'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          label: 'Cancelled'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          label: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
      {/* Header with Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {appointment.doctorName || 'Doctor Name'}
            </h3>
            <p className="text-sm text-gray-500">{appointment.type}</p>
          </div>
        </div>
        
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
          <StatusIcon className="w-4 h-4" />
          {statusConfig.label}
        </span>
      </div>

      {/* Appointment Details */}
      <div className="space-y-3">
        {/* Date and Time */}
        <div className="flex items-start gap-6">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-medium">{appointment.appointmentDate || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="text-sm font-medium">{appointment.appointmentTime || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Reason */}
        {appointment.reason && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Reason for Visit</p>
            <p className="text-sm text-gray-700">{appointment.reason}</p>
          </div>
        )}

        {/* Doctor Notes (if any) */}
        {appointment.notes && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Doctor's Notes</p>
            <p className="text-sm text-gray-700 italic">{appointment.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentCard;
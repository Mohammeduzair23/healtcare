import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, FileText } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

// ============================================
// CONFIGURATION - Easy to modify
// ============================================
const TIME_CONFIG = {
  START_HOUR: 10,  // 10 AM - Change this to modify start time
  END_HOUR: 23,    // 11 PM - Change this to modify end time
  INTERVAL_MINUTES: 30  // 30-minute slots - Change to 15, 30, or 60
};

// Test doctors list (will be replaced with API call later)
const TEST_DOCTORS = [
  { id: "doc1", name: "Dr. Sarah Mitchell", specialty: "Cardiologist" },
  { id: "doc2", name: "Dr. John Davis", specialty: "General Physician" },
  { id: "doc3", name: "Dr. Emily Chen", specialty: "Pediatrician" }
];

const APPOINTMENT_TYPES = [
  'New Patient',
  'Follow-up',
  'Check-Up',
  'Consultation',
  'Emergency'
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate time slots based on configuration
 */
const generateTimeSlots = () => {
  const slots = [];
  const startHour = TIME_CONFIG.START_HOUR;
  const endHour = TIME_CONFIG.END_HOUR;
  const interval = TIME_CONFIG.INTERVAL_MINUTES;

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      // Don't add slots that go past end hour
      if (hour === endHour && minute > 0) break;
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = formatTimeDisplay(hour, minute);
      
      slots.push({
        value: timeString,
        label: displayTime
      });
    }
  }
  
  return slots;
};

/**
 * Format time for display (e.g., "10:00 AM", "2:30 PM")
 */
const formatTimeDisplay = (hour, minute) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
};

/**
 * Get readable time range for display
 */
const getTimeRangeText = () => {
  const startTime = formatTimeDisplay(TIME_CONFIG.START_HOUR, 0);
  const endTime = formatTimeDisplay(TIME_CONFIG.END_HOUR, 0);
  return `${startTime} - ${endTime}`;
};

// ============================================
// MAIN COMPONENT
// ============================================
function AppointmentRequestModal({ show, patientId, onClose, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    type: 'New Patient',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState(TEST_DOCTORS);
  const [timeSlots] = useState(generateTimeSlots());

  useEffect(() => {
    if (show) {
      // Reset form
      setFormData({
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        type: 'New Patient',
        reason: ''
      });
    }
  }, [show]);

  if (!show) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.doctorId) {
      onError('Please select a doctor');
      return;
    }
    if (!formData.appointmentDate) {
      onError('Please select appointment date');
      return;
    }
    if (!formData.appointmentTime) {
      onError('Please select appointment time');
      return;
    }
    if (!formData.reason.trim()) {
      onError('Please provide a reason for appointment');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/patient/${patientId}/appointments/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          patientId
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onSuccess('Appointment request sent successfully! Waiting for doctor approval.');
        onClose();
      } else {
        onError(result.error || 'Failed to request appointment');
      }
    } catch (err) {
      console.error('❌ Appointment request error:', err);
      onError('Server error. Please check if backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Request Appointment
            </h3>
            <p className="text-sm text-green-100 mt-1">
              Schedule a consultation with your preferred doctor
            </p>
          </div>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-white hover:bg-green-800 rounded-full p-2 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-5">
            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Select Doctor <span className="text-red-500">*</span>
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              >
                <option value="">-- Choose a Doctor --</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Appointment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                disabled={isSubmitting}
                min={today}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            {/* Appointment Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Appointment Time <span className="text-red-500">*</span>
              </label>
              <select
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              >
                <option value="">-- Select Time --</option>
                {timeSlots.map(slot => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                📅 Available hours: {getTimeRangeText()}
              </p>
            </div>

            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              >
                {APPOINTMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Reason for Appointment <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                disabled={isSubmitting}
                rows={4}
                placeholder="Please describe your symptoms or reason for consultation..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your appointment request will be sent to the doctor. 
                You will be notified once the doctor accepts or reschedules your appointment.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                Request Appointment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppointmentRequestModal;
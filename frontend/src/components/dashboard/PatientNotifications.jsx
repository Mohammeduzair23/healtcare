import { useState, useEffect } from 'react';
import { Bell, Key, Clock, X } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

/**
 * Patient Notifications - Shows passkey requests from doctors
 * Displays in patient dashboard or as a dropdown
 */

function PatientNotifications({ patientId, showAsDropdown = false }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(!showAsDropdown);

  useEffect(() => {
    if (patientId) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [patientId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/patient/${patientId}/notifications`);
      const result = await response.json();

      if (result.success) {
        setNotifications(result.notifications || []);
        setUnreadCount(result.unreadCount || 0);
      }
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_URL}/patient/${patientId}/notifications/${notificationId}/read`,
        { method: 'PUT' }
      );

      if (response.ok) {
        await fetchNotifications();
      }
    } catch (err) {
      console.error('❌ Error marking notification as read:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Delete this notification?')) return;
    
    try {
      const response = await fetch(
        `${API_URL}/patient/${patientId}/notifications/${notificationId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await fetchNotifications();
      }
    } catch (err) {
      console.error('❌ Error deleting notification:', err);
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch {
      return '';
    }
  };

  const isExpired = (notification) => {
    if (!notification.expiresAt) return false;
    try {
      return new Date(notification.expiresAt) < new Date();
    } catch {
      return false;
    }
  };

  // Dropdown view (for navbar)
  if (showAsDropdown) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(notif => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                    formatTime={formatTime}
                    isExpired={isExpired(notif)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full page view (for patient dashboard)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>
        {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No notifications</p>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={markAsRead}
              onDelete={deleteNotification}
              formatTime={formatTime}
              isExpired={isExpired(notif)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Notification Item Component - SIMPLIFIED
function NotificationItem({ notification, onMarkRead, onDelete, formatTime, isExpired }) {
  return (
    <div
      className={`relative p-4 rounded-lg border transition-colors cursor-pointer ${
        notification.isRead
          ? 'bg-white border-gray-200'
          : 'bg-blue-50 border-blue-200'
      }`}
      onClick={() => !notification.isRead && onMarkRead(notification.id)}
    >
      {/* Delete Button */}
      <button
        onClick={(e) => onDelete(notification.id, e)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors p-1 z-10"
        title="Delete notification"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className={`flex-shrink-0 ${notification.isRead ? 'opacity-50' : ''}`}>
          <Key className="w-5 h-5 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-sm text-gray-900">
              Access Request from Dr. {notification.doctorName || 'Unknown'}
            </h4>
            {!notification.isRead && (
              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </div>

          {/* Passkey Display */}
          {notification.passkey && !isExpired && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-3 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-s font-medium text-gray-800">Access Code:</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-mono font-bold text-blue-600 tracking-widest">
                    {notification.passkey}
                  </span>
                  {/*<button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(notification.passkey);
                      alert('Code copied to clipboard!');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 bg-white rounded border border-blue-200"
                  >
                    Copy
                  </button>*/}
                </div>
              </div>
            </div>
          )}

          {/* Expired State */}
          {isExpired && notification.passkey && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 mb-2">
              <p className="text-xs text-gray-600 text-center">
                ⏰ This access code has expired
              </p>
            </div>
          )}

          {/* Time Info */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatTime(notification.createdAt)}</span>
            {notification.expiresAt && !isExpired && (
              <>
                <span>•</span>
                <span className="text-orange-600">
                  Expires in 30 minutes
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientNotifications;
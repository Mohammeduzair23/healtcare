import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

function Notification({ type = 'success', message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      text: 'text-green-800',
      IconComponent: CheckCircle
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      text: 'text-red-800',
      IconComponent: AlertCircle
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      text: 'text-yellow-800',
      IconComponent: AlertCircle
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-800',
      IconComponent: Info
    }
  };

  const style = styles[type] || styles.info;
  const Icon = style.IconComponent;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
      <div className={`${style.bg} border rounded-lg shadow-lg p-4 pr-12 max-w-sm min-w-[300px]`}>
        <div className="flex items-start space-x-3">
          <Icon className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
          <p className={`${style.text} text-sm font-medium flex-1`}>{message}</p>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Notification;
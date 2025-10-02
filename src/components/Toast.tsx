import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, WifiOff, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'offline';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 5000,
  action 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'offline':
        return <WifiOff className="w-5 h-5 text-orange-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'offline':
        return 'bg-orange-50 border-orange-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`${getBackgroundColor()} border rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[320px] max-w-md animate-slide-in`}>
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;

import React from 'react';
import { useToast } from '../contexts/AppContext';
import { ToastType } from '../types';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const icons = {
  [ToastType.Success]: <CheckCircle className="text-green-500" size={24} />,
  [ToastType.Error]: <XCircle className="text-red-500" size={24} />,
  [ToastType.Info]: <Info className="text-blue-500" size={24} />,
};

const toastColors = {
    [ToastType.Success]: 'bg-green-100 border-green-400',
    [ToastType.Error]: 'bg-red-100 border-red-400',
    [ToastType.Info]: 'bg-blue-100 border-blue-400',
}

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-5 right-5 z-[100] space-y-3 w-full max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`relative w-full p-4 pr-10 rounded-lg shadow-lg flex items-center gap-4 animate-fade-in-right ${toastColors[toast.type]} border`}
        >
          {icons[toast.type]}
          <p className="text-sm text-gray-800 font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

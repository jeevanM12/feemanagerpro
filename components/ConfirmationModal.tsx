import React from 'react';
import { X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm relative transform transition-all animate-fade-in-down">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-700" aria-label="Close">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{title}</h2>
        <p className="text-slate-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg transition duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
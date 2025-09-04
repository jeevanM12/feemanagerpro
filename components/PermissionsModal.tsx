import React, { useState, useEffect } from 'react';
import { User, Permissions } from '../types';
import { X, Save } from 'lucide-react';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (email: string, permissions: Permissions) => void;
  user: User | null;
}

const permissionLabels: Record<keyof Permissions, string> = {
  canViewDashboardSummary: 'View Dashboard Summary',
  canViewStudents: 'View Students',
  canAddStudents: 'Add Students',
  canEditStudents: 'Edit Students',
  canDeleteStudents: 'Delete Students',
  canManagePayments: 'Manage Payments',
  canManageDiscounts: 'Manage Discounts',
  canViewReports: 'View Reports',
  canImportExport: 'Import/Export Data',
  canManageUsers: 'Manage Users',
};

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const [localPermissions, setLocalPermissions] = useState<Permissions | null>(null);

  useEffect(() => {
    if (user) {
      setLocalPermissions(user.permissions);
    }
  }, [user]);

  if (!isOpen || !user || !localPermissions) return null;

  const handleCheckboxChange = (permissionKey: keyof Permissions) => {
    setLocalPermissions(prev => prev ? { ...prev, [permissionKey]: !prev[permissionKey] } : null);
  };

  const handleSave = () => {
    if (localPermissions) {
      onSave(user.email, localPermissions);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl relative transform transition-all animate-fade-in-down">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-700" aria-label="Close">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Edit Permissions</h2>
        <p className="text-slate-600 mb-6">For user: <span className="font-semibold">{user.email}</span></p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
          {Object.keys(permissionLabels).map(key => {
            const pKey = key as keyof Permissions;
            // Admins cannot manage other users, so hide this option.
            if (pKey === 'canManageUsers') return null;
            return (
              <label key={pKey} className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPermissions[pKey]}
                  onChange={() => handleCheckboxChange(pKey)}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm font-medium text-slate-700">{permissionLabels[pKey]}</span>
              </label>
            );
          })}
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg transition duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 flex items-center"
          >
            <Save size={18} className="mr-2"/> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
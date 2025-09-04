import React, { useState } from 'react';
import { useAuth, useData, useToast } from '../contexts/AppContext';
import { KeyRound, ShieldCheck, Lock } from 'lucide-react';
import { ToastType } from '../types';

export const AccountSettingsPage = () => {
    const { loggedInUser } = useAuth();
    const { updateUserPassword } = useData();
    const { addToast } = useToast();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!loggedInUser) {
            addToast("Not logged in.", ToastType.Error);
            setIsLoading(false);
            return;
        }
        if (newPassword !== confirmNewPassword) {
            addToast("New passwords do not match.", ToastType.Error);
            setIsLoading(false);
            return;
        }
        if (newPassword.length < 8) {
             addToast("New password must be at least 8 characters long.", ToastType.Error);
             setIsLoading(false);
             return;
        }

        const result = updateUserPassword(loggedInUser.email, currentPassword, newPassword);
        
        if (result.success) {
            addToast(result.message, ToastType.Success);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } else {
            addToast(result.message, ToastType.Error);
        }
        setIsLoading(false);
    };

    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6 flex items-center">
            <ShieldCheck className="mr-3 text-indigo-600" size={32} /> Account Settings
        </h2>
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                <KeyRound size={20} className="mr-2 text-indigo-600"/> Change Password for {loggedInUser?.email}
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-6">
                 <div>
                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="currentPassword">Current Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="password"
                            id="currentPassword"
                            className="pl-10 shadow appearance-none border rounded w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                </div>
                 <div>
                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="newPassword">New Password</label>
                    <div className="relative">
                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="password"
                            id="newPassword"
                            className="pl-10 shadow appearance-none border rounded w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>
                </div>
                 <div>
                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="confirmNewPassword">Confirm New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="password"
                            id="confirmNewPassword"
                            className="pl-10 shadow appearance-none border rounded w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                             autoComplete="new-password"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full sm:w-auto transform transition duration-150 hover:scale-105 flex items-center justify-center"
                    >
                         {isLoading && (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
      </div>
    );
};

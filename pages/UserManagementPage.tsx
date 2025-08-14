import React, { useState } from 'react';
import { useData, useAuth, useToast } from '../contexts/AppContext';
import { User } from '../types';
import { UserCog, Users, UserPlus, Trash2, KeyRound } from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const UserManagementPage = () => {
    const { users, addUser, deleteUser, updateUserRole } = useData();
    const { loggedInUser } = useAuth();
    const { addToast } = useToast();

    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const handleAddUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUserPassword !== confirmPassword) {
            addToast('Passwords do not match.', 'error');
            return;
        }
        const success = addUser({ email: newUserEmail, password: newUserPassword });
        if (success) {
            addToast('User added successfully!', 'success');
            setNewUserEmail('');
            setNewUserPassword('');
            setConfirmPassword('');
        } else {
            addToast('User with this email already exists.', 'error');
        }
    };
    
    const handleDeleteUser = () => {
        if (userToDelete) {
            if (userToDelete.email === loggedInUser?.email) {
                addToast("You cannot delete yourself.", "error");
            } else if (userToDelete.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
                addToast("Cannot delete the last admin.", "error");
            } else {
                deleteUser(userToDelete.email);
                addToast(`User ${userToDelete.email} deleted.`, "success");
            }
        }
        setUserToDelete(null);
    };

    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center"><UserCog className="mr-3 text-blue-600" size={32} /> User Management</h2>
        
        {/* Add User Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><UserPlus size={20} className="mr-2 text-green-600"/> Add New User</h3>
          <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newUserEmail">Email</label>
              <input type="email" id="newUserEmail" className="shadow appearance-none border rounded w-full py-2 px-3" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newUserPassword">Password</label>
              <input type="password" id="newUserPassword" className="shadow appearance-none border rounded w-full py-2 px-3" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" className="shadow appearance-none border rounded w-full py-2 px-3" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <div className="md:col-start-3 flex justify-end">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">Add User</button>
            </div>
          </form>
        </div>
        
        {/* User List */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><Users size={20} className="mr-2 text-blue-600"/> Existing Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                        <tr key={user.email}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{user.role}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                    {user.email !== loggedInUser?.email && (
                                        <>
                                            <button onClick={() => updateUserRole(user.email, user.role === 'admin' ? 'user' : 'admin')} className="text-indigo-600 hover:text-indigo-900"><KeyRound size={20} /></button>
                                            <button onClick={() => setUserToDelete(user)} className="text-red-600 hover:text-red-900"><Trash2 size={20} /></button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
              </table>
            </div>
        </div>
        <ConfirmationModal
            isOpen={!!userToDelete}
            onClose={() => setUserToDelete(null)}
            onConfirm={handleDeleteUser}
            title="Confirm User Deletion"
            message={`Are you sure you want to delete the user ${userToDelete?.email}? This action cannot be undone.`}
        />
      </div>
    );
};

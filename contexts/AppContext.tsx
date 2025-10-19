import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.ts';
import { User, Student, Permissions, ToastMessage, ToastType } from '../types.ts';
import { initialUsers, initialStudentsData, adminPermissions, defaultUserPermissions, LOCAL_STORAGE_KEYS } from '../constants.ts';

// --- CONTEXT TYPE DEFINITIONS ---

interface AuthContextType {
  loggedInUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

interface DataContextType {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addStudent: (student: Omit<Student, 'id' | 'payments' | 'discounts'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  addPayment: (studentId: string, payment: Omit<Student['payments'][0], 'id' | 'date'> & { date?: string }) => void;
  addDiscount: (studentId: string, discount: Omit<Student['discounts'][0], 'id' | 'date'> & { date?: string }) => void;
  updateDiscount: (studentId: string, discount: Student['discounts'][0]) => void;
  deleteDiscount: (studentId: string, discountId: string) => void;
  addUser: (user: Omit<User, 'role' | 'permissions'>) => boolean;
  deleteUser: (email: string) => void;
  updateUserRole: (email: string, role: 'admin' | 'user') => void;
  updateUserPermissions: (email: string, permissions: Permissions) => void;
  importStudents: (importedStudents: Student[]) => { newCount: number; updatedCount: number };
  updateUserPassword: (email: string, oldPass: string, newPass: string) => { success: boolean; message: string; };
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

// --- CONTEXT CREATION ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DataContext = createContext<DataContextType | undefined>(undefined);
const ToastContext = createContext<ToastContextType | undefined>(undefined);


// --- PROVIDER COMPONENT ---

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // --- STATE MANAGEMENT ---
  const [users, setUsers] = useLocalStorage<User[]>(LOCAL_STORAGE_KEYS.USERS, initialUsers);
  const [students, setStudents] = useLocalStorage<Student[]>(LOCAL_STORAGE_KEYS.STUDENTS, initialStudentsData);
  const [loggedInUser, setLoggedInUser] = useLocalStorage<User | null>(LOCAL_STORAGE_KEYS.LOGGED_IN_USER, null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- AUTH LOGIC ---
  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setLoggedInUser(user);
      addToast('Login successful!', ToastType.Success);
      return true;
    }
    return false;
  };

  const logout = () => {
    setLoggedInUser(null);
    addToast('You have been logged out.', ToastType.Info);
  };
  
  // --- TOAST LOGIC ---
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const addToast = (message: string, type: ToastType = ToastType.Info) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
        removeToast(id);
    }, 2000); // Auto-dismiss after 2 seconds
  };
  

  // --- DATA LOGIC (STUDENTS & USERS) ---

  const addStudent = (newStudent: Omit<Student, 'id' | 'payments' | 'discounts'>) => {
    const studentWithDefaults: Student = {
      ...newStudent,
      id: `S${Date.now()}`,
      payments: [],
      discounts: [],
    };
    setStudents(prev => [...prev, studentWithDefaults]);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };
  
  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const addPayment = (studentId: string, paymentDetails: Omit<Student['payments'][0], 'id' | 'date'> & { date?: string }) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, payments: [...s.payments, { ...paymentDetails, id: `P${Date.now()}`, date: paymentDetails.date || new Date().toISOString() }] } : s ));
  };

  const addDiscount = (studentId: string, discountDetails: Omit<Student['discounts'][0], 'id' | 'date'> & { date?: string }) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, discounts: [...s.discounts, { ...discountDetails, id: `D${Date.now()}`, date: discountDetails.date || new Date().toISOString() }] } : s ));
  };
  
  const updateDiscount = (studentId: string, updatedDiscount: Student['discounts'][0]) => {
     setStudents(prev => prev.map(s => s.id === studentId ? { ...s, discounts: s.discounts.map(d => d.id === updatedDiscount.id ? updatedDiscount : d) } : s));
  };

  const deleteDiscount = (studentId: string, discountId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, discounts: s.discounts.filter(d => d.id !== discountId) } : s));
  };

  const addUser = (newUser: Omit<User, 'role' | 'permissions'>): boolean => {
    if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
        return false;
    }
    const userWithDefaults: User = {
        ...newUser,
        role: 'user',
        permissions: defaultUserPermissions,
    };
    setUsers(prev => [...prev, userWithDefaults]);
    return true;
  };

  const deleteUser = (email: string) => {
    setUsers(prev => prev.filter(user => user.email.toLowerCase() !== email.toLowerCase()));
  };
  
  const updateUserRole = (email: string, role: 'admin' | 'user') => {
    const userToUpdate = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (userToUpdate && userToUpdate.role === 'admin' && role === 'user') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        addToast("Cannot demote the last remaining admin.", ToastType.Error);
        return; 
      }
    }

    setUsers(prev => prev.map(user =>
       user.email.toLowerCase() === email.toLowerCase() ?
       { ...user, role: role, permissions: role === 'admin' ? adminPermissions : defaultUserPermissions } : user
    ));
    addToast(`User role for ${email} updated to ${role}.`, ToastType.Success);
  };
  
  const updateUserPermissions = (email: string, permissions: Permissions) => {
    setUsers(prevUsers => prevUsers.map(user =>
      user.email === email ? { ...user, permissions } : user
    ));
    // If the logged-in user's permissions are updated, refresh their state
    if (loggedInUser && loggedInUser.email === email) {
        setLoggedInUser(prev => (prev ? { ...prev, permissions } : prev));
    }
  };

  const updateUserPassword = (email: string, oldPass: string, newPass: string): { success: boolean; message: string; } => {
    const userToUpdate = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!userToUpdate) {
        return { success: false, message: "User not found." };
    }

    if (userToUpdate.password !== oldPass) {
        return { success: false, message: "Incorrect current password." };
    }

    const updatedUsers = users.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: newPass } : u);
    setUsers(updatedUsers);

    if (loggedInUser && loggedInUser.email.toLowerCase() === email.toLowerCase()) {
        setLoggedInUser({ ...loggedInUser, password: newPass });
    }

    return { success: true, message: "Password updated successfully." };
  };

  const importStudents = (importedStudentsArray: Student[]) => {
    let newCount = 0;
    let updatedCount = 0;
    setStudents(prevStudents => {
        const updatedStudentsMap = new Map(prevStudents.map(s => [s.rollNumber.toLowerCase(), { ...s }]));

        importedStudentsArray.forEach(importedStudent => {
            const rollNumberKey = String(importedStudent.rollNumber || '').toLowerCase();
            if (!rollNumberKey) return; // Skip if roll number is empty

            const existingStudent = updatedStudentsMap.get(rollNumberKey);
            if (existingStudent) {
                // Merge logic (simplified): Overwrite with imported data
                updatedStudentsMap.set(rollNumberKey, {
                    ...existingStudent,
                    name: importedStudent.name,
                    class: importedStudent.class,
                    grade: importedStudent.grade,
                    totalFees: importedStudent.totalFees,
                });
                updatedCount++;
            } else {
                updatedStudentsMap.set(rollNumberKey, {
                  ...importedStudent,
                  id: `S${Date.now()}${Math.random().toString(36).substring(2, 9)}`,
                  payments: [],
                  discounts: []
                });
                newCount++;
            }
        });
        return Array.from(updatedStudentsMap.values());
    });
    return { newCount, updatedCount };
  };


  // --- CONTEXT VALUES ---
  const authContextValue: AuthContextType = { loggedInUser, login, logout };
  const dataContextValue: DataContextType = { students, setStudents, users, setUsers, addStudent, updateStudent, deleteStudent, addPayment, addDiscount, updateDiscount, deleteDiscount, addUser, deleteUser, updateUserRole, updateUserPermissions, importStudents, updateUserPassword };
  const toastContextValue: ToastContextType = { addToast, toasts, removeToast };

  return (
    <AuthContext.Provider value={authContextValue}>
      <DataContext.Provider value={dataContextValue}>
        <ToastContext.Provider value={toastContextValue}>
          {children}
        </ToastContext.Provider>
      </DataContext.Provider>
    </AuthContext.Provider>
  );
};

// --- CUSTOM HOOKS ---

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within an AppProvider');
  }
  return context;
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
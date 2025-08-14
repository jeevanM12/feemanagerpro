import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User, Student, Permissions, ToastMessage, ToastType } from '../types';
import { initialUsers, initialStudentsData, adminPermissions, defaultUserPermissions, LOCAL_STORAGE_KEYS } from '../constants';

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
  const addToast = (message: string, type: ToastType = ToastType.Info) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
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
     setUsers(prev => prev.map(user =>
        user.email.toLowerCase() === email.toLowerCase() ?
        { ...user, role: role, permissions: role === 'admin' ? adminPermissions : defaultUserPermissions } : user
    ));
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

  const importStudents = (importedStudentsArray: Student[]) => {
    let newCount = 0;
    let updatedCount = 0;
    setStudents(prevStudents => {
        const updatedStudentsMap = new Map(prevStudents.map(s => [s.rollNumber.toLowerCase(), { ...s }]));

        importedStudentsArray.forEach(importedStudent => {
            const existingStudent = updatedStudentsMap.get(importedStudent.rollNumber.toLowerCase());
            if (existingStudent) {
                // Merge logic (simplified): Overwrite with imported data
                updatedStudentsMap.set(importedStudent.rollNumber.toLowerCase(), {
                    ...existingStudent,
                    ...importedStudent,
                    // More sophisticated merging could happen here
                });
                updatedCount++;
            } else {
                updatedStudentsMap.set(importedStudent.rollNumber.toLowerCase(), importedStudent);
                newCount++;
            }
        });
        return Array.from(updatedStudentsMap.values());
    });
    return { newCount, updatedCount };
  };


  // --- CONTEXT VALUES ---
  const authContextValue: AuthContextType = { loggedInUser, login, logout };
  const dataContextValue: DataContextType = { students, setStudents, users, setUsers, addStudent, updateStudent, deleteStudent, addPayment, addDiscount, updateDiscount, deleteDiscount, addUser, deleteUser, updateUserRole, updateUserPermissions, importStudents };
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

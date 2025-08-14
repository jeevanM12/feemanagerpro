import { Permissions, User, Student } from './types';

export const defaultUserPermissions: Permissions = {
  canViewStudents: true,
  canAddStudents: false,
  canEditStudents: false,
  canDeleteStudents: false,
  canManagePayments: false,
  canManageDiscounts: false,
  canViewReports: false,
  canImportExport: false,
  canManageUsers: false,
  canViewDashboardSummary: true,
};

export const adminPermissions: Permissions = {
  canViewStudents: true,
  canAddStudents: true,
  canEditStudents: true,
  canDeleteStudents: true,
  canManagePayments: true,
  canManageDiscounts: true,
  canViewReports: true,
  canImportExport: true,
  canManageUsers: true,
  canViewDashboardSummary: true,
};

export const initialUsers: User[] = [
  { email: 'srisubhodaya@gmail.com', password: 'adminpassword', role: 'admin', permissions: adminPermissions },
  { email: 'user@example.com', password: 'userpassword', role: 'user', permissions: defaultUserPermissions },
];

export const initialStudentsData: Student[] = [
  { id: 'S1001', name: 'Amit Kumar', rollNumber: 'R001', class: '10', grade: 'A', totalFees: 50000, payments: [{ id: 'P1', amount: 20000, date: '2024-07-15T10:30:00Z', remarks: 'First Installment' },{ id: 'P2', amount: 15000, date: '2024-08-20T14:00:00Z', remarks: 'Second Installment' }], discounts: [{ id: 'D1', amount: 2000, reason: 'Sibling Discount', date: '2024-07-10T09:00:00Z' }] },
  { id: 'S1002', name: 'Priya Sharma', rollNumber: 'R002', class: '12', grade: 'B', totalFees: 60000, payments: [{ id: 'P3', amount: 30000, date: '2024-07-20T11:00:00Z', remarks: 'Full Payment Attempt 1' }], discounts: [] },
  { id: 'S1003', name: 'Rahul Singh', rollNumber: 'R003', class: '10', grade: 'A', totalFees: 50000, payments: [{ id: 'P4', amount: 10000, date: '2024-08-01T12:15:00Z', remarks: 'Partial Payment' }], discounts: [{ id: 'D2', amount: 1000, reason: 'Early Bird', date: '2024-07-05T10:00:00Z' }] },
];

export const APP_NAME = "FeeManager Pro";
export const LOCAL_STORAGE_KEYS = {
    STUDENTS: 'feeManager_studentsData',
    USERS: 'feeManager_appUsersData',
    LOGGED_IN_USER: 'feeManager_loggedInFeeUser'
};
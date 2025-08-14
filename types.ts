
export interface Permissions {
  canViewStudents: boolean;
  canAddStudents: boolean;
  canEditStudents: boolean;
  canDeleteStudents: boolean;
  canManagePayments: boolean;
  canManageDiscounts: boolean;
  canViewReports: boolean;
  canImportExport: boolean;
  canManageUsers: boolean;
  canViewDashboardSummary: boolean;
}

export interface User {
  email: string;
  password?: string; // Optional for security when handling user objects
  role: 'admin' | 'user';
  permissions: Permissions;
}

export interface Payment {
  id: string;
  amount: number;
  date: string; // ISO 8601 string
  remarks: string;
}

export interface Discount {
  id: string;
  amount: number;
  reason: string;
  date: string; // ISO 8601 string
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  grade: string;
  totalFees: number;
  payments: Payment[];
  discounts: Discount[];
}

export interface StudentWithFeeDetails extends Student {
  totalPaid: number;
  totalDiscount: number;
  remainingBalance: number;
  lastPaymentDate: string | null;
}

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
}

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

// For zod-like validation in services
export interface FieldError {
    path: (string | number)[];
    message: string;
}

export interface SafeParseResult<T> {
    success: boolean;
    data?: T;
    error?: {
        errors: FieldError[]
    };
}

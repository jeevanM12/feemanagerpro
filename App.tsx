import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext.tsx';
import { MainLayout } from './components/MainLayout.tsx';
import { ProtectedRoute } from './pages/ProtectedRoute.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { StudentDetailPage } from './pages/StudentDetailPage.tsx';
import { StudentAddPage } from './pages/StudentAddPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { DailyReportPage } from './pages/DailyReportPage.tsx';
import { MonthlyReportPage } from './pages/MonthlyReportPage.tsx';
import { UserManagementPage } from './pages/UserManagementPage.tsx';
import { AccountSettingsPage } from './pages/AccountSettingsPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { StudentEditPage } from './pages/StudentEditPage.tsx';
import { PermissionsModal } from './components/PermissionsModal.tsx';

const App = () => {
  return (
    <AppProvider>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="student/new" element={<ProtectedRoute requiredPermission="canAddStudents"><StudentAddPage /></ProtectedRoute>} />
            <Route path="student/:id" element={<ProtectedRoute requiredPermission="canViewStudents"><StudentDetailPage /></ProtectedRoute>} />
            <Route path="student/:id/edit" element={<ProtectedRoute requiredPermission="canEditStudents"><StudentEditPage /></ProtectedRoute>} />
            
            <Route path="reports" element={<ProtectedRoute requiredPermission="canViewReports"><Outlet/></ProtectedRoute>}>
                <Route path="summary" element={<ReportsPage />} />
                <Route path="daily" element={<DailyReportPage />} />
                <Route path="monthly" element={<MonthlyReportPage />} />
            </Route>

            <Route path="admin" element={<ProtectedRoute requiredPermission="canManageUsers"><Outlet/></ProtectedRoute>}>
                 <Route path="users" element={<UserManagementPage />} />
                 <Route path="settings" element={<AccountSettingsPage />} />
            </Route>
          </Route>
          
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
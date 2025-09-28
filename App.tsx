import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { MainLayout } from './components/MainLayout';
import { ProtectedRoute } from './pages/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { StudentAddPage } from './pages/StudentAddPage';
import { ReportsPage } from './pages/ReportsPage';
import { DailyReportPage } from './pages/DailyReportPage';
import { MonthlyReportPage } from './pages/MonthlyReportPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ToastContainer } from './components/ToastContainer';
import { StudentEditPage } from './pages/StudentEditPage';

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
                <Route index element={<ReportsPage />} />
                <Route path="daily" element={<DailyReportPage />} />
                <Route path="monthly" element={<MonthlyReportPage />} />
            </Route>

            <Route path="admin" element={<ProtectedRoute requiredPermission="canManageUsers"><Outlet/></ProtectedRoute>}>
                 <Route index element={<UserManagementPage />} />
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

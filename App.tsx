import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { MainLayout } from './components/MainLayout';
import { ProtectedRoute } from './pages/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { ReportsPage } from './pages/ReportsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ToastContainer } from './components/ToastContainer';

const App = () => {
  return (
    <AppProvider>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="student/:id" element={<StudentDetailPage />} />
            
            <Route path="reports" element={<ProtectedRoute requiredPermission="canViewReports"><Outlet/></ProtectedRoute>}>
                <Route path="summary" element={<ReportsPage />} />
                {/* Placeholder for other report routes */}
                <Route path="daily" element={<div>Daily Reports Page (WIP)</div>} />
                <Route path="monthly" element={<div>Monthly Reports Page (WIP)</div>} />
            </Route>

            <Route path="admin" element={<ProtectedRoute requiredPermission="canManageUsers"><Outlet/></ProtectedRoute>}>
                 <Route path="users" element={<UserManagementPage />} />
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

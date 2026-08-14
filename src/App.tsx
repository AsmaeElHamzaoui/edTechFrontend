import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { RequireAuth } from './guards/RequireAuth';
import { RequireRole } from './guards/RequireRole';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import DocumentsPage from './pages/documents/DocumentsPage';
import ChatPage from './pages/chat/ChatPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Pages temporaires pour les autres routes du menu pour éviter les 404 */}
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/quizzes" element={<div style={{padding: '24px'}}>Quiz (Phase 5)</div>} />
            <Route path="/progress" element={<div style={{padding: '24px'}}>Progression (Phase 6)</div>} />
            <Route path="/notifications" element={<div style={{padding: '24px'}}>Notifications (Phase 7)</div>} />
            <Route path="/profile" element={<div style={{padding: '24px'}}>Profil</div>} />
          </Route>
          
          <Route element={<RequireAuth><RequireRole role="ADMINISTRATEUR"><MainLayout /></RequireRole></RequireAuth>}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<div style={{padding: '24px'}}>Utilisateurs (Phase 8)</div>} />
            <Route path="/admin/quotas" element={<div style={{padding: '24px'}}>Quotas & Logs (Phase 8)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

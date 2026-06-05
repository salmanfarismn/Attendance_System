import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SemesterProvider } from './context/SemesterContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import AttendancePage from './features/attendance/AttendancePage';
import SubjectsPage from './features/subjects/SubjectsPage';
import CalendarPage from './features/calendar/CalendarPage';
import CalculatorPage from './features/calculator/CalculatorPage';
import ReportsPage from './features/reports/ReportsPage';
import NotificationsPage from './features/notifications/NotificationsPage';
import SettingsPage from './features/settings/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-base)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Public — no SemesterProvider needed */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected — SemesterProvider only mounts after auth */}
            <Route element={
              <ProtectedRoute>
                <SemesterProvider>
                  <AppLayout />
                </SemesterProvider>
              </ProtectedRoute>
            }>
              <Route path="/dashboard"     element={<DashboardPage />} />
              <Route path="/attendance"    element={<AttendancePage />} />
              <Route path="/subjects"      element={<SubjectsPage />} />
              <Route path="/calendar"      element={<CalendarPage />} />
              <Route path="/calculator"    element={<CalculatorPage />} />
              <Route path="/reports"       element={<ReportsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings"      element={<SettingsPage />} />
            </Route>

            {/* Default */}
            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}


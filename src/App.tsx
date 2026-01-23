import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import Financials from './pages/Financials';
import VendorsPage from './pages/Vendors';
import TenantPortal from './pages/TenantPortal';
import MessagesPage from './pages/Messages';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/financials" element={
            <ProtectedRoute>
              <Financials />
            </ProtectedRoute>
          } />

          <Route path="/vendors" element={
            <ProtectedRoute>
              <VendorsPage />
            </ProtectedRoute>
          } />

          {/* Tenant Portal Routes */}
          <Route path="/tenant/:section" element={
            <ProtectedRoute>
              <TenantPortal />
            </ProtectedRoute>
          } />

          <Route path="/messages" element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          {/* Placeholders for other routes */}
          <Route path="*" element={
            <ProtectedRoute>
              <div className="p-4">
                <h2 className="text-xl font-bold">Coming Soon</h2>
                <p className="text-slate-500">This feature is under development.</p>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

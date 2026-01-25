import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import Financials from './pages/Financials';
import VendorsPage from './pages/Vendors';
import TenantPortal from './pages/TenantPortal';
import MessagesPage from './pages/Messages';
import Maintenance from './pages/Maintenance';
import Documents from './pages/Documents';
import Tenants from './pages/Tenants';
import Settings from './pages/Settings';
import Expenses from './pages/Expenses';
import Gallery from './pages/Gallery';
import Responsibilities from './pages/Responsibilities';

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

          <Route path="/expenses" element={
            <ProtectedRoute>
              <Expenses />
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

          <Route path="/maintenance" element={
            <ProtectedRoute>
              <Maintenance />
            </ProtectedRoute>
          } />

          <Route path="/documents" element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          } />

          <Route path="/tenants" element={
            <ProtectedRoute>
              <Tenants />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="/gallery" element={
            <ProtectedRoute>
              <Gallery />
            </ProtectedRoute>
          } />

          <Route path="/responsibilities" element={
            <ProtectedRoute>
              <Responsibilities />
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

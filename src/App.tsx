import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import PortalHeader from './components/PortalHeader';
import LoadingSpinner from './components/ui/LoadingSpinner';
import RoleBasedRoute from './components/RoleBasedRoute';
import LoginPage from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import MeetTheTeacher from './pages/MeetTheTeacher';
import AdminDashboard from './pages/AdminDashboard';
import TeachEmbed from './pages/TeachEmbed';
import Dashboard from './pages/Dashboard';
import Financials from './pages/Financials';
import VendorsPage from './pages/Vendors';
import VendorProfile from './pages/VendorProfile';
import TenantPortal from './pages/TenantPortal';
import MessagesPage from './pages/Messages';
import Maintenance from './pages/Maintenance';
import Documents from './pages/Documents';
import Tenants from './pages/Tenants';
import Settings from './pages/Settings';
// Expenses now integrated into Maintenance page
import Gallery from './pages/Gallery';
import Responsibilities from './pages/Responsibilities';
import Projects from './pages/Projects';
import View3D from './pages/View3D';
import IssuesPage from './pages/Issues';
import Accounts from './pages/Accounts';
import Inspections from './pages/Inspections';
import Rent from './pages/Rent';
import Leases from './pages/Leases';
import HelpCenter from './components/help/HelpCenter';
import AIAssistant from './components/ai-assistant/AIAssistant';
import { useHelpStore } from './stores/helpStore';
import { useAIAssistantStore } from './stores/aiAssistantStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage message="Loading..." />;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

function ProtectedPortal({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage message="Loading..." />;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}


// Keyboard shortcuts handler
function KeyboardShortcuts() {
  const { toggleHelp } = useHelpStore();
  const { toggleAssistant } = useAIAssistantStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+/ or Ctrl+/ - Toggle Help Center
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        toggleHelp();
      }
      // Cmd+. or Ctrl+. - Toggle AI Assistant
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        toggleAssistant();
      }
      // Escape - Close panels
      if (e.key === 'Escape') {
        const { isOpen: helpOpen, closeHelp } = useHelpStore.getState();
        const { isOpen: aiOpen, closeAssistant } = useAIAssistantStore.getState();
        if (helpOpen) closeHelp();
        if (aiOpen) closeAssistant();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleHelp, toggleAssistant]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <PortalHeader />
        <KeyboardShortcuts />
        <HelpCenter />
        <AIAssistant />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Public Meet the Teacher page (always accessible) */}
          <Route path="/" element={<MeetTheTeacher />} />

          {/* Authenticated dashboard with Profile/Teach/House tabs */}
          <Route path="/dashboard" element={
            <ProtectedPortal>
              <AdminDashboard />
            </ProtectedPortal>
          } />

          <Route path="/teach" element={
            <ProtectedPortal>
              <TeachEmbed />
            </ProtectedPortal>
          } />

          {/* PM dashboard (moved from /) */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* OWNER-ONLY ROUTES */}
          <Route path="/properties" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['owner']}>
                <Dashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/financials" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['owner']}>
                <Financials />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* OWNER & PM ROUTES */}
          <Route path="/accounts" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['owner', 'pm']}>
                <Accounts />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/documents" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['owner', 'pm']}>
                <Documents />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* PM-ONLY ROUTES */}
          <Route path="/issues" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['owner', 'pm']}>
                <IssuesPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/vendors" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['pm']}>
                <VendorsPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/vendors/:vendorId" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['owner', 'pm']}>
                <VendorProfile />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/tenants" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['pm']}>
                <Tenants />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* PM routes */}
          <Route path="/inspections" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['pm']}>
                <Inspections />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/rent" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['pm']}>
                <Rent />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/leases" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['pm']}>
                <Leases />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/expenses" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['pm']}>
                <Maintenance />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* TENANT-ONLY ROUTES */}
          <Route path="/payments" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['tenant']}>
                <TenantPortal />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/lease" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['tenant']}>
                <TenantPortal />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* Tenant Portal Routes (legacy) */}
          <Route path="/tenant/:section" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['tenant']}>
                <TenantPortal />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* PM & TENANT SHARED ROUTES */}
          <Route path="/maintenance" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['owner', 'pm', 'tenant']}>
                <Maintenance />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* SHARED ROUTES - All authenticated users */}
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

          {/* OTHER ROUTES */}
          <Route path="/gallery" element={
            <ProtectedRoute>
              <Gallery />
            </ProtectedRoute>
          } />

          <Route path="/responsibilities" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['pm', 'owner']}>
                <Responsibilities />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/projects" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['pm', 'owner']}>
                <Projects />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/3d-view" element={
            <ProtectedRoute>
              <View3D />
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

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LoginPage from './pages/Login';
import WelcomePage from './pages/WelcomePage';
import Dashboard from './pages/Dashboard';
import Financials from './pages/Financials';
import VendorsPage from './pages/Vendors';
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
import HelpCenter from './components/help/HelpCenter';
import ContextualTip from './components/help/ContextualTip';
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
        <KeyboardShortcuts />
        <HelpCenter />
        <AIAssistant />
        <ContextualTip />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <WelcomePage />
            </ProtectedRoute>
          } />

          <Route path="/properties" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/financials" element={
            <ProtectedRoute>
              <Financials />
            </ProtectedRoute>
          } />

          {/* Expenses redirect to Maintenance */}
          <Route path="/expenses" element={<Navigate to="/maintenance" replace />} />

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

          <Route path="/issues" element={
            <ProtectedRoute>
              <IssuesPage />
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

          <Route path="/projects" element={
            <ProtectedRoute>
              <Projects />
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

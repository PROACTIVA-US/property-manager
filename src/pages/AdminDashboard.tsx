import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Home, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import ProfileEditor from '../components/ProfileEditor';

const TEACHASSIST_URL = import.meta.env.VITE_TEACHASSIST_URL || 'http://localhost:3000';

type DashboardTab = 'profile' | 'teach' | 'house';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');

  const handleHouseClick = () => {
    navigate('/home');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const tabs: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'teach', label: 'Teach', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'house', label: 'House', icon: <Home className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-cc-bg">
      {/* Dashboard header */}
      <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-cc-surface border-b border-cc-border/50 flex items-center justify-between px-4">
        {/* Left: brand */}
        <span
          onClick={() => navigate('/')}
          className="text-lg font-bold text-cc-accent hover:text-cc-accent/80 transition-colors cursor-pointer"
        >
          Shanie
        </span>

        {/* Center: tab toggle */}
        <div className="flex items-center bg-cc-bg rounded-full p-0.5 border border-cc-border/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'house') {
                  handleHouseClick();
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full transition-colors',
                activeTab === tab.id && tab.id !== 'house'
                  ? tab.id === 'teach'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-cc-accent text-white'
                  : 'text-cc-muted hover:text-cc-text'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: user + logout */}
        <div className="flex items-center gap-2">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-cc-border flex items-center justify-center text-xs font-bold text-cc-text">
              {user?.displayName?.charAt(0) || '?'}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 text-cc-muted hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="pt-14">
        {activeTab === 'profile' && <ProfileEditor />}
        {activeTab === 'teach' && (
          <iframe
            src={`${TEACHASSIST_URL}?embedded=true`}
            title="TeachAssist"
            className="w-full border-0"
            style={{ height: 'calc(100vh - 3.5rem)' }}
            allow="clipboard-read; clipboard-write"
          />
        )}
      </main>
    </div>
  );
}

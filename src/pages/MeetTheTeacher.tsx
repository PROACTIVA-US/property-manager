import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HeroNav from '../components/teacher/HeroNav';
import AboutSection from '../components/teacher/AboutSection';
import ScheduleSection from '../components/teacher/ScheduleSection';
import ContactForm from '../components/teacher/ContactForm';
import GetToKnowMe from '../components/teacher/GetToKnowMe';
import LoginModal from '../components/LoginModal';
import { getTeacherProfile, DEFAULT_PROFILE, type TeacherProfile } from '../lib/teacherProfile';

export default function MeetTheTeacher() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getTeacherProfile().then((p) => {
      setProfile(p);
      setLoaded(true);
    });
  }, []);

  // Use DB profile or fall back to defaults
  const display = profile || {
    ...DEFAULT_PROFILE,
    id: '',
    createdAt: '',
    updatedAt: '',
  };

  const handleNavAction = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setLoginOpen(true);
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-cc-bg flex items-center justify-center">
        <div className="text-cc-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cc-bg">
      <HeroNav
        teacherName={display.name}
        onActionClick={handleNavAction}
        isLoggedIn={!!user}
      />

      {/* Spacer for fixed nav */}
      <div className="pt-14" />

      <AboutSection
        photoUrl={display.photoUrl}
        name={display.name}
        tagline={display.tagline}
        bio={display.bio}
        philosophy={display.philosophy}
      />

      <ScheduleSection schedule={display.schedule} />

      <ContactForm teacherId={profile?.id || null} />

      <GetToKnowMe />

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Footer */}
      <footer className="py-8 text-center text-cc-muted text-sm border-t border-cc-border/50">
        <p>&copy; {new Date().getFullYear()} {display.name}</p>
      </footer>
    </div>
  );
}

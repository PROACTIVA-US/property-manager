import WelcomeHero from '../components/welcome/WelcomeHero';
import QuickStartSection from '../components/welcome/QuickStartSection';
import RecentActivitySection from '../components/welcome/RecentActivitySection';
import FeatureOverview from '../components/welcome/FeatureOverview';
import { useAuth } from '../contexts/AuthContext';

export default function WelcomePage() {
  const { user } = useAuth();
  const userName = user?.displayName?.split(' ')[0]; // Get first name only

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <WelcomeHero userName={userName} />
      <QuickStartSection />
      {user?.role !== 'owner' && <RecentActivitySection />}
      {user?.role !== 'owner' && <FeatureOverview />}
    </div>
  );
}

import WelcomeHero from '../components/welcome/WelcomeHero';
import QuickStartSection from '../components/welcome/QuickStartSection';
import RecentActivitySection from '../components/welcome/RecentActivitySection';
import FeatureOverview from '../components/welcome/FeatureOverview';

export default function WelcomePage() {
  // TODO: Get actual user name from auth context when implemented
  const userName = undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <WelcomeHero userName={userName} />
      <QuickStartSection />
      <RecentActivitySection />
      <FeatureOverview />
    </div>
  );
}

import { Sparkles } from 'lucide-react';

interface WelcomeHeroProps {
  userName?: string;
}

export default function WelcomeHero({ userName }: WelcomeHeroProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-8 mb-8 border border-indigo-500/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-100">
          {getGreeting()}{userName ? `, ${userName}` : ''}!
        </h1>
      </div>
      <p className="text-gray-300 text-lg">
        Welcome to PropertyManager - your all-in-one platform for managing rental properties,
        maintenance projects, and tenant relationships.
      </p>
    </div>
  );
}

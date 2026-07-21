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
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-cc-text">
        {getGreeting()}{userName ? `, ${userName}` : ''}!
      </h1>
    </div>
  );
}

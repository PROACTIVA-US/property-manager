import { LogIn, LayoutDashboard } from 'lucide-react';

interface HeroNavProps {
  teacherName: string;
  onActionClick: () => void;
  isLoggedIn: boolean;
}

export default function HeroNav({ teacherName, onActionClick, isLoggedIn }: HeroNavProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-cc-surface/80 backdrop-blur-md border-b border-cc-border/50">
      <div className="max-w-4xl mx-auto h-full flex items-center justify-between px-4">
        <span className="text-lg font-bold text-cc-text">{teacherName}</span>
        <button
          onClick={onActionClick}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-cc-muted hover:text-cc-text border border-cc-border rounded-lg hover:border-cc-muted transition-colors"
        >
          {isLoggedIn ? (
            <>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Login
            </>
          )}
        </button>
      </div>
    </header>
  );
}

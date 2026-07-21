import { useNavigate } from 'react-router-dom';
import { Home, BookOpen } from 'lucide-react';

export default function PortalHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cc-bg pt-12">
      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 max-w-2xl w-full">
          {/* House card */}
          <button
            onClick={() => navigate('/home')}
            className="group flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-cc-border/50 bg-cc-surface hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
              <Home className="h-8 w-8 text-indigo-400" />
            </div>
            <span className="text-lg font-semibold text-cc-text">House</span>
            <span className="text-sm text-cc-muted">Property Manager</span>
          </button>

          {/* Teach card */}
          <button
            onClick={() => navigate('/teach')}
            className="group flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-cc-border/50 bg-cc-surface hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <BookOpen className="h-8 w-8 text-emerald-400" />
            </div>
            <span className="text-lg font-semibold text-cc-text">Teach</span>
            <span className="text-sm text-cc-muted">TeachAssist</span>
          </button>
        </div>
      </div>
    </div>
  );
}

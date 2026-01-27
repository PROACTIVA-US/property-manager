import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  className?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ size = 32, message, className = '', fullPage = false }: LoadingSpinnerProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 size={size} className="text-brand-orange animate-spin" />
      {message && <p className="text-brand-muted text-sm">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        {content}
      </div>
    );
  }

  return content;
}

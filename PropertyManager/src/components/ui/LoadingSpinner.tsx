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
      <Loader2 size={size} className="text-cc-accent animate-spin" />
      {message && <p className="text-cc-muted text-sm">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cc-bg">
        {content}
      </div>
    );
  }

  return content;
}

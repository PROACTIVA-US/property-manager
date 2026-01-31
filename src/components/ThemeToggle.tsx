import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme, type Theme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  showLabel?: boolean;
}

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function ThemeToggle({ variant = 'dropdown', showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;
  const currentOption = THEME_OPTIONS.find(opt => opt.value === theme);

  if (variant === 'button') {
    // Simple toggle button (cycles through themes)
    const handleCycle = () => {
      const currentIndex = THEME_OPTIONS.findIndex(opt => opt.value === theme);
      const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
      setTheme(THEME_OPTIONS[nextIndex].value);
    };

    return (
      <button
        onClick={handleCycle}
        className="p-2 rounded-lg bg-cc-surface border border-cc-border hover:bg-cc-border transition-colors"
        aria-label={`Current theme: ${currentOption?.label}. Click to change.`}
        title={`Theme: ${currentOption?.label}`}
      >
        <CurrentIcon size={20} className="text-cc-text" />
      </button>
    );
  }

  // Dropdown variant
  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cc-surface border border-cc-border hover:bg-cc-border transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Theme: ${currentOption?.label}`}
      >
        <CurrentIcon size={18} className="text-cc-text" />
        {showLabel && (
          <span className="text-sm text-cc-text">{currentOption?.label}</span>
        )}
        <ChevronDown 
          size={14} 
          className={`text-cc-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-40 py-1 bg-cc-surface border border-cc-border rounded-lg shadow-xl z-50"
          role="listbox"
          aria-label="Theme options"
        >
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  isSelected 
                    ? 'bg-cc-accent/20 text-cc-accent' 
                    : 'text-cc-text hover:bg-cc-border'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{option.label}</span>
                {isSelected && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

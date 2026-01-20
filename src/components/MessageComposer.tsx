import { useState } from 'react';
import { Send, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import type { UserRole } from '../contexts/AuthContext';
import type { Thread } from '../lib/messages';

interface MessageComposerProps {
  onSend: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MessageComposer({ onSend, placeholder = 'Type a message...', disabled }: MessageComposerProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !disabled) {
      onSend(content.trim());
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700/50 bg-brand-dark/30">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full resize-none input-field rounded-2xl py-3 px-4 pr-12 min-h-[48px] max-h-32',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        </div>
        <button
          type="submit"
          disabled={!content.trim() || disabled}
          className={cn(
            'p-3 rounded-full transition-all',
            content.trim() && !disabled
              ? 'bg-brand-orange text-white hover:bg-orange-600 shadow-lg shadow-orange-900/30'
              : 'bg-slate-700/50 text-brand-muted cursor-not-allowed'
          )}
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
}

// New Thread Composer
interface NewThreadComposerProps {
  onClose: () => void;
  onCreate: (thread: {
    subject: string;
    category: Thread['category'];
    participants: { id: string; role: UserRole; name: string }[];
    initialMessage: string;
  }) => void;
  currentUser: { id: string; role: UserRole; name: string };
  availableParticipants: { id: string; role: UserRole; name: string }[];
}

export function NewThreadComposer({
  onClose,
  onCreate,
  currentUser,
  availableParticipants,
}: NewThreadComposerProps) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<Thread['category']>('general');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim() && message.trim() && selectedParticipants.length > 0) {
      const participants = [
        currentUser,
        ...availableParticipants.filter(p => selectedParticipants.includes(p.id)),
      ];
      onCreate({
        subject: subject.trim(),
        category,
        participants,
        initialMessage: message.trim(),
      });
    }
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'text-purple-400 border-purple-400/50';
      case 'pm':
        return 'text-brand-orange border-brand-orange/50';
      case 'tenant':
        return 'text-blue-400 border-blue-400/50';
      default:
        return 'text-brand-muted border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-navy border border-slate-700/50 rounded-xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-brand-light">New Conversation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-brand-muted hover:text-brand-light"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
              className="w-full input-field"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {(['general', 'maintenance', 'lease', 'inspection'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize',
                    category === cat
                      ? 'bg-brand-orange text-white'
                      : 'bg-slate-700/50 text-brand-muted hover:bg-slate-700'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">
              Add Recipients
            </label>
            <div className="flex flex-wrap gap-2">
              {availableParticipants.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleParticipant(p.id)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium transition-colors border',
                    selectedParticipants.includes(p.id)
                      ? cn('bg-slate-700', getRoleColor(p.role))
                      : 'bg-transparent border-slate-600 text-brand-muted hover:border-slate-500'
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              rows={4}
              className="w-full input-field resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!subject.trim() || !message.trim() || selectedParticipants.length === 0}
              className={cn(
                'btn-primary flex items-center gap-2',
                (!subject.trim() || !message.trim() || selectedParticipants.length === 0) &&
                  'opacity-50 cursor-not-allowed'
              )}
            >
              <Plus size={18} />
              Create Thread
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

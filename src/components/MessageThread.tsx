import { useEffect, useRef } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import type { Thread, Message } from '../lib/messages';
import { formatRelativeTime } from '../lib/messages';
import { cn } from '../lib/utils';
import type { UserRole } from '../contexts/AuthContext';

interface MessageThreadProps {
  thread: Thread;
  messages: Message[];
  currentUserId: string;
  currentUserRole: UserRole;
  onBack: () => void;
}

export default function MessageThread({
  thread,
  messages,
  currentUserId,
  currentUserRole: _currentUserRole,
  onBack,
}: MessageThreadProps) {
  // currentUserRole reserved for future role-based features
  void _currentUserRole;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'text-purple-400';
      case 'pm':
        return 'text-brand-orange';
      case 'tenant':
        return 'text-blue-400';
      default:
        return 'text-brand-muted';
    }
  };

  const getRoleBgColor = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/20';
      case 'pm':
        return 'bg-brand-orange/20';
      case 'tenant':
        return 'bg-blue-500/20';
      default:
        return 'bg-slate-700';
    }
  };

  const getCategoryBadge = (category: Thread['category']) => {
    const styles = {
      general: 'bg-slate-600/50 text-slate-300',
      maintenance: 'bg-yellow-500/20 text-yellow-400',
      lease: 'bg-purple-500/20 text-purple-400',
      inspection: 'bg-green-500/20 text-green-400',
    };
    return styles[category] || styles.general;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="flex items-center gap-4 p-4 border-b border-slate-700/50 bg-brand-dark/30">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-brand-muted hover:text-brand-light"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-brand-light truncate">{thread.subject}</h2>
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium uppercase', getCategoryBadge(thread.category))}>
              {thread.category}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-brand-muted mt-1">
            <Users size={12} />
            <span>
              {thread.participants.map(p => p.name).join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          return (
            <div
              key={message.id}
              className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                  getRoleBgColor(message.senderRole),
                  getRoleColor(message.senderRole)
                )}
              >
                {message.senderName.charAt(0)}
              </div>

              {/* Message Content */}
              <div className={cn('max-w-[70%] space-y-1', isOwn && 'items-end')}>
                <div className={cn('flex items-center gap-2', isOwn && 'flex-row-reverse')}>
                  <span className={cn('text-xs font-medium', getRoleColor(message.senderRole))}>
                    {message.senderName}
                  </span>
                  <span className="text-[10px] text-brand-muted">
                    {formatRelativeTime(message.timestamp)}
                  </span>
                </div>
                <div
                  className={cn(
                    'px-4 py-2 rounded-2xl text-sm',
                    isOwn
                      ? 'bg-brand-orange/20 text-brand-light rounded-tr-sm'
                      : 'bg-slate-700/50 text-brand-light rounded-tl-sm'
                  )}
                >
                  {message.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

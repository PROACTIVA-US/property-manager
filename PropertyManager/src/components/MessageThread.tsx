import { useEffect, useRef } from 'react';
import { ArrowLeft, Users, Trash2 } from 'lucide-react';
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
  onDeleteMessage?: (messageId: string) => void;
}

export default function MessageThread({
  thread,
  messages,
  currentUserId,
  currentUserRole: _currentUserRole,
  onBack,
  onDeleteMessage,
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
        return 'text-cc-accent';
      case 'tenant':
        return 'text-blue-400';
      default:
        return 'text-cc-muted';
    }
  };

  const getRoleBgColor = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/20';
      case 'pm':
        return 'bg-cc-accent/20';
      case 'tenant':
        return 'bg-blue-500/20';
      default:
        return 'bg-cc-border';
    }
  };

  const getCategoryBadge = (category: Thread['category']) => {
    const styles = {
      general: 'bg-cc-border/50 text-slate-300',
      maintenance: 'bg-yellow-500/20 text-yellow-400',
      lease: 'bg-purple-500/20 text-purple-400',
      inspection: 'bg-green-500/20 text-green-400',
    };
    return styles[category] || styles.general;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="flex items-center gap-4 p-4 border-b border-cc-border/50 bg-cc-bg/30">
        <button
          onClick={onBack}
          className="p-2 hover:bg-cc-border/50 rounded-lg transition-colors text-cc-muted hover:text-cc-text"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-cc-text truncate">{thread.subject}</h2>
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium uppercase', getCategoryBadge(thread.category))}>
              {thread.category}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-cc-muted mt-1">
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
              <div className={cn('max-w-[70%] space-y-1 group', isOwn && 'items-end')}>
                <div className={cn('flex items-center gap-2', isOwn && 'flex-row-reverse')}>
                  <span className={cn('text-xs font-medium', getRoleColor(message.senderRole))}>
                    {message.senderName}
                  </span>
                  <span className="text-[10px] text-cc-muted">
                    {formatRelativeTime(message.timestamp)}
                  </span>
                  {isOwn && onDeleteMessage && (
                    <button
                      onClick={() => onDeleteMessage(message.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                      title="Delete message"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div
                  className={cn(
                    'px-4 py-2 rounded-2xl text-sm',
                    isOwn
                      ? 'bg-cc-accent/20 text-cc-text rounded-tr-sm'
                      : 'bg-cc-border/50 text-cc-text rounded-tl-sm'
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

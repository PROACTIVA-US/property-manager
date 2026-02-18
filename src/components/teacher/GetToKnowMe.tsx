import { useState } from 'react';
import { Mic, Send, MessageCircle } from 'lucide-react';

export default function GetToKnowMe() {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI-only for now — no backend
    setInput('');
  };

  return (
    <section className="py-16 px-4 bg-cc-surface/50">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="h-6 w-6 text-cc-accent" />
          <h2 className="text-2xl font-bold text-cc-text">Get to Know Me</h2>
        </div>
        <p className="text-cc-muted mb-6">
          Ask me anything! (Coming soon)
        </p>

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me a question..."
              className="w-full px-4 py-3 pr-12 bg-cc-bg border border-cc-border rounded-full text-cc-text placeholder-cc-muted focus:outline-none focus:border-cc-accent transition-colors"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-cc-muted hover:text-cc-accent transition-colors"
              title="Voice input (coming soon)"
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-cc-accent text-white rounded-full hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </section>
  );
}

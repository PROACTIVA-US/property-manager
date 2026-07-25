import { useState } from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { submitContactForm } from '../../lib/teacherProfile';

interface ContactFormProps {
  teacherId: string | null;
}

export default function ContactForm({ teacherId }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) {
      setError('Unable to send message at this time.');
      return;
    }

    setSending(true);
    setError(null);

    const success = await submitContactForm(teacherId, { name, email, message });

    if (success) {
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
    } else {
      setError('Failed to send message. Please try again.');
    }

    setSending(false);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-cc-text mb-2">Leave a Message</h2>
        <p className="text-cc-muted mb-8">
          Have a question or want to get in touch? Drop me a note!
        </p>

        {sent ? (
          <div className="flex flex-col items-center gap-4 p-8 bg-cc-surface rounded-xl border border-cc-border">
            <CheckCircle className="h-12 w-12 text-emerald-400" />
            <p className="text-cc-text font-medium">Message sent!</p>
            <p className="text-cc-muted text-sm">Thank you for reaching out.</p>
            <button
              onClick={() => setSent(false)}
              className="text-sm text-cc-accent hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-4 py-3 bg-cc-surface border border-cc-border rounded-lg text-cc-text placeholder-cc-muted focus:outline-none focus:border-cc-accent transition-colors"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="w-full px-4 py-3 bg-cc-surface border border-cc-border rounded-lg text-cc-text placeholder-cc-muted focus:outline-none focus:border-cc-accent transition-colors"
              />
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              required
              rows={4}
              className="w-full px-4 py-3 bg-cc-surface border border-cc-border rounded-lg text-cc-text placeholder-cc-muted focus:outline-none focus:border-cc-accent transition-colors resize-none"
            />

            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-6 py-3 bg-cc-accent text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Message
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

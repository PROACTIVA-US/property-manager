import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, KeyRound } from 'lucide-react';

export default function ChangePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setPassword('');
      setConfirm('');
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-cc-text flex items-center gap-2">
        <KeyRound size={16} className="text-cc-accent" />
        Change Password
      </h3>
      <form onSubmit={handleSubmit} className="max-w-sm space-y-3">
        <div>
          <label className="block text-sm font-medium text-cc-text mb-1">New Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text placeholder-cc-muted focus:outline-none focus:ring-2 focus:ring-cc-accent focus:border-transparent"
            placeholder="New password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-cc-text mb-1">Confirm Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text placeholder-cc-muted focus:outline-none focus:ring-2 focus:ring-cc-accent focus:border-transparent"
            placeholder="Confirm password"
          />
        </div>
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-3 py-2 rounded-lg text-sm">
            Password updated successfully.
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-cc-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cc-accent/90 disabled:opacity-50 transition-colors"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Password
        </button>
      </form>
    </div>
  );
}

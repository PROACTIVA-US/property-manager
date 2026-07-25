import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Home,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type AuthView = 'sign-in' | 'forgot' | 'reset';

interface HouseSignInProps {
  initialView?: AuthView;
  onPasswordUpdated?: () => void;
}

function safeAuthMessage(message: string) {
  if (/invalid login credentials/i.test(message)) {
    return 'That email and password combination did not work.';
  }
  if (/rate limit/i.test(message)) {
    return 'Too many attempts. Wait a few minutes and try again.';
  }
  return message;
}

export default function HouseSignIn({
  initialView = 'sign-in',
  onPasswordUpdated,
}: HouseSignInProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const resetFeedback = () => {
    setError('');
    setNotice('');
  };

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    resetFeedback();
    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (signInError) setError(safeAuthMessage(signInError.message));
  };

  const handleForgotPassword = async (event: FormEvent) => {
    event.preventDefault();
    resetFeedback();
    setBusy(true);
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}rebuild?mode=reset`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo },
    );
    setBusy(false);
    if (resetError) {
      setError(safeAuthMessage(resetError.message));
      return;
    }
    setNotice(
      'If that email has access, a secure password-reset link is on its way.',
    );
  };

  const handleUpdatePassword = async (event: FormEvent) => {
    event.preventDefault();
    resetFeedback();
    if (password.length < 6) {
      setError('Use at least 6 characters for the new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The two password entries do not match.');
      return;
    }

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(safeAuthMessage(updateError.message));
      return;
    }
    setNotice('Your password has been updated.');
    onPasswordUpdated?.();
  };

  const switchView = (nextView: AuthView) => {
    resetFeedback();
    setPassword('');
    setConfirmPassword('');
    setView(nextView);
  };

  return (
    <main className="house-auth-shell">
      <section className="house-auth-story" aria-label="House introduction">
        <div className="house-auth-brand">
          <span><Home aria-hidden="true" /></span>
          <strong>House</strong>
        </div>
        <div className="house-auth-story-copy">
          <p className="house-eyebrow">Private property workspace</p>
          <h1>One trusted record for one real home.</h1>
          <p>
            Property, people, lease, photos, work, and money—shared only with
            the people who belong here.
          </p>
        </div>
        <div className="house-auth-proof">
          <LockKeyhole aria-hidden="true" />
          <span>
            Invite-only access
            <small>Passwords are never visible to property staff.</small>
          </span>
        </div>
      </section>

      <section className="house-auth-panel">
        <div className="house-auth-card">
          {view !== 'sign-in' && (
            <button
              className="house-auth-back"
              type="button"
              onClick={() => switchView('sign-in')}
            >
              <ArrowLeft aria-hidden="true" />
              Back to sign in
            </button>
          )}

          <div className="house-auth-heading">
            <span className="house-auth-icon">
              {view === 'sign-in' ? (
                <KeyRound aria-hidden="true" />
              ) : (
                <Mail aria-hidden="true" />
              )}
            </span>
            <div>
              <p className="house-eyebrow">
                {view === 'sign-in'
                  ? 'Welcome back'
                  : view === 'forgot'
                    ? 'Password recovery'
                    : 'Choose a new password'}
              </p>
              <h2>
                {view === 'sign-in'
                  ? 'Sign in to House'
                  : view === 'forgot'
                    ? 'Reset your password'
                    : 'Secure your account'}
              </h2>
            </div>
          </div>

          {view === 'sign-in' && (
            <form className="house-auth-form" onSubmit={handleSignIn}>
              <label>
                Email
                <span className="house-input-wrap">
                  <Mail aria-hidden="true" />
                  <input
                    autoComplete="email"
                    inputMode="email"
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    value={email}
                  />
                </span>
              </label>
              <label>
                Password
                <span className="house-input-wrap">
                  <LockKeyhole aria-hidden="true" />
                  <input
                    autoComplete="current-password"
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </span>
              </label>
              <button className="house-auth-primary" disabled={busy} type="submit">
                {busy && <Loader2 className="house-spin" aria-hidden="true" />}
                Sign in
              </button>
              <button
                className="house-auth-link"
                type="button"
                onClick={() => switchView('forgot')}
              >
                I forgot my password
              </button>
            </form>
          )}

          {view === 'forgot' && (
            <form className="house-auth-form" onSubmit={handleForgotPassword}>
              <p className="house-auth-help">
                Enter the email that was invited to this property. We’ll send
                a single-use reset link if the account exists.
              </p>
              <label>
                Email
                <span className="house-input-wrap">
                  <Mail aria-hidden="true" />
                  <input
                    autoComplete="email"
                    inputMode="email"
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    value={email}
                  />
                </span>
              </label>
              <button className="house-auth-primary" disabled={busy} type="submit">
                {busy && <Loader2 className="house-spin" aria-hidden="true" />}
                Send reset link
              </button>
            </form>
          )}

          {view === 'reset' && (
            <form className="house-auth-form" onSubmit={handleUpdatePassword}>
              <p className="house-auth-help">
                Use at least 6 characters. A password manager can create and
                remember a strong one for you.
              </p>
              <label>
                New password
                <span className="house-input-wrap">
                  <LockKeyhole aria-hidden="true" />
                  <input
                    autoComplete="new-password"
                    minLength={6}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </span>
              </label>
              <label>
                Confirm new password
                <span className="house-input-wrap">
                  <LockKeyhole aria-hidden="true" />
                  <input
                    autoComplete="new-password"
                    minLength={6}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    type="password"
                    value={confirmPassword}
                  />
                </span>
              </label>
              <button className="house-auth-primary" disabled={busy} type="submit">
                {busy && <Loader2 className="house-spin" aria-hidden="true" />}
                Save new password
              </button>
            </form>
          )}

          {error && (
            <p className="house-auth-message house-auth-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="house-auth-message house-auth-success" role="status">
              <CheckCircle2 aria-hidden="true" />
              {notice}
            </p>
          )}

          <p className="house-auth-footnote">
            There is no public sign-up. Contact the property manager if your
            invitation uses a different email.
          </p>
        </div>
      </section>
    </main>
  );
}

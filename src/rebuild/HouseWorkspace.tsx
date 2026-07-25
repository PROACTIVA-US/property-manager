import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  AlertTriangle,
  Home,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadHouseWorkspace } from './data';
import HouseSignIn from './HouseSignIn';
import HouseToday from './HouseToday';
import type { HouseWorkspaceData } from './types';
import './HouseWorkspace.css';

function clearRecoveryMode() {
  const url = new URL(window.location.href);
  url.searchParams.delete('mode');
  window.history.replaceState({}, '', `${url.pathname}${url.search}`);
}

export default function HouseWorkspace() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [workspace, setWorkspace] = useState<HouseWorkspaceData | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState('');
  const [passwordRecovery, setPasswordRecovery] = useState(
    () => new URLSearchParams(window.location.search).get('mode') === 'reset',
  );

  useEffect(() => {
    document.title = 'House · Private property workspace';

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) setWorkspaceError(error.message);
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      if (event === 'SIGNED_OUT') {
        setWorkspace(null);
        setPasswordRecovery(false);
        clearRecoveryMode();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshWorkspace = useCallback(async () => {
    if (!session?.user.id) return;
    setWorkspaceLoading(true);
    setWorkspaceError('');
    try {
      const nextWorkspace = await loadHouseWorkspace(session.user.id);
      setWorkspace(nextWorkspace);
    } catch (error) {
      setWorkspaceError(
        error instanceof Error
          ? error.message
          : 'The property workspace could not be loaded.',
      );
    } finally {
      setWorkspaceLoading(false);
    }
  }, [session?.user.id]);

  useEffect(() => {
    if (session && !passwordRecovery) void refreshWorkspace();
  }, [passwordRecovery, refreshWorkspace, session]);

  if (authLoading) {
    return (
      <main className="house-gate-state">
        <span className="house-gate-mark"><Home aria-hidden="true" /></span>
        <Loader2 className="house-spin" aria-hidden="true" />
        <h1>Opening House</h1>
        <p>Checking your private session…</p>
      </main>
    );
  }

  if (!session) return <HouseSignIn />;

  if (passwordRecovery) {
    return (
      <HouseSignIn
        initialView="reset"
        onPasswordUpdated={() => {
          setPasswordRecovery(false);
          clearRecoveryMode();
        }}
      />
    );
  }

  if (workspaceLoading && !workspace) {
    return (
      <main className="house-gate-state">
        <span className="house-gate-mark"><ShieldCheck aria-hidden="true" /></span>
        <Loader2 className="house-spin" aria-hidden="true" />
        <h1>Loading your house record</h1>
        <p>Applying your property role and privacy rules…</p>
      </main>
    );
  }

  if (workspaceError && !workspace) {
    return (
      <main className="house-gate-state house-gate-error">
        <span className="house-gate-mark"><AlertTriangle aria-hidden="true" /></span>
        <h1>House could not open</h1>
        <p>{workspaceError}</p>
        <div className="house-gate-actions">
          <button type="button" onClick={() => void refreshWorkspace()}>
            <RefreshCw aria-hidden="true" /> Try again
          </button>
          <button type="button" onClick={() => void supabase.auth.signOut()}>
            <LogOut aria-hidden="true" /> Sign out
          </button>
        </div>
      </main>
    );
  }

  if (!workspace) {
    return (
      <main className="house-gate-state house-gate-error">
        <span className="house-gate-mark"><ShieldCheck aria-hidden="true" /></span>
        <h1>This account has no House access yet</h1>
        <p>
          You signed in successfully, but this email is not an active member of
          a property. Ask the property manager to confirm the invited email.
        </p>
        <div className="house-gate-actions">
          <button type="button" onClick={() => void supabase.auth.signOut()}>
            <LogOut aria-hidden="true" /> Sign out
          </button>
        </div>
      </main>
    );
  }

  return <HouseToday data={workspace} onRefresh={refreshWorkspace} />;
}

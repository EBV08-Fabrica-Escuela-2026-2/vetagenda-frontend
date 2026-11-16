import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock3 } from 'lucide-react';
import { announceToScreenReader } from '../accessibility/announcer';
import { useDialogAccessibility } from '../accessibility/dialog';
import {
  CLIENT_SESSION_EVENT,
  clearClientSession,
  getAuthenticatedSession,
  logoutCurrentSession,
} from '../services/api';

export const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;
export const INACTIVITY_WARNING_MS = 60 * 1000;
const LAST_ACTIVITY_KEY = 'vetagenda-last-activity';
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'pointerdown',
  'keydown',
  'scroll',
  'touchstart',
  'focus',
];

export function IdleSessionManager() {
  const navigate = useNavigate();
  const [hasSession, setHasSession] = useState(() => getAuthenticatedSession() !== null);
  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(INACTIVITY_WARNING_MS / 1000);
  const lastRecordedActivity = useRef(0);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  const recordActivity = useCallback(() => {
    if (!getAuthenticatedSession()) return;
    const now = Date.now();
    if (now - lastRecordedActivity.current < 1_000) return;
    lastRecordedActivity.current = now;
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    setWarningOpen(false);
  }, []);

  const closeWarning = useCallback(() => recordActivity(), [recordActivity]);
  const dialogRef = useDialogAccessibility({
    isOpen: warningOpen,
    onClose: closeWarning,
    initialFocusRef: continueButtonRef,
  });

  useEffect(() => {
    const refreshSession = () => {
      const active = getAuthenticatedSession() !== null;
      setHasSession(active);
      if (active && !localStorage.getItem(LAST_ACTIVITY_KEY)) recordActivity();
      if (!active) setWarningOpen(false);
    };
    refreshSession();
    window.addEventListener(CLIENT_SESSION_EVENT, refreshSession);
    window.addEventListener('storage', refreshSession);
    return () => {
      window.removeEventListener(CLIENT_SESSION_EVENT, refreshSession);
      window.removeEventListener('storage', refreshSession);
    };
  }, [recordActivity]);

  useEffect(() => {
    if (!hasSession) return;
    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }));
    return () => ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
  }, [hasSession, recordActivity]);

  useEffect(() => {
    if (!hasSession) return;
    let expiring = false;
    const checkInactivity = async () => {
      const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now());
      const remaining = INACTIVITY_LIMIT_MS - (Date.now() - lastActivity);

      if (remaining <= 0 && !expiring) {
        expiring = true;
        const session = getAuthenticatedSession();
        clearClientSession();
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        setWarningOpen(false);
        announceToScreenReader('Tu sesión se cerró por inactividad.');
        navigate('/login?reason=inactive', { replace: true });
        if (session) void logoutCurrentSession(session.token).catch(() => undefined);
        return;
      }

      if (remaining <= INACTIVITY_WARNING_MS) {
        const seconds = Math.max(1, Math.ceil(remaining / 1000));
        setSecondsRemaining(seconds);
        setWarningOpen(true);
      }
    };

    void checkInactivity();
    const intervalId = window.setInterval(() => void checkInactivity(), 1_000);
    return () => window.clearInterval(intervalId);
  }, [hasSession, navigate]);

  if (!warningOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/60 p-4">
      <section
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="idle-session-title"
        aria-describedby="idle-session-description"
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <Clock3 className="h-10 w-10 text-amber-600" aria-hidden="true" />
        <h2 id="idle-session-title" className="mt-4 text-xl font-black text-slate-950">
          Tu sesión está por cerrarse
        </h2>
        <p id="idle-session-description" className="mt-2 text-sm leading-6 text-slate-600">
          No detectamos actividad. La sesión se cerrará en {secondsRemaining} segundos para proteger tu cuenta.
        </p>
        <button
          ref={continueButtonRef}
          type="button"
          onClick={recordActivity}
          className="mt-6 min-h-11 w-full rounded-xl bg-[#0D5C75] px-4 font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
        >
          Continuar sesión
        </button>
      </section>
    </div>
  );
}

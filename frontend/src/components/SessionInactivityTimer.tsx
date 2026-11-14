
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CLIENT_SESSION_EVENT,
  clearClientSession,
  getAuthenticatedSession,
  logoutCurrentSession,
} from '../services/api';

const WARNING_LIMIT = 25 * 60 * 1000;
const INACTIVITY_LIMIT = 30 * 60 * 1000;

export function SessionInactivityTimer() {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    let warningTimer: ReturnType<typeof setTimeout> | undefined;
    let logoutTimer: ReturnType<typeof setTimeout> | undefined;
    let lastActivity = Date.now();
    let sessionToken: string | undefined;

    const clearTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
    };

    const expireSession = () => {
      const session = getAuthenticatedSession();
      if (!session) {
        setShowWarning(false);
        clearTimers();
        return;
      }

      clearTimers();
      setShowWarning(false);
      clearClientSession();
      navigate('/', { replace: true });

      void logoutCurrentSession(session.token).catch((error) => {
        console.error('No se pudo notificar el cierre de sesión:', error);
      });
    };

    const scheduleTimers = () => {
      clearTimers();

      const elapsed = Date.now() - lastActivity;
      const remaining = INACTIVITY_LIMIT - elapsed;

      if (remaining <= 0) {
        expireSession();
        return;
      }

      if (elapsed >= WARNING_LIMIT) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
        warningTimer = setTimeout(() => {
          scheduleTimers();
        }, WARNING_LIMIT - elapsed);
      }

      logoutTimer = setTimeout(() => {
        scheduleTimers();
      }, remaining);
    };

    const resetTimer = () => {
      const session = getAuthenticatedSession();

      if (!session) {
        sessionToken = undefined;
        clearTimers();
        setShowWarning(false);
        return;
      }

      lastActivity = Date.now();
      sessionToken = session.token;
      scheduleTimers();
    };

    const checkSession = () => {
      const session = getAuthenticatedSession();

      if (!session) {
        sessionToken = undefined;
        clearTimers();
        setShowWarning(false);
        return;
      }

      if (session.token !== sessionToken) {
        resetTimer();
      } else {
        scheduleTimers();
      }
    };

    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    window.addEventListener(CLIENT_SESSION_EVENT, checkSession);
    window.addEventListener('storage', checkSession);
    window.addEventListener('focus', checkSession);
    document.addEventListener('visibilitychange', checkSession);

    resetTimer();

    return () => {
      clearTimers();

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });

      window.removeEventListener(CLIENT_SESSION_EVENT, checkSession);
      window.removeEventListener('storage', checkSession);
      window.removeEventListener('focus', checkSession);
      document.removeEventListener('visibilitychange', checkSession);
    };
  }, [navigate]);

  return (
    <>
      {showWarning && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4"
          role="presentation"
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="inactivity-warning-title"
            aria-describedby="inactivity-warning-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
          >
            <h2
              id="inactivity-warning-title"
              className="text-xl font-black"
            >
              Tu sesión está por finalizar
            </h2>

            <p
              id="inactivity-warning-description"
              className="mt-3 text-sm leading-6 text-slate-600"
            >
              Llevas 25 minutos sin actividad. Por seguridad,
              tu sesión se cerrará automáticamente al completar
              30 minutos de inactividad.
            </p>

            <button
              type="button"
              onClick={resetTimer}
              className="mt-6 min-h-11 w-full rounded-xl bg-[#0D5C75] px-4 py-2 text-sm font-bold text-white hover:bg-[#09485d]"
            >
              Continuar sesión
            </button>
          </section>
        </div>
      )}
    </>
  );
}

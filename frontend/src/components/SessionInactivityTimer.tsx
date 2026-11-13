
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CLIENT_SESSION_EVENT,
  clearClientSession,
  getAuthenticatedSession,
  logoutCurrentSession,
} from '../services/api';

const INACTIVITY_LIMIT = 15 * 60 * 1000;

export function SessionInactivityTimer() {
  const navigate = useNavigate();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const expireSession = () => {
      const session = getAuthenticatedSession();
      if (!session) return;

      clearClientSession();
      navigate('/', { replace: true });

      void logoutCurrentSession(session.token).catch((error) => {
        console.error('No se pudo notificar el cierre de sesión:', error);
      });
    };

    const resetTimer = () => {
      clearTimeout(timer);

      if (getAuthenticatedSession()) {
        timer = setTimeout(expireSession, INACTIVITY_LIMIT);
      }
    };

    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    window.addEventListener(CLIENT_SESSION_EVENT, resetTimer);
    window.addEventListener('storage', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      window.removeEventListener(CLIENT_SESSION_EVENT, resetTimer);
      window.removeEventListener('storage', resetTimer);
    };
  }, [navigate]);

  return null;
}

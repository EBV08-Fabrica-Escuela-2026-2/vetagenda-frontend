import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogIn, LogOut, UserRound } from 'lucide-react';
import {
  CLIENT_SESSION_EVENT,
  clearClientSession,
  getAuthenticatedSession,
  type AuthenticatedSession,
} from '../services/api';

type ClientSessionActionsProps = {
  className?: string;
  onOpenLogin?: () => void;
  onAction?: () => void;
  showPortalLink?: boolean;
  stacked?: boolean;
};

export function ClientSessionActions({
  className = '',
  onOpenLogin,
  onAction,
  showPortalLink = true,
  stacked = false,
}: ClientSessionActionsProps) {
  const [session, setSession] = useState<AuthenticatedSession | null>(() => getAuthenticatedSession());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const refreshSession = () => setSession(getAuthenticatedSession());

    window.addEventListener(CLIENT_SESSION_EVENT, refreshSession);
    window.addEventListener('storage', refreshSession);
    return () => {
      window.removeEventListener(CLIENT_SESSION_EVENT, refreshSession);
      window.removeEventListener('storage', refreshSession);
    };
  }, []);

  const handleLogout = () => {
    clearClientSession();
    setSession(null);
    onAction?.();
    navigate('/', { replace: true });
  };

  const containerClass = stacked
    ? 'flex flex-col items-stretch gap-2'
    : 'flex flex-wrap items-center justify-end gap-2';

  if (!session) {
    const buttonClass = `${stacked ? 'w-full justify-start' : ''} inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-[#0D5C75] transition hover:bg-[#F0F7F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]`;

    if (onOpenLogin) {
      return (
        <div className={`${containerClass} ${className}`}>
          <button
            type="button"
            onClick={() => {
              onAction?.();
              onOpenLogin();
            }}
            className={buttonClass}
          >
            <LogIn className="h-4 w-4" />
            Ingresar
          </button>
        </div>
      );
    }

    const returnTo = `${location.pathname}${location.search}`;
    return (
      <div className={`${containerClass} ${className}`}>
        <Link
          to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
          onClick={onAction}
          className={buttonClass}
        >
          <LogIn className="h-4 w-4" />
          Ingresar
        </Link>
      </div>
    );
  }

  const firstName = session.nombre.trim().split(/\s+/)[0] || session.nombre;

  return (
    <div className={`${containerClass} ${className}`}>
      <span
        className={`${stacked ? 'w-full justify-start' : ''} inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900`}
        title={`Sesión iniciada como ${session.nombre}`}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
        <UserRound className="h-4 w-4" />
        <span>Sesión: {firstName}</span>
      </span>

      {showPortalLink && (
        <Link
          to={session.rol === 'VETERINARIO' ? '/veterinario/agenda' : '/cliente'}
          onClick={onAction}
          className={`${stacked ? 'w-full justify-start' : ''} inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-[#0D5C75] transition hover:bg-[#F0F7F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Mi portal
        </Link>
      )}

      <button
        type="button"
        onClick={handleLogout}
        className={`${stacked ? 'w-full justify-start' : ''} inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400`}
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronRight, History, House, LogOut, Stethoscope } from 'lucide-react';
import { Logo } from './Logo';
import { clearSession, type Session } from '../../services/api';
import { iniciales } from '../../utils/format';

type Props = { session: Session | null };

export function AppHeader({ session }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const items = [
    { to: '/', label: 'Inicio', icon: House, visible: true },
    { to: '/historial', label: 'Historial', icon: History, visible: session?.rol === 'CLIENTE' },
    { to: '/modulo-medico', label: 'Módulo médico', icon: Stethoscope, visible: session?.rol === 'VETERINARIO' },
  ].filter((item) => item.visible);

  const logout = () => {
    clearSession();
    setOpen(false);
    navigate('/ingresar');
  };

  return (
    <header className="sticky top-0 z-30 bg-brand-900 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        <NavLink to="/" aria-label="Ir al inicio" className="shrink-0">
          <Logo />
        </NavLink>

        <nav className="flex h-full items-stretch gap-1 overflow-x-auto" aria-label="Principal">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `relative flex items-center gap-2 whitespace-nowrap px-3 text-sm font-semibold transition sm:px-4 ${
                  isActive ? 'bg-white/[0.08] text-white' : 'text-[#B7D0D7] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="sr-only md:not-sr-only">{label}</span>
                  {isActive && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-brand-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto" ref={menuRef}>
          {session ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-white/[0.08]"
                aria-haspopup="menu"
                aria-expanded={open}
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-700 font-display text-sm font-bold">
                  {iniciales(session.nombre)}
                </span>
                <span className="hidden sm:block">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#B7D0D7]">Cuenta activa</span>
                  <span className="block text-sm font-bold leading-tight">{session.nombre}</span>
                </span>
                <ChevronRight className={`h-4 w-4 text-[#B7D0D7] transition ${open ? 'rotate-90' : ''}`} aria-hidden />
              </button>
              {open && (
                <div role="menu" className="absolute right-0 mt-2 w-60 animate-fade-in rounded-xl border border-line bg-white p-2 text-ink-800 shadow-card">
                  <p className="px-3 py-2 text-xs text-ink-400">
                    {session.rol === 'CLIENTE' ? 'Cliente' : `Veterinario${session.especialidad ? ` · ${session.especialidad}` : ''}`}
                  </p>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-canvas"
                  >
                    <LogOut className="h-4 w-4" aria-hidden /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/ingresar" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">
              Ingresar
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

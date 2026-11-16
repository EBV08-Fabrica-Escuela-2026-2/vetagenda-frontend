import { CalendarDays, Home, PawPrint, Stethoscope } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ClientSessionActions } from './ClientSessionActions';
import { Logo } from './Logo';

const navigation = [
  { to: '/cliente', label: 'Inicio', icon: Home, exact: true },
  { to: '/cliente/citas', label: 'Mis citas', icon: CalendarDays },
  { to: '/cliente#mascotas', label: 'Mis mascotas', icon: PawPrint, hash: '#mascotas' },
  { to: '/catalogo', label: 'Servicios', icon: Stethoscope },
];

export function ClientPortalHeader() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-2 px-4 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-6 lg:px-8">
        <div className="flex min-h-[68px] items-center justify-between gap-3">
          <Logo subtitle="Portal de clientes" to="/cliente" className="self-start" />
          <ClientSessionActions showPortalLink={false} className="lg:hidden" />
        </div>

        <nav aria-label="Portal de clientes" className="order-3 flex gap-1 overflow-x-auto border-t border-slate-100 py-2 lg:order-none lg:justify-center lg:border-0">
          {navigation.map(({ to, label, icon: Icon, exact, hash }) => {
            const isActive = hash
              ? location.pathname === '/cliente' && location.hash === hash
              : exact
                ? location.pathname === to && !location.hash
                : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                  isActive
                    ? 'bg-[#E8F4F1] text-[#0D5C75]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <ClientSessionActions showPortalLink={false} className="hidden lg:flex" />
      </div>
    </header>
  );
}

import { CalendarDays, Home, PawPrint, Stethoscope } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ClientSessionActions } from './ClientSessionActions';
import { Logo } from './Logo';

const navigation = [
  { to: '/cliente', label: 'Inicio', icon: Home, exact: true },
  { to: '/cliente/citas', label: 'Mis citas', icon: CalendarDays },
  { to: '/mascotas/registro', label: 'Registrar mascota', icon: PawPrint },
  { to: '/catalogo', label: 'Servicios', icon: Stethoscope },
];

export function ClientPortalHeader() {
  const location = useLocation();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[72px] flex-col items-stretch justify-between gap-3 py-4 sm:flex-row sm:items-center sm:py-0">
          <Logo subtitle="Portal de clientes" to="/cliente" className="self-start" />
          <ClientSessionActions showPortalLink={false} />
        </div>

        <nav aria-label="Portal de clientes" className="flex gap-2 overflow-x-auto border-t border-slate-100 py-2">
          {navigation.map(({ to, label, icon: Icon, exact }) => {
            const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1 ${
                  isActive
                    ? 'bg-[#E8F4F1] text-[#0D5C75]'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

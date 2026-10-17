import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import { Logo } from './Logo';

type NavbarProps = {
  onOpenRoleSwitcher: () => void;
};

const links = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#portales', label: 'Portales' },
  { href: '#faq', label: 'Preguntas' },
];

export function Navbar({ onOpenRoleSwitcher }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      <Link
        to="/disponibilidad"
        className="block bg-[#0D5C75] px-4 py-2 text-center text-xs font-semibold text-white transition hover:bg-[#094356] sm:text-sm"
      >
        Consulta la disponibilidad y agenda tu cita →
      </Link>

      <div className="border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-5 md:px-10">
          <Logo />

          <nav aria-label="Navegación principal" className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#0D5C75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenRoleSwitcher}
              className="hidden rounded-full px-4 py-2 text-sm font-bold text-[#0D5C75] transition hover:bg-[#F0F7F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] sm:inline-flex"
            >
              Ingresar
            </button>
            <button
              type="button"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              <Icon name={open ? 'close' : 'menu'} className="h-6 w-6" />
            </button>
          </div>
        </div>

        <nav
          id="mobile-menu"
          aria-label="Navegación móvil"
          className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 lg:hidden ${open ? 'max-h-96' : 'max-h-0 border-t-0'}`}
        >
          <div className="flex flex-col px-5 py-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-[#F0F7F7]"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenRoleSwitcher();
              }}
              className="mt-1 rounded-xl px-3 py-3 text-left text-sm font-bold text-[#0D5C75] hover:bg-[#F0F7F7]"
            >
              Ingresar
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

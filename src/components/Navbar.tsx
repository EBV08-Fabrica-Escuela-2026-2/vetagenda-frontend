import { useEffect, useRef, useState } from 'react';
import { ClientSessionActions } from './ClientSessionActions';
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-5 md:px-10">
          <Logo />

          <nav aria-label="Navegación principal" className="hidden items-center gap-5 lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex min-h-[44px] items-center rounded-lg px-2 text-sm font-semibold text-slate-700 transition-colors hover:text-[#0D5C75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ClientSessionActions onOpenLogin={onOpenRoleSwitcher} className="hidden sm:flex" />
            <button
              ref={menuButtonRef}
              type="button"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 lg:hidden"
            >
              <Icon name={open ? 'close' : 'menu'} className="h-6 w-6" />
            </button>
          </div>
        </div>

        <nav
          id="mobile-menu"
          aria-label="Navegación móvil"
          hidden={!open}
          className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 lg:hidden ${open ? 'visible max-h-96' : 'invisible max-h-0 border-t-0'}`}
        >
          <div className="flex flex-col gap-2 px-5 py-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="inline-flex min-h-[44px] items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[#F0F7F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
              >
                {link.label}
              </a>
            ))}
            <ClientSessionActions
              onOpenLogin={onOpenRoleSwitcher}
              onAction={() => setOpen(false)}
              className="mt-1"
              stacked
            />
          </div>
        </nav>
      </div>
    </header>
  );
}

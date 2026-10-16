import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-slate-900 px-5 py-9 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo variant="light" />
          <p className="mt-2 text-xs text-slate-300">© {new Date().getFullYear()} VetAgenda · Proyecto académico.</p>
        </div>
        <nav aria-label="Enlaces institucionales" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-200">
          <a href="#como-funciona" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">Cómo funciona</a>
          <a href="#faq" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">Preguntas</a>
          <a href="#nosotros" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">Nosotros</a>
          <a href="#privacidad" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">Privacidad y Habeas Data</a>
          <a href="#terminos" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">Términos</a>
          <a href="mailto:contacto@vetagenda.com" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">Contacto</a>
        </nav>
      </div>
    </footer>
  );
}

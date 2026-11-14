import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer id="nosotros" className="scroll-mt-28 bg-slate-900 px-5 py-12 text-white md:px-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-slate-700 pb-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo variant="light" />
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Organiza el cuidado de tus mascotas, consulta servicios y encuentra horarios disponibles en un solo lugar.
            </p>
            <p className="mt-3 max-w-md text-xs leading-5 text-slate-400">
              Demostración académica. No ingreses datos personales reales.
            </p>
          </div>

          <nav aria-label="Explorar VetAgenda">
            <h2 className="text-xs font-bold uppercase text-slate-300">Explorar</h2>
            <div className="mt-3 flex flex-col items-start gap-2 text-sm text-slate-200">
              <Link to="/#como-funciona" className="inline-flex min-h-[44px] items-center rounded-lg px-1 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Cómo funciona</Link>
              <Link to="/#servicios" className="inline-flex min-h-[44px] items-center rounded-lg px-1 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Servicios</Link>
              <Link to="/#portales" className="inline-flex min-h-[44px] items-center rounded-lg px-1 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Portales</Link>
              <Link to="/#faq" className="inline-flex min-h-[44px] items-center rounded-lg px-1 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Preguntas frecuentes</Link>
            </div>
          </nav>

          <nav aria-label="Accesos de VetAgenda">
            <h2 className="text-xs font-bold uppercase text-slate-300">Accesos</h2>
            <div className="mt-3 flex flex-col items-start gap-2 text-sm text-slate-200">
              <Link to="/disponibilidad" className="inline-flex min-h-[44px] items-center rounded-lg px-1 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Consultar disponibilidad</Link>
              <Link to="/catalogo" className="inline-flex min-h-[44px] items-center rounded-lg px-1 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Catálogo de servicios</Link>
              <Link to="/cliente/citas" className="inline-flex min-h-[44px] items-center rounded-lg px-1 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Consultar mis citas</Link>
            </div>
          </nav>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-xs text-slate-300 lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} VetAgenda.</p>
          <nav aria-label="Información legal" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/privacidad" className="inline-flex min-h-[44px] items-center rounded-lg px-1 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Privacidad y Habeas Data</Link>
            <Link to="/terminos" className="inline-flex min-h-[44px] items-center rounded-lg px-1 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Términos de uso</Link>
            <Link to="/contacto" className="inline-flex min-h-[44px] items-center rounded-lg px-1 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Contacto</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

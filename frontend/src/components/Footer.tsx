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
            <h2 className="text-xs font-bold uppercase text-slate-400">Explorar</h2>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-200">
              <a href="#como-funciona" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">Cómo funciona</a>
              <a href="#servicios" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">Servicios</a>
              <a href="#portales" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">Portales</a>
              <a href="#faq" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">Preguntas frecuentes</a>
            </div>
          </nav>

          <nav aria-label="Accesos de VetAgenda">
            <h2 className="text-xs font-bold uppercase text-slate-400">Accesos</h2>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-200">
              <Link to="/disponibilidad" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">Consultar disponibilidad</Link>
              <Link to="/catalogo" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">Catálogo de servicios</Link>
              <Link to="/cliente/citas" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">Consultar mis citas</Link>
            </div>
          </nav>
        </div>

        <div className="flex flex-col gap-2 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} VetAgenda.</p>
          <p>Proyecto académico de Fábrica Escuela.</p>
        </div>
      </div>
    </footer>
  );
}

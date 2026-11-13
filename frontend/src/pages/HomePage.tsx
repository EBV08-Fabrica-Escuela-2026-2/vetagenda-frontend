import { Link } from 'react-router-dom';
import { ArrowRight, History, Stethoscope } from 'lucide-react';
import type { Session } from '../services/api';

export function HomePage({ session }: { session: Session | null }) {
  const accesos = [
    {
      to: '/historial',
      icon: History,
      titulo: 'Historial asistencial',
      texto: 'Para clientes: citas completadas y canceladas de tus mascotas, con profesional, servicio y notas clínicas.',
      rol: 'CLIENTE',
    },
    {
      to: '/modulo-medico',
      icon: Stethoscope,
      titulo: 'Módulo médico',
      texto: 'Para veterinarios: diagnósticos, tratamientos y fechas de atención del paciente en consulta.',
      rol: 'VETERINARIO',
    },
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
        <span className="h-2 w-2 rounded-full bg-brand-400" aria-hidden /> VetAgenda
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-brand-950 sm:text-5xl">
        {session ? `Hola, ${session.nombre.split(' ')[0] === 'Dra.' || session.nombre.split(' ')[0] === 'Dr.' ? session.nombre : session.nombre.split(' ')[0]}` : 'Bienvenido'}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-500">
        Haz seguimiento a la evolución clínica de los pacientes y audita el cumplimiento de los turnos programados.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {accesos.map(({ to, icon: Icon, titulo, texto, rol }) => {
          const disponible = !session || session.rol === rol;
          return (
            <Link
              key={to}
              to={disponible ? (session ? to : '/ingresar') : '#'}
              aria-disabled={!disponible}
              onClick={(e) => !disponible && e.preventDefault()}
              className={`card group flex items-start gap-4 p-6 transition ${disponible ? 'hover:-translate-y-0.5 hover:border-brand-500' : 'cursor-not-allowed opacity-50'}`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-display text-2xl font-bold text-brand-950">{titulo}</span>
                <span className="mt-1 block text-sm text-ink-500">{texto}</span>
                {!disponible && <span className="mt-2 block text-xs font-semibold text-ink-400">No disponible para tu rol</span>}
              </span>
              {disponible && <ArrowRight className="mt-1 h-5 w-5 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden />}
            </Link>
          );
        })}
      </div>
    </main>
  );
}

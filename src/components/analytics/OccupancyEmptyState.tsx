import { CalendarX2 } from 'lucide-react';

type Props = { onReset: () => void };

export function OccupancyEmptyState({ onReset }: Props) {
  return (
    <section className="flex min-h-[22rem] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <span className="rounded-full bg-slate-100 p-4 text-slate-500">
        <CalendarX2 aria-hidden="true" size={30} />
      </span>
      <h2 className="mt-5 text-xl font-extrabold text-slate-900">
        No hay registros de turnos para el periodo seleccionado
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
        Verifica el rango de fechas seleccionado o ajusta los filtros de sede y profesional para consultar otro periodo.
      </p>
      <button
        className="mt-6 min-h-11 rounded-xl bg-[#0D5C75] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#09485d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
        onClick={onReset}
        type="button"
      >
        Ver semana actual
      </button>
    </section>
  );
}

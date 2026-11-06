import { Activity, CalendarCheck2, CalendarRange, CircleOff } from 'lucide-react';

type Props = {
  occupancy: number;
  enabledSlots: number;
  effectiveAppointments: number;
  freeSlots: number;
};

const cards = [
  { label: 'Tasa global de ocupación', icon: Activity, accent: 'text-teal-700' },
  { label: 'Total slots habilitados', icon: CalendarRange, accent: 'text-[#0D5C75]' },
  { label: 'Citas efectivas agendadas', icon: CalendarCheck2, accent: 'text-indigo-700' },
  { label: 'Capacidad ociosa / slots libres', icon: CircleOff, accent: 'text-amber-700' },
] as const;

export function OccupancyKpiGrid({ occupancy, enabledSlots, effectiveAppointments, freeSlots }: Props) {
  const values = [`${occupancy.toFixed(1)}%`, enabledSlots, effectiveAppointments, freeSlots];

  return (
    <section aria-label="Indicadores de ocupación" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, icon: Icon, accent }, index) => (
        <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="max-w-[13rem] text-sm font-semibold leading-5 text-slate-600">{label}</p>
            <span className={`rounded-xl bg-slate-50 p-2 ${accent}`}><Icon aria-hidden="true" size={20} /></span>
          </div>
          <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">
            {typeof values[index] === 'number' ? values[index].toLocaleString('es-CO') : values[index]}
          </p>
          {index === 0 && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`Ocupación: ${occupancy.toFixed(1)}%`}>
              <div className="h-full rounded-full bg-[#0D9488] transition-all" style={{ width: `${Math.min(100, Math.max(0, occupancy))}%` }} />
            </div>
          )}
          {index > 0 && <p className="mt-2 text-xs text-slate-500">{['', 'Capacidad instalada', 'Demanda real', 'Espacios disponibles'][index]}</p>}
        </article>
      ))}
    </section>
  );
}

import { AlertTriangle, Flame, Star } from 'lucide-react';
import type { VetOccupancyDetail } from '../../types/occupancy';

type Props = {
  highest: VetOccupancyDetail | null;
  lowest: VetOccupancyDetail | null;
};

function HighlightCard({ detail, type }: { detail: VetOccupancyDetail | null; type: 'highest' | 'lowest' }) {
  const high = type === 'highest';
  const Icon = high ? Flame : AlertTriangle;
  const label = high ? 'Profesional con mayor demanda' : 'Profesional con menor demanda';

  return (
    <article className="flex min-h-36 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`rounded-xl p-3 ${high ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
        <Icon aria-hidden="true" size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-slate-600">{label}</p>
          {detail && (
            <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${
              high ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
            }`}>
              {detail.porcentajeOcupacion.toFixed(1)}%
            </span>
          )}
        </div>
        {detail ? (
          <>
            <h3 className="mt-3 text-lg font-extrabold text-slate-900">{detail.nombre}</h3>
            <p className="mt-1 text-sm text-slate-600">{detail.especialidad} · {detail.sede}</p>
            {high && detail.porcentajeOcupacion > 85 && (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-rose-800">
                <Star aria-hidden="true" size={16} /> Riesgo de saturación; evalúe redistribuir turnos.
              </p>
            )}
            {!high && detail.porcentajeOcupacion < 50 && (
              <p className="mt-3 text-sm font-semibold text-amber-900">
                Capacidad ociosa: considere reasignar demanda a este profesional.
              </p>
            )}
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Sin profesionales con registros en este periodo.</p>
        )}
      </div>
    </article>
  );
}

export function OccupancyHighlights({ highest, lowest }: Props) {
  return (
    <section aria-label="Profesionales destacados" className="grid gap-4 lg:grid-cols-2">
      <HighlightCard detail={highest} type="highest" />
      <HighlightCard detail={lowest} type="lowest" />
    </section>
  );
}

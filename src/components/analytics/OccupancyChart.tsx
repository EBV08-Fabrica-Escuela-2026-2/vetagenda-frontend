import type { VetOccupancyDetail } from '../../types/occupancy';

type Props = { details: VetOccupancyDetail[] };

export function OccupancyChart({ details }: Props) {
  const maxSlots = Math.max(1, ...details.map((item) => item.slotsHabilitados));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Distribución por veterinario</h2>
          <p className="mt-1 text-sm text-slate-600">Turnos ocupados frente a capacidad disponible.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm bg-[#0D5C75]" /> Slots ocupados</span>
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm bg-[#A7F3D0]" /> Slots libres</span>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {details.map((item) => {
          const occupiedWidth = (item.citasEfectivas / maxSlots) * 100;
          const freeWidth = (item.slotsLibres / maxSlots) * 100;
          return (
            <div key={item.vetId} className="grid gap-2 sm:grid-cols-[minmax(9rem,13rem)_1fr_auto] sm:items-center sm:gap-4">
              <div>
                <p className="truncate text-sm font-bold text-slate-800">{item.nombre}</p>
                <p className="text-xs text-slate-500">{item.sede}</p>
              </div>
              <div
                aria-label={`${item.nombre}: ${item.citasEfectivas} slots ocupados, ${item.slotsLibres} slots libres, de ${item.slotsHabilitados} habilitados`}
                className="flex h-7 min-w-0 overflow-hidden rounded-md bg-slate-100"
                role="img"
                tabIndex={0}
                title={`${item.citasEfectivas} ocupados · ${item.slotsLibres} libres`}
              >
                {item.citasEfectivas > 0 && (
                  <span className="flex min-w-[2px] items-center justify-center overflow-hidden bg-[#0D5C75] px-1 text-[10px] font-bold text-white" style={{ width: `${occupiedWidth}%` }}>
                    {item.citasEfectivas}
                  </span>
                )}
                {item.slotsLibres > 0 && (
                  <span className="flex min-w-[2px] items-center justify-center overflow-hidden bg-[#A7F3D0] px-1 text-[10px] font-bold text-emerald-950" style={{ width: `${freeWidth}%` }}>
                    {item.slotsLibres}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-slate-700">{item.porcentajeOcupacion.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

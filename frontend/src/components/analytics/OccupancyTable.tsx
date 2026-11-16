import type { VetOccupancyDetail } from '../../types/occupancy';

type Props = { details: VetOccupancyDetail[] };

const stateStyle: Record<VetOccupancyDetail['estado'], string> = {
  SATURADO: 'bg-rose-100 text-rose-900',
  OPTIMO: 'bg-emerald-100 text-emerald-900',
  BAJA_DEMANDA: 'bg-amber-100 text-amber-950',
};

const stateLabel: Record<VetOccupancyDetail['estado'], string> = {
  SATURADO: 'Saturado',
  OPTIMO: 'Óptimo',
  BAJA_DEMANDA: 'Baja Demanda',
};

export function OccupancyTable({ details }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="px-5 py-4">
        <h2 className="text-lg font-extrabold text-slate-900">Detalle por periodo</h2>
        <p className="mt-1 text-sm text-slate-600">Capacidad y demanda según la agrupación seleccionada.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <caption className="sr-only">Detalle de slots y ocupación por periodo</caption>
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-700">
            <tr>
              <th className="px-5 py-3 font-bold" scope="col">Periodo / Rango</th>
              <th className="px-4 py-3 font-bold" scope="col">Agrupación</th>
              <th className="px-4 py-3 text-right font-bold" scope="col">Slots habilitados</th>
              <th className="px-4 py-3 text-right font-bold" scope="col">Citas efectivas</th>
              <th className="px-4 py-3 text-right font-bold" scope="col">Slots libres</th>
              <th className="px-4 py-3 font-bold" scope="col">% Ocupación</th>
              <th className="px-5 py-3 font-bold" scope="col">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {details.map((item) => (
              <tr key={item.vetId} className="text-slate-700 hover:bg-slate-50/70">
                <th className="px-5 py-4 text-left" scope="row">
                  <span className="block font-bold text-slate-900">{item.nombre}</span>
                  <span className="mt-1 block text-xs font-normal text-slate-600">{item.especialidad}</span>
                </th>
                <td className="px-4 py-4">{item.sede}</td>
                <td className="px-4 py-4 text-right tabular-nums">{item.slotsHabilitados.toLocaleString('es-CO')}</td>
                <td className="px-4 py-4 text-right tabular-nums">{item.citasEfectivas.toLocaleString('es-CO')}</td>
                <td className="px-4 py-4 text-right tabular-nums">{item.slotsLibres.toLocaleString('es-CO')}</td>
                <td className="min-w-36 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#0D9488]" style={{ width: `${Math.min(100, item.porcentajeOcupacion)}%` }} />
                    </div>
                    <span className="w-12 text-right font-semibold tabular-nums">{item.porcentajeOcupacion.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ${stateStyle[item.estado]}`}>
                    {stateLabel[item.estado]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

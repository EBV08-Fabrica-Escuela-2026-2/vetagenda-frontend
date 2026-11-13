import { Activity } from 'lucide-react';
import type { ResumenClinico } from '../../types/historial';
import { fechaControl, fechaLarga } from '../../utils/format';

export function ClinicalSummary({ resumen }: { resumen: ResumenClinico }) {
  const lista = (items: string[], color: string) =>
    items.length === 0 ? (
      <p className="text-sm italic text-ink-400">Ninguna registrada</p>
    ) : (
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-ink-700">
            <span className={`h-1.5 w-1.5 rounded-full ${color}`} aria-hidden /> {item}
          </li>
        ))}
      </ul>
    );

  return (
    <aside className="card p-5" aria-labelledby="resumen-clinico">
      <h2 id="resumen-clinico" className="border-b border-line pb-4 font-display text-2xl font-bold text-brand-950">Resumen clínico</h2>
      <div className="divide-y divide-line">
        <div className="py-4">
          <p className="eyebrow mb-2">Alergias</p>
          {lista(resumen.alergias, 'bg-[#E0A93B]')}
        </div>
        <div className="py-4">
          <p className="eyebrow mb-2">Diagnósticos activos</p>
          {lista(resumen.diagnosticosActivos, 'bg-[#E08A3B]')}
        </div>
        <div className="py-4">
          <p className="eyebrow mb-2">Última vacuna</p>
          {resumen.ultimaVacuna ? (
            <>
              <p className="font-display text-lg font-bold text-brand-950">{resumen.ultimaVacuna.nombre}</p>
              <p className="text-xs text-ink-400">{fechaLarga(`${resumen.ultimaVacuna.fecha}T12:00:00-05:00`)}</p>
            </>
          ) : (
            <p className="text-sm italic text-ink-400">Sin registro</p>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 rounded-xl border border-brand-100 bg-[#F6FFFC] p-4">
        <Activity className="h-5 w-5 text-brand-600" aria-hidden />
        <div>
          <p className="text-sm font-bold text-brand-950">Próximo control</p>
          <p className="text-xs text-ink-500">{resumen.proximoControl ? fechaControl(resumen.proximoControl) : 'Sin programar'}</p>
        </div>
      </div>
    </aside>
  );
}

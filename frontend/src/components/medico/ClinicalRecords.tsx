import type { Diagnostico, Tratamiento } from '../../types/historial';
import { fechaCorta, fechaTabla } from '../../utils/format';

export function DiagnosticosList({ diagnosticos }: { diagnosticos: Diagnostico[] }) {
  return (
    <ul className="space-y-3">
      {diagnosticos.map((d) => (
        <li key={d.id} className="rounded-xl border border-line border-l-[3px] border-l-brand-500 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600">{fechaCorta(d.fecha)}</p>
            {!d.principal && <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-bold text-ink-500">Secundario</span>}
          </div>
          <p className="mt-1 font-display text-xl font-bold text-brand-950">{d.descripcion}</p>
          <p className="mt-1 text-sm text-ink-500">{d.observaciones}</p>
          <p className="mt-3 text-xs text-ink-400">Registrado por {d.registradoPor}</p>
        </li>
      ))}
    </ul>
  );
}

export function TratamientosTable({ tratamientos }: { tratamientos: Tratamiento[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="bg-canvas text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">
          <tr>
            <th scope="col" className="px-4 py-3">Medicamento</th>
            <th scope="col" className="px-4 py-3">Dosis</th>
            <th scope="col" className="px-4 py-3">Duración</th>
            <th scope="col" className="px-4 py-3">Indicado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-white">
          {tratamientos.map((t) => (
            <tr key={t.id}>
              <th scope="row" className="px-4 py-3.5 font-bold text-brand-950">{t.medicamento}</th>
              <td className="px-4 py-3.5 text-ink-600">{t.dosis}</td>
              <td className="px-4 py-3.5 text-ink-600">{t.duracion}</td>
              <td className="px-4 py-3.5 text-ink-500">{fechaTabla(t.fechaIndicacion)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

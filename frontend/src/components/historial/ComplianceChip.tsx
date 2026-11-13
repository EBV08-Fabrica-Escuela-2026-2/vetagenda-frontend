import type { ResumenCumplimiento } from '../../types/historial';
import { plural } from '../../utils/format';

export function ComplianceChip({ resumen }: { resumen: ResumenCumplimiento }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-2.5" title="Citas completadas sobre el total de citas programadas (completadas + canceladas)">
      <span className="font-display text-2xl font-bold text-brand-950">{resumen.porcentaje}%</span>
      <span className="leading-tight">
        <span className="block text-xs font-bold text-ink-700">Cumplimiento</span>
        <span className="block text-[11px] text-ink-400">
          {plural(resumen.completadas, 'completada')} · {plural(resumen.canceladas, 'cancelada')}
        </span>
      </span>
    </div>
  );
}

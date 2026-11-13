import { Check, X } from 'lucide-react';
import type { ResumenCumplimiento } from '../../types/historial';

function Ring({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" role="img" aria-label={`${value}% de cumplimiento`}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="#E7FAF4" strokeWidth="7" />
      <circle cx="32" cy="32" r={r} fill="none" stroke="#0C9A90" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} />
      <text x="32" y="36" textAnchor="middle" transform="rotate(90 32 32)" className="fill-brand-950 font-display text-[15px] font-bold">
        {value}%
      </text>
    </svg>
  );
}

const etiqueta = (p: number) => (p >= 80 ? 'Buen cumplimiento' : p >= 60 ? 'Cumplimiento moderado' : 'Cumplimiento bajo');

export function ClinicalKpis({ resumen }: { resumen: ResumenCumplimiento }) {
  const pctCanceladas = resumen.total === 0 ? 0 : Math.round((resumen.canceladas / resumen.total) * 100);
  const kpi = 'card flex items-center gap-4 p-5';
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.15fr]">
      <div className={kpi}>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Check className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="eyebrow">Citas completadas</p>
          <p className="font-display text-3xl font-bold text-brand-950">{resumen.completadas}</p>
          <p className="text-[11px] text-ink-400">Histórico total</p>
        </div>
      </div>
      <div className={kpi}>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-danger-50 text-danger-600">
          <X className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="eyebrow">Citas canceladas</p>
          <p className="font-display text-3xl font-bold text-brand-950">{resumen.canceladas}</p>
          <p className="text-[11px] text-ink-400">{pctCanceladas}% del total</p>
        </div>
      </div>
      <div className={`${kpi} justify-between`}>
        <div>
          <p className="eyebrow">Cumplimiento de turnos</p>
          <p className="font-display text-3xl font-bold text-brand-950">{resumen.porcentaje}%</p>
          <p className="text-[11px] text-ink-400">{resumen.total === 0 ? 'Sin citas registradas' : etiqueta(resumen.porcentaje)}</p>
        </div>
        <Ring value={resumen.porcentaje} />
      </div>
    </div>
  );
}

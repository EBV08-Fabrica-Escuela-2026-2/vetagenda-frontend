import { Check, X } from 'lucide-react';
import type { EstadoCita } from '../../types/historial';
import { ESTADO_LABEL } from '../../utils/format';

export function StatusBadge({ estado }: { estado: EstadoCita }) {
  const completada = estado === 'COMPLETADA';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        completada ? 'bg-success-100 text-success-700' : 'bg-danger-50 text-danger-700'
      }`}
    >
      {completada ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
      {ESTADO_LABEL[estado]}
    </span>
  );
}

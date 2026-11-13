import { ShieldCheck } from 'lucide-react';
import type { DemoScenario } from '../../services/historialService';

type Props = {
  value: DemoScenario;
  onChange: (scenario: DemoScenario) => void;
  /** Navega a una mascota ajena para disparar un 403 real del (simulado) backend. */
  onSimulateForbidden: () => void;
};

/** Solo visible en modo demo: permite revisar los estados de la pantalla como en el prototipo. */
export function DemoStateSwitcher({ value, onChange, onSimulateForbidden }: Props) {
  return (
    <div className="flex flex-col gap-1.5 sm:items-end">
      <label htmlFor="demo-state" className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
        Vista del prototipo · modo demo
      </label>
      <div className="flex items-center gap-3">
        <select id="demo-state" className="field !h-9 !w-44 !text-xs" value={value} onChange={(e) => onChange(e.target.value as DemoScenario)}>
          <option value="normal">Estado normal</option>
          <option value="loading">Cargando</option>
          <option value="empty">Sin citas</option>
          <option value="error">Error del servicio</option>
        </select>
        <button type="button" onClick={onSimulateForbidden} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-brand-800">
          <ShieldCheck className="h-4 w-4" aria-hidden /> Simular acceso 403
        </button>
      </div>
    </div>
  );
}

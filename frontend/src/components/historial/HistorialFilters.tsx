import { useEffect, useState, type FormEvent } from 'react';
import { Filter, Search } from 'lucide-react';
import type { FiltrosHistorial, MascotaResumen } from '../../types/historial';
import { TIPO_LABEL } from '../../utils/format';

type Props = {
  mascotas: MascotaResumen[];
  value: FiltrosHistorial;
  defaults: FiltrosHistorial;
  onApply: (filtros: FiltrosHistorial) => void;
};

const contarActivos = (f: FiltrosHistorial, d: FiltrosHistorial) =>
  [f.desde !== d.desde, f.hasta !== d.hasta, f.tipo !== 'TODOS', f.estado !== 'TODOS'].filter(Boolean).length;

export function HistorialFilters({ mascotas, value, defaults, onApply }: Props) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const rangoInvalido = Boolean(draft.desde && draft.hasta && draft.desde > draft.hasta);
  const activos = contarActivos(value, defaults);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!rangoInvalido) onApply(draft);
  };

  const limpiar = () => {
    const reset = { ...defaults, mascotaId: draft.mascotaId };
    setDraft(reset);
    onApply(reset);
  };

  const label = 'mb-1.5 block text-xs font-semibold text-ink-500';

  return (
    <form onSubmit={submit} className="card p-5" aria-label="Filtrar historial">
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-4 w-4 text-ink-400" aria-hidden />
        <span className="eyebrow">Filtrar historial</span>
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-600">
          {activos === 0 ? 'Todos' : `${activos} activo${activos > 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_1.2fr_1fr_auto_auto] lg:items-end">
        <div>
          <label htmlFor="f-mascota" className={label}>Mascota</label>
          <select
            id="f-mascota"
            className="field"
            value={String(draft.mascotaId)}
            onChange={(e) => setDraft({ ...draft, mascotaId: e.target.value === 'TODAS' ? 'TODAS' : Number(e.target.value) })}
          >
            {mascotas.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
            {mascotas.length > 1 && <option value="TODAS">Todas</option>}
          </select>
        </div>
        <div>
          <label htmlFor="f-desde" className={label}>Desde</label>
          <input id="f-desde" type="date" className="field" value={draft.desde} max={draft.hasta || undefined} onChange={(e) => setDraft({ ...draft, desde: e.target.value })} />
        </div>
        <div>
          <label htmlFor="f-hasta" className={label}>Hasta</label>
          <input id="f-hasta" type="date" className="field" value={draft.hasta} min={draft.desde || undefined} onChange={(e) => setDraft({ ...draft, hasta: e.target.value })} />
        </div>
        <div>
          <label htmlFor="f-tipo" className={label}>Tipo de cita</label>
          <select id="f-tipo" className="field" value={draft.tipo} onChange={(e) => setDraft({ ...draft, tipo: e.target.value as FiltrosHistorial['tipo'] })}>
            <option value="TODOS">Todos los tipos</option>
            {(Object.keys(TIPO_LABEL) as (keyof typeof TIPO_LABEL)[]).map((tipo) => (
              <option key={tipo} value={tipo}>{TIPO_LABEL[tipo]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-estado" className={label}>Estado</label>
          <select id="f-estado" className="field" value={draft.estado} onChange={(e) => setDraft({ ...draft, estado: e.target.value as FiltrosHistorial['estado'] })}>
            <option value="TODOS">Todos</option>
            <option value="COMPLETADA">Completada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
        <button type="button" onClick={limpiar} className="btn-secondary">Limpiar</button>
        <button type="submit" className="btn-primary" disabled={rangoInvalido}>
          <Search className="h-4 w-4" aria-hidden /> Aplicar filtros
        </button>
      </div>
      {rangoInvalido && (
        <p className="mt-3 text-xs font-semibold text-danger-600" role="alert">
          La fecha "Desde" no puede ser posterior a la fecha "Hasta".
        </p>
      )}
    </form>
  );
}

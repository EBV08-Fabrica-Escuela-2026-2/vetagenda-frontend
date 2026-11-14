import type { FormEvent } from 'react';
import { Search } from 'lucide-react';
import type { OccupancyFilter } from '../../types/occupancy';

type Props = {
  filters: OccupancyFilter;
  veterinarians: ReadonlyArray<{ id: string; nombre: string }>;
  onChange: (filters: OccupancyFilter) => void;
  onSubmit: () => void;
};

const fieldClass = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#0D5C75] focus:ring-2 focus:ring-[#0D5C75]/20';

function rangeForPeriod(startDate: string, periodicity: OccupancyFilter['periodicity']) {
  const start = new Date(`${startDate}T12:00:00`);
  if (!Number.isFinite(start.getTime())) return { startDate, endDate: startDate };
  const end = new Date(start);

  if (periodicity === 'semana') {
    start.setDate(start.getDate() - (start.getDay() === 0 ? 6 : start.getDay() - 1));
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
  } else if (periodicity === 'mes') {
    start.setDate(1);
    end.setMonth(start.getMonth() + 1, 0);
  }

  const toDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  return { startDate: toDateInput(start), endDate: toDateInput(end) };
}

export function OccupancyFilters({ filters, veterinarians, onChange, onSubmit }: Props) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (filters.startDate > filters.endDate) return;
    onSubmit();
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap gap-2" aria-label="Periodicidad del reporte">
        {([
          ['dia', 'Día'],
          ['semana', 'Semana'],
          ['mes', 'Mes'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filters.periodicity === value}
            onClick={() => onChange({ ...filters, ...rangeForPeriod(filters.startDate, value), periodicity: value })}
            className={`min-h-11 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 ${
              filters.periodicity === value
                ? 'bg-[#0D5C75] text-white'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm font-semibold text-slate-700">
          Fecha de inicio
          <input
            aria-label="Fecha de inicio"
            className={`${fieldClass} mt-1`}
            max={filters.endDate}
            onChange={(event) => onChange({ ...filters, startDate: event.target.value })}
            required
            type="date"
            value={filters.startDate}
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Fecha de fin
          <input
            aria-label="Fecha de fin"
            className={`${fieldClass} mt-1`}
            min={filters.startDate}
            onChange={(event) => onChange({ ...filters, endDate: event.target.value })}
            required
            type="date"
            value={filters.endDate}
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Sede
          <select
            className={`${fieldClass} mt-1`}
            onChange={(event) => onChange({ ...filters, sedeId: event.target.value })}
            value={filters.sedeId}
          >
            <option value="">Todas las Sedes</option>
            <option value="Sede Laureles">Sede Laureles</option>
            <option value="Sede Belén">Sede Belén</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Profesional
          <select
            className={`${fieldClass} mt-1`}
            onChange={(event) => onChange({ ...filters, vetId: event.target.value })}
            value={filters.vetId}
          >
            <option value="">Todos los Profesionales</option>
            {veterinarians.map((vet) => (
              <option key={vet.id} value={vet.id}>{vet.nombre}</option>
            ))}
          </select>
        </label>
        <button
          className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0D5C75] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#09485d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 sm:col-span-2 xl:col-span-1"
          type="submit"
        >
          <Search aria-hidden="true" size={17} />
          Consultar Ocupación
        </button>
      </div>
      {filters.startDate > filters.endDate && (
        <p className="mt-2 text-sm font-medium text-rose-700" role="alert">
          La fecha de inicio debe ser anterior o igual a la fecha de fin.
        </p>
      )}
    </form>
  );
}

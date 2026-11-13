import { CalendarX2, ChevronRight, CirclePlus, PawPrint, Stethoscope, Syringe, type LucideIcon } from 'lucide-react';
import type { CitaHistorial, TipoCita } from '../../types/historial';
import { anio, dia, hora, mesCorto } from '../../utils/format';
import { StatusBadge } from '../ui/StatusBadge';

const ICONO_TIPO: Record<TipoCita, LucideIcon> = {
  CONSULTA_GENERAL: CirclePlus,
  CONTROL: CirclePlus,
  VACUNACION: Syringe,
  CIRUGIA: Stethoscope,
  URGENCIA: Stethoscope,
};

type Props = {
  cita: CitaHistorial;
  onOpen: (cita: CitaHistorial) => void;
};

export function AppointmentCard({ cita, onOpen }: Props) {
  const cancelada = cita.estado === 'CANCELADA';
  const Icon = cancelada ? CalendarX2 : ICONO_TIPO[cita.tipo];

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(cita)}
        className={`group flex w-full overflow-hidden rounded-2xl border bg-white text-left transition hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25 ${
          cancelada ? 'border-danger-100 border-l-[3px] border-l-danger-500' : 'border-line'
        }`}
        aria-label={`Ver detalle: ${cita.servicio} del ${dia(cita.fechaHora)} ${mesCorto(cita.fechaHora)} ${anio(cita.fechaHora)}, ${cancelada ? 'cancelada' : 'completada'}`}
      >
        <div className="relative flex w-20 shrink-0 flex-col items-center justify-center border-r border-line py-5 sm:w-24">
          <span className="font-display text-3xl font-bold leading-none text-brand-950">{dia(cita.fechaHora)}</span>
          <span className="mt-1 text-[11px] font-extrabold tracking-wider text-brand-950">
            {mesCorto(cita.fechaHora)} {anio(cita.fechaHora)}
          </span>
          <span className="mt-1 text-xs text-ink-400">{hora(cita.fechaHora)}</span>
          <span
            aria-hidden
            className={`absolute -right-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ring-4 ring-white ${
              cancelada ? 'bg-danger-500' : 'bg-brand-400'
            }`}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
          <span
            className={`hidden h-10 w-10 shrink-0 place-items-center rounded-xl sm:grid ${
              cancelada ? 'bg-danger-50 text-danger-600' : 'bg-brand-50 text-brand-600'
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-bold leading-tight text-brand-950">{cita.servicio}</p>
            <p className="mt-0.5 truncate text-sm text-ink-500">{cita.motivo}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <PawPrint className="h-3.5 w-3.5 text-ink-300" aria-hidden /> {cita.mascota.nombre}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-ink-300" aria-hidden /> {cita.profesional.nombre}
              </span>
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <StatusBadge estado={cita.estado} />
            <ChevronRight className="h-5 w-5 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden />
          </div>
        </div>
      </button>
    </li>
  );
}

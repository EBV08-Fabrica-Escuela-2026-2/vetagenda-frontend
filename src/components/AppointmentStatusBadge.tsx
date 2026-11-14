import { CalendarClock, CheckCircle2, XCircle } from 'lucide-react';

export type AccessibleAppointmentStatus =
  | 'Programada'
  | 'Confirmada'
  | 'Completada'
  | 'Cancelada'
  | 'Anulada';

type StatusVisualConfig = {
  className: string;
  Icon: typeof CalendarClock;
  srPrefix: string;
};

const STATUS_CONFIG: Record<AccessibleAppointmentStatus, StatusVisualConfig> = {
  Programada: {
    className: 'border-sky-300 bg-sky-100 text-sky-900',
    Icon: CalendarClock,
    srPrefix: 'Estado de cita:',
  },
  Confirmada: {
    className: 'border-sky-300 bg-sky-100 text-sky-900',
    Icon: CalendarClock,
    srPrefix: 'Estado de cita:',
  },
  Completada: {
    className: 'border-emerald-300 bg-emerald-100 text-emerald-900',
    Icon: CheckCircle2,
    srPrefix: 'Estado de cita:',
  },
  Cancelada: {
    className: 'border-rose-300 bg-rose-100 text-rose-900',
    Icon: XCircle,
    srPrefix: 'Estado de cita:',
  },
  Anulada: {
    className: 'border-rose-300 bg-rose-100 text-rose-900',
    Icon: XCircle,
    srPrefix: 'Estado de cita:',
  },
};

type AppointmentStatusBadgeProps = {
  status: AccessibleAppointmentStatus;
  label?: string;
  className?: string;
};

export function AppointmentStatusBadge({
  status,
  label,
  className = '',
}: AppointmentStatusBadgeProps) {
  const { className: toneClassName, Icon, srPrefix } = STATUS_CONFIG[status];
  const displayLabel = label ?? status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${toneClassName} ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">{srPrefix} </span>
      <span>{displayLabel}</span>
    </span>
  );
}

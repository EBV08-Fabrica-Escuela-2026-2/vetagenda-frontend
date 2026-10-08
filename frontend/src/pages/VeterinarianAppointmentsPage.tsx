import { useEffect, useState } from 'react';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { BrandHeader } from '../components/BrandHeader';

const MIN_REASON_LENGTH = 10;

type AppointmentStatus = 'Programada' | 'Completada' | 'Cancelada';

type Appointment = {
  id: number;
  client: string;
  pet: string;
  service: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  cancellationReason?: string;
};

function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

const initialAppointments: Appointment[] = [
  {
    id: 1,
    client: 'Mariana López',
    pet: 'Luna · Golden retriever',
    service: 'Consulta general',
    date: dateOffset(1),
    time: '9:00 a. m.',
    status: 'Programada',
  },
  {
    id: 2,
    client: 'Carlos Ramírez',
    pet: 'Max · Gato criollo',
    service: 'Control veterinario',
    date: dateOffset(1),
    time: '10:30 a. m.',
    status: 'Programada',
  },
  {
    id: 3,
    client: 'Valentina Cruz',
    pet: 'Nina · Beagle',
    service: 'Vacunación',
    date: dateOffset(2),
    time: '11:00 a. m.',
    status: 'Programada',
  },
  {
    id: 4,
    client: 'Juan David Pérez',
    pet: 'Rocky · Labrador',
    service: 'Consulta general',
    date: dateOffset(-2),
    time: '3:00 p. m.',
    status: 'Completada',
  },
  {
    id: 5,
    client: 'Sofía Gómez',
    pet: 'Milo · Schnauzer',
    service: 'Desparasitación',
    date: dateOffset(-1),
    time: '8:30 a. m.',
    status: 'Cancelada',
    cancellationReason: 'El cliente solicitó reprogramar la cita.',
  },
];

function formatAppointmentDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const styles: Record<AppointmentStatus, string> = {
    Programada: 'bg-sky-100 text-sky-800',
    Completada: 'bg-emerald-100 text-emerald-800',
    Cancelada: 'bg-rose-100 text-rose-800',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
}

type CancellationDialogProps = {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: (appointmentId: number, reason: string) => void;
};

function CancellationDialog({ appointment, onClose, onConfirm }: CancellationDialogProps) {
  const [reason, setReason] = useState('');
  const normalizedReason = reason.trim();
  const isReasonValid = normalizedReason.length >= MIN_REASON_LENGTH;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isReasonValid) return;
    onConfirm(appointment.id, normalizedReason);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="cancel-dialog-title"
        aria-modal="true"
        className="my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Acción definitiva</p>
            <h2 id="cancel-dialog-title" className="mt-2 text-2xl font-black text-slate-900">
              Cancelar cita
            </h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar ventana de cancelación"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            ×
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="font-bold text-slate-900">{appointment.client} · {appointment.pet}</p>
          <p className="mt-1 text-sm text-slate-600">{appointment.service}</p>
          <p className="mt-2 text-sm font-semibold capitalize text-slate-700">
            {formatAppointmentDate(appointment.date)} · {appointment.time}
          </p>
        </div>

        <form className="mt-5" onSubmit={handleSubmit}>
          <label htmlFor="cancellation-reason" className="block text-sm font-bold text-slate-800">
            Motivo de cancelación <span className="text-rose-600">*</span>
          </label>
          <p id="reason-help" className="mt-1 text-sm text-slate-500">
            Explica brevemente por qué debes cancelar. Mínimo {MIN_REASON_LENGTH} caracteres.
          </p>
          <textarea
            id="cancellation-reason"
            aria-describedby="reason-help reason-counter"
            aria-invalid={reason.length > 0 && !isReasonValid}
            autoFocus
            maxLength={500}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Escribe el motivo para informar al cliente..."
            required
            rows={4}
            value={reason}
            className="mt-3 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
          <div className="mt-2 flex items-start justify-between gap-3 text-xs">
            <span id="reason-counter" className={isReasonValid ? 'text-emerald-700' : 'text-slate-500'}>
              {normalizedReason.length}/{MIN_REASON_LENGTH} caracteres mínimos
            </span>
            {reason.length > 0 && !isReasonValid && (
              <span className="text-right font-semibold text-rose-600">
                El motivo debe tener al menos {MIN_REASON_LENGTH} caracteres.
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={!isReasonValid}
              className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Confirmar cancelación
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function VeterinarianAppointmentsPage() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const orderedAppointments = [...appointments].sort(
    (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime(),
  );
  const visibleAppointments = showAll
    ? orderedAppointments
    : orderedAppointments.filter((appointment) => appointment.status === 'Programada');
  const pendingCount = appointments.filter((appointment) => appointment.status === 'Programada').length;

  function cancelAppointment(appointmentId: number, reason: string) {
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment || appointment.status !== 'Programada') return;

    setAppointments((current) =>
      current.map((item) =>
        item.id === appointmentId
          ? { ...item, status: 'Cancelada', cancellationReason: reason }
          : item,
      ),
    );
    setSelectedAppointment(null);
    setNotification(
      `La cita de ${appointment.client} fue cancelada. El horario ${appointment.time} quedó liberado en tu agenda y se notificará a las partes.`,
    );
  }

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <BrandHeader subtitle="Agenda del veterinario" />
          <BackToHomeButton />
        </header>

        <section className="mb-6 flex flex-col gap-5 rounded-3xl bg-gradient-to-r from-sky-700 to-cyan-600 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-sm font-semibold text-sky-100">Panel profesional</p>
            <h1 className="mt-2 text-3xl font-black">Mi agenda</h1>
            <p className="mt-2 max-w-xl text-sm text-sky-50">
              Revisa tus citas programadas y gestiona las cancelaciones informando el motivo al cliente.
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 px-5 py-4 ring-1 ring-white/20">
            <p className="text-sm text-sky-100">Citas pendientes</p>
            <p className="mt-1 text-3xl font-black">{pendingCount}</p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">Citas del profesional</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Agenda de atención</h2>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(event) => setShowAll(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Mostrar historial
            </label>
          </div>

          {notification && (
            <div role="status" className="mt-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <span aria-hidden="true" className="text-lg">✓</span>
              <p>{notification}</p>
              <button
                type="button"
                aria-label="Cerrar confirmación"
                onClick={() => setNotification(null)}
                className="ml-auto h-fit font-bold text-emerald-800 hover:text-emerald-950"
              >
                ×
              </button>
            </div>
          )}

          {visibleAppointments.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm" aria-hidden="true">🗓️</div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">No hay citas para mostrar</h3>
              <p className="mt-1 text-sm text-slate-600">
                {showAll ? 'Todavía no hay citas registradas en la agenda.' : 'No tienes citas pendientes en este momento.'}
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {visibleAppointments.map((appointment) => (
                <article key={appointment.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-sky-200 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-xl" aria-hidden="true">🐾</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">{appointment.client}</h3>
                          <StatusBadge status={appointment.status} />
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{appointment.pet}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-800">{appointment.service}</p>
                        <p className="mt-1 text-sm capitalize text-slate-500">
                          {formatAppointmentDate(appointment.date)} · {appointment.time}
                        </p>
                        {appointment.cancellationReason && (
                          <p className="mt-2 text-sm text-rose-700">
                            <span className="font-semibold">Motivo:</span> {appointment.cancellationReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {appointment.status === 'Programada' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setNotification(null);
                          setSelectedAppointment(appointment);
                        }}
                        className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
                      >
                        Cancelar cita
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        {appointment.status === 'Completada' ? 'Cita finalizada' : 'No se puede modificar'}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-5 text-center text-xs text-slate-500">
          Agenda de demostración. Las cancelaciones se reflejan en esta pantalla; el backend aún no gestiona citas ni notificaciones reales.
        </p>
      </div>

      {selectedAppointment && (
        <CancellationDialog
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onConfirm={cancelAppointment}
        />
      )}
    </main>
  );
}

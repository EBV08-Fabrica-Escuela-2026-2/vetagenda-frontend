import { Link } from 'react-router-dom';
import type { TipoErrorCita } from '../services/citasService';

interface DetalleCitaFeedbackProps {
  tipoError: TipoErrorCita;
  onReintentar: () => void;
}

const mensajes: Record<TipoErrorCita, { titulo: string; descripcion: string }> = {
  NOT_FOUND: {
    titulo: 'No encontramos esta cita',
    descripcion: 'El identificador no existe o la cita fue cancelada. Puedes revisar el listado de tus citas.',
  },
  UNAUTHORIZED: {
    titulo: 'No tienes acceso a esta cita',
    descripcion: 'Inicia sesión con la cuenta asociada a la cita o vuelve a tu listado.',
  },
  NETWORK_ERROR: {
    titulo: 'No pudimos conectar',
    descripcion: 'Revisa tu conexión a internet. La información de la cita no se ha podido cargar.',
  },
};

export function DetalleCitaFeedback({ tipoError, onReintentar }: DetalleCitaFeedbackProps) {
  const mensaje = mensajes[tipoError];

  return (
    <section
      role="alert"
      className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10"
    >
      <div
        aria-hidden="true"
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-2xl text-[#0D5C75]"
      >
        {tipoError === 'NETWORK_ERROR' ? '!' : tipoError === 'UNAUTHORIZED' ? '●' : '?'}
      </div>
      <h2 className="text-xl font-bold text-slate-900">{mensaje.titulo}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">{mensaje.descripcion}</p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        {tipoError === 'NETWORK_ERROR' && (
          <button
            type="button"
            onClick={onReintentar}
            className="min-h-11 rounded-lg bg-[#0D5C75] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#09485d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C75]"
          >
            Reintentar conexión
          </button>
        )}
        {tipoError === 'UNAUTHORIZED' && (
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0D5C75] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#09485d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C75]"
          >
            Iniciar sesión
          </Link>
        )}
        <Link
          to={tipoError === 'NETWORK_ERROR' ? '/' : '/cliente/citas'}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
        >
          {tipoError === 'NETWORK_ERROR' ? 'Volver al inicio' : 'Volver a mis citas'}
        </Link>
      </div>
    </section>
  );
}

export function DetalleCitaSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-label="Cargando detalle de la cita" aria-busy="true" className="animate-pulse">
      <span className="sr-only">Cargando detalle de la cita...</span>
      <div className="mb-5 h-5 w-40 rounded bg-slate-200" />
      <div className="mb-7 h-8 w-64 max-w-full rounded bg-slate-200" />
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="h-72 rounded-xl border border-slate-200 bg-white p-5">
          <div className="h-5 w-28 rounded bg-slate-200" />
          <div className="mt-5 space-y-4">
            <div className="h-16 rounded-lg bg-slate-100" />
            <div className="h-16 rounded-lg bg-slate-100" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-xl border border-slate-200 bg-white" />
          <div className="h-24 rounded-xl border border-slate-200 bg-white" />
          <div className="h-32 rounded-xl border border-slate-200 bg-white" />
        </div>
      </div>
    </div>
  );
}
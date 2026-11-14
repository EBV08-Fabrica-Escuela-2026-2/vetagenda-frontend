import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  X,
  Calendar,
  MapPin,
  Stethoscope,
  FileText,
  PawPrint,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import type { Cita } from '../services/api';
import { useModalAccessibility } from '../utils/useModalAccessibility';

interface ConfirmacionAnulacionModalProps {
  cita: Cita | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (citaId: number, motivo: string) => Promise<void>;
}

const MOTIVOS_PREDETERMINADOS = [
  'Imprevisto de horario / personal',
  'La mascota presentó mejoría previa',
  'Dificultad para trasladarse al consultorio',
  'Deseo reprogramar para otra fecha',
  'Costo o presupuesto',
  'Otro motivo',
];

export const ConfirmacionAnulacionModal: React.FC<ConfirmacionAnulacionModalProps> = ({
  cita,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string>(MOTIVOS_PREDETERMINADOS[0]);
  const [detalleMotivo, setDetalleMotivo] = useState<string>('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useModalAccessibility({
    isOpen: isOpen && Boolean(cita),
    onClose,
    dialogRef,
    initialFocusRef: selectRef,
    canClose: !isSubmitting,
  });

  if (!isOpen || !cita) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    const motivoFinal =
      motivoSeleccionado === 'Otro motivo'
        ? detalleMotivo.trim()
        : detalleMotivo.trim()
        ? `${motivoSeleccionado} - ${detalleMotivo.trim()}`
        : motivoSeleccionado;

    if (!motivoFinal) {
      setErrorValidacion('Por favor especifica el motivo de la anulación.');
      return;
    }

    await onConfirm(cita.id, motivoFinal);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity animate-in fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-warning-cupo"
        tabIndex={-1}
        className="relative my-auto w-full max-w-lg rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl ring-1 ring-slate-900/10 focus:outline-none sm:p-7"
      >
        {/* Header con icono de advertencia */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 ring-4 ring-rose-50" aria-hidden="true">
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="flex-1">
            <span className="inline-block rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-800">
              HU14 · Anulación de Turno
            </span>
            <h3 id="modal-title" className="mt-0.5 text-xl font-black text-slate-900 sm:text-2xl">
              ¿Deseas anular esta cita?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar modal de anulación"
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Mensaje de advertencia sobre liberación de cupo (Task 98) */}
        <div id="modal-warning-cupo" className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-amber-950">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
            <div className="text-xs leading-relaxed sm:text-sm">
              <strong className="font-bold text-amber-950">Advertencia sobre liberación de cupo:</strong>
              <p className="mt-0.5 text-amber-950">
                Al confirmar, este turno quedará <strong>inmediatamente disponible</strong> en la agenda del
                consultorio para que otra mascota pueda recibir atención oportuna.
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de la cita */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Reserva</span>
            <span className="rounded-lg bg-sky-100 px-2.5 py-0.5 font-mono text-xs font-bold text-sky-900">
              {cita.codigoReserva}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <p className="flex items-center gap-1 text-[11px] text-slate-600">
                <PawPrint className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                Paciente / Mascota:
              </p>
              <p className="font-bold text-slate-900">
                {cita.mascotaNombre}{' '}
                <span className="text-xs font-normal text-slate-600">({cita.mascotaRaza})</span>
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[11px] text-slate-600">
                <Stethoscope className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                Veterinario:
              </p>
              <p className="font-bold text-slate-900">{cita.veterinarioNombre}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[11px] text-slate-600">
                <FileText className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                Servicio:
              </p>
              <p className="font-bold text-slate-900">{cita.servicioNombre}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[11px] text-slate-600">
                <Calendar className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                Fecha y hora:
              </p>
              <p className="font-bold text-sky-800">
                {cita.fecha} · {cita.hora}
              </p>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 border-t border-slate-200/60 pt-2 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-600" aria-hidden="true" />
            <span><strong>Consultorio:</strong> {cita.consultorio}</span>
          </div>
        </div>

        {/* Formulario de motivo */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5" noValidate>
          <div>
            <label htmlFor="motivoSelect" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Motivo de la anulación <span className="text-rose-700" aria-hidden="true">*</span>
            </label>
            <select
              ref={selectRef}
              id="motivoSelect"
              value={motivoSeleccionado}
              onChange={(e) => {
                setMotivoSeleccionado(e.target.value);
                setErrorValidacion(null);
              }}
              disabled={isSubmitting}
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-xs outline-none transition focus:border-[#0D5C75] focus-visible:ring-2 focus-visible:ring-[#0D5C75] sm:text-sm"
            >
              {MOTIVOS_PREDETERMINADOS.map((motivo) => (
                <option key={motivo} value={motivo}>
                  {motivo}
                </option>
              ))}
            </select>
          </div>

          {motivoSeleccionado === 'Otro motivo' ? (
            <div>
              <label htmlFor="detalleMotivo" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Describe el motivo <span className="text-rose-700" aria-hidden="true">*</span>
              </label>
              <textarea
                id="detalleMotivo"
                rows={2}
                required
                aria-required="true"
                aria-invalid={Boolean(errorValidacion)}
                aria-describedby={errorValidacion ? 'anulacion-error' : undefined}
                value={detalleMotivo}
                onChange={(e) => {
                  setDetalleMotivo(e.target.value);
                  setErrorValidacion(null);
                }}
                placeholder="Por favor cuéntanos la razón de la anulación..."
                disabled={isSubmitting}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-xs outline-none transition focus:border-[#0D5C75] focus-visible:ring-2 focus-visible:ring-[#0D5C75] sm:text-sm"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="detalleOpcional" className="block text-xs font-semibold text-slate-700">
                Comentarios adicionales (opcional):
              </label>
              <input
                id="detalleOpcional"
                type="text"
                value={detalleMotivo}
                onChange={(e) => setDetalleMotivo(e.target.value)}
                placeholder="Ej. El tutor tuvo un imprevisto laboral..."
                disabled={isSubmitting}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-xs outline-none transition focus:border-[#0D5C75] focus-visible:ring-2 focus-visible:ring-[#0D5C75] sm:text-sm"
              />
            </div>
          )}

          {errorValidacion && (
            <p id="anulacion-error" role="alert" aria-live="polite" className="text-xs font-semibold text-rose-700 animate-in fade-in">
              {errorValidacion}
            </p>
          )}

          {/* Botones de acción */}
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 disabled:opacity-50 sm:text-sm"
            >
              Mantener cita
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 disabled:opacity-50 sm:text-sm"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? 'Liberando cupo...' : 'Sí, anular y liberar cupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

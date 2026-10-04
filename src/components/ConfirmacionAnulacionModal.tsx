import React, { useState } from 'react';
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl ring-1 ring-slate-900/10 sm:p-7">
        {/* Header con icono de advertencia */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 ring-4 ring-rose-50">
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="flex-1">
            <span className="inline-block rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-700">
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
            aria-label="Cerrar modal"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mensaje de advertencia sobre liberación de cupo (Task 98) */}
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-amber-900">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
            <div className="text-xs leading-relaxed sm:text-sm">
              <strong className="font-bold text-amber-950">Advertencia sobre liberación de cupo:</strong>
              <p className="mt-0.5 text-amber-900">
                Al confirmar, este turno quedará <strong>inmediatamente disponible</strong> en la agenda del
                consultorio para que otra mascota pueda recibir atención oportuna.
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de la cita */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Reserva</span>
            <span className="rounded-lg bg-sky-100 px-2.5 py-0.5 font-mono text-xs font-bold text-sky-800">
              {cita.codigoReserva}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <p className="flex items-center gap-1 text-[11px] text-slate-500">
                <PawPrint className="h-3.5 w-3.5 text-slate-400" />
                Paciente / Mascota:
              </p>
              <p className="font-bold text-slate-800">
                {cita.mascotaNombre}{' '}
                <span className="text-xs font-normal text-slate-500">({cita.mascotaRaza})</span>
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[11px] text-slate-500">
                <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                Veterinario:
              </p>
              <p className="font-bold text-slate-800">{cita.veterinarioNombre}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[11px] text-slate-500">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                Servicio:
              </p>
              <p className="font-bold text-slate-800">{cita.servicioNombre}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[11px] text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Fecha y hora:
              </p>
              <p className="font-bold text-sky-700">
                {cita.fecha} · {cita.hora}
              </p>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 border-t border-slate-200/60 pt-2 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span><strong>Consultorio:</strong> {cita.consultorio}</span>
          </div>
        </div>

        {/* Formulario de motivo */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label htmlFor="motivoSelect" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Motivo de la anulación <span className="text-rose-500">*</span>
            </label>
            <select
              id="motivoSelect"
              value={motivoSeleccionado}
              onChange={(e) => setMotivoSeleccionado(e.target.value)}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 shadow-xs outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
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
                Describe el motivo <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="detalleMotivo"
                rows={2}
                required
                value={detalleMotivo}
                onChange={(e) => setDetalleMotivo(e.target.value)}
                placeholder="Por favor cuéntanos la razón de la anulación..."
                disabled={isSubmitting}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 shadow-xs outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="detalleOpcional" className="block text-xs font-semibold text-slate-500">
                Comentarios adicionales (opcional):
              </label>
              <input
                id="detalleOpcional"
                type="text"
                value={detalleMotivo}
                onChange={(e) => setDetalleMotivo(e.target.value)}
                placeholder="Ej. El tutor tuvo un imprevisto laboral..."
                disabled={isSubmitting}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 shadow-xs outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </div>
          )}

          {errorValidacion && (
            <p className="text-xs font-semibold text-rose-600 animate-in fade-in">
              {errorValidacion}
            </p>
          )}

          {/* Botones de acción */}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50"
            >
              Mantener cita
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 focus:ring-4 focus:ring-rose-200 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {isSubmitting ? 'Liberando cupo...' : 'Sí, anular y liberar cupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

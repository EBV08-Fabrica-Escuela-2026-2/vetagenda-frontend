import { useRef } from 'react';
import { LogOut, X } from 'lucide-react';
import { useDialogAccessibility } from '../accessibility/dialog';

type LogoutConfirmationModalProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Confirma una salida iniciada por la persona usuaria. El cierre por
 * inactividad se gestiona por separado en IdleSessionManager.
 */
export function LogoutConfirmationModal({
  isOpen,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: LogoutConfirmationModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useDialogAccessibility({
    isOpen,
    onClose: isSubmitting ? () => undefined : onCancel,
    initialFocusRef: cancelButtonRef,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-confirmation-title"
        aria-describedby="logout-confirmation-description"
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">Sesión activa</p>
            <h2 id="logout-confirmation-title" className="mt-1 text-xl font-black text-slate-950">
              ¿Deseas cerrar sesión?
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Cerrar confirmación"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p id="logout-confirmation-description" className="mt-4 text-sm leading-6 text-slate-600">
          Saldrás de tu cuenta en este dispositivo. Podrás volver a ingresar cuando lo necesites.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0D5C75] px-4 text-sm font-bold text-white transition hover:bg-[#09495e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {isSubmitting ? 'Cerrando sesión…' : 'Sí, cerrar sesión'}
          </button>
        </div>
      </section>
    </div>
  );
}

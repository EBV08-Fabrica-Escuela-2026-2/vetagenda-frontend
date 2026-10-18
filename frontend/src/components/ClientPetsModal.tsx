import { AlertCircle, PawPrint, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClientSession, listClientPets, type PetProfile } from '../services/api';

type ClientPetsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ClientPetsModal({ isOpen, onClose }: ClientPetsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const session = getClientSession();
    if (!session) {
      setPets([]);
      setError('Tu sesión terminó. Inicia sesión nuevamente para consultar tus mascotas.');
      return;
    }

    let isCurrent = true;
    setIsLoading(true);
    setError('');

    listClientPets(session.documentoIdentidad, session.token)
      .then((result) => {
        if (isCurrent) setPets(result);
      })
      .catch((requestError) => {
        if (!isCurrent) return;
        setPets([]);
        setError(requestError instanceof Error ? requestError.message : 'No fue posible consultar tus mascotas.');
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-pets-title"
        className="my-auto flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase text-[#0D9488]">Perfil de cliente</p>
            <h2 id="client-pets-title" className="mt-1 text-2xl font-bold text-slate-950">Mis mascotas</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Pacientes asociados a tu cuenta de VetAgenda.</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar mis mascotas"
            title="Cerrar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {isLoading && (
            <div className="flex min-h-40 items-center justify-center" role="status">
              <div className="text-center">
                <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0D9488]" />
                <p className="mt-3 text-sm font-medium text-slate-600">Consultando tus mascotas...</p>
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div role="alert" className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium leading-6">{error}</p>
            </div>
          )}

          {!isLoading && !error && pets.length === 0 && (
            <div className="flex min-h-44 flex-col items-center justify-center border border-dashed border-slate-300 px-5 py-8 text-center">
              <PawPrint className="h-9 w-9 text-slate-400" />
              <h3 className="mt-3 font-bold text-slate-900">Todavía no tienes mascotas registradas</h3>
              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600">Registra tu primera mascota para asociarla a tus próximas citas.</p>
            </div>
          )}

          {!isLoading && !error && pets.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {pets.map((pet) => (
                <li key={pet.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E8F4F1] text-[#0D5C75]">
                      <PawPrint className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-slate-950">{pet.nombre}</h3>
                      <p className="text-sm text-slate-600">{pet.especie} · {pet.raza}</p>
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 text-sm">
                    <div>
                      <dt className="text-slate-500">Sexo</dt>
                      <dd className="font-semibold text-slate-900">{pet.sexo}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Edad</dt>
                      <dd className="font-semibold text-slate-900">{pet.edad} {pet.edad === 1 ? 'año' : 'años'}</dd>
                    </div>
                  </dl>
                  {pet.observaciones && (
                    <p className="mt-3 text-sm leading-6 text-slate-600">{pet.observaciones}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
          >
            Cerrar
          </button>
          <Link
            to="/mascotas/registro"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0D5C75] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
          >
            <Plus className="h-4 w-4" />
            Registrar mascota
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';

export type DemoProfile = {
  id: string;
  nombre: string;
  rol: 'CLIENTE' | 'VETERINARIO';
  email: string;
  destination: string;
  description: string;
  icon: string;
};

export const VETERINARIAN_DEMO_PROFILE: DemoProfile = {
  id: 'veterinario-demo-camilo',
  nombre: 'Dr. Camilo Durán',
  rol: 'VETERINARIO',
  email: 'camilo.duran@vetagenda.com',
  destination: '/veterinario/agenda',
  description: 'Especialista en Medicina Interna',
  icon: '🩺',
};

const profiles: DemoProfile[] = [VETERINARIAN_DEMO_PROFILE];

type MockRoleSwitcherProps = {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRole: (profile: DemoProfile) => void;
  preferredRole: DemoProfile['rol'] | null;
};

export function MockRoleSwitcher({ isOpen, onClose, onSwitchRole, preferredRole }: MockRoleSwitcherProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
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
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function chooseProfile(profile: DemoProfile) {
    onSwitchRole(profile);
  }

  const orderedProfiles = preferredRole
    ? [...profiles].sort((first, second) => Number(second.rol === preferredRole) - Number(first.rol === preferredRole))
    : profiles;

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
        aria-labelledby="mock-login-title"
        aria-describedby="mock-login-description"
        className="my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0D9488]">Conmutador de perfil</p>
            <h2 id="mock-login-title" className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              Elegir perfil de demostración
            </h2>
            <p id="mock-login-description" className="mt-2 text-sm leading-6 text-slate-600">
              Explora las funciones disponibles para el equipo veterinario.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar selector de perfil"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {orderedProfiles.map((profile, index) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => chooseProfile(profile)}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-300 hover:border-[#0D9488] hover:bg-[#F0F7F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F4F1] text-2xl" aria-hidden="true">{profile.icon}</span>
              <span className="min-w-0">
                <span className="block font-bold text-slate-900">{profile.nombre} · {profile.rol === 'CLIENTE' ? 'Cliente' : 'Veterinario'}</span>
                <span className="mt-1 block text-sm text-slate-600">{profile.description}</span>
                <span className="mt-1 block truncate text-xs text-slate-500">{profile.email}</span>
                {index === 0 && preferredRole && <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-[0.12em] text-[#0D5C75]">Perfil seleccionado</span>}
              </span>
              <span aria-hidden="true" className="ml-auto text-lg text-[#0D5C75]">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

type Props = {
  onBack: () => void;
  backLabel?: string;
  description?: string;
};

/**
 * Vista 403. No recibe ni muestra ningún dato de la mascota solicitada:
 * solo un mensaje genérico, para no confirmar siquiera que el recurso existe.
 */
export function ForbiddenState({
  onBack,
  backLabel = 'Volver a mi historial',
  description = 'Este historial no está asociado a tu cuenta. Por seguridad, no podemos mostrar datos de otras mascotas ni su información médica.',
}: Props) {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6 py-16" aria-labelledby="forbidden-title">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="h-[560px] w-[560px] rounded-full border border-line/70" />
        <div className="absolute h-[420px] w-[420px] rounded-full border border-line/70 bg-white/40" />
        <div className="absolute h-[280px] w-[280px] rounded-full border border-line/70" />
      </div>
      <div className="relative flex max-w-xl flex-col items-center text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-800 text-white shadow-card">
          <Lock className="h-7 w-7" aria-hidden />
        </span>
        <p className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
          <ShieldCheck className="h-4 w-4" aria-hidden /> Acceso restringido · 403
        </p>
        <h1 id="forbidden-title" className="mt-3 font-display text-4xl font-bold leading-tight text-brand-950 sm:text-5xl">
          No tienes permiso para ver esta información
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-ink-500">{description}</p>
        <button type="button" onClick={onBack} className="btn-primary mt-8">
          <ArrowLeft className="h-4 w-4" aria-hidden /> {backLabel}
        </button>
        <p className="mt-4 text-xs text-ink-400">Si crees que esto es un error, contacta con soporte.</p>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentClient, loginUser, saveClientSession } from '../services/api';

const DEMO_EMAIL = 'carolina.restrepo@vetagenda.com';
const DEMO_PASSWORD = 'Demo2026!';

type ClientAccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ClientAccessModal({ isOpen, onClose }: ClientAccessModalProps) {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.setTimeout(() => emailRef.current?.focus(), 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const auth = await loginUser(email.trim(), password);
      const profile = await getCurrentClient(auth.token);
      saveClientSession(profile, auth.token);
      onClose();
      navigate('/cliente/citas');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'No fue posible iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDemoLogin() {
    setIsSubmitting(true);
    setError('');
    try {
      const auth = await loginUser(DEMO_EMAIL, DEMO_PASSWORD);
      const profile = await getCurrentClient(auth.token);
      saveClientSession(profile, auth.token);
      onClose();
      navigate('/cliente/citas');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'No fue posible cargar el perfil de Carolina.');
    } finally {
      setIsSubmitting(false);
    }
  }

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
        aria-labelledby="client-access-title"
        className="my-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0D9488]">Portal de clientes</p>
            <h2 id="client-access-title" className="mt-2 text-2xl font-black text-slate-900">Inicia sesión</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Consulta tus mascotas y administra tus citas.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar acceso de clientes"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-700 hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="client-email" className="mb-1.5 block text-sm font-bold text-slate-700">Correo electrónico</label>
            <input
              ref={emailRef}
              id="client-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10"
            />
          </div>
          <div>
            <label htmlFor="client-password" className="mb-1.5 block text-sm font-bold text-slate-700">Contraseña</label>
            <input
              id="client-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10"
            />
          </div>

          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-12 w-full rounded-full bg-[#0D5C75] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#094356] disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          <span>o</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/registro');
          }}
          className="mt-5 min-h-12 w-full rounded-full border border-[#0D5C75] px-5 py-3 text-sm font-bold text-[#0D5C75] transition hover:bg-[#F0F7F7]"
        >
          Crear cuenta de cliente
        </button>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isSubmitting}
          className="mt-3 w-full px-4 py-2 text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-[#0D5C75]"
        >
          {isSubmitting ? 'Cargando perfil…' : 'Explorar con Carolina (modo demo)'}
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { Logo } from '../components/Logo';
import { getCurrentClient, loginUser, saveClientSession } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const requestedReturn = searchParams.get('returnTo');
  const returnTo = requestedReturn?.startsWith('/') && !requestedReturn.startsWith('//')
    ? requestedReturn
    : '/cliente';

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Debe ingresar correo y contraseña.');
      return;
    }

    try {
      const response = await loginUser(email, password);
      if (!response?.token) {
        throw new Error('El servidor no devolvió un token de acceso.');
      }
      const profile = await getCurrentClient(response.token);
      saveClientSession(profile, response.token);
      setError('');
      navigate(returnTo, { replace: true });
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'No fue posible iniciar sesión. Intenta nuevamente.');
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-sky-50 px-4 py-16 text-slate-800 outline-none">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="mb-5 flex justify-end">
          <BackToHomeButton />
        </div>
        <Logo />
        <h1 className="mt-4 text-3xl font-black text-slate-900">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-slate-600">
          Inicia sesión para agendar y gestionar las citas de tus mascotas.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleLogin();
          }}
          noValidate
        >
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-semibold text-slate-700">
              Correo
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
              className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus-visible:border-[#0D5C75] focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-semibold text-slate-700">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
              className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus-visible:border-[#0D5C75] focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
            />
          </div>

          {error && (
            <p id="login-error" role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="min-h-[44px] w-full rounded-xl bg-[#0D5C75] px-4 py-3 font-semibold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
          >
            Ingresar
          </button>

          <div className="flex items-center gap-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
            <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
            <span>o</span>
            <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
          </div>

          <Link
            to={`/registro?returnTo=${encodeURIComponent(returnTo)}`}
            className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[#0D5C75] px-4 py-3 font-semibold text-[#0D5C75] transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
          >
            Crear cuenta de cliente
          </Link>
        </form>
      </div>
    </main>
  );
}

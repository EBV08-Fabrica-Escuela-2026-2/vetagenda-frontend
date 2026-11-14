import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { Logo } from '../components/Logo';
import { LoginApiError, loginUser, saveSessionFromLogin } from '../services/api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatWaitTime(seconds: number): string {
  if (seconds < 60) return `${seconds} segundos`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitInProgress = useRef(false);
  const requestedReturn = searchParams.get('returnTo');
  const returnTo = requestedReturn?.startsWith('/') && !requestedReturn.startsWith('//')
    ? requestedReturn
    : '/cliente';

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitInProgress.current) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Debe ingresar correo y contraseña.');
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    submitInProgress.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser({ email: trimmedEmail, password });
      if (!response.token) {
        throw new Error('El servidor no devolvió un token de acceso válido.');
      }

      const session = await saveSessionFromLogin(trimmedEmail, response);
      const defaultRoute = session.rol === 'ADMIN'
        ? '/dashboard'
        : session.rol === 'VETERINARIO'
          ? '/agenda'
          : '/mis-citas';
      navigate(returnTo === '/cliente' ? defaultRoute : returnTo, { replace: true });
    } catch (loginError: unknown) {
      if (loginError instanceof LoginApiError && loginError.status === 429) {
        const waitMessage = loginError.retryAfterSeconds
          ? ` Intenta nuevamente en ${formatWaitTime(loginError.retryAfterSeconds)}.`
          : ' Intenta nuevamente en unos minutos.';
        setError(`Acceso bloqueado temporalmente.${waitMessage}`);
      } else if (loginError instanceof LoginApiError && (loginError.status === 401 || loginError.status === 403)) {
        setError('Credenciales incorrectas');
      } else {
        setError(loginError instanceof Error
          ? loginError.message
          : 'No fue posible iniciar sesión. Intenta nuevamente.');
      }
    } finally {
      submitInProgress.current = false;
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-16 text-slate-800">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="mb-5 flex justify-end">
          <BackToHomeButton disabled={isLoading} />
        </div>
        <Logo />
        <h1 className="mt-4 text-3xl font-black text-slate-900">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-slate-500">
          Inicia sesión para agendar y gestionar las citas de tus mascotas.
        </p>

        <form className="mt-8 space-y-4" noValidate onSubmit={handleLogin}>
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-semibold text-slate-700">
              Correo electrónico
            </label>
            <input
              id="login-email"
              name="email"
              autoComplete="username"
              type="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearError();
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-semibold text-slate-700">
              Contraseña
            </label>
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 focus-within:border-sky-500">
              <input
                id="login-password"
                name="password"
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearError();
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'login-error' : undefined}
                className="min-w-0 flex-1 rounded-l-xl bg-transparent px-4 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                disabled={isLoading}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
                className="rounded-r-xl px-4 text-sm font-semibold text-sky-800 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {error && (
            <p
              id="login-error"
              role="alert"
              className={`rounded-xl border p-3 text-sm font-medium ${
                error.startsWith('Acceso bloqueado')
                  ? 'border-amber-300 bg-amber-50 text-amber-950'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Ingresando…' : 'Ingresar'}
          </button>

          <div className="flex items-center gap-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>o</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <Link
            to={`/registro?returnTo=${encodeURIComponent(returnTo)}`}
            aria-disabled={isLoading}
            tabIndex={isLoading ? -1 : undefined}
            onClick={(event) => {
              if (isLoading) event.preventDefault();
            }}
            className={`flex w-full items-center justify-center rounded-xl border border-sky-700 px-4 py-3 font-semibold text-sky-800 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
              isLoading ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            Crear cuenta de cliente
          </Link>
        </form>
      </div>
    </main>
  );
}

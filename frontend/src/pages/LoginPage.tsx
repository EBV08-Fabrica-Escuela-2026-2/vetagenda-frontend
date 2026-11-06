import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { Logo } from '../components/Logo';
import {
  ADMIN_DEMO_CREDENTIALS,
  getCurrentClient,
  loginAdminDemo,
  loginUser,
  saveClientSession,
} from '../services/api';

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
      if (loginAdminDemo(email, password)) {
        setError('');
        navigate(returnTo === '/cliente' ? '/admin/analitica/ocupacion' : returnTo, { replace: true });
        return;
      }

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
    <main className="min-h-screen bg-sky-50 px-4 py-16 text-slate-800">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="mb-5 flex justify-end">
          <BackToHomeButton />
        </div>
        <Logo />
        <h1 className="mt-4 text-3xl font-black text-slate-900">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-slate-500">
          Inicia sesión para agendar y gestionar las citas de tus mascotas.
        </p>

        <aside className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-bold">Acceso temporal de administrador (demostración)</p>
            <p className="mt-2">Correo: <code className="font-bold">{ADMIN_DEMO_CREDENTIALS.email}</code></p>
            <p>Contraseña: <code className="font-bold">{ADMIN_DEMO_CREDENTIALS.password}</code></p>
            <p className="mt-2 text-xs leading-5">
              Acceso temporal de demostración: no es autenticación segura. No usar con información sensible.
            </p>
            <button
              className="mt-3 min-h-11 rounded-xl border border-amber-800 px-3 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2"
              onClick={() => {
                setEmail(ADMIN_DEMO_CREDENTIALS.email);
                setPassword(ADMIN_DEMO_CREDENTIALS.password);
                setError('');
              }}
              type="button"
            >
              Usar credenciales de prueba
            </button>
        </aside>

        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Correo</label>
            <input
              autoComplete="username"
              aria-label="Correo"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Contraseña</label>
            <input
              autoComplete="current-password"
              aria-label="Contraseña"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700"
          >
            Ingresar
          </button>

          <div className="flex items-center gap-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>o</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <Link
            to={`/registro?returnTo=${encodeURIComponent(returnTo)}`}
            className="flex w-full items-center justify-center rounded-xl border border-sky-700 px-4 py-3 font-semibold text-sky-800 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Crear cuenta de cliente
          </Link>
        </div>
      </div>
    </main>
  );
}

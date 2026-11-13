import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoaderCircle, PawPrint, Stethoscope } from 'lucide-react';
import { ApiError, DEMO_USERS, IS_DEMO, loginCliente, loginDemo, loginVeterinario } from '../services/api';
import type { Rol } from '../types/historial';

const destino = (rol: Rol) => (rol === 'CLIENTE' ? '/historial' : '/modulo-medico');

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<Rol | null>(null);

  const entrar = (rol: Rol) => navigate(from && from.startsWith(destino(rol)) ? from : destino(rol), { replace: true });

  const demo = (rol: Rol) => {
    loginDemo(rol);
    entrar(rol);
  };

  const submitCliente = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading('CLIENTE');
    try {
      await loginCliente(email, password);
      entrar('CLIENTE');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No pudimos iniciar sesión.');
    } finally {
      setLoading(null);
    }
  };

  const veterinario = async () => {
    setError('');
    setLoading('VETERINARIO');
    try {
      await loginVeterinario();
      entrar('VETERINARIO');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No pudimos iniciar sesión.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center px-4 py-12 sm:px-6">
      <div className="card grid overflow-hidden md:grid-cols-2">
        <div className="bg-[linear-gradient(160deg,#074B5D,#08647A)] p-8 text-white sm:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-400">VetAgenda</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight">Historial asistencial</h1>
          <p className="mt-3 text-sm leading-6 text-[#B7D0D7]">
            Consulta atenciones pasadas, cancelaciones, diagnósticos y tratamientos. Cada usuario solo ve la información de las mascotas que le corresponden.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          {IS_DEMO ? (
            <>
              <h2 className="font-display text-2xl font-bold text-brand-950">Ingresa en modo demo</h2>
              <p className="mt-1 text-sm text-ink-500">No hay backend configurado: se usan datos de prueba que simulan el servidor.</p>
              <div className="mt-6 space-y-3">
                <button type="button" onClick={() => demo('CLIENTE')} className="flex w-full items-center gap-4 rounded-2xl border border-line p-4 text-left transition hover:border-brand-500 hover:bg-[#F6FFFC]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><PawPrint className="h-5 w-5" aria-hidden /></span>
                  <span>
                    <span className="block font-bold text-brand-950">Cliente · {DEMO_USERS.CLIENTE.nombre}</span>
                    <span className="block text-xs text-ink-500">Dueña de Bruno y Mía</span>
                  </span>
                </button>
                <button type="button" onClick={() => demo('VETERINARIO')} className="flex w-full items-center gap-4 rounded-2xl border border-line p-4 text-left transition hover:border-brand-500 hover:bg-[#F6FFFC]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Stethoscope className="h-5 w-5" aria-hidden /></span>
                  <span>
                    <span className="block font-bold text-brand-950">Veterinario · {DEMO_USERS.VETERINARIO.nombre}</span>
                    <span className="block text-xs text-ink-500">Consulta activa con Bruno</span>
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl font-bold text-brand-950">Iniciar sesión</h2>
              <form onSubmit={submitCliente} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink-500">Correo electrónico</label>
                  <input id="email" type="email" required autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-ink-500">Contraseña</label>
                  <input id="password" type="password" required autoComplete="current-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading !== null}>
                  {loading === 'CLIENTE' && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />} Ingresar como cliente
                </button>
              </form>
              <div className="my-5 flex items-center gap-3 text-xs text-ink-400"><span className="h-px flex-1 bg-line" />o<span className="h-px flex-1 bg-line" /></div>
              <button type="button" className="btn-secondary w-full" onClick={veterinario} disabled={loading !== null}>
                {loading === 'VETERINARIO' ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Stethoscope className="h-4 w-4" aria-hidden />}
                Ingresar como veterinario (demo del backend)
              </button>
            </>
          )}
          {error && <p className="mt-4 text-sm font-semibold text-danger-600" role="alert">{error}</p>}
        </div>
      </div>
    </main>
  );
}

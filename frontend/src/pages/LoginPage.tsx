import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem('vetagenda_session', 'true');
    navigate('/catalogo');
  };

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-16 text-slate-800">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">VetAgenda</p>
        <h1 className="mt-4 text-3xl font-black text-slate-900">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-slate-500">
          Debes iniciar sesión para consultar el catálogo de servicios.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Correo</label>
            <input
              type="email"
              defaultValue="cliente@vetagenda.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Contraseña</label>
            <input
              type="password"
              defaultValue="12345678"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700"
          >
            Ingresar
          </button>
        </div>
      </div>
    </main>
  );
}

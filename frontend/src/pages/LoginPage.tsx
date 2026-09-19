import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('cliente@vetagenda.com');
  const [password, setPassword] = useState('12345678');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Debe ingresar correo y contraseña.');
      return;
    }

    try {
      const response = await loginUser(email, password);
      const token = response?.token || 'offline-token';
      localStorage.setItem('vetagenda_session', 'true');
      localStorage.setItem('vetagenda_token', token);
      setError('');
      navigate('/catalogo');
    } catch {
      setError('No fue posible iniciar sesión. Intenta nuevamente.');
    }
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Contraseña</label>
            <input
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
        </div>
      </div>
    </main>
  );
}

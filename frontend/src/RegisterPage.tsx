import { useMemo, useState } from 'react';

const initialState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const invalidNameChars = /[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g;
const invalidPhoneChars = /[^0-9+\s()-]/g;

function App() {
  const [form, setForm] = useState(initialState);

  const validation = useMemo(() => {
    const fullNameInvalid = !!form.fullName && invalidNameChars.test(form.fullName);
    const phoneInvalid = !!form.phone && invalidPhoneChars.test(form.phone);
    const emailInvalid = !!form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const passwordWeak = !!form.password && (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password));
    const confirmMismatch = !!form.confirmPassword && form.password !== form.confirmPassword;

    return { fullNameInvalid, phoneInvalid, emailInvalid, passwordWeak, confirmMismatch };
  }, [form]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <main className="min-h-screen bg-[#edf7ff] px-4 py-10 text-slate-800 md:px-8">
      <div className="mx-auto max-w-[960px] rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="px-5 py-5 md:px-8 md:py-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dff7ff] text-lg font-black text-[#0ea5e9]">
              V
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">VetAgenda</p>
              <p className="text-[10px] text-slate-500">Plataforma de Gestión Veterinaria</p>
            </div>
          </div>
        </div>

        <section className="px-5 pb-8 md:px-10 md:pb-10">
          <div className="mx-auto max-w-[580px]">
            <h1 className="text-[2.1rem] font-black leading-tight text-slate-900 md:text-[2.7rem]">
              Crear cuenta de cliente
            </h1>
            <p className="mt-2 text-base text-slate-500">
              Registra tus datos para gestionar tus mascotas
            </p>

            <form className="mt-7 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Nombre completo</label>
                  <input
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                      validation.fullNameInvalid ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                    }`}
                  />
                  {validation.fullNameInvalid && (
                    <p className="text-xs font-medium text-red-600">Solo se permiten letras, espacios y acentos.</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Correo electrónico</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="juan@email.com"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                      validation.emailInvalid ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                    }`}
                  />
                  {validation.emailInvalid && (
                    <p className="text-xs font-medium text-red-600">Ingresa un correo electrónico válido.</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Teléfono de contacto</label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+57 300 123 4567"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                      validation.phoneInvalid ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                    }`}
                  />
                  <p className="text-xs text-slate-400">Opcional. Te contactaremos para recordatorios de citas.</p>
                  {validation.phoneInvalid && (
                    <p className="text-xs font-medium text-red-600">Solo se permiten números, +, espacios, guiones y paréntesis.</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Contraseña</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="********"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                      validation.passwordWeak ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                    }`}
                  />
                  {validation.passwordWeak && (
                    <p className="text-xs font-medium text-red-600">Mínimo 8 caracteres, una mayúscula y un número.</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Confirmar contraseña</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="********"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                      validation.confirmMismatch ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                    }`}
                  />
                  {validation.confirmMismatch && (
                    <p className="text-xs font-medium text-red-600">Las contraseñas no coinciden.</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-[#0ea5e9] px-5 py-3 text-base font-semibold text-white shadow-[0_8px_20px_rgba(14,165,233,0.25)] transition hover:bg-[#0284c7]"
              >
                Crear cuenta de cliente
              </button>

              <div className="pt-1 text-center text-sm text-slate-500">
                ¿Ya tienes una cuenta?
                <a href="#" className="ml-1 font-semibold text-sky-700 underline-offset-4 hover:underline">
                  Inicia sesión
                </a>
              </div>

              <p className="pt-2 text-center text-xs text-slate-400">
                Al registrarte aceptas nuestros{' '}
                <span className="font-medium text-slate-500 underline-offset-2 hover:underline">Términos de Servicio</span>
                {' '}y la{' '}
                <span className="font-medium text-slate-500 underline-offset-2 hover:underline">Política de Privacidad</span>.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;

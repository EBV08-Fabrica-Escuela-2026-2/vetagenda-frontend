import { useState } from 'react';
import { BrandHeader } from './components/BrandHeader';

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const initialState: FormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

function App() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    let nextValue = value;
    if (name === 'phone') {
      nextValue = value.replace(/\D/g, '');
    }

    if (name === 'fullName') {
      nextValue = value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
    }

    setForm((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setShowSuccessModal(false);
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Este campo es obligatorio.';
    } else if (form.fullName.trim().length < 2) {
      nextErrors.fullName = 'Ingresa un nombre válido.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Este campo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Ingresa un correo válido.';
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Este campo es obligatorio.';
    } else if (form.phone.length < 10) {
      nextErrors.phone = 'El celular debe tener al menos 10 dígitos.';
    }

    if (!form.password) {
      nextErrors.password = 'Este campo es obligatorio.';
    } else if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      nextErrors.password = 'Mínimo 8 caracteres, una mayúscula y un número.';
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Este campo es obligatorio.';
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowSuccessModal(true);
    setForm(initialState);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setErrors({});
  };

  return (
    <main className="min-h-screen bg-[#edf7ff] px-4 py-10 text-slate-800 md:px-8">
      <div className="mx-auto max-w-[960px] rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="px-5 py-5 md:px-8 md:py-6">
          <BrandHeader subtitle="Plataforma de Gestión Veterinaria" className="mb-4" />
        </div>

        <section className="px-5 pb-8 md:px-10 md:pb-10">
          <div className="mx-auto max-w-[580px]">
            <h1 className="text-[2.1rem] font-black leading-tight text-slate-900 md:text-[2.7rem]">
              Crear cuenta de cliente
            </h1>
            <p className="mt-2 text-base text-slate-500">
              Registra tus datos para gestionar tus mascotas
            </p>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    required
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                      errors.fullName ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                    }`}
                  />
                  {errors.fullName && <p className="text-xs font-medium text-red-600">{errors.fullName}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="juan@email.com"
                    required
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                      errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                    }`}
                  />
                  {errors.email && <p className="text-xs font-medium text-red-600">{errors.email}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Teléfono de contacto <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="3001234567"
                    required
                    maxLength={15}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                      errors.phone ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                    }`}
                  />
                  {errors.phone ? (
                    <p className="text-xs font-medium text-red-600">{errors.phone}</p>
                  ) : (
                    <p className="text-xs text-slate-400">Solo se permiten números.</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="********"
                    required
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                      errors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                    }`}
                  />
                  {errors.password && <p className="text-xs font-medium text-red-600">{errors.password}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Confirmar contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="********"
                    required
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                      errors.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs font-medium text-red-600">{errors.confirmPassword}</p>
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
                <span className="font-medium text-slate-500 underline-offset-2 hover:underline">Términos de Servicio</span>{' '}
                y la{' '}
                <span className="font-medium text-slate-500 underline-offset-2 hover:underline">Política de Privacidad</span>.
              </p>
            </form>
          </div>
        </section>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50">
          <div className="w-[90%] max-w-[400px] rounded-xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
              ✓
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900">Registro guardado correctamente</h3>
            <p className="mb-6 text-sm text-slate-500">
              La cuenta del cliente se ha registrado correctamente en el sistema.
            </p>
            <button
              onClick={handleCloseModal}
              className="w-full rounded-xl bg-[#0ea5e9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0284c7]"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;

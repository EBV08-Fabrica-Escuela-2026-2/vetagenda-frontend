import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BackToHomeButton } from './components/BackToHomeButton';
import { BrandHeader } from './components/BrandHeader';
import { useModalAccessibility } from './utils/useModalAccessibility';
import {
  getCurrentClient,
  loginUser,
  registerClient,
  registerClientCredentials,
  saveClientSession,
} from './services/api';

type FormState = {
  fullName: string;
  documentIdentidad: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
};

const initialState: FormState = {
  fullName: '',
  documentIdentidad: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  address: '',
};

function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [registrationStage, setRegistrationStage] = useState<'profile' | 'credentials' | 'complete'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successDialogRef = useRef<HTMLDivElement>(null);
  const requestedReturn = searchParams.get('returnTo');
  const returnTo = requestedReturn?.startsWith('/') && !requestedReturn.startsWith('//')
    ? requestedReturn
    : '/cliente';
  const continuesReservation = returnTo.startsWith('/citas/reservar');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    let nextValue = value;
    if (name === 'phone') {
      nextValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'documentIdentidad') {
      nextValue = value.replace(/\D/g, '');
    }

    if (name === 'fullName') {
      nextValue = value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
    }

    setForm((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setBackendError(null);
    setShowSuccessModal(false);
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Este campo es obligatorio.';
    } else if (form.fullName.trim().length < 2) {
      nextErrors.fullName = 'Ingresa un nombre válido.';
    }

    if (!form.documentIdentidad.trim()) {
      nextErrors.documentIdentidad = 'Este campo es obligatorio.';
    } else if (form.documentIdentidad.length < 6) {
      nextErrors.documentIdentidad = 'El documento debe tener al menos 6 dígitos.';
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBackendError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      let nextStage = registrationStage;
      if (nextStage === 'profile') {
        await registerClient({
          nombre: form.fullName.trim(),
          documentoIdentidad: form.documentIdentidad,
          telefono: form.phone,
          correo: form.email.trim(),
          direccion: form.address.trim() || 'Dirección no registrada',
        });
        nextStage = 'credentials';
        setRegistrationStage(nextStage);
      }

      if (nextStage === 'credentials') {
        await registerClientCredentials({
          correo: form.email.trim(),
          documentoIdentidad: form.documentIdentidad,
          password: form.password,
        });
        nextStage = 'complete';
        setRegistrationStage(nextStage);
      }

      const auth = await loginUser(form.email.trim(), form.password);
      const profile = await getCurrentClient(auth.token);
      saveClientSession(profile, auth.token);
      setShowSuccessModal(true);
    } catch (err) {
      setBackendError(
        err instanceof Error ? err.message : 'No se pudo completar el registro. Intenta nuevamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = useCallback(() => {
    setShowSuccessModal(false);
    setErrors({});
    setBackendError(null);
    setForm(initialState);
    setRegistrationStage('profile');
    navigate(returnTo, { replace: true });
  }, [navigate, returnTo]);

  useModalAccessibility({
    isOpen: showSuccessModal,
    onClose: handleCloseModal,
    dialogRef: successDialogRef,
  });

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#edf7ff] px-4 py-10 text-slate-800 outline-none md:px-8">
      <div className="mx-auto max-w-[960px] rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="px-5 py-5 md:px-8 md:py-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <BrandHeader subtitle="Plataforma de Gestión Veterinaria" />
            <BackToHomeButton />
          </div>
        </div>

        <section className="px-5 pb-8 md:px-10 md:pb-10">
          <div className="mx-auto max-w-[580px]">
            <h1 className="text-[2.1rem] font-black leading-tight text-slate-900 md:text-[2.7rem]">
              Crear cuenta de cliente
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Registra tus datos para gestionar tus mascotas
            </p>

            {backendError && (
              <div role="alert" className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                ⚠️ {backendError}
              </div>
            )}

            <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="reg-fullName" className="block text-sm font-semibold text-slate-700">
                    Nombre completo <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="reg-fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    required
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? 'reg-fullName-error' : undefined}
                    className={`min-h-[44px] w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:ring-2 ${
                      errors.fullName
                        ? 'border-red-400 focus-visible:border-red-600 focus-visible:ring-red-600'
                        : 'border-slate-300 focus-visible:border-[#0D5C75] focus-visible:ring-[#0D5C75]'
                    }`}
                  />
                  {errors.fullName && (
                    <p id="reg-fullName-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="reg-documentIdentidad" className="block text-sm font-semibold text-slate-700">
                    Documento de identidad <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="reg-documentIdentidad"
                    name="documentIdentidad"
                    type="text"
                    inputMode="numeric"
                    value={form.documentIdentidad}
                    onChange={handleChange}
                    placeholder="1234567890"
                    required
                    aria-invalid={Boolean(errors.documentIdentidad)}
                    aria-describedby={errors.documentIdentidad ? 'reg-documentIdentidad-error' : undefined}
                    className={`min-h-[44px] w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:ring-2 ${
                      errors.documentIdentidad
                        ? 'border-red-400 focus-visible:border-red-600 focus-visible:ring-red-600'
                        : 'border-slate-300 focus-visible:border-[#0D5C75] focus-visible:ring-[#0D5C75]'
                    }`}
                  />
                  {errors.documentIdentidad && (
                    <p id="reg-documentIdentidad-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.documentIdentidad}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700">
                    Correo electrónico <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="juan@email.com"
                    required
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'reg-email-error' : undefined}
                    className={`min-h-[44px] w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:ring-2 ${
                      errors.email
                        ? 'border-red-400 focus-visible:border-red-600 focus-visible:ring-red-600'
                        : 'border-slate-300 focus-visible:border-[#0D5C75] focus-visible:ring-[#0D5C75]'
                    }`}
                  />
                  {errors.email && (
                    <p id="reg-email-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="reg-phone" className="block text-sm font-semibold text-slate-700">
                    Teléfono de contacto <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="3001234567"
                    required
                    maxLength={10}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'reg-phone-error' : 'reg-phone-help'}
                    className={`min-h-[44px] w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:ring-2 ${
                      errors.phone
                        ? 'border-red-400 focus-visible:border-red-600 focus-visible:ring-red-600'
                        : 'border-slate-300 focus-visible:border-[#0D5C75] focus-visible:ring-[#0D5C75]'
                    }`}
                  />
                  {errors.phone ? (
                    <p id="reg-phone-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.phone}
                    </p>
                  ) : (
                    <p id="reg-phone-help" className="text-xs text-slate-600">
                      Solo se permiten números.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="reg-address" className="block text-sm font-semibold text-slate-700">
                    Dirección
                  </label>
                  <input
                    id="reg-address"
                    name="address"
                    type="text"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Calle 12 # 45-67"
                    className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:border-[#0D5C75] focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700">
                    Contraseña <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="********"
                    required
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'reg-password-error' : undefined}
                    className={`min-h-[44px] w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:ring-2 ${
                      errors.password
                        ? 'border-red-400 focus-visible:border-red-600 focus-visible:ring-red-600'
                        : 'border-slate-300 focus-visible:border-[#0D5C75] focus-visible:ring-[#0D5C75]'
                    }`}
                  />
                  {errors.password && (
                    <p id="reg-password-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="reg-confirmPassword" className="block text-sm font-semibold text-slate-700">
                    Confirmar contraseña <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="reg-confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="********"
                    required
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={errors.confirmPassword ? 'reg-confirmPassword-error' : undefined}
                    className={`min-h-[44px] w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:ring-2 ${
                      errors.confirmPassword
                        ? 'border-red-400 focus-visible:border-red-600 focus-visible:ring-red-600'
                        : 'border-slate-300 focus-visible:border-[#0D5C75] focus-visible:ring-[#0D5C75]'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p id="reg-confirmPassword-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 min-h-[48px] w-full rounded-xl bg-[#0D5C75] px-5 py-3 text-base font-semibold text-white shadow-[0_8px_20px_rgba(13,92,117,0.2)] transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 disabled:cursor-wait disabled:bg-slate-300 disabled:text-slate-700"
              >
                {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta de cliente'}
              </button>

              <div className="pt-1 text-center text-sm text-slate-600">
                ¿Ya tienes una cuenta?
                <Link
                  to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
                  className="ml-1 inline-flex min-h-[44px] items-center rounded-md px-1 font-semibold text-[#0D5C75] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                >
                  Inicia sesión
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-1.5 pt-2 text-center text-xs text-slate-600">
                <span>Al registrarte aceptas nuestros</span>
                <Link
                  to="/terminos"
                  className="inline-flex min-h-[44px] items-center rounded px-1 font-medium text-[#0D5C75] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                >
                  Términos de Servicio
                </Link>
                <span>y la</span>
                <Link
                  to="/privacidad"
                  className="inline-flex min-h-[44px] items-center rounded px-1 font-medium text-[#0D5C75] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                >
                  Política de Privacidad
                </Link>
                <span>.</span>
              </div>
            </form>
          </div>
        </section>
      </div>

      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) handleCloseModal();
          }}
        >
          <div
            ref={successDialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-success-title"
            className="w-[90%] max-w-[400px] rounded-xl bg-white p-8 text-center shadow-2xl outline-none"
          >
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700"
              aria-hidden="true"
            >
              ✓
            </div>
            <h2 id="register-success-title" className="mb-2 text-lg font-bold text-slate-900">
              Registro guardado correctamente
            </h2>
            <p className="mb-6 text-sm text-slate-600">
              Tu cuenta está lista y ya has iniciado sesión.
            </p>
            <button
              type="button"
              onClick={handleCloseModal}
              className="min-h-[44px] w-full rounded-xl bg-[#0D5C75] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
            >
              {continuesReservation ? 'Continuar con la reserva' : 'Ir a mi portal'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default RegisterPage;

import React, { useCallback, useRef, useState } from 'react';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { BrandHeader } from '../components/BrandHeader';
import { registerVeterinarian } from '../services/api';
import { useModalAccessibility } from '../utils/useModalAccessibility';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  documentNumber?: string;
  phone?: string;
  professionalLicense?: string;
  email?: string;
  specialty?: string;
  address?: string;
  attentionSchedule?: string;
}

const baseInputClasses =
  'min-h-[44px] w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:ring-2';
const validInputClasses = 'border-slate-300 focus-visible:border-[#0D5C75] focus-visible:ring-[#0D5C75]';
const invalidInputClasses = 'border-red-400 focus-visible:border-red-600 focus-visible:ring-red-600';
const disabledInputClasses = 'bg-slate-100 cursor-not-allowed';

export const RegisterVeterinarianPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentType: 'CC',
    documentNumber: '',
    phone: '',
    professionalLicense: '',
    email: '',
    specialty: '',
    address: '',
    attentionSchedule: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const successDialogRef = useRef<HTMLDivElement>(null);

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleLettersKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', ' '];
    if (!allowedKeys.includes(e.key) && /\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value;

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Este campo es obligatorio';
    } else if (!lettersRegex.test(formData.firstName.trim())) {
      newErrors.firstName = 'El nombre no debe contener números';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Este campo es obligatorio';
    } else if (!lettersRegex.test(formData.lastName.trim())) {
      newErrors.lastName = 'El apellido no debe contener números';
    }

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'Este campo es obligatorio';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Este campo es obligatorio';
    } else if (formData.phone.trim().length !== 10) {
      newErrors.phone = 'El número celular no es válido';
    }

    const digitsInLicense = (formData.professionalLicense.match(/\d/g) || []).length;
    if (!formData.professionalLicense.trim()) {
      newErrors.professionalLicense = 'Este campo es obligatorio';
    } else if (digitsInLicense < 4) {
      newErrors.professionalLicense = 'Debe incluir letras y al menos 4 números';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Este campo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'El correo no es válido';
    }

    if (!formData.specialty) {
      newErrors.specialty = 'Este campo es obligatorio';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Este campo es obligatorio';
    }

    if (!formData.attentionSchedule.trim()) {
      newErrors.attentionSchedule = 'Este campo es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      setErrorMessage('Por favor, corrija los campos marcados antes de continuar.');
      return;
    }

    setIsLoading(true);
    try {
      await registerVeterinarian({
        nombre: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        tipoDocumento: formData.documentType,
        documentoIdentidad: formData.documentNumber.trim(),
        telefono: formData.phone.trim(),
        correo: formData.email.trim(),
        tarjetaProfesional: formData.professionalLicense.trim(),
        especialidad: formData.specialty,
        direccion: formData.address.trim() || undefined,
        horarioAtencion: formData.attentionSchedule.trim() || undefined,
      });
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo registrar el veterinario en este momento.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      documentType: 'CC',
      documentNumber: '',
      phone: '',
      professionalLicense: '',
      email: '',
      specialty: '',
      address: '',
      attentionSchedule: '',
      isActive: true,
    });
    setErrors({});
    setErrorMessage(null);
  };

  const handleCloseModal = useCallback(() => {
    setShowSuccessModal(false);
    resetForm();
  }, []);

  useModalAccessibility({
    isOpen: showSuccessModal,
    onClose: handleCloseModal,
    dialogRef: successDialogRef,
  });

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#edf7ff] px-4 py-10 text-slate-800 outline-none md:px-8">
      <div className="mx-auto max-w-[960px] rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 md:px-8 md:py-6">
          <BrandHeader subtitle="Alta de Profesional Veterinario" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-600" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-600">Sistema activo</span>
            </div>
            <BackToHomeButton />
          </div>
        </div>

        <section className="px-5 pb-8 md:px-10 md:pb-10">
          <div className="mx-auto max-w-[580px]">
            {errorMessage && (
              <div role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                ⚠️ {errorMessage}
              </div>
            )}

            <div className="mb-4 border-b border-slate-100 pb-4">
              <h1 className="text-lg font-semibold text-[#115e59]">Información del Profesional</h1>
              <p className="mt-1 text-sm text-slate-600">
                Complete todos los campos obligatorios para dar de alta al médico.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="vet-firstName" className="block text-sm font-semibold text-slate-700">
                    Nombres <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="vet-firstName"
                    type="text"
                    name="firstName"
                    disabled={isLoading}
                    value={formData.firstName}
                    onChange={handleChange}
                    onKeyDown={handleLettersKeyDown}
                    placeholder="Ej. Carlos Andrés"
                    aria-invalid={Boolean(errors.firstName)}
                    aria-describedby={errors.firstName ? 'vet-firstName-error' : undefined}
                    className={`${baseInputClasses} ${errors.firstName ? invalidInputClasses : validInputClasses} ${
                      isLoading ? disabledInputClasses : ''
                    }`}
                  />
                  {errors.firstName && (
                    <p id="vet-firstName-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="vet-lastName" className="block text-sm font-semibold text-slate-700">
                    Apellidos <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="vet-lastName"
                    type="text"
                    name="lastName"
                    disabled={isLoading}
                    value={formData.lastName}
                    onChange={handleChange}
                    onKeyDown={handleLettersKeyDown}
                    placeholder="Ej. Ramírez Torres"
                    aria-invalid={Boolean(errors.lastName)}
                    aria-describedby={errors.lastName ? 'vet-lastName-error' : undefined}
                    className={`${baseInputClasses} ${errors.lastName ? invalidInputClasses : validInputClasses} ${
                      isLoading ? disabledInputClasses : ''
                    }`}
                  />
                  {errors.lastName && (
                    <p id="vet-lastName-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="vet-documentType" className="block text-sm font-semibold text-slate-700">
                    Tipo de documento <span className="text-red-700">*</span>
                  </label>
                  <select
                    id="vet-documentType"
                    name="documentType"
                    disabled={isLoading}
                    value={formData.documentType}
                    onChange={handleChange}
                    className={`${baseInputClasses} ${validInputClasses} ${isLoading ? disabledInputClasses : ''}`}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="vet-documentNumber" className="block text-sm font-semibold text-slate-700">
                    Número de documento <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="vet-documentNumber"
                    type="text"
                    name="documentNumber"
                    inputMode="numeric"
                    disabled={isLoading}
                    value={formData.documentNumber}
                    onChange={handleChange}
                    onKeyDown={handleNumericKeyDown}
                    placeholder="Ej. 1012345678"
                    aria-invalid={Boolean(errors.documentNumber)}
                    aria-describedby={errors.documentNumber ? 'vet-documentNumber-error' : undefined}
                    className={`${baseInputClasses} ${
                      errors.documentNumber ? invalidInputClasses : validInputClasses
                    } ${isLoading ? disabledInputClasses : ''}`}
                  />
                  {errors.documentNumber && (
                    <p id="vet-documentNumber-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.documentNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="vet-phone" className="block text-sm font-semibold text-slate-700">
                    Número Celular <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="vet-phone"
                    type="tel"
                    inputMode="numeric"
                    name="phone"
                    maxLength={10}
                    disabled={isLoading}
                    value={formData.phone}
                    onChange={handleChange}
                    onKeyDown={handleNumericKeyDown}
                    placeholder="Ej. 3001234567"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'vet-phone-error' : undefined}
                    className={`${baseInputClasses} ${errors.phone ? invalidInputClasses : validInputClasses} ${
                      isLoading ? disabledInputClasses : ''
                    }`}
                  />
                  {errors.phone && (
                    <p id="vet-phone-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="vet-professionalLicense" className="block text-sm font-semibold text-slate-700">
                    Tarjeta Profesional / Registro Médico <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="vet-professionalLicense"
                    type="text"
                    name="professionalLicense"
                    disabled={isLoading}
                    value={formData.professionalLicense}
                    onChange={handleChange}
                    placeholder="Ej. TP-123456-VET"
                    aria-invalid={Boolean(errors.professionalLicense)}
                    aria-describedby={
                      errors.professionalLicense ? 'vet-professionalLicense-error' : 'vet-professionalLicense-help'
                    }
                    className={`${baseInputClasses} ${
                      errors.professionalLicense ? invalidInputClasses : validInputClasses
                    } ${isLoading ? disabledInputClasses : ''}`}
                  />
                  {errors.professionalLicense ? (
                    <p id="vet-professionalLicense-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.professionalLicense}
                    </p>
                  ) : (
                    <p id="vet-professionalLicense-help" className="text-xs text-slate-600">
                      Debe contener letras y mínimo 4 números.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="vet-email" className="block text-sm font-semibold text-slate-700">
                  Correo Electrónico Institucional <span className="text-red-700">*</span>
                </label>
                <input
                  id="vet-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  disabled={isLoading}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="medico@veterinaria.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'vet-email-error' : undefined}
                  className={`${baseInputClasses} ${errors.email ? invalidInputClasses : validInputClasses} ${
                    isLoading ? disabledInputClasses : ''
                  }`}
                />
                {errors.email && (
                  <p id="vet-email-error" role="alert" className="text-xs font-medium text-red-700">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="vet-specialty" className="block text-sm font-semibold text-slate-700">
                  Especialidad Asistencial <span className="text-red-700">*</span>
                </label>
                <select
                  id="vet-specialty"
                  name="specialty"
                  disabled={isLoading}
                  value={formData.specialty}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.specialty)}
                  aria-describedby={errors.specialty ? 'vet-specialty-error' : undefined}
                  className={`${baseInputClasses} ${
                    errors.specialty ? invalidInputClasses : validInputClasses
                  } ${isLoading ? disabledInputClasses : ''}`}
                >
                  <option value="">Selecciona una especialidad</option>
                  <option value="Medicina General">Medicina General</option>
                  <option value="Cirugía">Cirugía</option>
                  <option value="Dermatología">Dermatología</option>
                  <option value="Cardiología">Cardiología</option>
                </select>
                {errors.specialty && (
                  <p id="vet-specialty-error" role="alert" className="text-xs font-medium text-red-700">
                    {errors.specialty}
                  </p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="vet-address" className="block text-sm font-semibold text-slate-700">
                    Dirección <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="vet-address"
                    type="text"
                    name="address"
                    disabled={isLoading}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Ej. Calle 45 # 12-30, Bogotá"
                    aria-invalid={Boolean(errors.address)}
                    aria-describedby={errors.address ? 'vet-address-error' : undefined}
                    className={`${baseInputClasses} ${errors.address ? invalidInputClasses : validInputClasses} ${
                      isLoading ? disabledInputClasses : ''
                    }`}
                  />
                  {errors.address && (
                    <p id="vet-address-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="vet-attentionSchedule" className="block text-sm font-semibold text-slate-700">
                    Horario de atención <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="vet-attentionSchedule"
                    type="text"
                    name="attentionSchedule"
                    disabled={isLoading}
                    value={formData.attentionSchedule}
                    onChange={handleChange}
                    placeholder="Ej. Lunes a sábado, 8:00 AM - 6:00 PM"
                    aria-invalid={Boolean(errors.attentionSchedule)}
                    aria-describedby={errors.attentionSchedule ? 'vet-attentionSchedule-error' : undefined}
                    className={`${baseInputClasses} ${
                      errors.attentionSchedule ? invalidInputClasses : validInputClasses
                    } ${isLoading ? disabledInputClasses : ''}`}
                  />
                  {errors.attentionSchedule && (
                    <p id="vet-attentionSchedule-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.attentionSchedule}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p id="vet-account-status-label" className="text-sm font-semibold text-slate-900">
                    Estado de la Cuenta
                  </p>
                  <p className="text-xs text-slate-600">El médico podrá iniciar sesión y gestionar citas.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isActive}
                  aria-labelledby="vet-account-status-label"
                  disabled={isLoading}
                  onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 ${
                    isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  }`}
                >
                  <span
                    className={`relative block h-6 w-11 rounded-full transition ${
                      formData.isActive ? 'bg-[#115e59]' : 'bg-slate-400'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-all ${
                        formData.isActive ? 'left-[23px]' : 'left-[3px]'
                      }`}
                    />
                  </span>
                </button>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(14,165,233,0.15)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 ${
                    isLoading ? 'cursor-wait bg-[#0f766e] opacity-80' : 'bg-[#115e59] hover:bg-[#0f766e]'
                  }`}
                >
                  {isLoading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={resetForm}
                  className={`min-h-[44px] min-w-[44px] rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 ${
                    isLoading ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-50'
                  }`}
                >
                  Cancelar registro
                </button>
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
            aria-labelledby="vet-register-success-title"
            className="w-[90%] max-w-[400px] rounded-xl bg-white p-8 text-center shadow-2xl outline-none"
          >
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700"
              aria-hidden="true"
            >
              ✓
            </div>
            <h2 id="vet-register-success-title" className="mb-2 text-lg font-bold text-slate-900">
              Registro de veterinario exitoso
            </h2>
            <p className="mb-6 text-sm text-slate-600">
              El profesional médico ha sido registrado correctamente en el sistema con estado activo.
            </p>
            <button
              type="button"
              onClick={handleCloseModal}
              className="min-h-[44px] w-full rounded-xl bg-[#115e59] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f766e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { BrandHeader } from '../components/BrandHeader';
import { createService, getStoredServices, listVeterinarians, VeterinarioListaItem } from '../services/api';
import { useModalAccessibility } from '../utils/useModalAccessibility';

type FormState = {
  nombre: string;
  descripcion: string;
  precio: string;
  duracionMinutos: string;
  veterinarioId: string;
};

type FormErrors = {
  nombre?: string;
  descripcion?: string;
  precio?: string;
  duracionMinutos?: string;
  veterinarioId?: string;
  duplicate?: string;
};

const MAX_DESCRIPTION_LENGTH = 500;
const initialForm: FormState = {
  nombre: '',
  descripcion: '',
  precio: '',
  duracionMinutos: '',
  veterinarioId: '',
};

export function RegisterServicePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [descriptionLimitMessage, setDescriptionLimitMessage] = useState('');
  const [existingServices, setExistingServices] = useState<string[]>(() =>
    getStoredServices().map((service) => service.nombre),
  );
  const [veterinarios, setVeterinarios] = useState<VeterinarioListaItem[]>([]);
  const [loadingVets, setLoadingVets] = useState(true);
  const [vetsError, setVetsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    setLoadingVets(true);
    setVetsError(null);

    listVeterinarians()
      .then((data) => {
        if (isMounted) setVeterinarios(data);
      })
      .catch(() => {
        if (isMounted) setVetsError('No se pudo cargar la lista de veterinarios. Verifica que el backend esté activo.');
      })
      .finally(() => {
        if (isMounted) setLoadingVets(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, duplicate: undefined }));
    setSubmitError(null);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    const trimmed = nextValue.slice(0, MAX_DESCRIPTION_LENGTH);
    setForm((current) => ({ ...current, descripcion: trimmed }));
    if (nextValue.length > MAX_DESCRIPTION_LENGTH) {
      setDescriptionLimitMessage('Límite de 500 caracteres alcanzado');
      return;
    }
    setDescriptionLimitMessage('');
    setErrors((current) => ({ ...current, descripcion: undefined }));
  };

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};
    const normalizedName = form.nombre.trim();
    const normalizedDescription = form.descripcion.trim();
    const normalizedPrice = form.precio.trim();
    const normalizedDuration = form.duracionMinutos.trim();

    if (!normalizedName) {
      nextErrors.nombre = 'Este campo es obligatorio';
    } else if (existingServices.some((service) => service.toLowerCase() === normalizedName.toLowerCase())) {
      nextErrors.duplicate = 'Este servicio ya ha sido creado anteriormente';
    }

    if (!normalizedDescription) {
      nextErrors.descripcion = 'Este campo es obligatorio';
    }

    if (!normalizedPrice) {
      nextErrors.precio = 'Este campo es obligatorio';
    } else {
      const priceNumber = Number(normalizedPrice);
      if (Number.isNaN(priceNumber) || priceNumber <= 0) {
        nextErrors.precio = 'El precio debe ser un número válido mayor a cero';
      }
    }

    if (!normalizedDuration) {
      nextErrors.duracionMinutos = 'Este campo es obligatorio';
    } else {
      const durationNumber = Number(normalizedDuration);
      if (!Number.isInteger(durationNumber) || durationNumber < 1) {
        nextErrors.duracionMinutos = 'La duración debe ser al menos 1 minuto';
      }
    }

    if (!form.veterinarioId) {
      nextErrors.veterinarioId = 'Debes seleccionar un veterinario';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const createdService = await createService({
        veterinarioId: Number(form.veterinarioId),
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio),
        duracionMinutos: Number(form.duracionMinutos),
      });

      const nextStoredServices = [...getStoredServices(), createdService];
      setExistingServices(nextStoredServices.map((service) => service.nombre));
      setShowSuccessModal(true);
      setForm(initialForm);
      setDescriptionLimitMessage('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo guardar el servicio en este momento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  useModalAccessibility({
    isOpen: showSuccessModal,
    onClose: handleCloseModal,
    dialogRef: successDialogRef,
  });

  const handleCancel = () => {
    navigate('/catalogo');
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-sky-50 px-4 py-10 text-slate-800 outline-none md:px-8">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5 md:px-8">
          <BrandHeader subtitle="Registrar nuevo servicio" />
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Catalogación clínica
            </span>
            <BackToHomeButton />
          </div>
        </div>

        <section className="px-5 py-8 md:px-8 md:py-10">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-slate-900">Servicio asistencial</h1>
              <p className="mt-1 text-sm text-slate-600">
                Registra un nuevo servicio para incorporarlo a la oferta clínica disponible en la sede.
              </p>
            </div>

            {submitError && (
              <div role="alert" className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                ⚠️ {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label htmlFor="service-nombre" className="block text-sm font-semibold text-slate-700">
                  Nombre del servicio <span className="text-red-700">*</span>
                </label>
                <input
                  id="service-nombre"
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Ultrasonido abdominal"
                  aria-invalid={Boolean(errors.nombre || errors.duplicate)}
                  aria-describedby={
                    errors.nombre || errors.duplicate ? 'service-nombre-error' : undefined
                  }
                  className={`min-h-[44px] w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:ring-2 ${
                    errors.nombre || errors.duplicate
                      ? 'border-red-400 focus-visible:border-red-600 focus-visible:ring-red-600'
                      : 'border-slate-300 focus-visible:border-[#0D5C75] focus-visible:ring-[#0D5C75]'
                  }`}
                />
                {(errors.nombre || errors.duplicate) && (
                  <p id="service-nombre-error" role="alert" className="text-xs font-medium text-red-700">
                    {errors.nombre || errors.duplicate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="service-descripcion" className="block text-sm font-semibold text-slate-700">
                  Descripción <span className="text-red-700">*</span>
                </label>
                <textarea
                  id="service-descripcion"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleDescriptionChange}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  rows={5}
                  placeholder="Ingrese una descripción detallada del servicio."
                  aria-invalid={Boolean(errors.descripcion)}
                  aria-describedby={
                    errors.descripcion
                      ? 'service-descripcion-error'
                      : descriptionLimitMessage
                        ? 'service-descripcion-limit'
                        : undefined
                  }
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:ring-2 ${
                    errors.descripcion
                      ? 'border-red-400 focus-visible:border-red-600 focus-visible:ring-red-600'
                      : 'border-slate-300 focus-visible:border-[#0D5C75] focus-visible:ring-[#0D5C75]'
                  }`}
                />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    {errors.descripcion && (
                      <p id="service-descripcion-error" role="alert" className="text-xs font-medium text-red-700">
                        {errors.descripcion}
                      </p>
                    )}
                    {descriptionLimitMessage && (
                      <p id="service-descripcion-limit" role="status" aria-live="polite" className="text-xs font-medium text-amber-800">
                        {descriptionLimitMessage}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {form.descripcion.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="service-veterinarioId" className="block text-sm font-semibold text-slate-700">
                  Veterinario responsable <span className="text-red-700">*</span>
                </label>
                {loadingVets ? (
                  <div
                    role="status"
                    aria-live="polite"
                    aria-busy="true"
                    className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                  >
                    <span
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#0D5C75] border-t-transparent"
                      aria-hidden="true"
                    />
                    Cargando veterinarios...
                  </div>
                ) : vetsError ? (
                  <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                    ⚠️ {vetsError}
                  </div>
                ) : (
                  <select
                    id="service-veterinarioId"
                    name="veterinarioId"
                    value={form.veterinarioId}
                    onChange={(e) => {
                      setForm((current) => ({ ...current, veterinarioId: e.target.value }));
                      setErrors((current) => ({ ...current, veterinarioId: undefined }));
                    }}
                    aria-invalid={Boolean(errors.veterinarioId)}
                    aria-describedby={errors.veterinarioId ? 'service-veterinarioId-error' : undefined}
                    className={`min-h-[44px] w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:ring-2 ${
                      errors.veterinarioId
                        ? 'border-red-400 focus-visible:border-red-600 focus-visible:ring-red-600'
                        : 'border-slate-300 focus-visible:border-[#0D5C75] focus-visible:ring-[#0D5C75]'
                    }`}
                  >
                    <option value="">Selecciona un veterinario...</option>
                    {veterinarios.map((vet) => (
                      <option key={vet.id} value={vet.id}>
                        {vet.nombre}
                      </option>
                    ))}
                  </select>
                )}
                {errors.veterinarioId && (
                  <p id="service-veterinarioId-error" role="alert" className="text-xs font-medium text-red-700">
                    {errors.veterinarioId}
                  </p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="service-precio" className="block text-sm font-semibold text-slate-700">
                    Tarifa / Precio <span className="text-red-700">*</span>
                  </label>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-base font-semibold text-slate-600"
                      aria-hidden="true"
                    >
                      $
                    </span>
                    <input
                      id="service-precio"
                      type="number"
                      min="1"
                      step="1"
                      name="precio"
                      value={form.precio}
                      onChange={handleChange}
                      placeholder="Ej. 65000"
                      aria-invalid={Boolean(errors.precio)}
                      aria-describedby={errors.precio ? 'service-precio-error' : undefined}
                      className={`min-h-[44px] w-full rounded-xl border bg-white py-3 pl-8 pr-4 text-base text-slate-800 shadow-sm outline-none transition focus-visible:ring-2 ${
                        errors.precio
                          ? 'border-red-400 focus-visible:border-red-600 focus-visible:ring-red-600'
                          : 'border-slate-300 focus-visible:border-[#0D5C75] focus-visible:ring-[#0D5C75]'
                      }`}
                    />
                  </div>
                  {errors.precio && (
                    <p id="service-precio-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.precio}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="service-duracionMinutos" className="block text-sm font-semibold text-slate-700">
                    Duración (minutos) <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="service-duracionMinutos"
                    type="number"
                    min="1"
                    step="1"
                    name="duracionMinutos"
                    value={form.duracionMinutos}
                    onChange={handleChange}
                    placeholder="Ej. 30"
                    aria-invalid={Boolean(errors.duracionMinutos)}
                    aria-describedby={errors.duracionMinutos ? 'service-duracion-error' : undefined}
                    className={`min-h-[44px] w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:ring-2 ${
                      errors.duracionMinutos
                        ? 'border-red-400 focus-visible:border-red-600 focus-visible:ring-red-600'
                        : 'border-slate-300 focus-visible:border-[#0D5C75] focus-visible:ring-[#0D5C75]'
                    }`}
                  />
                  {errors.duracionMinutos && (
                    <p id="service-duracion-error" role="alert" className="text-xs font-medium text-red-700">
                      {errors.duracionMinutos}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
                >
                  Cancelar registro
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loadingVets}
                  className="min-h-[44px] min-w-[44px] rounded-xl bg-[#0D5C75] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 disabled:cursor-wait disabled:bg-slate-300 disabled:text-slate-700"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) handleCloseModal();
          }}
        >
          <div
            ref={successDialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-success-title"
            className="w-full max-w-[420px] rounded-2xl bg-white p-8 text-center shadow-2xl outline-none"
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700"
              aria-hidden="true"
            >
              ✓
            </div>
            <h2 id="service-success-title" className="text-xl font-black text-slate-900">
              Registro exitoso
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              El servicio se ha registrado correctamente en la oferta clínica.
            </p>
            <button
              type="button"
              onClick={handleCloseModal}
              className="mt-6 min-h-[44px] w-full rounded-xl bg-[#0D5C75] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

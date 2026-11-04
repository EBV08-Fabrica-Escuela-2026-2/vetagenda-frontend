import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { BrandHeader } from '../components/BrandHeader';
import { ClientSessionActions } from '../components/ClientSessionActions';
import { createService, fetchCatalogo, getVeterinarianSession } from '../services/api';

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
  const veterinarian = getVeterinarianSession();
  const veterinarianId = veterinarian ? String(veterinarian.id) : '';
  const [form, setForm] = useState<FormState>({ ...initialForm, veterinarioId: veterinarianId });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [descriptionLimitMessage, setDescriptionLimitMessage] = useState('');
  const [existingServices, setExistingServices] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCatalogo()
      .then((catalog) => {
        if (!active) return;
        const ownProfile = catalog.find((item) => item.id === veterinarian?.id);
        setExistingServices(ownProfile?.servicios.map((service) => service.nombre) ?? []);
      })
      .catch(() => {
        if (active) setExistingServices([]);
      });
    return () => { active = false; };
  }, [veterinarian?.id]);

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

      setExistingServices((current) => [...current, createdService.nombre]);
      setShowSuccessModal(true);
      setForm({ ...initialForm, veterinarioId: veterinarianId });
      setDescriptionLimitMessage('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo guardar el servicio en este momento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  const handleCancel = () => {
    navigate('/veterinario/agenda');
  };

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-10 text-slate-800 md:px-8">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <BrandHeader subtitle="Registrar nuevo servicio" />
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/veterinario/agenda"
              className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-800 transition hover:bg-sky-100"
            >
              Volver a mi portal
            </Link>
            <ClientSessionActions showPortalLink={false} />
            <BackToHomeButton />
          </div>
        </div>

        <section className="px-5 py-8 md:px-8 md:py-10">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-slate-900">Servicio asistencial</h1>
              <p className="mt-1 text-sm text-slate-500">
                Agrega un servicio a tu oferta profesional. Al guardarlo quedará disponible en el catálogo público.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Profesional responsable</p>
              <p className="mt-1 font-bold text-slate-900">{veterinarian?.nombre}</p>
              <p className="mt-1 text-sm text-slate-600">El servicio se asociará automáticamente a tu perfil.</p>
            </div>

            {submitError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                ⚠️ {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre del servicio */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Nombre del servicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Ultrasonido abdominal"
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                    errors.nombre || errors.duplicate
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                  }`}
                />
                {errors.nombre && <p className="text-xs font-medium text-red-600">{errors.nombre}</p>}
                {errors.duplicate && <p className="text-xs font-medium text-red-600">{errors.duplicate}</p>}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleDescriptionChange}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  rows={5}
                  placeholder="Ingrese una descripción detallada del servicio."
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                    errors.descripcion
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                  }`}
                />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    {errors.descripcion && <p className="text-xs font-medium text-red-600">{errors.descripcion}</p>}
                    {descriptionLimitMessage && (
                      <p className="text-xs font-medium text-amber-600">{descriptionLimitMessage}</p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {form.descripcion.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
              </div>

              {/* Precio y Duración */}
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Tarifa / Precio <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-base font-semibold text-slate-500">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      name="precio"
                      value={form.precio}
                      onChange={handleChange}
                      placeholder="Ej. 65000"
                      className={`w-full rounded-xl border bg-white py-3 pl-8 pr-4 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                        errors.precio
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                      }`}
                    />
                  </div>
                  {errors.precio && <p className="text-xs font-medium text-red-600">{errors.precio}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Duración (minutos) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    name="duracionMinutos"
                    value={form.duracionMinutos}
                    onChange={handleChange}
                    placeholder="Ej. 30"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                      errors.duracionMinutos
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                    }`}
                  />
                  {errors.duracionMinutos && (
                    <p className="text-xs font-medium text-red-600">{errors.duracionMinutos}</p>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar registro
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-wait disabled:opacity-70"
                >
                  {isSubmitting ? 'Publicando...' : 'Agregar servicio'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
              ✓
            </div>
            <h3 className="text-xl font-black text-slate-900">Registro exitoso</h3>
            <p className="mt-2 text-sm text-slate-500">El servicio ya aparece asociado a tu perfil y está disponible en el catálogo.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Agregar otro
              </button>
              <button
                type="button"
                onClick={() => navigate('/veterinario/agenda')}
                className="rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Volver a mi portal
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

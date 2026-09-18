import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';

type FormState = {
  nombre: string;
  descripcion: string;
  precio: string;
  duracion: string;
};

type FormErrors = {
  nombre?: string;
  descripcion?: string;
  precio?: string;
  duracion?: string;
  duplicate?: string;
};

type StoredService = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: string;
};

const MAX_DESCRIPTION_LENGTH = 500;
const SERVICES_STORAGE_KEY = 'vetagenda-services';
const initialForm: FormState = {
  nombre: '',
  descripcion: '',
  precio: '',
  duracion: '',
};

const readStoredServices = (): StoredService[] => {
  try {
    const rawValue = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

export function RegisterServicePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [descriptionLimitMessage, setDescriptionLimitMessage] = useState('');
  const [existingServices, setExistingServices] = useState<string[]>(() => readStoredServices().map((service) => service.nombre));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
      duplicate: undefined,
    }));
  };

  const buildValidationError = (field: keyof FormErrors, message: string) => {
    setErrors((current) => ({
      ...current,
      [field]: message,
    }));
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
    const normalizedDuration = form.duracion.trim();

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
      nextErrors.duracion = 'Este campo es obligatorio';
    } else {
      const durationNumber = Number(normalizedDuration);
      if (Number.isNaN(durationNumber) || durationNumber <= 0) {
        nextErrors.duracion = 'La duración estimada debe ser mayor a cero';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const nextService: StoredService = {
      id: Date.now(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      duracion: form.duracion.trim(),
    };

    const nextStoredServices = [...readStoredServices(), nextService];
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(nextStoredServices));
    setExistingServices(nextStoredServices.map((service) => service.nombre));
    setShowSuccessModal(true);
    setForm(initialForm);
    setDescriptionLimitMessage('');
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  const handleCancel = () => {
    navigate('/catalogo');
  };

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-10 text-slate-800 md:px-8">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 md:px-8">
          <BrandHeader subtitle="Registrar nuevo servicio" />
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Catalogación clínica
          </span>
        </div>

        <section className="px-5 py-8 md:px-8 md:py-10">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-slate-900">Servicio asistencial</h1>
              <p className="mt-1 text-sm text-slate-500">
                Registra un nuevo servicio para incorporarlo a la oferta clínica disponible en la sede.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    errors.nombre || errors.duplicate ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                  }`}
                />
                {errors.nombre && <p className="text-xs font-medium text-red-600">{errors.nombre}</p>}
                {errors.duplicate && <p className="text-xs font-medium text-red-600">{errors.duplicate}</p>}
              </div>

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
                    errors.descripcion ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                  }`}
                />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    {errors.descripcion && (
                      <p className="text-xs font-medium text-red-600">{errors.descripcion}</p>
                    )}
                    {descriptionLimitMessage && (
                      <p className="text-xs font-medium text-amber-600">{descriptionLimitMessage}</p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {form.descripcion.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
              </div>

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
                        errors.precio ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                      }`}
                    />
                  </div>
                  {errors.precio && <p className="text-xs font-medium text-red-600">{errors.precio}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Duración estimada <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      name="duracion"
                      value={form.duracion}
                      onChange={handleChange}
                      placeholder="Ej. 45"
                      className={`w-full rounded-xl border bg-white py-3 pr-16 pl-4 text-base text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                        errors.duracion ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                      }`}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-semibold text-slate-500">
                      min
                    </span>
                  </div>
                  {errors.duracion && <p className="text-xs font-medium text-red-600">{errors.duracion}</p>}
                </div>
              </div>

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
                  className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                >
                  Guardar
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
            <p className="mt-2 text-sm text-slate-500">
              El servicio se ha registrado correctamente en la oferta clínica.
            </p>
            <button
              type="button"
              onClick={handleCloseModal}
              className="mt-6 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

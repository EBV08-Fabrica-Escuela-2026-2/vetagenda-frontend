import { useCallback, useRef, useState } from 'react';
import { ClientPortalHeader } from '../components/ClientPortalHeader';
import { getClientSession, registerPet } from '../services/api';
import { useModalAccessibility } from '../utils/useModalAccessibility';

export function RegistroMascotaPage() {
  const session = getClientSession();
  const [form, setForm] = useState({
    nombre: '',
    especie: 'Perro',
    sexo: 'Macho',
    raza: '',
    edad: '',
    observaciones: '',
    documentoIdentidad: session?.documentoIdentidad || '',
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');
  const successDialogRef = useRef<HTMLDivElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
    setShowSuccessModal(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.nombre.trim() || !form.raza.trim() || !form.documentoIdentidad.trim() || !form.sexo.trim() || Number(form.edad) < 0) {
      setError('Todos los campos obligatorios deben estar completos.');
      return;
    }

    try {
      await registerPet(
        {
          nombre: form.nombre.trim(),
          especie: form.especie,
          sexo: form.sexo,
          raza: form.raza.trim(),
          edad: Number(form.edad),
          observaciones: form.observaciones.trim(),
        },
        form.documentoIdentidad
      );

      setShowSuccessModal(true);
      setError('');
      setForm({
        nombre: '',
        especie: 'Perro',
        sexo: 'Macho',
        raza: '',
        edad: '',
        observaciones: '',
        documentoIdentidad: session?.documentoIdentidad || '',
      });
    } catch {
      setError('No se pudo guardar la mascota en este momento.');
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

  return (
    <div className="min-h-screen bg-[#edf7ff] text-slate-800">
      <ClientPortalHeader />
      <main id="main-content" tabIndex={-1} className="px-4 py-8 outline-none md:px-8 md:py-10">
        <div className="mx-auto max-w-[960px] rounded-lg border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <section className="px-5 py-8 md:px-10 md:py-10">
            <div className="mx-auto max-w-[580px]">
              <h1 className="text-[2.1rem] font-black leading-tight text-slate-900 md:text-[2.7rem]">Registro de mascota</h1>
              <p className="mt-2 text-base text-slate-600">Ingrese la información principal de la mascota.</p>

              <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase text-emerald-800">Cuenta asociada</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-950">
                    {session?.nombre} · documento terminado en {form.documentoIdentidad.slice(-4)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="pet-nombre" className="block text-sm font-semibold text-slate-700">
                    Nombre
                  </label>
                  <input
                    id="pet-nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'pet-form-error' : undefined}
                    className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:border-[#0D5C75] focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                    placeholder="Ej. Luna"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="pet-especie" className="block text-sm font-semibold text-slate-700">
                    Especie
                  </label>
                  <select
                    id="pet-especie"
                    name="especie"
                    value={form.especie}
                    onChange={handleChange}
                    className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:border-[#0D5C75] focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                  >
                    <option>Perro</option>
                    <option>Gato</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="pet-sexo" className="block text-sm font-semibold text-slate-700">
                    Sexo
                  </label>
                  <select
                    id="pet-sexo"
                    name="sexo"
                    value={form.sexo}
                    onChange={handleChange}
                    className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:border-[#0D5C75] focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                  >
                    <option>Macho</option>
                    <option>Hembra</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="pet-raza" className="block text-sm font-semibold text-slate-700">
                    Raza
                  </label>
                  <input
                    id="pet-raza"
                    name="raza"
                    value={form.raza}
                    onChange={handleChange}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'pet-form-error' : undefined}
                    className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:border-[#0D5C75] focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                    placeholder="Ej. Labrador"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="pet-edad" className="block text-sm font-semibold text-slate-700">
                    Edad (años)
                  </label>
                  <input
                    id="pet-edad"
                    name="edad"
                    type="number"
                    min="0"
                    value={form.edad}
                    onChange={handleChange}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'pet-form-error' : undefined}
                    className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:border-[#0D5C75] focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                    placeholder="Ej. 4"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="pet-observaciones" className="block text-sm font-semibold text-slate-700">
                    Observaciones
                  </label>
                  <textarea
                    id="pet-observaciones"
                    name="observaciones"
                    value={form.observaciones}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus-visible:border-[#0D5C75] focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                    placeholder="Ej. Tiene alergia a ciertos alimentos."
                  />
                </div>

                {error && (
                  <p id="pet-form-error" role="alert" className="text-sm font-medium text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-2 min-h-[48px] w-full rounded-xl bg-[#0D5C75] px-5 py-3 text-base font-semibold text-white shadow-[0_8px_20px_rgba(13,92,117,0.2)] transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
                >
                  Guardar mascota
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

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
            aria-labelledby="pet-success-title"
            className="w-[90%] max-w-[400px] rounded-xl bg-white p-8 text-center shadow-2xl outline-none"
          >
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700"
              aria-hidden="true"
            >
              ✓
            </div>
            <h2 id="pet-success-title" className="mb-2 text-lg font-bold text-slate-900">
              Registro guardado correctamente
            </h2>
            <p className="mb-6 text-sm text-slate-600">La mascota se ha registrado correctamente en el sistema.</p>
            <button
              type="button"
              onClick={handleCloseModal}
              className="min-h-[44px] w-full rounded-xl bg-[#0D5C75] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

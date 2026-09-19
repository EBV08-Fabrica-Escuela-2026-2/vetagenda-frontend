import { useState } from 'react';
import { BrandHeader } from '../components/BrandHeader';
import { registerPet } from '../services/api';

export function RegistroMascotaPage() {
  const [form, setForm] = useState({
    nombre: '',
    especie: 'Perro',
    sexo: 'Macho',
    raza: '',
    edad: '',
    observaciones: '',
    documentoIdentidad: '',
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');

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
      setForm({ nombre: '', especie: 'Perro', sexo: 'Macho', raza: '', edad: '', observaciones: '', documentoIdentidad: '' });
    } catch {
      setError('No se pudo guardar la mascota en este momento.');
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <main className="min-h-screen bg-[#edf7ff] px-4 py-10 text-slate-800 md:px-8">
      <div className="mx-auto max-w-[960px] rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="px-5 py-5 md:px-8 md:py-6">
          <BrandHeader subtitle="Registro de mascota" className="mb-4" />
        </div>

        <section className="px-5 pb-8 md:px-10 md:pb-10">
          <div className="mx-auto max-w-[580px]">
            <h1 className="text-[2.1rem] font-black leading-tight text-slate-900 md:text-[2.7rem]">Registro de mascota</h1>
            <p className="mt-2 text-base text-slate-500">Ingrese la información principal de la mascota.</p>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Documento del cliente</label>
                <input
                  name="documentoIdentidad"
                  value={form.documentoIdentidad}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="Ej. 1234567890"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="Ej. Luna"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Especie</label>
                <select name="especie" value={form.especie} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
                  <option>Perro</option>
                  <option>Gato</option>
                  <option>Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Sexo</label>
                <select name="sexo" value={form.sexo} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
                  <option>Macho</option>
                  <option>Hembra</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Raza</label>
                <input
                  name="raza"
                  value={form.raza}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="Ej. Labrador"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Edad (años)</label>
                <input
                  name="edad"
                  type="number"
                  min="0"
                  value={form.edad}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="Ej. 4"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Observaciones</label>
                <textarea
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="Ej. Tiene alergia a ciertos alimentos."
                />
              </div>

              {error && <p className="text-sm font-medium text-red-600">{error}</p>}

              <button type="submit" className="mt-2 w-full rounded-xl bg-[#0ea5e9] px-5 py-3 text-base font-semibold text-white shadow-[0_8px_20px_rgba(14,165,233,0.25)] transition hover:bg-[#0284c7]">
                Guardar mascota
              </button>
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
            <p className="mb-6 text-sm text-slate-500">La mascota se ha registrado correctamente en el sistema.</p>
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

import { useState } from 'react';

export function RegistroMascotaPage() {
  const [form, setForm] = useState({
    nombre: '',
    especie: 'Perro',
    sexo: 'Macho',
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setShowSuccessModal(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.nombre.trim()) {
      setShowSuccessModal(true);
      return;
    }

    setShowSuccessModal(true);
    setForm({ nombre: '', especie: 'Perro', sexo: 'Macho' });
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-sky-700">Registro de Mascota</h1>
        <p className="mt-2 text-sm text-slate-600">
          Aquí irá el formulario de alta de mascota.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Ej. Luna"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Especie</label>
            <select name="especie" value={form.especie} onChange={handleChange} className="w-full rounded border border-slate-300 px-3 py-2">
              <option>Perro</option>
              <option>Gato</option>
              <option>Otro</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Sexo</label>
            <select name="sexo" value={form.sexo} onChange={handleChange} className="w-full rounded border border-slate-300 px-3 py-2">
              <option>Macho</option>
              <option>Hembra</option>
            </select>
          </div>

          <button type="submit" className="rounded bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700">
            Guardar mascota
          </button>
        </form>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50">
          <div className="w-[90%] max-w-[400px] rounded-xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
              ✓
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900">Registro guardado correctamente</h3>
            <p className="mb-6 text-sm text-slate-500">
              La mascota se ha registrado correctamente en el sistema.
            </p>
            <button
              onClick={handleCloseModal}
              className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

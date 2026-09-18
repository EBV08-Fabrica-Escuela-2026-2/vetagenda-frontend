export function RegistroMascotaPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-sky-700">Registro de Mascota</h1>
        <p className="mt-2 text-sm text-slate-600">
          Aquí irá el formulario de alta de mascota.
        </p>

        <form className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Ej. Luna" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Especie</label>
            <select className="w-full rounded border border-slate-300 px-3 py-2">
              <option>Perro</option>
              <option>Gato</option>
              <option>Otro</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Sexo</label>
            <select className="w-full rounded border border-slate-300 px-3 py-2">
              <option>Macho</option>
              <option>Hembra</option>
            </select>
          </div>

          <button type="button" className="rounded bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700">
            Guardar mascota
          </button>
        </form>
      </div>
    </main>
  );
}

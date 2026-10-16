import { useState } from 'react';
import { BrandHeader } from '../components/BrandHeader';
import { BackToHomeButton } from '../components/BackToHomeButton';

export function ReservarCitaPage() {
  const [mascota, setMascota] = useState('');
  const [servicio, setServicio] = useState('');
  const [fecha, setFecha] = useState('');
  const [horario, setHorario] = useState('');

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
          <BrandHeader subtitle="Reservar cita" />
          <BackToHomeButton />
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
            HU12
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-900">
            Reserva una cita para tu mascota
          </h1>

          <p className="mt-2 text-slate-600">
            Selecciona tu mascota, el servicio requerido y un horario disponible.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-semibold">Mascota</span>
              <select
                value={mascota}
                onChange={(e) => setMascota(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="">Selecciona una mascota</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="font-semibold">Servicio</span>
              <select
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="">Selecciona un servicio</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="font-semibold">Fecha</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              />
            </label>

            <label className="grid gap-2">
              <span className="font-semibold">Horario disponible</span>
              <select
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="">Selecciona un horario</option>
              </select>
            </label>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              disabled={!mascota || !servicio || !fecha || !horario}
              className="rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Confirmar reserva
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
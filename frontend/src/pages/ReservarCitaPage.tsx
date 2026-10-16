import { useState } from 'react';
import { BrandHeader } from '../components/BrandHeader';
import { BackToHomeButton } from '../components/BackToHomeButton';

export function ReservarCitaPage() {
  const [mascota, setMascota] = useState('');
  const [servicio, setServicio] = useState('');
  const [fecha, setFecha] = useState('');
  const [horario, setHorario] = useState('');
  const [profesional, setProfesional] = useState('');
  const [reservaConfirmada, setReservaConfirmada] = useState(false);

  // Datos temporales para probar la HU12 mientras se integra el backend.
  const nombreCliente = 'Carlos Teleche';

  const horariosDisponibles = [
    { hora: '08:00 a. m.', profesional: 'Dra. Laura Gómez' },
    { hora: '10:00 a. m.', profesional: 'Dr. Andrés Pérez' },
    { hora: '02:00 p. m.', profesional: 'Dra. Natalia Ruiz' },
    { hora: '04:00 p. m.', profesional: 'Dr. Sebastián López' },
  ];

  const seleccionarHorario = (hora: string) => {
    setHorario(hora);

    const disponibilidad = horariosDisponibles.find(
      (opcion) => opcion.hora === hora
    );

    setProfesional(disponibilidad?.profesional ?? '');
  };

  const confirmarReserva = () => {
    if (mascota && servicio && fecha && horario && profesional) {
      setReservaConfirmada(true);
    }
  };

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
                onChange={(e) => {
                  setMascota(e.target.value);
                  setReservaConfirmada(false);
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="">Selecciona una mascota</option>
                <option value="Luna">Luna</option>
                <option value="Toby">Toby</option>
                <option value="Milo">Milo</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="font-semibold">Servicio</span>
              <select
                value={servicio}
                onChange={(e) => {
                  setServicio(e.target.value);
                  setReservaConfirmada(false);
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="">Selecciona un servicio</option>
                <option value="Consulta general">Consulta general</option>
                <option value="Vacunación">Vacunación</option>
                <option value="Control veterinario">Control veterinario</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="font-semibold">Fecha</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setReservaConfirmada(false);
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              />
            </label>

            <label className="grid gap-2">
              <span className="font-semibold">Horario disponible</span>
              <select
                value={horario}
                onChange={(e) => {
                  seleccionarHorario(e.target.value);
                  setReservaConfirmada(false);
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="">Selecciona un horario</option>
                {horariosDisponibles.map((opcion) => (
                  <option key={opcion.hora} value={opcion.hora}>
                    {opcion.hora} - {opcion.profesional}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {profesional && !reservaConfirmada && (
            <div className="mt-6 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
              <span className="text-sm text-slate-500">
                Profesional asignado
              </span>
              <p className="font-semibold text-slate-900">{profesional}</p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={confirmarReserva}
              disabled={
                !mascota || !servicio || !fecha || !horario || !profesional
              }
              className="rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Confirmar reserva
            </button>
          </div>

          {reservaConfirmada && (
            <section className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="mb-5">
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                  Reserva confirmada
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  Resumen de la cita
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Nombre del cliente</p>
                  <p className="font-bold text-slate-900">{nombreCliente}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Nombre de la mascota</p>
                  <p className="font-bold text-slate-900">{mascota}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Horario</p>
                  <p className="font-bold text-slate-900">
                    {fecha} · {horario}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Nombre del profesional
                  </p>
                  <p className="font-bold text-slate-900">{profesional}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-emerald-200 pt-4">
                <p className="text-sm text-slate-500">Servicio</p>
                <p className="font-semibold text-slate-900">{servicio}</p>
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
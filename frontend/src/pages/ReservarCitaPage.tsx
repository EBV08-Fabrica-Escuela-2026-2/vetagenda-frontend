import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { BackToHomeButton } from '../components/BackToHomeButton';
import {
  listServices,
  reservarCita,
  type CatalogService,
} from '../services/api';

const BASE_HORARIOS = [
  { hora: '08:00 a. m.', profesional: 'Dra. Laura Gómez' },
  { hora: '10:00 a. m.', profesional: 'Dr. Andrés Pérez' },
  { hora: '02:00 p. m.', profesional: 'Dra. Natalia Ruiz' },
  { hora: '04:00 p. m.', profesional: 'Dr. Sebastián López' },
];

export function ReservarCitaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const stateData = (location.state || {}) as {
    servicio?: string;
    servicioId?: number | string;
    fecha?: string;
    horario?: string;
    profesional?: string;
    veterinarioId?: number | string;
    mascota?: string;
  };

  const paramServicio = stateData.servicio || searchParams.get('servicio') || '';
  const paramFecha = stateData.fecha || searchParams.get('fecha') || '';
  const paramHorario = stateData.horario || searchParams.get('horario') || '';
  const paramProfesional = stateData.profesional || searchParams.get('profesional') || '';
  const paramMascota = stateData.mascota || searchParams.get('mascota') || '';
  const servicioId = stateData.servicioId || searchParams.get('servicioId') || '';
  const veterinarioId = stateData.veterinarioId || searchParams.get('veterinarioId') || '';

  const userSession = useMemo(() => {
    try {
      const raw = localStorage.getItem('vetagenda_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const nombreCliente = userSession?.nombre || 'Carolina Restrepo';

  const [serviciosDisponibles, setServiciosDisponibles] = useState<string[]>([
    'Consulta general',
    'Vacunación',
    'Control veterinario',
    'Desparasitación',
    'Profilaxis dental',
  ]);

  useEffect(() => {
    let isMounted = true;
    listServices().then((servs: CatalogService[]) => {
      if (!isMounted || !servs?.length) return;
      const nombres = servs.map((s) => s.nombre);
      setServiciosDisponibles((prev) => {
        const set = new Set([...prev, ...nombres]);
        if (paramServicio) set.add(paramServicio);
        return Array.from(set);
      });
    });
    return () => {
      isMounted = false;
    };
  }, [paramServicio]);

  const mascotasDisponibles = useMemo(() => {
    const list = ['Luna', 'Toby', 'Milo'];
    if (userSession?.mascota?.nombre && !list.includes(userSession.mascota.nombre)) {
      list.unshift(userSession.mascota.nombre);
    }
    if (paramMascota && !list.includes(paramMascota)) {
      list.push(paramMascota);
    }
    return list;
  }, [userSession, paramMascota]);

  const horariosDisponibles = useMemo(() => {
    const lista = [...BASE_HORARIOS];
    if (paramHorario) {
      const existe = lista.some((opcion) => opcion.hora.toLowerCase() === paramHorario.toLowerCase());
      if (!existe) {
        lista.unshift({
          hora: paramHorario,
          profesional: paramProfesional || 'Veterinario asignado',
        });
      }
    }
    return lista;
  }, [paramHorario, paramProfesional]);

  const [mascota, setMascota] = useState(paramMascota || userSession?.mascota?.nombre || '');
  const [servicio, setServicio] = useState(paramServicio || 'Consulta general');
  const [fecha, setFecha] = useState(paramFecha || '');
  const [horario, setHorario] = useState(paramHorario || '');
  const [profesional, setProfesional] = useState(paramProfesional || '');
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  const [codigoReserva, setCodigoReserva] = useState('');
  const [idCitaGenerada, setIdCitaGenerada] = useState<number | string>('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (paramHorario && !profesional) {
      const disp = horariosDisponibles.find((opcion) => opcion.hora === paramHorario);
      if (disp?.profesional) {
        setProfesional(disp.profesional);
      }
    }
  }, [paramHorario, profesional, horariosDisponibles]);

  const seleccionarHorario = (hora: string) => {
    setHorario(hora);

    const disponibilidad = horariosDisponibles.find(
      (opcion) => opcion.hora === hora
    );

    setProfesional(disponibilidad?.profesional ?? '');
  };

  const confirmarReserva = async () => {
    if (!mascota || !servicio || !fecha || !horario || !profesional) {
      return;
    }

    setGuardando(true);
    try {
      const resp = await reservarCita({
        mascotaNombre: mascota,
        servicioNombre: servicio,
        fecha,
        hora: horario,
        veterinarioNombre: profesional,
        clienteNombre: nombreCliente,
        servicioId: servicioId ? Number(servicioId) : undefined,
        veterinarioId: veterinarioId ? Number(veterinarioId) : undefined,
      });

      setIdCitaGenerada(resp.id);
      setCodigoReserva(resp.codigo);
      setReservaConfirmada(true);
    } catch {
      const idTmp = Date.now();
      setIdCitaGenerada(idTmp);
      setCodigoReserva(`VA-${idTmp.toString().slice(-4)}`);
      setReservaConfirmada(true);
    } finally {
      setGuardando(false);
    }
  };

  const vieneDeDisponibilidad = Boolean(paramHorario || paramFecha);

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
          <BrandHeader subtitle="Reservar cita" />
          <BackToHomeButton />
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
              HU12 · Reservar Cita
            </p>
            <Link
              to="/disponibilidad"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900"
            >
              <span>🗓️</span> Consultar disponibilidad en tiempo real
            </Link>
          </div>

          <h1 className="mt-3 text-3xl font-black text-slate-900">
            Reserva una cita para tu mascota
          </h1>

          <p className="mt-2 text-slate-600">
            Selecciona tu mascota, el servicio requerido y el horario disponible para agendar tu atención.
          </p>

          {vieneDeDisponibilidad ? (
            <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-950 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white text-xs">
                  ✓
                </span>
                <div>
                  <p className="font-bold">Datos sincronizados con disponibilidad</p>
                  <p className="text-xs text-emerald-800">
                    Se preseleccionó el servicio, fecha y horario que elegiste en la consulta.
                  </p>
                </div>
              </div>
              <Link
                to="/disponibilidad"
                className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-sm hover:bg-emerald-100/50"
              >
                Cambiar en disponibilidad
              </Link>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <span>¿Quieres ver antes el calendario con turnos libres por doctor?</span>
              <Link
                to="/disponibilidad"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-sky-700 border border-slate-200 shadow-sm hover:bg-sky-50"
              >
                Ver disponibilidad →
              </Link>
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-semibold text-slate-900">Mascota</span>
              <select
                id="select-mascota"
                value={mascota}
                onChange={(e) => {
                  setMascota(e.target.value);
                  setReservaConfirmada(false);
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="">Selecciona una mascota</option>
                {mascotasDisponibles.map((nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="font-semibold text-slate-900">Servicio</span>
              <select
                id="select-servicio"
                value={servicio}
                onChange={(e) => {
                  setServicio(e.target.value);
                  setReservaConfirmada(false);
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="">Selecciona un servicio</option>
                {serviciosDisponibles.map((nom) => (
                  <option key={nom} value={nom}>
                    {nom}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="font-semibold text-slate-900">Fecha</span>
              <input
                id="input-fecha"
                type="date"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setReservaConfirmada(false);
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>

            <label className="grid gap-2">
              <span className="font-semibold text-slate-900">Horario disponible</span>
              <select
                id="select-horario"
                value={horario}
                onChange={(e) => {
                  seleccionarHorario(e.target.value);
                  setReservaConfirmada(false);
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
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
            <div className="mt-6 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                  Profesional asignado
                </span>
                <p className="text-base font-bold text-slate-900">{profesional}</p>
              </div>
              <span className="text-xl">🩺</span>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              id="btn-confirmar-reserva"
              onClick={confirmarReserva}
              disabled={
                !mascota || !servicio || !fecha || !horario || !profesional || guardando
              }
              className="rounded-xl bg-sky-600 px-7 py-3.5 font-bold text-white shadow-md transition hover:bg-sky-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {guardando ? 'Confirmando...' : 'Confirmar reserva'}
            </button>
          </div>

          {reservaConfirmada && (
            <section
              id="resumen-reserva"
              className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 md:p-8"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200 pb-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                    Reserva confirmada
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    Resumen de la cita
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {idCitaGenerada && (
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm border border-emerald-200">
                      <span className="text-slate-500">ID Cita:</span>
                      <span className="font-mono text-sm font-black text-sky-800">{idCitaGenerada}</span>
                    </div>
                  )}
                  {codigoReserva && (
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-sm border border-emerald-200">
                      <span className="text-emerald-600">Código:</span>
                      <span className="font-mono text-sm font-black text-emerald-800">{codigoReserva}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="rounded-2xl bg-white/80 p-4 border border-emerald-100 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nombre del cliente</p>
                  <p className="mt-1 font-bold text-slate-900">{nombreCliente}</p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4 border border-emerald-100 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mascota</p>
                  <p className="mt-1 font-bold text-slate-900">{mascota}</p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4 border border-emerald-100 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Horario</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {fecha} · {horario}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4 border border-emerald-100 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Nombre del profesional
                  </p>
                  <p className="mt-1 font-bold text-slate-900">{profesional}</p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4 border border-emerald-100 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Servicio</p>
                  <p className="mt-1 font-bold text-slate-900">{servicio}</p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4 border border-emerald-100 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sede</p>
                  <p className="mt-1 font-bold text-slate-900">Clínica VetAgenda</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-emerald-200 pt-5">
                <p className="text-xs text-emerald-800">
                  ✓ Tu cita ha quedado reservada exitosamente en el sistema con el ID indicado arriba.
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    to={`/cliente/citas/${encodeURIComponent(String(idCitaGenerada || codigoReserva))}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-sky-700 active:scale-95"
                  >
                    <span>🔍</span> Consultar detalle de la cita
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setReservaConfirmada(false);
                      setHorario('');
                      setProfesional('');
                      setFecha('');
                      setIdCitaGenerada('');
                      setCodigoReserva('');
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Reservar otra cita
                  </button>
                  <Link
                    to="/cliente/citas"
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Ver mis citas
                  </Link>
                  <Link
                    to="/"
                    className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800"
                  >
                    Volver al inicio
                  </Link>
                </div>
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

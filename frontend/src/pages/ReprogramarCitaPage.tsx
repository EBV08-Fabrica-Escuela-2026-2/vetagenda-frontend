import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { ClientSessionActions } from '../components/ClientSessionActions';
import { getClinicTodayDate, minutesUntilClinicDateTime } from '../services/api';
import {
  consultarDisponibilidadReprogramacion,
  obtenerCitaParaReprogramar,
  ReprogramacionApiError,
  reprogramarCita,
  type CitaReprogramacionDetalle,
  type DisponibilidadReprogramacion,
} from '../services/citasService';

function inicioDelDia(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function fechaComoClave(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fechaDesdeClave(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function fechaLegible(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fechaDesdeClave(value));
}

function horaLegible(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  return new Intl.DateTimeFormat('es-CO', { timeStyle: 'short' }).format(
    new Date(2000, 0, 1, hour, minute),
  );
}

function construirDiasMes(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  return Array.from({ length: leadingDays + dayCount }, (_, index) => {
    if (index < leadingDays) return null;
    return new Date(month.getFullYear(), month.getMonth(), index - leadingDays + 1);
  });
}

function mensajeError(error: unknown) {
  if (error instanceof ReprogramacionApiError) return error.message;
  return 'Ocurrió un error inesperado. Intenta nuevamente.';
}

export const ReprogramarCitaPage = () => {
  const { citaId = '' } = useParams<{ citaId: string }>();
  const navigate = useNavigate();
  const hoy = useMemo(() => inicioDelDia(fechaDesdeClave(getClinicTodayDate())), []);
  const hoyClave = fechaComoClave(hoy);

  const [cita, setCita] = useState<CitaReprogramacionDetalle | null>(null);
  const [cargandoCita, setCargandoCita] = useState(true);
  const [errorCita, setErrorCita] = useState<string | null>(null);
  const [intentoCita, setIntentoCita] = useState(0);
  const [mesVisible, setMesVisible] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyClave);
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadReprogramacion | null>(null);
  const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState(false);
  const [errorDisponibilidad, setErrorDisponibilidad] = useState<string | null>(null);
  const [intentoDisponibilidad, setIntentoDisponibilidad] = useState(0);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    setCargandoCita(true);
    setErrorCita(null);
    setCita(null);

    const token = localStorage.getItem('vetagenda_token') ?? undefined;
    obtenerCitaParaReprogramar(citaId, token)
      .then((resultado) => {
        if (vigente) setCita(resultado);
      })
      .catch((error: unknown) => {
        if (vigente) setErrorCita(mensajeError(error));
      })
      .finally(() => {
        if (vigente) setCargandoCita(false);
      });

    return () => {
      vigente = false;
    };
  }, [citaId, intentoCita]);

  useEffect(() => {
    if (!cita) return;
    let vigente = true;
    setCargandoDisponibilidad(true);
    setDisponibilidad(null);
    setErrorDisponibilidad(null);
    setHoraSeleccionada(null);

    const token = localStorage.getItem('vetagenda_token') ?? undefined;
    consultarDisponibilidadReprogramacion(citaId, fechaSeleccionada, token)
      .then((resultado) => {
        if (vigente) setDisponibilidad(resultado);
      })
      .catch((error: unknown) => {
        if (vigente) setErrorDisponibilidad(mensajeError(error));
      })
      .finally(() => {
        if (vigente) setCargandoDisponibilidad(false);
      });

    return () => {
      vigente = false;
    };
  }, [cita?.id, citaId, fechaSeleccionada, intentoDisponibilidad]);

  const diasMes = useMemo(() => construirDiasMes(mesVisible), [mesVisible]);
  const mesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const puedeIrAlMesAnterior = mesVisible > mesActual;
  const horasFaltantes = cita
    ? minutesUntilClinicDateTime(cita.fechaHoraInicio) / 60
    : 0;
  const esReprogramable = cita?.estado === 'CONFIRMADA' && horasFaltantes > 4;

  async function confirmarReprogramacion() {
    if (!cita || !horaSeleccionada || !esReprogramable) return;

    setGuardando(true);
    setErrorGuardado(null);
    setMensajeExito(null);
    const token = localStorage.getItem('vetagenda_token') ?? undefined;

    try {
      const respuesta = await reprogramarCita(citaId, fechaSeleccionada, horaSeleccionada, token);
      setCita((actual) => actual
        ? {
            ...actual,
            estado: respuesta.cita.estado,
            fechaHoraInicio: respuesta.cita.fechaHoraInicio,
            fechaHoraFin: respuesta.cita.fechaHoraFin,
          }
        : actual);
      setMensajeExito(respuesta.mensaje);
      setHoraSeleccionada(null);
      setIntentoDisponibilidad((intento) => intento + 1);
    } catch (error: unknown) {
      setErrorGuardado(mensajeError(error));
      if (error instanceof ReprogramacionApiError && error.status === 409) {
        setIntentoDisponibilidad((intento) => intento + 1);
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <BrandHeader subtitle="Reprogramar cita" homePath="/cliente" />
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <ClientSessionActions />
          </div>
        </header>

        <button
          type="button"
          onClick={() => navigate('/cliente/citas')}
          className="mb-5 inline-flex min-h-11 items-center text-sm font-semibold text-[#0D5C75] hover:text-[#094356] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C75]"
        >
          Volver a mis citas
        </button>

        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0D5C75]">Gestión de cita</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Reprogramar cita</h1>
          <p className="mt-1 text-sm text-slate-600">Elige una fecha y una franja disponible para actualizar tu reserva.</p>
        </div>

        {cargandoCita ? (
          <div role="status" aria-label="Cargando cita" className="animate-pulse rounded-xl border border-slate-200 bg-white p-6">
            <div className="h-5 w-44 rounded bg-slate-200" />
            <div className="mt-5 h-24 rounded bg-slate-100" />
            <span className="sr-only">Cargando información de la cita...</span>
          </div>
        ) : errorCita ? (
          <section role="alert" className="rounded-xl border border-red-200 bg-white p-6">
            <h2 className="font-bold text-slate-900">No se pudo cargar la cita</h2>
            <p className="mt-2 text-sm text-slate-600">{errorCita}</p>
            <button
              type="button"
              onClick={() => setIntentoCita((intento) => intento + 1)}
              className="mt-4 min-h-11 rounded-lg bg-[#0D5C75] px-4 text-sm font-semibold text-white hover:bg-[#094356]"
            >
              Reintentar
            </button>
          </section>
        ) : cita ? (
          <>
            {mensajeExito && (
              <div role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900">
                {mensajeExito}
              </div>
            )}

            <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0D5C75]">{cita.codigo}</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">{cita.servicio.nombre}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {cita.mascota.nombre} · {[cita.mascota.especie, cita.mascota.raza].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="text-sm sm:text-right">
                  <p className="font-semibold text-slate-800">{cita.profesional.nombre}</p>
                  {cita.profesional.especialidad && <p className="mt-1 text-slate-600">{cita.profesional.especialidad}</p>}
                  <p className="mt-2 text-slate-600">
                    Actual: {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cita.fechaHoraInicio))}
                  </p>
                </div>
              </div>
            </section>

            {!esReprogramable && (
              <div role="note" className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                Solo puedes cambiar una cita confirmada con más de cuatro horas de anticipación. El backend validará nuevamente esta regla al guardar.
              </div>
            )}

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
              <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="calendario-heading">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 id="calendario-heading" className="font-bold text-slate-900">Nueva fecha</h2>
                    <p className="mt-1 text-sm capitalize text-slate-600">
                      {new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(mesVisible)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label="Mes anterior"
                      disabled={!puedeIrAlMesAnterior}
                      onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1))}
                      className="min-h-11 min-w-11 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      aria-label="Mes siguiente"
                      onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1))}
                      className="min-h-11 min-w-11 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500" aria-hidden="true">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => <span key={dia} className="py-2">{dia}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {diasMes.map((dia, index) => {
                    if (!dia) return <span key={`vacio-${index}`} aria-hidden="true" />;
                    const clave = fechaComoClave(dia);
                    const delMes = dia.getMonth() === mesVisible.getMonth();
                    const deshabilitado = !delMes || inicioDelDia(dia) < hoy || !esReprogramable || guardando;
                    const seleccionado = clave === fechaSeleccionada;

                    return (
                      <button
                        key={clave}
                        type="button"
                        disabled={deshabilitado}
                        aria-label={fechaLegible(clave)}
                        aria-pressed={seleccionado}
                        onClick={() => {
                          setFechaSeleccionada(clave);
                          setErrorGuardado(null);
                        }}
                        className={`min-h-11 rounded-lg text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0D5C75] ${
                          seleccionado
                            ? 'bg-[#0D5C75] text-white'
                            : deshabilitado
                              ? 'cursor-not-allowed text-slate-300'
                              : 'text-slate-800 hover:bg-teal-50'
                        }`}
                      >
                        {dia.getDate()}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  Fecha seleccionada: <strong className="capitalize text-slate-900">{fechaLegible(fechaSeleccionada)}</strong>
                </p>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="horarios-heading" aria-live="polite">
                <h2 id="horarios-heading" className="font-bold text-slate-900">Horarios disponibles</h2>
                <p className="mt-1 text-sm capitalize text-slate-600">{fechaLegible(fechaSeleccionada)}</p>

                {cargandoDisponibilidad ? (
                  <div role="status" className="mt-5 grid grid-cols-2 gap-2">
                    {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-11 animate-pulse rounded-lg bg-slate-100" />)}
                    <span className="sr-only">Consultando disponibilidad...</span>
                  </div>
                ) : errorDisponibilidad ? (
                  <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                    <p>{errorDisponibilidad}</p>
                    <button
                      type="button"
                      onClick={() => setIntentoDisponibilidad((intento) => intento + 1)}
                      className="mt-3 min-h-11 font-semibold underline"
                    >
                      Volver a consultar
                    </button>
                  </div>
                ) : disponibilidad?.horariosDisponibles.length ? (
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {disponibilidad.horariosDisponibles.map((franja) => {
                      const seleccionada = horaSeleccionada === franja.horaInicio;
                      return (
                        <button
                          key={franja.horaInicio}
                          type="button"
                          disabled={!esReprogramable || guardando}
                          aria-pressed={seleccionada}
                          onClick={() => {
                            setHoraSeleccionada(franja.horaInicio);
                            setErrorGuardado(null);
                          }}
                          className={`min-h-11 rounded-lg border px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C75] ${
                            seleccionada
                              ? 'border-[#0D5C75] bg-[#0D5C75] text-white'
                              : 'border-slate-300 text-slate-800 hover:border-teal-600 hover:bg-teal-50'
                          }`}
                        >
                          {horaLegible(franja.horaInicio)}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div role="status" className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    {disponibilidad?.mensaje ?? 'No hay horarios disponibles para esta fecha. Selecciona otra.'}
                  </div>
                )}

                {errorGuardado && <p role="alert" className="mt-4 text-sm font-medium text-red-700">{errorGuardado}</p>}

                <button
                  type="button"
                  disabled={!esReprogramable || !horaSeleccionada || guardando}
                  onClick={confirmarReprogramacion}
                  className="mt-5 min-h-11 w-full rounded-lg bg-[#0D5C75] px-4 text-sm font-bold text-white transition hover:bg-[#094356] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C75] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {guardando ? 'Guardando cambio...' : 'Confirmar nueva fecha'}
                </button>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
};

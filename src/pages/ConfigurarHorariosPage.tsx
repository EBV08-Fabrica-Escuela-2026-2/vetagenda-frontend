import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { BrandHeader } from '../components/BrandHeader';
import { ClientSessionActions } from '../components/ClientSessionActions';
import {
  crearDisponibilidadVacia,
  deleteAvailabilitySlot,
  DIAS_SEMANA,
  DiaSemana,
  DisponibilidadDia,
  FranjaHoraria,
  fetchVetAvailability,
  generarIdFranja,
  getVeterinarianSession,
  saveVetAvailability,
  VeterinarioListaItem,
} from '../services/api';
import { useModalAccessibility } from '../utils/useModalAccessibility';

const DURACION_TURNO_MINUTOS = 30;
const RANGO_INVALIDO = 'El rango de horario no es válido: la hora de finalización debe ser posterior a la de inicio.';

type ErroresValidacion = {
  franjas: Record<string, string>;
  dias: Partial<Record<DiaSemana, string>>;
  general?: string;
};

type FranjaPorEliminar = { dia: DiaSemana; franja: FranjaHoraria };

function aMinutos(hora: string) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function desdeMinutos(total: number) {
  const limitado = Math.max(0, Math.min(total, 23 * 60 + 59));
  const h = String(Math.floor(limitado / 60)).padStart(2, '0');
  const m = String(limitado % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function formatoHora(hora: string) {
  if (!hora) return '--:--';
  const [h, m] = hora.split(':').map(Number);
  const periodo = h < 12 ? 'a. m.' : 'p. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${periodo}`;
}

function nombreDia(dia: DiaSemana) {
  return DIAS_SEMANA.find((d) => d.value === dia)?.largo ?? dia;
}

function clonar(dias: DisponibilidadDia[]): DisponibilidadDia[] {
  return dias.map((d) => ({ ...d, franjas: d.franjas.map((f) => ({ ...f })) }));
}

function firma(dias: DisponibilidadDia[]) {
  return JSON.stringify(
    dias
      .filter((d) => d.activo)
      .map((d) => ({ dia: d.dia, franjas: d.franjas.map((f) => `${f.horaInicio}-${f.horaFin}`) })),
  );
}

function ordenarFranjas(franjas: FranjaHoraria[]) {
  return [...franjas].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
}

function validar(dias: DisponibilidadDia[]): ErroresValidacion {
  const errores: ErroresValidacion = { franjas: {}, dias: {} };
  const activos = dias.filter((d) => d.activo);

  if (activos.length === 0) {
    errores.general = 'Selecciona al menos un día de atención.';
  }

  activos.forEach((dia) => {
    if (dia.franjas.length === 0) {
      errores.dias[dia.dia] = 'Agrega al menos una franja horaria o desactiva este día.';
      return;
    }

    const validas: FranjaHoraria[] = [];
    dia.franjas.forEach((franja) => {
      if (!franja.horaInicio || !franja.horaFin) {
        errores.franjas[franja.id] = 'Completa la hora de inicio y la hora de finalización.';
      } else if (aMinutos(franja.horaFin) <= aMinutos(franja.horaInicio)) {
        errores.franjas[franja.id] = RANGO_INVALIDO;
      } else {
        validas.push(franja);
      }
    });

    const ordenadas = ordenarFranjas(validas);
    for (let i = 1; i < ordenadas.length; i += 1) {
      const anterior = ordenadas[i - 1];
      const actual = ordenadas[i];
      if (aMinutos(actual.horaInicio) < aMinutos(anterior.horaFin)) {
        errores.franjas[actual.id] =
          `Esta franja se cruza con ${formatoHora(anterior.horaInicio)} – ${formatoHora(anterior.horaFin)}.`;
      }
    }
  });

  return errores;
}

function contarErrores(errores: ErroresValidacion) {
  return Object.keys(errores.franjas).length + Object.keys(errores.dias).length + (errores.general ? 1 : 0);
}

function resumenSemanal(dias: DisponibilidadDia[]) {
  const minutos = dias
    .filter((d) => d.activo)
    .flatMap((d) => d.franjas)
    .reduce((total, f) => total + Math.max(0, aMinutos(f.horaFin) - aMinutos(f.horaInicio)), 0);
  const turnos = dias
    .filter((d) => d.activo)
    .flatMap((d) => d.franjas)
    .reduce(
      (total, f) =>
        total + Math.floor(Math.max(0, aMinutos(f.horaFin) - aMinutos(f.horaInicio)) / DURACION_TURNO_MINUTOS),
      0,
    );
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return { texto: resto ? `${horas} h ${resto} min` : `${horas} h`, turnos };
}

export function ConfigurarHorariosPage() {
  const [veterinarios, setVeterinarios] = useState<VeterinarioListaItem[]>([]);
  const [veterinarioId, setVeterinarioId] = useState('');

  const [guardado, setGuardado] = useState<DisponibilidadDia[]>(crearDisponibilidadVacia());
  const [borrador, setBorrador] = useState<DisponibilidadDia[]>(crearDisponibilidadVacia());
  const [, setOrigen] = useState<'api' | 'local' | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const [intentoGuardar, setIntentoGuardar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<{ titulo: string; mensaje: string } | null>(null);

  const [porEliminar, setPorEliminar] = useState<FranjaPorEliminar | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const deleteDialogRef = useRef<HTMLDivElement>(null);
  const successDialogRef = useRef<HTMLDivElement>(null);

  useModalAccessibility({
    isOpen: Boolean(porEliminar),
    onClose: () => {
      if (!isDeleting) setPorEliminar(null);
    },
    dialogRef: deleteDialogRef,
    canClose: !isDeleting,
  });

  useModalAccessibility({
    isOpen: Boolean(successModal),
    onClose: () => setSuccessModal(null),
    dialogRef: successDialogRef,
  });

  useEffect(() => {
    const session = getVeterinarianSession();
    if (!session) return;
    setVeterinarios([{ id: session.id, nombre: session.nombre }]);
    setVeterinarioId(String(session.id));
  }, []);

  useEffect(() => {
    if (!veterinarioId) return;
    let isMounted = true;
    setLoadingSchedule(true);
    setScheduleError(null);
    setSubmitError(null);
    setIntentoGuardar(false);
    setStatusMessage(null);

    fetchVetAvailability(Number(veterinarioId))
      .then((resultado) => {
        if (!isMounted) return;
        setGuardado(resultado.dias);
        setBorrador(clonar(resultado.dias));
        setOrigen(resultado.origen);
      })
      .catch((err) => {
        if (!isMounted) return;
        setScheduleError(err instanceof Error ? err.message : 'No se pudo cargar la disponibilidad.');
        setGuardado(crearDisponibilidadVacia());
        setBorrador(crearDisponibilidadVacia());
      })
      .finally(() => {
        if (isMounted) setLoadingSchedule(false);
      });

    return () => {
      isMounted = false;
    };
  }, [veterinarioId]);

  useEffect(() => {
    if (!statusMessage) return;
    const timeoutId = window.setTimeout(() => setStatusMessage(null), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  const errores = useMemo(() => validar(borrador), [borrador]);
  const totalErrores = contarErrores(errores);
  const hayCambios = firma(borrador) !== firma(guardado);
  const tieneConfiguracion = guardado.some((d) => d.activo && d.franjas.length > 0);
  const resumen = useMemo(() => resumenSemanal(guardado), [guardado]);
  const vetSeleccionado = veterinarios.find((v) => String(v.id) === veterinarioId);

  function actualizarDia(dia: DiaSemana, cambio: (actual: DisponibilidadDia) => DisponibilidadDia) {
    setBorrador((actual) => actual.map((d) => (d.dia === dia ? cambio(d) : d)));
    setSubmitError(null);
  }

  function alternarDia(dia: DiaSemana) {
    actualizarDia(dia, (d) => {
      const activo = !d.activo;
      const franjas =
        activo && d.franjas.length === 0
          ? [{ id: generarIdFranja(), horaInicio: '08:00', horaFin: '12:00' }]
          : d.franjas;
      return { ...d, activo, franjas };
    });
  }

  function agregarFranja(dia: DiaSemana) {
    actualizarDia(dia, (d) => {
      const ultima = ordenarFranjas(d.franjas.filter((f) => f.horaFin)).slice(-1)[0];
      const inicio = ultima ? aMinutos(ultima.horaFin) + 60 : 8 * 60;
      const nueva: FranjaHoraria =
        inicio >= 23 * 60
          ? { id: generarIdFranja(), horaInicio: '', horaFin: '' }
          : { id: generarIdFranja(), horaInicio: desdeMinutos(inicio), horaFin: desdeMinutos(inicio + 4 * 60) };
      return { ...d, franjas: [...d.franjas, nueva] };
    });
  }

  function cambiarHora(dia: DiaSemana, franjaId: string, campo: 'horaInicio' | 'horaFin', valor: string) {
    actualizarDia(dia, (d) => ({
      ...d,
      franjas: d.franjas.map((f) => (f.id === franjaId ? { ...f, [campo]: valor } : f)),
    }));
  }

  function copiarAOtrosDias(origenDia: DiaSemana) {
    const fuente = borrador.find((d) => d.dia === origenDia);
    if (!fuente) return;
    setBorrador((actual) =>
      actual.map((d) =>
        d.dia === origenDia || !d.activo
          ? d
          : {
              ...d,
              franjas: fuente.franjas.map((f) => ({
                id: generarIdFranja(),
                horaInicio: f.horaInicio,
                horaFin: f.horaFin,
              })),
            },
      ),
    );
    setStatusMessage(`Franjas del ${nombreDia(origenDia).toLowerCase()} copiadas a los demás días activos.`);
  }

  function descartarCambios() {
    setBorrador(clonar(guardado));
    setIntentoGuardar(false);
    setSubmitError(null);
  }

  async function handleGuardar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIntentoGuardar(true);
    setSubmitError(null);
    if (!veterinarioId || totalErrores > 0) return;

    setIsSaving(true);
    try {
      const diasOrdenados = borrador.map((d) => ({ ...d, franjas: ordenarFranjas(d.franjas) }));
      const resultado = await saveVetAvailability(Number(veterinarioId), diasOrdenados);
      setGuardado(resultado.dias);
      setBorrador(clonar(resultado.dias));
      setOrigen(resultado.origen);
      setIntentoGuardar(false);
      setSuccessModal(
        tieneConfiguracion
          ? {
              titulo: 'Disponibilidad actualizada',
              mensaje: 'Tus nuevos horarios quedaron disponibles para futuros agendamientos.',
            }
          : {
              titulo: 'Horarios guardados',
              mensaje: 'Tu configuración se guardó y los horarios ya están disponibles para agendamiento.',
            },
      );
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo guardar la disponibilidad.');
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmarEliminacion() {
    if (!porEliminar) return;
    const { dia, franja } = porEliminar;
    setIsDeleting(true);
    setDeleteError(null);

    const quitar = (dias: DisponibilidadDia[]) =>
      dias.map((d) => {
        if (d.dia !== dia) return d;
        const franjas = d.franjas.filter((f) => f.id !== franja.id);
        return { ...d, franjas, activo: franjas.length > 0 ? d.activo : false };
      });

    try {
      if (franja.persistida) {
        await deleteAvailabilitySlot(Number(veterinarioId), franja.id);
        setGuardado((actual) => quitar(actual));
      }
      setBorrador((actual) => quitar(actual));
      setPorEliminar(null);
      setStatusMessage(
        `Franja ${formatoHora(franja.horaInicio)} – ${formatoHora(franja.horaFin)} del ${nombreDia(dia).toLowerCase()} eliminada. Ya no estará disponible para nuevos agendamientos.`,
      );
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'No se pudo eliminar la franja horaria.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-sky-50 px-4 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <BrandHeader subtitle="Gestión de disponibilidad" />
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              to="/veterinario/agenda"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-900 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
            >
              <span aria-hidden="true">📅</span>
              <span>Ver citas agendadas</span>
            </Link>
            <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900 sm:inline">
              Veterinario
            </span>
            <ClientSessionActions showPortalLink={false} />
            <BackToHomeButton />
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <Link
            to="/veterinario/agenda"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-[#0D5C75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
          >
            <span aria-hidden="true">📅</span>
            <span>Citas agendadas</span>
          </Link>
          <button
            type="button"
            aria-current="page"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0D5C75] px-4 py-2.5 text-sm font-bold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
          >
            <span aria-hidden="true">⏰</span>
            <span>Gestionar disponibilidad</span>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0D5C75]">Mi agenda</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Configura tus horarios de atención
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Elige los días en que atiendes y define una o varias franjas por día. Solo los horarios guardados se
            muestran a los clientes para reservar.
          </p>
        </div>

        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0D5C75]">Perfil profesional</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{vetSeleccionado?.nombre ?? 'Veterinario'}</p>
          <p className="mt-1 text-sm text-slate-600">Los cambios se guardan en la agenda central de VetAgenda.</p>
        </section>

        {!veterinarioId ? (
          <section className="rounded-3xl border border-dashed border-sky-200 bg-white/70 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl" aria-hidden="true">
              ⏰
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Selecciona un veterinario para comenzar</h2>
            <p className="mt-1 text-sm text-slate-600">Verás sus días y franjas de atención configurados.</p>
          </section>
        ) : loadingSchedule ? (
          <section
            role="status"
            aria-label="Cargando disponibilidad"
            aria-live="polite"
            aria-busy="true"
            className="grid gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <span className="sr-only">Cargando disponibilidad del profesional...</span>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </section>
        ) : scheduleError ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800" role="alert">
            ⚠️ {scheduleError}
          </section>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <form onSubmit={handleGuardar} noValidate className="min-w-0 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Días de atención</h2>
                  <p className="mt-1 text-sm text-slate-600">Activa los días de la semana en que atiendes.</p>
                </div>
                {hayCambios && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                    Cambios sin guardar
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7" role="group" aria-label="Días de la semana">
                {DIAS_SEMANA.map(({ value, corto, largo }) => {
                  const dia = borrador.find((d) => d.dia === value);
                  const activo = Boolean(dia?.activo);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={activo}
                      aria-label={largo}
                      onClick={() => alternarDia(value)}
                      className={`min-h-[44px] min-w-[44px] rounded-xl border px-2 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1 ${
                        activo
                          ? 'border-[#0D5C75] bg-[#0D5C75] text-white shadow-sm'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-[#0D5C75] hover:bg-sky-50'
                      }`}
                    >
                      {corto}
                    </button>
                  );
                })}
              </div>
              {(intentoGuardar || hayCambios) && errores.general && (
                <p role="alert" className="mt-2 text-xs font-medium text-red-700">{errores.general}</p>
              )}

              <div className="mt-7 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Franjas horarias</h2>
                {borrador.filter((d) => d.activo).length === 0 && (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                    Aún no has seleccionado días de atención.
                  </p>
                )}

                {borrador
                  .filter((d) => d.activo)
                  .map((dia) => {
                    const otrosActivos = borrador.filter((d) => d.activo && d.dia !== dia.dia).length;
                    return (
                      <div key={dia.dia} className="rounded-2xl border border-slate-200 p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-bold text-slate-900">{nombreDia(dia.dia)}</h3>
                          <div className="flex flex-wrap gap-2">
                            {otrosActivos > 0 && dia.franjas.length > 0 && (
                              <button
                                type="button"
                                onClick={() => copiarAOtrosDias(dia.dia)}
                                className="min-h-[44px] rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                              >
                                Copiar a otros días
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => agregarFranja(dia.dia)}
                              className="min-h-[44px] rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                            >
                              + Agregar franja
                            </button>
                          </div>
                        </div>

                        {errores.dias[dia.dia] && (
                          <p role="alert" className="mb-2 text-xs font-medium text-red-700">{errores.dias[dia.dia]}</p>
                        )}

                        <ul className="space-y-3">
                          {dia.franjas.map((franja, index) => {
                            const error = errores.franjas[franja.id];
                            const inicioId = `inicio-${dia.dia}-${franja.id}`;
                            const finId = `fin-${dia.dia}-${franja.id}`;
                            const errorId = `error-${dia.dia}-${franja.id}`;
                            const inputClass = `min-h-[44px] w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus-visible:ring-2 ${
                              error
                                ? 'border-red-400 focus:border-red-500 focus-visible:ring-red-500'
                                : 'border-slate-300 focus:border-[#0D5C75] focus-visible:ring-[#0D5C75]'
                            }`;
                            return (
                              <li key={franja.id}>
                                <div className="flex flex-wrap items-end gap-2 sm:flex-nowrap sm:gap-3">
                                  <div className="min-w-[115px] flex-1">
                                    <label htmlFor={inicioId} className="mb-1 block text-xs font-semibold text-slate-700">
                                      Inicio{dia.franjas.length > 1 ? ` · franja ${index + 1}` : ''}
                                    </label>
                                    <input
                                      id={inicioId}
                                      type="time"
                                      step={900}
                                      value={franja.horaInicio}
                                      aria-invalid={Boolean(error)}
                                      aria-describedby={error ? errorId : undefined}
                                      onChange={(e) => cambiarHora(dia.dia, franja.id, 'horaInicio', e.target.value)}
                                      className={inputClass}
                                    />
                                  </div>
                                  <span className="hidden pb-3 text-slate-600 sm:inline" aria-hidden="true">–</span>
                                  <div className="min-w-[115px] flex-1">
                                    <label htmlFor={finId} className="mb-1 block text-xs font-semibold text-slate-700">
                                      Fin
                                    </label>
                                    <input
                                      id={finId}
                                      type="time"
                                      step={900}
                                      value={franja.horaFin}
                                      aria-invalid={Boolean(error)}
                                      aria-describedby={error ? errorId : undefined}
                                      onChange={(e) => cambiarHora(dia.dia, franja.id, 'horaFin', e.target.value)}
                                      className={inputClass}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    aria-label={`Eliminar franja ${index + 1} del ${nombreDia(dia.dia)}`}
                                    onClick={() => {
                                      setDeleteError(null);
                                      setPorEliminar({ dia: dia.dia, franja });
                                    }}
                                    className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-300 text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                                  >
                                    <span aria-hidden="true">🗑️</span>
                                  </button>
                                </div>
                                {error && <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-red-700">{error}</p>}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
              </div>

              {submitError && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
                  ⚠️ {submitError}
                </div>
              )}
              {(intentoGuardar || hayCambios) && totalErrores > 0 && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
                  ⚠️ Corrige {totalErrores === 1 ? 'el error marcado' : `los ${totalErrores} errores marcados`} para
                  poder guardar la configuración.
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                {hayCambios && (
                  <button
                    type="button"
                    onClick={descartarCambios}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
                  >
                    Descartar cambios
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving || totalErrores > 0 || !hayCambios}
                  title={totalErrores > 0 ? 'Corrige los errores para poder guardar' : undefined}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-[#0D5C75] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-700"
                >
                  {isSaving ? 'Guardando...' : tieneConfiguracion ? 'Actualizar disponibilidad' : 'Guardar horarios'}
                </button>
              </div>
            </form>

            <aside className="min-w-0 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7 lg:sticky lg:top-6" aria-live="polite">
              <div className="border-b border-slate-100 pb-4">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0D5C75]">Disponibles para agendamiento</p>
                <h2 className="mt-2 text-xl font-black text-slate-900">{vetSeleccionado?.nombre}</h2>
                <p className="mt-1 text-sm text-slate-600">Así verán los clientes tus horarios al reservar.</p>
              </div>

              {tieneConfiguracion ? (
                <>
                  <ul className="divide-y divide-slate-100">
                    {guardado.map((dia) => (
                      <li key={dia.dia} className="flex items-start justify-between gap-3 py-3">
                        <span className={`w-24 shrink-0 text-sm font-semibold ${dia.activo ? 'text-slate-800' : 'text-slate-600'}`}>
                          {nombreDia(dia.dia)}
                        </span>
                        {dia.activo && dia.franjas.length > 0 ? (
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {ordenarFranjas(dia.franjas).map((f) => (
                              <span
                                key={f.id}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-900"
                              >
                                {formatoHora(f.horaInicio)} – {formatoHora(f.horaFin)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">Sin atención</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-sky-50 p-3">
                      <p className="text-xs text-slate-600">Horas por semana</p>
                      <p className="text-lg font-black text-slate-900">{resumen.texto}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-3">
                      <p className="text-xs text-slate-600">Turnos de {DURACION_TURNO_MINUTOS} min</p>
                      <p className="text-lg font-black text-slate-900">{resumen.turnos}</p>
                    </div>
                  </div>
                  {hayCambios && (
                    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      Los cambios que estás editando no se publican hasta que guardes.
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5" role="status">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm" aria-hidden="true">
                    🗓️
                  </div>
                  <h3 className="mt-3 font-bold text-slate-900">Sin horarios configurados</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Selecciona tus días, define las franjas y guarda para que los clientes puedan reservar.
                  </p>
                </div>
              )}

              <p className="mt-5 text-center text-xs text-slate-600">
                Estos horarios se ofrecen a los clientes para nuevas reservas.
              </p>
            </aside>
          </div>
        )}
      </div>

      <div aria-live="polite">
        {statusMessage && (
          <div
            role="status"
            className="fixed bottom-6 left-1/2 z-[900] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white shadow-xl"
          >
            ✓ {statusMessage}
          </div>
        )}
      </div>

      {porEliminar && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) setPorEliminar(null);
          }}
        >
          <div
            ref={deleteDialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-eliminar"
            className="w-full max-w-[420px] rounded-2xl bg-white p-8 text-center shadow-2xl outline-none"
          >
            <div aria-hidden="true" className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">🗑️</div>
            <h3 id="titulo-eliminar" className="text-xl font-black text-slate-900">¿Eliminar esta franja?</h3>
            <p className="mt-2 text-sm text-slate-600">
              {nombreDia(porEliminar.dia)} · {formatoHora(porEliminar.franja.horaInicio)} –{' '}
              {formatoHora(porEliminar.franja.horaFin)}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {porEliminar.franja.persistida
                ? 'Dejará de mostrarse como disponible para nuevos agendamientos.'
                : 'Esta franja aún no se ha guardado y se quitará del formulario.'}
            </p>
            {deleteError && (
              <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">⚠️ {deleteError}</p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPorEliminar(null)}
                disabled={isDeleting}
                className="inline-flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminacion}
                disabled={isDeleting}
                className="inline-flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1 disabled:cursor-wait disabled:opacity-70"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {successModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSuccessModal(null);
          }}
        >
          <div
            ref={successDialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="horarios-success-title"
            className="w-full max-w-[420px] rounded-2xl bg-white p-8 text-center shadow-2xl outline-none"
          >
            <div aria-hidden="true" className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
              ✓
            </div>
            <h3 id="horarios-success-title" className="text-xl font-black text-slate-900">{successModal.titulo}</h3>
            <p className="mt-2 text-sm text-slate-600">{successModal.mensaje}</p>
            <button
              type="button"
              onClick={() => setSuccessModal(null)}
              className="mt-6 inline-flex min-h-[44px] min-w-[44px] w-full items-center justify-center rounded-xl bg-[#0D5C75] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

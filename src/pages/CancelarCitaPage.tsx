import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  ClipboardList,
  PawPrint,
  Search,
  X,
  CheckCircle2,
  Trash2,
  LayoutList,
  LayoutGrid,
  Info,
  CalendarCheck,
  CalendarX,
  User,
  Eye,
  RefreshCw,
  CalendarPlus,
} from 'lucide-react';
import { AppointmentStatusBadge } from '../components/AppointmentStatusBadge';
import { BrandHeader } from '../components/BrandHeader';
import { ClientSessionActions } from '../components/ClientSessionActions';
import { ConfirmacionAnulacionModal } from '../components/ConfirmacionAnulacionModal';
import {
  cancelarCita,
  getCitas,
} from '../services/api';
import type { Cita } from '../services/api';

type FiltroEstado = 'TODAS' | 'PROGRAMADA' | 'CANCELADA';
type ModoVista = 'lista' | 'tarjetas';

function searchable(value: unknown) {
  return String(value ?? '').toLocaleLowerCase('es-CO');
}

export const CancelarCitaPage: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODAS');
  const [modoVista, setModoVista] = useState<ModoVista>('lista');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const documentoIdentidad = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('vetagenda_user') || 'null');
      return user?.documentoIdentidad || localStorage.getItem('vetagenda_documento') || '';
    } catch {
      return localStorage.getItem('vetagenda_documento') || '';
    }
  }, []);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorAnulacion, setErrorAnulacion] = useState<string | null>(null);

  useEffect(() => {
    void cargarCitas();
  }, []);

  const cargarCitas = async () => {
    setIsLoading(true);
    setErrorCarga(null);
    try {
      const data = await getCitas(documentoIdentidad);
      setCitas(data);
    } catch (e) {
      setCitas([]);
      setErrorCarga(e instanceof Error ? e.message : 'No se pudieron consultar las citas.');
    } finally {
      setIsLoading(false);
    }
  };

  const citasFiltradas = useMemo(() => {
    return citas.filter((cita) => {
      if (filtroEstado !== 'TODAS' && cita.estado !== filtroEstado) {
        return false;
      }

      if (filtroTexto.trim() !== '') {
        const query = filtroTexto.trim().toLowerCase();
        const coincideCodigo = searchable(cita.codigoReserva).includes(query);
        const coincideDoc = searchable(cita.clienteDocumento).includes(query);
        const coincideCliente = searchable(cita.clienteNombre).includes(query);
        const coincideMascota = searchable(cita.mascotaNombre).includes(query);
        const coincideVet = searchable(cita.veterinarioNombre).includes(query);
        const coincideServicio = searchable(cita.servicioNombre).includes(query);

        return (
          coincideCodigo ||
          coincideDoc ||
          coincideCliente ||
          coincideMascota ||
          coincideVet ||
          coincideServicio
        );
      }

      return true;
    });
  }, [citas, filtroEstado, filtroTexto]);

  const totalProgramadas = useMemo(
    () => citas.filter((c) => c.estado === 'PROGRAMADA').length,
    [citas]
  );
  const totalCanceladas = useMemo(
    () => citas.filter((c) => c.estado === 'CANCELADA').length,
    [citas]
  );

  const handleConfirmarAnulacion = async (citaId: number, motivo: string) => {
    setIsSubmitting(true);
    setErrorAnulacion(null);
    try {
      const citaActual = citas.find((item) => item.id === citaId);
      await cancelarCita(citaId, documentoIdentidad);

      setCitas((prev) =>
        prev.map((item) =>
          item.id === citaId
            ? {
                ...item,
                estado: 'CANCELADA',
                motivoCancelacion: motivo,
                fechaCancelacion: new Intl.DateTimeFormat('es-CO').format(new Date()),
              }
            : item,
        ),
      );

      setCitaSeleccionada(null);
      setMensajeExito(
        `¡La cita con código ${citaActual?.codigoReserva || citaId} ha sido anulada con éxito! El cupo médico ha quedado disponible para otros pacientes.`
      );

      setTimeout(() => {
        setMensajeExito(null);
      }, 6000);
    } catch (error: unknown) {
      setCitaSeleccionada(null);
      setErrorAnulacion(error instanceof Error ? error.message : 'Ocurrió un error al anular la cita.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-slate-50/70 px-3 py-5 text-slate-800 md:px-8 md:py-7">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3.5 sm:px-6">
            <BrandHeader subtitle="Mis citas" homePath="/cliente" />
            <ClientSessionActions />
          </div>

          <div className="border-b border-slate-100 bg-white px-4 py-3.5 sm:px-6">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Mis Citas Médicas · Consulta y Gestión
                </h1>
                <p className="mt-0.5 text-xs text-slate-600">
                  Consulta tus citas activas e históricas, accede a los detalles clínicos, reprograma fechas o libera cupos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-bold text-emerald-900 shadow-2xs">
                  <CalendarCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  <span>{totalProgramadas} Activas</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs font-bold text-rose-900 shadow-2xs">
                  <CalendarX className="h-4 w-4 text-rose-700" aria-hidden="true" />
                  <span>{totalCanceladas} Anuladas</span>
                </div>
                <Link
                  to="/citas/reservar"
                  className="hidden sm:inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#0D5C75] px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
                >
                  <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Nueva cita</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-slate-50/30 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <label htmlFor="citas-search-input" className="sr-only">
                Buscar citas por cédula, código, mascota, tutor o doctor
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" aria-hidden="true" />
              <input
                id="citas-search-input"
                type="text"
                placeholder="Buscar por cédula (ej. 1020304050), código, mascota, tutor o doctor..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-12 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-[#0D5C75] focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
              />
              {filtroTexto && (
                <button
                  type="button"
                  aria-label="Limpiar texto de búsqueda"
                  onClick={() => setFiltroTexto('')}
                  className="absolute right-0.5 top-1/2 flex h-11 w-11 min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="inline-flex gap-2 rounded-xl bg-slate-100 p-1 text-xs" role="group" aria-label="Filtrar por estado">
                <button
                  type="button"
                  aria-pressed={filtroEstado === 'TODAS'}
                  onClick={() => setFiltroEstado('TODAS')}
                  className={`min-h-[44px] min-w-[44px] rounded-lg px-3 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] ${
                    filtroEstado === 'TODAS'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Todas ({citas.length})
                </button>
                <button
                  type="button"
                  aria-pressed={filtroEstado === 'PROGRAMADA'}
                  onClick={() => setFiltroEstado('PROGRAMADA')}
                  className={`min-h-[44px] min-w-[44px] rounded-lg px-3 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] ${
                    filtroEstado === 'PROGRAMADA'
                      ? 'bg-white text-emerald-900 shadow-2xs'
                      : 'text-slate-700 hover:text-emerald-900'
                  }`}
                >
                  Activas ({totalProgramadas})
                </button>
                <button
                  type="button"
                  aria-pressed={filtroEstado === 'CANCELADA'}
                  onClick={() => setFiltroEstado('CANCELADA')}
                  className={`min-h-[44px] min-w-[44px] rounded-lg px-3 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] ${
                    filtroEstado === 'CANCELADA'
                      ? 'bg-white text-rose-900 shadow-2xs'
                      : 'text-slate-700 hover:text-rose-900'
                  }`}
                >
                  Anuladas ({totalCanceladas})
                </button>
              </div>

              <div className="inline-flex gap-2 rounded-xl bg-slate-100 p-1 text-xs" role="group" aria-label="Modo de visualización">
                <button
                  type="button"
                  aria-pressed={modoVista === 'lista'}
                  aria-label="Vista en lista"
                  onClick={() => setModoVista('lista')}
                  title="Vista en lista compacta"
                  className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] ${
                    modoVista === 'lista'
                      ? 'bg-white text-[#0D5C75] shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <LayoutList className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Lista</span>
                </button>
                <button
                  type="button"
                  aria-pressed={modoVista === 'tarjetas'}
                  aria-label="Vista en tarjetas"
                  onClick={() => setModoVista('tarjetas')}
                  title="Vista en tarjetas"
                  className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] ${
                    modoVista === 'tarjetas'
                      ? 'bg-white text-[#0D5C75] shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Tarjetas</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {errorCarga && (
          <div role="alert" aria-live="assertive" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-900">
            {errorCarga}
          </div>
        )}

        {errorAnulacion && (
          <div role="alert" aria-live="assertive" className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-900">
            <span>{errorAnulacion}</span>
            <button
              type="button"
              aria-label="Cerrar mensaje de error"
              onClick={() => setErrorAnulacion(null)}
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-rose-900 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div aria-live="polite">
          {mensajeExito && (
            <div role="status" className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/95 p-3.5 text-emerald-950 shadow-xs">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
              <div className="flex-1 text-xs font-medium sm:text-sm">
                <strong className="font-bold text-emerald-950">Acción completada:</strong> {mensajeExito}
              </div>
              <button
                type="button"
                aria-label="Cerrar notificación"
                onClick={() => setMensajeExito(null)}
                className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-emerald-900 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div role="status" aria-live="polite" aria-busy="true" aria-label="Cargando citas médicas" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <span className="sr-only">Cargando citas médicas...</span>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((id) => (
                <div key={id} className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        ) : citasFiltradas.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs" role="status">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600" aria-hidden="true">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900">No se encontraron citas</h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-600">
              No hay citas que coincidan con la búsqueda o el filtro seleccionado.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              {filtroTexto && (
                <button
                  type="button"
                  onClick={() => setFiltroTexto('')}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-sky-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-800 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
                >
                  Limpiar búsqueda
                </button>
              )}
              <Link
                to="/citas/reservar"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-900 transition hover:bg-sky-100 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
              >
                <CalendarPlus className="h-3.5 w-3.5 text-[#0D5C75]" aria-hidden="true" />
                <span>Agendar nueva cita</span>
              </Link>
            </div>
          </div>
        ) : modoVista === 'lista' ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4 w-[160px]">Reserva & Estado</th>
                    <th className="py-3 px-4">Paciente & Tutor</th>
                    <th className="py-3 px-4">Servicio & Especialista</th>
                    <th className="py-3 px-4">Fecha, Hora & Lugar</th>
                    <th className="py-3 px-4 w-[100px]">Valor</th>
                    <th className="py-3 px-4 text-right min-w-[260px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {citasFiltradas.map((cita) => {
                    const estaCancelada = cita.estado === 'CANCELADA';

                    return (
                      <tr
                        key={cita.id}
                        className={`transition hover:bg-sky-50/30 ${
                          estaCancelada ? 'bg-slate-50/60' : 'bg-white'
                        }`}
                      >
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-mono text-xs font-extrabold text-slate-800 block">
                            {cita.codigoReserva}
                          </span>
                          <div className="mt-1.5 flex flex-col gap-1 items-start">
                            {estaCancelada ? (
                              <>
                                <AppointmentStatusBadge status="Anulada" />
                                <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-700" aria-hidden="true" />
                                  Cupo liberado
                                </span>
                              </>
                            ) : (
                              <AppointmentStatusBadge status="Programada" label="Activa" />
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <PawPrint className="h-3.5 w-3.5 text-[#0D5C75] shrink-0" aria-hidden="true" />
                            <span>{cita.mascotaNombre}</span>
                            <span className="text-xs font-normal text-slate-600">
                              ({cita.mascotaEspecie} • {cita.mascotaRaza})
                            </span>
                          </div>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                            <User className="h-3 w-3 text-slate-500 shrink-0" aria-hidden="true" />
                            <span>
                              Tutor: <strong className="font-semibold text-slate-800">{cita.clienteNombre}</strong>{' '}
                              <span className="text-[11px] text-slate-600">(C.C. {cita.clienteDocumento})</span>
                            </span>
                          </p>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <ClipboardList className="h-3.5 w-3.5 text-slate-600 shrink-0" aria-hidden="true" />
                            <span>{cita.servicioNombre}</span>
                          </div>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                            <Stethoscope className="h-3 w-3 text-[#0D5C75] shrink-0" aria-hidden="true" />
                            <span>{cita.veterinarioNombre}</span>
                          </p>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-[#0D5C75]" aria-hidden="true" />
                              {cita.fecha}
                            </span>
                            <span className="text-slate-400" aria-hidden="true">•</span>
                            <span className="inline-flex items-center gap-1 text-[#0D5C75] font-bold">
                              <Clock className="h-3.5 w-3.5 text-[#0D5C75]" aria-hidden="true" />
                              {cita.hora} ({cita.duracionMinutos}m)
                            </span>
                          </div>
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-600 truncate max-w-xs">
                            <MapPin className="h-3 w-3 text-slate-500 shrink-0" aria-hidden="true" />
                            <span>{cita.consultorio}</span>
                          </p>
                          {estaCancelada && (
                            <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1 text-[11px] text-slate-700">
                              <Info className="h-3.5 w-3.5 shrink-0 text-slate-600 mt-0.5" aria-hidden="true" />
                              <div>
                                <span className="font-semibold text-slate-800">Liberado:</span>{' '}
                                <span className="text-slate-600">{cita.fechaCancelacion || 'Recientemente'}</span>{' '}
                                {cita.motivoCancelacion && (
                                  <span className="text-slate-700 italic">({cita.motivoCancelacion})</span>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 align-top font-bold text-slate-800">
                          <span className={estaCancelada ? 'line-through text-slate-600 font-medium' : 'text-slate-800'}>
                            {cita.precio}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 align-top text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Link
                              to={`/cliente/citas/${cita.id}`}
                              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-900 transition hover:bg-sky-100 hover:border-sky-300 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
                              title="Consultar detalles completos de la cita"
                            >
                              <Eye className="h-3.5 w-3.5 text-[#0D5C75]" aria-hidden="true" />
                              <span>Detalle</span>
                            </Link>

                            {!estaCancelada && (
                              <Link
                                to={`/reprogramar-cita/${cita.id}`}
                                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100 hover:border-amber-300 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
                                title="Reprogramar fecha y hora"
                              >
                                <RefreshCw className="h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
                                <span>Reprogramar</span>
                              </Link>
                            )}

                            {estaCancelada ? (
                              <div className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap">
                                <CheckCircle2 className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                                <span>Liberado</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCitaSeleccionada(cita)}
                                className="group inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs font-bold text-rose-800 transition hover:border-rose-400 hover:bg-rose-700 hover:text-white shadow-2xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
                                title="Anular cita y liberar turno"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-700 group-hover:text-white transition" aria-hidden="true" />
                                <span>Anular</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-100">
              {citasFiltradas.map((cita) => {
                const estaCancelada = cita.estado === 'CANCELADA';

                return (
                  <div
                    key={cita.id}
                    className={`p-3.5 transition ${
                      estaCancelada ? 'bg-slate-50/70 text-slate-600' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-slate-700">
                          #{cita.codigoReserva}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-slate-900 text-sm">
                          <PawPrint className="h-3.5 w-3.5 text-sky-600" />
                          {cita.mascotaNombre}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {estaCancelada ? (
                          <>
                            <AppointmentStatusBadge status="Anulada" />
                            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">
                              <CheckCircle2 className="h-3 w-3 text-emerald-700" aria-hidden="true" />
                              Cupo libre
                            </span>
                          </>
                        ) : (
                          <AppointmentStatusBadge status="Programada" label="Activa" />
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-600">Servicio:</span>{' '}
                        <strong className="text-slate-800">{cita.servicioNombre}</strong>
                      </div>
                      <div>
                        <span className="text-slate-600">Doctor:</span>{' '}
                        <strong className="text-slate-800">{cita.veterinarioNombre}</strong>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#0D5C75]" aria-hidden="true" />
                        <strong className="text-sky-950">{cita.fecha}</strong>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#0D5C75]" aria-hidden="true" />
                        <strong className="text-sky-950">{cita.hora}</strong>
                      </div>
                    </div>

                    {estaCancelada && (
                      <div className="mt-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700 flex items-start gap-1.5">
                        <Info className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>
                          Cupo liberado ({cita.motivoCancelacion || 'Cancelada'})
                        </span>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                      <span className={`text-xs font-bold ${estaCancelada ? 'line-through text-slate-600' : 'text-slate-800'}`}>
                        {cita.precio}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/cliente/citas/${cita.id}`}
                          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-900 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                          title="Ver detalle"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#0D5C75]" aria-hidden="true" />
                          <span>Detalle</span>
                        </Link>
                        {!estaCancelada && (
                          <Link
                            to={`/reprogramar-cita/${cita.id}`}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                            title="Reprogramar cita"
                          >
                            <RefreshCw className="h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
                            <span>Reprogramar</span>
                          </Link>
                        )}
                        {estaCancelada ? (
                          <span className="text-xs font-semibold text-slate-600">Cupo liberado</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCitaSeleccionada(cita)}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 hover:bg-rose-700 hover:text-white shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Anular</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {citasFiltradas.map((cita) => {
              const estaCancelada = cita.estado === 'CANCELADA';

              return (
                <article
                  key={cita.id}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-xs transition duration-200 ${
                    estaCancelada
                      ? 'border-slate-200/80 bg-slate-50/70'
                      : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-slate-600">
                          Reserva #{cita.codigoReserva}
                        </span>
                        <h2 className="mt-0.5 flex items-center gap-1.5 text-base font-black text-slate-900 sm:text-lg">
                          <PawPrint className="h-4 w-4 text-[#0D5C75]" aria-hidden="true" />
                          {cita.mascotaNombre}
                        </h2>
                        <p className="text-xs text-slate-600">
                          Tutor: <span className="font-medium text-slate-800">{cita.clienteNombre}</span> (C.C. {cita.clienteDocumento})
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {estaCancelada ? (
                          <>
                            <AppointmentStatusBadge status="Anulada" />
                            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                              <CheckCircle2 className="h-3 w-3 text-emerald-700" aria-hidden="true" />
                              Cupo liberado
                            </span>
                          </>
                        ) : (
                          <AppointmentStatusBadge status="Programada" label="Confirmada · Activa" />
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                          <Stethoscope className="h-3 w-3 text-slate-600" aria-hidden="true" />
                          Veterinario
                        </p>
                        <p className="mt-0.5 font-bold text-slate-800">{cita.veterinarioNombre}</p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                          <ClipboardList className="h-3 w-3 text-slate-600" aria-hidden="true" />
                          Servicio
                        </p>
                        <p className="mt-0.5 font-bold text-slate-800">{cita.servicioNombre}</p>
                      </div>

                      <div className="rounded-xl bg-sky-50/70 p-2.5">
                        <p className="flex items-center gap-1 text-[11px] font-semibold text-[#0D5C75]">
                          <Calendar className="h-3 w-3 text-[#0D5C75]" aria-hidden="true" />
                          Fecha
                        </p>
                        <p className="mt-0.5 font-bold text-sky-950">{cita.fecha}</p>
                      </div>

                      <div className="rounded-xl bg-sky-50/70 p-2.5">
                        <p className="flex items-center gap-1 text-[11px] font-semibold text-[#0D5C75]">
                          <Clock className="h-3 w-3 text-[#0D5C75]" aria-hidden="true" />
                          Hora
                        </p>
                        <p className="mt-0.5 font-bold text-sky-950">{cita.hora}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600">
                      <p className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 text-slate-500" aria-hidden="true" />
                        {cita.consultorio}
                      </p>
                      <span className={`font-bold ${estaCancelada ? 'line-through text-slate-600' : 'text-slate-800'}`}>
                        {cita.precio}
                      </span>
                    </div>

                    {estaCancelada && (
                      <div className="mt-3 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 text-xs text-slate-700">
                        <p className="font-semibold text-slate-800">
                          Turno liberado el {cita.fechaCancelacion || 'Recientemente'}
                        </p>
                        {cita.motivoCancelacion && (
                          <p className="mt-0.5 text-slate-600">
                            <span className="font-medium text-slate-700">Motivo:</span> {cita.motivoCancelacion}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        to={`/cliente/citas/${cita.id}`}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-900 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                        title="Ver detalle de la cita"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#0D5C75]" aria-hidden="true" />
                        <span>Ver detalle</span>
                      </Link>

                      <div className="flex flex-wrap items-center gap-2">
                        {!estaCancelada && (
                          <Link
                            to={`/reprogramar-cita/${cita.id}`}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                            title="Reprogramar fecha y hora"
                          >
                            <RefreshCw className="h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
                            <span>Reprogramar</span>
                          </Link>
                        )}
                        {estaCancelada ? (
                          <span className="inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                            <CheckCircle2 className="h-3 w-3 text-slate-600" aria-hidden="true" />
                            Turno liberado
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCitaSeleccionada(cita)}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-800 hover:bg-rose-700 hover:text-white transition shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Anular cita</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmacionAnulacionModal
        cita={citaSeleccionada}
        isOpen={Boolean(citaSeleccionada)}
        isSubmitting={isSubmitting}
        onClose={() => setCitaSeleccionada(null)}
        onConfirm={handleConfirmarAnulacion}
      />
    </main>
  );
};

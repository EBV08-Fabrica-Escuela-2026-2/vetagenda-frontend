import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  ClipboardList,
  PawPrint,
  Search,
  X,
  RotateCcw,
  CheckCircle2,
  Trash2,
  LayoutList,
  LayoutGrid,
  Info,
  CalendarCheck,
  CalendarX,
  User,
  ShieldCheck,
} from 'lucide-react';
import { BrandHeader } from '../components/BrandHeader';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { ConfirmacionAnulacionModal } from '../components/ConfirmacionAnulacionModal';
import {
  cancelarCita,
  Cita,
  getCitas,
  resetCitas,
} from '../services/api';

type FiltroEstado = 'TODAS' | 'PROGRAMADA' | 'CANCELADA';
type ModoVista = 'lista' | 'tarjetas';

export const CancelarCitaPage: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODAS');
  const [modoVista, setModoVista] = useState<ModoVista>('lista');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Carga inicial de citas
  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    setIsLoading(true);
    try {
      const data = await getCitas();
      setCitas(data);
    } catch (e) {
      console.error('Error cargando citas', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrado reactivo en memoria
  const citasFiltradas = useMemo(() => {
    return citas.filter((cita) => {
      // Filtro por estado
      if (filtroEstado !== 'TODAS' && cita.estado !== filtroEstado) {
        return false;
      }

      // Filtro por texto
      if (filtroTexto.trim() !== '') {
        const query = filtroTexto.trim().toLowerCase();
        const coincideCodigo = cita.codigoReserva.toLowerCase().includes(query);
        const coincideDoc = cita.clienteDocumento.toLowerCase().includes(query);
        const coincideCliente = cita.clienteNombre.toLowerCase().includes(query);
        const coincideMascota = cita.mascotaNombre.toLowerCase().includes(query);
        const coincideVet = cita.veterinarioNombre.toLowerCase().includes(query);
        const coincideServicio = cita.servicioNombre.toLowerCase().includes(query);

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

  // Manejo de la anulación (Task 98 + Task 99)
  const handleConfirmarAnulacion = async (citaId: number, motivo: string) => {
    setIsSubmitting(true);
    try {
      const citaActualizada = await cancelarCita(citaId, motivo);

      // Task 99: Actualización visual inmediata en el listado
      setCitas((prev) =>
        prev.map((item) => (item.id === citaId ? citaActualizada : item))
      );

      setCitaSeleccionada(null);
      setMensajeExito(
        `¡La cita con código ${citaActualizada.codigoReserva} ha sido anulada con éxito! El cupo médico ha quedado disponible para otros pacientes.`
      );

      setTimeout(() => {
        setMensajeExito(null);
      }, 6000);
    } catch (error: any) {
      alert(error?.message || 'Ocurrió un error al anular la cita');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestablecerPrueba = () => {
    const defaultData = resetCitas();
    setCitas(defaultData);
    setMensajeExito('Se han restablecido las citas de prueba iniciales.');
    setTimeout(() => setMensajeExito(null), 3000);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_25%),linear-gradient(135deg,#f0f9ff_0%,#f8fafc_45%,#f1f5f9_100%)] px-3 py-6 text-slate-800 md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header institucional */}
        <header className="mb-5 flex flex-col gap-3.5 rounded-2xl border border-sky-100 bg-white/95 p-4 shadow-xs backdrop-blur-sm md:flex-row md:items-center md:justify-between md:p-5">
          <BrandHeader subtitle="HU14 · Cancelación de Citas y Liberación de Cupo" />
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleRestablecerPrueba}
              title="Restaurar datos de ejemplo para probar la anulación"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              Restablecer demo
            </button>
            <BackToHomeButton />
          </div>
        </header>

        {/* Notificación de éxito al anular cita */}
        {mensajeExito && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/95 p-3.5 text-emerald-900 shadow-xs transition animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div className="flex-1 text-xs font-medium sm:text-sm">
              <strong className="font-bold text-emerald-950">Acción completada:</strong> {mensajeExito}
            </div>
            <button
              type="button"
              onClick={() => setMensajeExito(null)}
              className="text-emerald-700 hover:text-emerald-950 p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Banner informativo optimizado con métricas claras */}
        <section className="mb-5 rounded-2xl border border-sky-200/70 bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 px-5 py-4 shadow-xs">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-200/80 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-sky-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-sky-700" />
                  Agenda Veterinaria
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  • Gestión de cupos y disponibilidad médica
                </span>
              </div>
              <h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                Anulación y Liberación de Turnos Médicos
              </h1>
              <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
                Al cancelar una cita que no podrás tomar, el cupo se <strong>reintegra de inmediato</strong> al consultorio para que otra mascota necesitada pueda ser atendida.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <div className="flex items-center gap-2.5 rounded-xl border border-sky-200 bg-white/95 px-3.5 py-2 shadow-2xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-lg font-black text-sky-700 leading-none">{totalProgramadas}</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Activas</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-white/95 px-3.5 py-2 shadow-2xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <CalendarX className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-lg font-black text-rose-600 leading-none">{totalCanceladas}</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Anuladas</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Barra de controles: Búsqueda, Filtros de estado y Selector de Vista */}
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs md:flex-row md:items-center md:justify-between">
          {/* Búsqueda rápida */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por documento (ej. 1020304050), código, mascota o doctor..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
            {filtroTexto && (
              <button
                type="button"
                onClick={() => setFiltroTexto('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Filtros por estado */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFiltroEstado('TODAS')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filtroEstado === 'TODAS'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({citas.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('PROGRAMADA')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filtroEstado === 'PROGRAMADA'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Activas ({totalProgramadas})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('CANCELADA')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filtroEstado === 'CANCELADA'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Anuladas ({totalCanceladas})
              </button>
            </div>

            {/* Selector de Modo de Vista (Optimización de espacio) */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/90 p-0.5">
              <button
                type="button"
                onClick={() => setModoVista('lista')}
                title="Vista en formato lista compacta"
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  modoVista === 'lista'
                    ? 'bg-white text-sky-800 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Lista</span>
              </button>
              <button
                type="button"
                onClick={() => setModoVista('tarjetas')}
                title="Vista en formato cuadrícula de tarjetas"
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  modoVista === 'tarjetas'
                    ? 'bg-white text-sky-800 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal según modo de vista */}
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((id) => (
                <div key={id} className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        ) : citasFiltradas.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900">No se encontraron citas</h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
              No hay citas que coincidan con la búsqueda o el filtro seleccionado.
            </p>
            {filtroTexto && (
              <button
                type="button"
                onClick={() => setFiltroTexto('')}
                className="mt-3 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700 shadow-2xs"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : modoVista === 'lista' ? (
          /* ========================================================================= */
          /* FORMATO DE LISTA OPTIMIZADO (ESPACIO ELEGANTE Y CORRECCIÓN DE BADGES)     */
          /* ========================================================================= */
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {/* Versión Desktop / Tablet: Tabla estructurada */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4 w-[160px]">Reserva & Estado</th>
                    <th className="py-3 px-4">Paciente & Tutor</th>
                    <th className="py-3 px-4">Servicio & Especialista</th>
                    <th className="py-3 px-4">Fecha, Hora & Lugar</th>
                    <th className="py-3 px-4 w-[100px]">Valor</th>
                    <th className="py-3 px-4 text-right w-[140px]">Acción</th>
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
                        {/* Columna: Reserva y Estado (CORREGIDO: Sin deformación, 1 sola línea) */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-mono text-xs font-extrabold text-slate-800 block">
                            {cita.codigoReserva}
                          </span>
                          <div className="mt-1.5 flex flex-col gap-1 items-start">
                            {estaCancelada ? (
                              <>
                                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                  Anulada
                                </span>
                                <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50/80 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  Cupo liberado
                                </span>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Activa
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Columna: Mascota y Tutor */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <PawPrint className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                            <span>{cita.mascotaNombre}</span>
                            <span className="text-xs font-normal text-slate-500">
                              ({cita.mascotaEspecie} • {cita.mascotaRaza})
                            </span>
                          </div>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <User className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>
                              Tutor: <strong className="font-semibold text-slate-700">{cita.clienteNombre}</strong>{' '}
                              <span className="text-[11px] text-slate-400">(C.C. {cita.clienteDocumento})</span>
                            </span>
                          </p>
                        </td>

                        {/* Columna: Servicio y Veterinario */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <ClipboardList className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span>{cita.servicioNombre}</span>
                          </div>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Stethoscope className="h-3 w-3 text-sky-600 shrink-0" />
                            <span>{cita.veterinarioNombre}</span>
                          </p>
                        </td>

                        {/* Columna: Fecha, Hora y Consultorio */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-sky-600" />
                              {cita.fecha}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1 text-sky-700 font-bold">
                              <Clock className="h-3.5 w-3.5 text-sky-600" />
                              {cita.hora} ({cita.duracionMinutos}m)
                            </span>
                          </div>
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-xs">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{cita.consultorio}</span>
                          </p>
                          {/* Nota de anulación formateada limpiamente (sin texto rojo corrido) */}
                          {estaCancelada && (
                            <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
                              <Info className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                              <div>
                                <span className="font-semibold text-slate-700">Liberado:</span>{' '}
                                <span className="text-slate-500">{cita.fechaCancelacion || 'Recientemente'}</span>{' '}
                                {cita.motivoCancelacion && (
                                  <span className="text-slate-600 italic">({cita.motivoCancelacion})</span>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Columna: Precio */}
                        <td className="py-3.5 px-4 align-top font-bold text-slate-800">
                          <span className={estaCancelada ? 'line-through text-slate-400 font-medium' : 'text-slate-800'}>
                            {cita.precio}
                          </span>
                        </td>

                        {/* Columna: Acción */}
                        <td className="py-3.5 px-4 align-top text-right">
                          {estaCancelada ? (
                            <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 px-2.5 py-1.5 text-xs font-semibold text-slate-500 whitespace-nowrap">
                              <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                              <span>Cupo liberado</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCitaSeleccionada(cita)}
                              className="group inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition hover:border-rose-400 hover:bg-rose-600 hover:text-white shadow-2xs whitespace-nowrap"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-600 group-hover:text-white transition" />
                              <span>Anular cita</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Versión Mobile: Tarjetas compactas en formato fila */}
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
                            <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                              Anulada
                            </span>
                            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Cupo libre
                            </span>
                          </>
                        ) : (
                          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Activa
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">Servicio:</span>{' '}
                        <strong className="text-slate-800">{cita.servicioNombre}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Doctor:</span>{' '}
                        <strong className="text-slate-800">{cita.veterinarioNombre}</strong>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-sky-600" />
                        <strong className="text-sky-900">{cita.fecha}</strong>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-sky-600" />
                        <strong className="text-sky-900">{cita.hora}</strong>
                      </div>
                    </div>

                    {estaCancelada && (
                      <div className="mt-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600 flex items-start gap-1.5">
                        <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          Cupo liberado ({cita.motivoCancelacion || 'Cancelada'})
                        </span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <span className={`text-xs font-bold ${estaCancelada ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {cita.precio}
                      </span>
                      {estaCancelada ? (
                        <span className="text-xs font-semibold text-slate-400">Turno liberado</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCitaSeleccionada(cita)}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white shadow-2xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Anular</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* FORMATO DE TARJETAS (TAMBIÉN CORREGIDO Y ELEVADO VISUALMENTE)             */
          /* ========================================================================= */
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
                        <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          Reserva #{cita.codigoReserva}
                        </span>
                        <h2 className="mt-0.5 flex items-center gap-1.5 text-base font-black text-slate-900 sm:text-lg">
                          <PawPrint className="h-4 w-4 text-sky-600" />
                          {cita.mascotaNombre}
                        </h2>
                        <p className="text-xs text-slate-500">
                          Tutor: <span className="font-medium text-slate-700">{cita.clienteNombre}</span> (C.C. {cita.clienteDocumento})
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {estaCancelada ? (
                          <>
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                              Anulada
                            </span>
                            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Cupo liberado
                            </span>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Confirmada · Activa
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <Stethoscope className="h-3 w-3 text-slate-400" />
                          Veterinario
                        </p>
                        <p className="mt-0.5 font-bold text-slate-800">{cita.veterinarioNombre}</p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <ClipboardList className="h-3 w-3 text-slate-400" />
                          Servicio
                        </p>
                        <p className="mt-0.5 font-bold text-slate-800">{cita.servicioNombre}</p>
                      </div>

                      <div className="rounded-xl bg-sky-50/70 p-2.5">
                        <p className="flex items-center gap-1 text-[11px] font-semibold text-sky-600">
                          <Calendar className="h-3 w-3 text-sky-600" />
                          Fecha
                        </p>
                        <p className="mt-0.5 font-bold text-sky-950">{cita.fecha}</p>
                      </div>

                      <div className="rounded-xl bg-sky-50/70 p-2.5">
                        <p className="flex items-center gap-1 text-[11px] font-semibold text-sky-600">
                          <Clock className="h-3 w-3 text-sky-600" />
                          Hora
                        </p>
                        <p className="mt-0.5 font-bold text-sky-950">{cita.hora}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
                      <p className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {cita.consultorio}
                      </p>
                      <span className={`font-bold ${estaCancelada ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {cita.precio}
                      </span>
                    </div>

                    {estaCancelada && (
                      <div className="mt-3 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 text-xs text-slate-700">
                        <p className="font-semibold text-slate-800">
                          Turno liberado el {cita.fechaCancelacion || 'Recientemente'}
                        </p>
                        {cita.motivoCancelacion && (
                          <p className="mt-0.5 text-slate-500">
                            <span className="font-medium text-slate-600">Motivo:</span> {cita.motivoCancelacion}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    {estaCancelada ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Cupo disponible en clínica</span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                          <CheckCircle2 className="h-3 w-3 text-slate-400" />
                          Turno liberado
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">¿No podrás asistir?</span>
                        <button
                          type="button"
                          onClick={() => setCitaSeleccionada(cita)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition shadow-2xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Anular cita</span>
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmación de anulación con advertencia de liberación de cupo (Task 98) */}
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

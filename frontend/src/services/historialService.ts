// ──────────────────────────────────────────────
// Servicio de Historial asistencial / clínico.
// Modo "api": llama al backend (ver docs/API_CONTRACT.md).
// Modo "demo": simula el backend en memoria, INCLUIDA la validación de
// titularidad que responde 403 sin devolver datos.
// ──────────────────────────────────────────────
import { ApiError, ForbiddenError, IS_DEMO, UnauthorizedError, apiGet, getSession } from './api';
import { DEMO_CITAS, DEMO_CONSULTA_ACTIVA, DEMO_PACIENTES, DEMO_PROFESIONALES, type DemoCita, type DemoPaciente } from '../data/demoData';
import type {
  CitaHistorial,
  ConsultaActiva,
  DetalleAtencion,
  Diagnostico,
  FiltrosClinicos,
  FiltrosHistorial,
  HistorialClinico,
  MascotaResumen,
  PacienteDetalle,
  PaginaHistorial,
  ResumenCumplimiento,
  Tratamiento,
} from '../types/historial';

export const PAGE_SIZE = 5;

// ── API pública ─────────────────────────────────

/** Mascotas del cliente autenticado. */
export function listarMisMascotas(signal?: AbortSignal): Promise<MascotaResumen[]> {
  if (IS_DEMO) return demo.listarMisMascotas(signal);
  return apiGet<MascotaResumen[]>('/clientes/me/mascotas', undefined, signal);
}

/** Historial (completadas + canceladas) de una mascota del cliente, o de todas. */
export function obtenerHistorialCliente(filtros: FiltrosHistorial, page: number, signal?: AbortSignal): Promise<PaginaHistorial> {
  if (IS_DEMO) return demo.obtenerHistorialCliente(filtros, page, signal);
  const params = {
    desde: filtros.desde || undefined,
    hasta: filtros.hasta || undefined,
    tipo: filtros.tipo === 'TODOS' ? undefined : filtros.tipo,
    estado: filtros.estado === 'TODOS' ? undefined : filtros.estado,
    page,
    size: PAGE_SIZE,
  };
  const path = filtros.mascotaId === 'TODAS'
    ? '/clientes/me/historial'
    : `/clientes/me/mascotas/${filtros.mascotaId}/historial`;
  return apiGet<PaginaHistorial>(path, params, signal);
}

/** Detalle de una atención. El backend valida que la cita sea de una mascota del cliente. */
export function obtenerDetalleCliente(citaId: number, signal?: AbortSignal): Promise<DetalleAtencion> {
  if (IS_DEMO) return demo.obtenerDetalle(citaId, signal);
  return apiGet<DetalleAtencion>(`/clientes/me/citas/${citaId}`, undefined, signal);
}

/** Consulta en curso del veterinario autenticado (null si no hay). */
export function obtenerConsultaActiva(signal?: AbortSignal): Promise<ConsultaActiva | null> {
  if (IS_DEMO) return demo.obtenerConsultaActiva(signal);
  return apiGet<ConsultaActiva | null>('/veterinario-portal/consulta-activa', undefined, signal);
}

/** Historial clínico de un paciente asignado al veterinario. */
export function obtenerHistorialClinico(mascotaId: number, filtros: FiltrosClinicos, signal?: AbortSignal): Promise<HistorialClinico> {
  if (IS_DEMO) return demo.obtenerHistorialClinico(mascotaId, filtros, signal);
  return apiGet<HistorialClinico>(
    `/veterinario-portal/pacientes/${mascotaId}/historial-clinico`,
    { q: filtros.q || undefined, periodo: filtros.periodo, tipo: filtros.tipo === 'TODOS' ? undefined : filtros.tipo },
    signal,
  );
}

export function obtenerDetalleVeterinario(citaId: number, signal?: AbortSignal): Promise<DetalleAtencion> {
  if (IS_DEMO) return demo.obtenerDetalle(citaId, signal);
  return apiGet<DetalleAtencion>(`/veterinario-portal/citas/${citaId}`, undefined, signal);
}

// ── Utilidades compartidas ──────────────────────

export function calcularCumplimiento(citas: Pick<CitaHistorial, 'estado'>[]): ResumenCumplimiento {
  const completadas = citas.filter((c) => c.estado === 'COMPLETADA').length;
  const canceladas = citas.filter((c) => c.estado === 'CANCELADA').length;
  const total = completadas + canceladas;
  return { total, completadas, canceladas, porcentaje: total === 0 ? 0 : Math.round((completadas / total) * 100) };
}

// ── Simulación del backend (modo demo) ──────────

export type DemoScenario = 'normal' | 'loading' | 'empty' | 'error';
let demoScenario: DemoScenario = 'normal';
export const setDemoScenario = (scenario: DemoScenario) => {
  demoScenario = scenario;
};
export const getDemoScenario = () => demoScenario;

function wait<T>(value: () => T, signal?: AbortSignal, ms = 450): Promise<T> {
  const delay = demoScenario === 'loading' ? 1000 * 60 * 10 : ms;
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      try {
        resolve(value());
      } catch (error) {
        reject(error);
      }
    }, delay);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

const fechaDia = (iso: string) => iso.slice(0, 10);

function toCitaHistorial(c: DemoCita): CitaHistorial {
  const paciente = DEMO_PACIENTES.find((p) => p.id === c.mascotaId)!;
  const prof = DEMO_PROFESIONALES.find((p) => p.id === c.profesionalId)!;
  // La lista NO incluye notas ni diagnósticos: solo datos de agenda.
  return {
    id: c.id,
    mascota: { id: paciente.id, nombre: paciente.nombre },
    profesional: { id: prof.id, nombre: prof.nombre },
    fechaHora: c.fechaHora,
    duracionMinutos: c.duracionMinutos,
    tipo: c.tipo,
    servicio: c.servicio,
    motivo: c.motivo,
    estado: c.estado,
  };
}

function toDiagnosticos(c: DemoCita): Diagnostico[] {
  const prof = DEMO_PROFESIONALES.find((p) => p.id === c.profesionalId)!;
  return c.diagnosticos.map((d) => ({ ...d, citaId: c.id, fecha: c.fechaHora, registradoPor: prof.nombre }));
}

function toTratamientos(c: DemoCita): Tratamiento[] {
  return c.tratamientos.map((t) => ({ ...t, citaId: c.id, fechaIndicacion: c.fechaHora }));
}

function toPaciente(p: DemoPaciente): PacienteDetalle {
  const { clienteId: _c, veterinariosAsignados: _v, resumen: _r, ...paciente } = p;
  return paciente;
}

/** Regla de negocio que en producción vive en el backend. */
function assertAcceso(mascotaId: number) {
  const session = getSession();
  if (!session) throw new UnauthorizedError();
  const mascota = DEMO_PACIENTES.find((p) => p.id === mascotaId);
  // Si no existe también respondemos 403 para no revelar qué IDs existen.
  if (!mascota) throw new ForbiddenError();
  const autorizado = session.rol === 'CLIENTE'
    ? mascota.clienteId === session.id
    : mascota.veterinariosAsignados.includes(session.id);
  if (!autorizado) throw new ForbiddenError();
  return mascota;
}

function assertErrorEscenario() {
  if (demoScenario === 'error') throw new ApiError(503, 'Servicio no disponible');
}

const demo = {
  listarMisMascotas(signal?: AbortSignal) {
    return wait(() => {
      const session = getSession();
      if (!session) throw new UnauthorizedError();
      return DEMO_PACIENTES.filter((p) => p.clienteId === session.id).map(({ id, nombre, especie, raza, fotoUrl }) => ({
        id, nombre, especie, raza, fotoUrl,
      }));
    }, signal, 250);
  },

  obtenerHistorialCliente(filtros: FiltrosHistorial, page: number, signal?: AbortSignal) {
    return wait<PaginaHistorial>(() => {
      const session = getSession();
      if (!session || session.rol !== 'CLIENTE') throw new ForbiddenError();
      const mascotasIds = filtros.mascotaId === 'TODAS'
        ? DEMO_PACIENTES.filter((p) => p.clienteId === session.id).map((p) => p.id)
        : [assertAcceso(filtros.mascotaId).id];
      assertErrorEscenario();

      const todas = demoScenario === 'empty'
        ? []
        : DEMO_CITAS.filter((c) => mascotasIds.includes(c.mascotaId)).sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));
      const filtradas = todas.filter((c) =>
        (!filtros.desde || fechaDia(c.fechaHora) >= filtros.desde)
        && (!filtros.hasta || fechaDia(c.fechaHora) <= filtros.hasta)
        && (filtros.tipo === 'TODOS' || c.tipo === filtros.tipo)
        && (filtros.estado === 'TODOS' || c.estado === filtros.estado));
      const inicio = page * PAGE_SIZE;
      return {
        citas: filtradas.slice(inicio, inicio + PAGE_SIZE).map(toCitaHistorial),
        // El cumplimiento se calcula sobre TODAS las citas de la(s) mascota(s), no solo las filtradas.
        resumen: calcularCumplimiento(todas),
        page,
        size: PAGE_SIZE,
        totalElementos: filtradas.length,
        hayMas: inicio + PAGE_SIZE < filtradas.length,
      };
    }, signal);
  },

  obtenerDetalle(citaId: number, signal?: AbortSignal) {
    return wait<DetalleAtencion>(() => {
      const cita = DEMO_CITAS.find((c) => c.id === citaId);
      if (!cita) throw new ForbiddenError();
      assertAcceso(cita.mascotaId);
      const prof = DEMO_PROFESIONALES.find((p) => p.id === cita.profesionalId)!;
      const diagnosticos = toDiagnosticos(cita);
      return {
        ...toCitaHistorial(cita),
        profesional: prof,
        diagnosticoPrincipal: diagnosticos.find((d) => d.principal) ?? null,
        diagnosticosSecundarios: diagnosticos.filter((d) => !d.principal),
        serviciosAplicados: cita.serviciosAplicados,
        notasClinicas: cita.notasClinicas,
        tratamientos: toTratamientos(cita),
        cancelacion: cita.cancelacion,
      };
    }, signal, 300);
  },

  obtenerConsultaActiva(signal?: AbortSignal) {
    return wait<ConsultaActiva | null>(() => {
      const session = getSession();
      if (!session || session.rol !== 'VETERINARIO') throw new ForbiddenError();
      if (session.id !== DEMO_CONSULTA_ACTIVA.veterinarioId) return null;
      const paciente = DEMO_PACIENTES.find((p) => p.id === DEMO_CONSULTA_ACTIVA.mascotaId)!;
      return { citaId: DEMO_CONSULTA_ACTIVA.citaId, inicio: DEMO_CONSULTA_ACTIVA.inicio, paciente: toPaciente(paciente) };
    }, signal, 250);
  },

  obtenerHistorialClinico(mascotaId: number, filtros: FiltrosClinicos, signal?: AbortSignal) {
    return wait<HistorialClinico>(() => {
      const session = getSession();
      if (!session || session.rol !== 'VETERINARIO') throw new ForbiddenError();
      const paciente = assertAcceso(mascotaId);
      assertErrorEscenario();

      const todas = demoScenario === 'empty'
        ? []
        : DEMO_CITAS.filter((c) => c.mascotaId === mascotaId).sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));
      const limite = new Date();
      if (filtros.periodo === 'ULTIMOS_12_MESES') limite.setMonth(limite.getMonth() - 12);
      if (filtros.periodo === 'ULTIMOS_6_MESES') limite.setMonth(limite.getMonth() - 6);
      const q = filtros.q.trim().toLowerCase();

      const enPeriodo = todas.filter((c) =>
        (filtros.periodo === 'TODO' || new Date(c.fechaHora) >= limite)
        && (filtros.tipo === 'TODOS' || c.tipo === filtros.tipo));
      const coincide = (texto: string | null | undefined) => !q || (texto ?? '').toLowerCase().includes(q);
      const citasFiltradas = enPeriodo.filter((c) =>
        coincide(c.servicio) || coincide(c.motivo) || coincide(c.notasClinicas)
        || c.diagnosticos.some((d) => coincide(d.descripcion) || coincide(d.observaciones))
        || c.tratamientos.some((t) => coincide(t.medicamento)));

      return {
        paciente: toPaciente(paciente),
        cumplimiento: calcularCumplimiento(todas),
        citas: citasFiltradas.map(toCitaHistorial),
        diagnosticos: enPeriodo.flatMap(toDiagnosticos).filter((d) => coincide(d.descripcion) || coincide(d.observaciones)),
        tratamientos: enPeriodo.flatMap(toTratamientos).filter((t) => coincide(t.medicamento) || coincide(t.dosis)),
        resumen: paciente.resumen,
      };
    }, signal);
  },
};

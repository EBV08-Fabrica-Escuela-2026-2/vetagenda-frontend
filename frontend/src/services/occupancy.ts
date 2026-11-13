import { API_BASE_URL, getAuthenticatedSession } from './api';
import type {
  OccupancyFilter,
  OccupancyReportResponse,
  VetOccupancyDetail,
} from '../types/occupancy';

type BackendProfessional = {
  veterinarioId: number;
  nombre: string;
  slotsHabilitados: number;
  citasEfectivas: number;
  slotsDisponibles: number;
  porcentajeOcupacion: number;
};

type BackendDistribution = {
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  slotsHabilitados: number;
  citasEfectivas: number;
  slotsDisponibles: number;
  porcentajeOcupacion: number;
};

type BackendOccupancyResponse = {
  fechaInicio: string;
  fechaFin: string;
  agrupacion: string;
  totalSlotsHabilitados: number;
  totalCitasEfectivas: number;
  totalSlotsDisponibles: number;
  porcentajeOcupacion: number;
  mayorDemanda: BackendProfessional | null;
  menorDemanda: BackendProfessional | null;
  distribucion: BackendDistribution[];
  mensaje?: string | null;
};

function authHeaders(): Record<string, string> {
  const session = getAuthenticatedSession();
  if (!session || session.rol !== 'ADMIN') {
    throw new Error('Debes iniciar sesión como administrador para consultar la ocupación.');
  }
  return { Accept: 'application/json', Authorization: `Bearer ${session.token}` };
}

function status(percentage: number): VetOccupancyDetail['estado'] {
  if (percentage > 80) return 'SATURADO';
  if (percentage >= 50) return 'OPTIMO';
  return 'BAJA_DEMANDA';
}

function professionalDetail(value: BackendProfessional | null): VetOccupancyDetail | null {
  if (!value) return null;
  const percentage = Number(value.porcentajeOcupacion);
  return {
    vetId: String(value.veterinarioId),
    nombre: value.nombre,
    especialidad: 'Profesional veterinario',
    sede: 'Toda la clínica',
    slotsHabilitados: value.slotsHabilitados,
    citasEfectivas: value.citasEfectivas,
    slotsLibres: value.slotsDisponibles,
    porcentajeOcupacion: percentage,
    estado: status(percentage),
  };
}

function periodDetail(value: BackendDistribution, grouping: string): VetOccupancyDetail {
  const range = value.fechaInicio === value.fechaFin
    ? value.fechaInicio
    : `${value.fechaInicio} – ${value.fechaFin}`;
  const percentage = Number(value.porcentajeOcupacion);
  return {
    vetId: value.periodo,
    nombre: value.periodo,
    especialidad: range,
    sede: `Agrupación ${grouping.toLocaleLowerCase('es-CO')}`,
    slotsHabilitados: value.slotsHabilitados,
    citasEfectivas: value.citasEfectivas,
    slotsLibres: value.slotsDisponibles,
    porcentajeOcupacion: percentage,
    estado: status(percentage),
  };
}

export async function getOccupancyReport(filters: OccupancyFilter): Promise<OccupancyReportResponse> {
  const query = new URLSearchParams({
    fechaInicio: filters.startDate,
    fechaFin: filters.endDate,
    agrupacion: filters.periodicity.toUpperCase(),
  });
  if (filters.vetId) query.set('veterinarioId', filters.vetId);

  const response = await fetch(`${API_BASE_URL}/ocupacion/resumen?${query}`, {
    headers: authHeaders(),
  });
  const data: BackendOccupancyResponse | { mensaje?: string; detail?: string } | null = await response.json().catch(() => null);
  if (!response.ok) {
    const problem = data as { mensaje?: string; detail?: string } | null;
    throw new Error(problem?.mensaje || problem?.detail || 'No fue posible consultar la ocupación.');
  }

  const report = data as BackendOccupancyResponse;
  return {
    rangoConsultado: { inicio: report.fechaInicio, fin: report.fechaFin },
    totalSlotsHabilitados: report.totalSlotsHabilitados,
    totalCitasEfectivas: report.totalCitasEfectivas,
    totalSlotsLibres: report.totalSlotsDisponibles,
    tasaOcupacionGlobal: Number(report.porcentajeOcupacion),
    veterinarioMayorDemanda: professionalDetail(report.mayorDemanda),
    veterinarioMenorDemanda: professionalDetail(report.menorDemanda),
    detallesPorVeterinario: (report.distribucion || []).map((item) => periodDetail(item, report.agrupacion)),
    mensaje: report.mensaje || null,
  };
}

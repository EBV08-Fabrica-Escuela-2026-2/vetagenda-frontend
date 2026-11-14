import { getCitasLocales } from './api';
import type { Cita } from './api';
import type {
  OccupancyFilter,
  OccupancyReportResponse,
  VetOccupancyDetail,
} from '../types/occupancy';

export const OCCUPANCY_VETERINARIANS = [
  { id: '1', nombre: 'Dra. Laura Gómez', especialidad: 'Medicina general', sede: 'Sede Laureles' },
  { id: '2', nombre: 'Dr. Andrés Pérez', especialidad: 'Medicina preventiva', sede: 'Sede Belén' },
  { id: '3', nombre: 'Dra. Natalia Ruiz', especialidad: 'Cirugía veterinaria', sede: 'Sede Laureles' },
  { id: '4', nombre: 'Dr. Carlos Pérez', especialidad: 'Medicina general', sede: 'Sede Belén' },
] as const;

const norm = (value: string) => value.trim().toLocaleLowerCase('es-CO');

function isWithinRange(date: string, startDate: string, endDate: string): boolean {
  return date >= startDate && date <= endDate;
}

function countWeekdays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) return 0;

  let weekdays = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) weekdays += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return weekdays;
}

function resolveVet(cita: Cita) {
  const appointmentName = norm(cita.veterinarioNombre);
  return OCCUPANCY_VETERINARIANS.find((vet) => norm(vet.nombre) === appointmentName);
}

function occupancyStatus(percentage: number): VetOccupancyDetail['estado'] {
  if (percentage > 80) return 'SATURADO';
  if (percentage >= 50) return 'OPTIMO';
  return 'BAJA_DEMANDA';
}

export async function getOccupancyReport(
  filters: OccupancyFilter,
): Promise<OccupancyReportResponse> {
  await new Promise((resolve) => window.setTimeout(resolve, 250));
  const appointments = getCitasLocales().filter(
    (cita) => cita.estado !== 'CANCELADA' && isWithinRange(cita.fecha, filters.startDate, filters.endDate),
  );
  const scopedAppointments = appointments.filter((cita) => {
    const vet = resolveVet(cita);
    if (!vet) return false;
    if (filters.vetId && vet.id !== filters.vetId) return false;
    if (filters.sedeId && vet.sede !== filters.sedeId) return false;
    return true;
  });

  if (scopedAppointments.length === 0) {
    return {
      rangoConsultado: { inicio: filters.startDate, fin: filters.endDate },
      totalSlotsHabilitados: 0,
      totalCitasEfectivas: 0,
      totalSlotsLibres: 0,
      tasaOcupacionGlobal: 0,
      veterinarioMayorDemanda: null,
      veterinarioMenorDemanda: null,
      detallesPorVeterinario: [],
    };
  }

  const enabledWeekdays = countWeekdays(filters.startDate, filters.endDate);
  const enabledSlotsPerVet = enabledWeekdays * 16;
  const eligibleVets = OCCUPANCY_VETERINARIANS.filter(
    (vet) => (!filters.vetId || vet.id === filters.vetId)
      && (!filters.sedeId || vet.sede === filters.sedeId),
  );

  const details: VetOccupancyDetail[] = eligibleVets.map((vet) => {
    const citasEfectivas = scopedAppointments.filter(
      (cita) => resolveVet(cita)?.id === vet.id,
    ).length;
    const slotsHabilitados = enabledSlotsPerVet;
    const porcentajeOcupacion = slotsHabilitados > 0
      ? Math.round((citasEfectivas / slotsHabilitados) * 1000) / 10
      : 0;
    return {
      vetId: vet.id,
      nombre: vet.nombre,
      especialidad: vet.especialidad,
      sede: vet.sede,
      slotsHabilitados,
      citasEfectivas,
      slotsLibres: Math.max(0, slotsHabilitados - citasEfectivas),
      porcentajeOcupacion,
      estado: occupancyStatus(porcentajeOcupacion),
    };
  });

  const totalSlotsHabilitados = details.reduce((sum, item) => sum + item.slotsHabilitados, 0);
  const totalCitasEfectivas = details.reduce((sum, item) => sum + item.citasEfectivas, 0);
  const totalSlotsLibres = Math.max(0, totalSlotsHabilitados - totalCitasEfectivas);
  const sortedByDemand = [...details].sort(
    (left, right) => right.porcentajeOcupacion - left.porcentajeOcupacion,
  );
  const lowestDemand = sortedByDemand[sortedByDemand.length - 1] ?? null;

  return {
    rangoConsultado: { inicio: filters.startDate, fin: filters.endDate },
    totalSlotsHabilitados,
    totalCitasEfectivas,
    totalSlotsLibres,
    tasaOcupacionGlobal: totalSlotsHabilitados > 0
      ? Math.round((totalCitasEfectivas / totalSlotsHabilitados) * 1000) / 10
      : 0,
    veterinarioMayorDemanda: sortedByDemand[0] ?? null,
    veterinarioMenorDemanda: lowestDemand,
    detallesPorVeterinario: details,
  };
}

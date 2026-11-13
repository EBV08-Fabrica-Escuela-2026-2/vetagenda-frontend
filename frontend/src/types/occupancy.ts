export interface OccupancyFilter {
  startDate: string;
  endDate: string;
  periodicity: 'dia' | 'semana' | 'mes';
  sedeId: string;
  vetId: string;
}

export interface VetOccupancyDetail {
  vetId: string;
  nombre: string;
  especialidad: string;
  sede: string;
  slotsHabilitados: number;
  citasEfectivas: number;
  slotsLibres: number;
  porcentajeOcupacion: number;
  estado: 'SATURADO' | 'OPTIMO' | 'BAJA_DEMANDA';
}

export interface OccupancyReportResponse {
  rangoConsultado: { inicio: string; fin: string };
  totalSlotsHabilitados: number;
  totalCitasEfectivas: number;
  totalSlotsLibres: number;
  tasaOcupacionGlobal: number;
  veterinarioMayorDemanda: VetOccupancyDetail | null;
  veterinarioMenorDemanda: VetOccupancyDetail | null;
  detallesPorVeterinario: VetOccupancyDetail[];
  mensaje?: string | null;
}

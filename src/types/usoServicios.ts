export type PeriodoFiltro = 'SEMANAL' | 'MENSUAL' | 'ANUAL';

export interface MetricaServicio {
  servicioId: string;
  nombreServicio: string;
  categoria: string;
  citasFacturadas: number;
  ingresosAcumulados: number;
  porcentajeDemanda: number;
  tendencia: { etiqueta: string; citas: number; ingresos: number }[];
}

export interface ReporteUsoServiciosResponse {
  periodo: PeriodoFiltro;
  totalCitas: number;
  totalIngresos: number;
  servicios: MetricaServicio[];
}

export interface UsoServicioReporteDto extends ReporteUsoServiciosResponse {}

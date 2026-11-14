import type {
  MetricaServicio,
  PeriodoFiltro,
  ReporteUsoServiciosResponse,
} from '../types/usoServicios';

type MockServicio = {
  servicioId: string;
  nombreServicio: string;
  categoria: string;
  citasFacturadas: number;
  ingresoPromedio: number;
  tendenciaBase: number[];
};

export const MOCK_SERVICIOS_USO: MockServicio[] = [
  { servicioId: '1', nombreServicio: 'Consulta general', categoria: 'Consulta', citasFacturadas: 48, ingresoPromedio: 65000, tendenciaBase: [8, 11, 9, 10, 10, 9, 8, 12, 11, 10, 9, 12] },
  { servicioId: '2', nombreServicio: 'Vacunación', categoria: 'Medicina preventiva', citasFacturadas: 37, ingresoPromedio: 90000, tendenciaBase: [6, 8, 7, 9, 8, 7, 8, 10, 7, 9, 8, 10] },
  { servicioId: '3', nombreServicio: 'Desparasitación', categoria: 'Medicina preventiva', citasFacturadas: 26, ingresoPromedio: 50000, tendenciaBase: [5, 6, 5, 7, 6, 5, 6, 7, 5, 6, 7, 8] },
  { servicioId: '6', nombreServicio: 'Odontología', categoria: 'Especialidad', citasFacturadas: 19, ingresoPromedio: 150000, tendenciaBase: [3, 4, 5, 4, 6, 5, 4, 6, 5, 4, 6, 7] },
  { servicioId: '5', nombreServicio: 'Dermatología', categoria: 'Especialidad', citasFacturadas: 16, ingresoPromedio: 120000, tendenciaBase: [3, 4, 3, 5, 4, 3, 4, 5, 4, 4, 5, 6] },
  { servicioId: '7', nombreServicio: 'Ecografía', categoria: 'Diagnóstico', citasFacturadas: 13, ingresoPromedio: 95000, tendenciaBase: [2, 3, 4, 3, 4, 3, 4, 4, 3, 4, 5, 5] },
  { servicioId: '4', nombreServicio: 'Cirugía Mayor', categoria: 'Cirugía', citasFacturadas: 8, ingresoPromedio: 350000, tendenciaBase: [1, 2, 2, 3, 2, 2, 3, 2, 3, 3, 4, 4] },
  { servicioId: '9', nombreServicio: 'Rehabilitación', categoria: 'Terapia', citasFacturadas: 7, ingresoPromedio: 180000, tendenciaBase: [1, 2, 2, 2, 3, 2, 2, 3, 2, 3, 3, 4] },
  { servicioId: '8', nombreServicio: 'Cirugía Cardíaca', categoria: 'Cirugía', citasFacturadas: 4, ingresoPromedio: 2500000, tendenciaBase: [0, 1, 1, 1, 2, 1, 1, 2, 1, 2, 2, 3] },
];

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function getPeriodo(value: string): PeriodoFiltro {
  if (value === 'SEMANAL' || value === 'MENSUAL' || value === 'ANUAL') return value;
  throw new Error('El periodo seleccionado no es válido.');
}

function getEtiquetas(periodo: PeriodoFiltro): string[] {
  if (periodo === 'ANUAL') {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, index) =>
      new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(new Date(currentYear, index, 1)),
    );
  }

  if (periodo === 'SEMANAL') {
    const today = new Date();
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const daysSinceMonday = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - daysSinceMonday);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      return new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(day);
    });
  }

  const today = new Date();
  const weeksInMonth = Math.ceil(new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() / 7);
  return Array.from({ length: weeksInMonth }, (_, index) => `Sem ${index + 1}`);
}

function dividirCitas(total: number, labelsCount: number, weights: number[]): number[] {
  const activeWeights = Array.from({ length: labelsCount }, (_, index) => weights[index % weights.length]);
  const weightTotal = activeWeights.reduce((sum, weight) => sum + weight, 0);
  const values = activeWeights.map((weight) => Math.floor((total * weight) / weightTotal));
  let remainder = total - values.reduce((sum, value) => sum + value, 0);

  for (let index = 0; remainder > 0; index = (index + 1) % values.length) {
    values[index] += 1;
    remainder -= 1;
  }

  return values;
}

function construirMetricas(periodo: PeriodoFiltro): MetricaServicio[] {
  const labels = getEtiquetas(periodo);
  const mockPeriodScale = periodo === 'SEMANAL' ? 0.26 : periodo === 'ANUAL' ? 12 : 1;

  return MOCK_SERVICIOS_USO.map((servicio) => {
    const citasFacturadas = Math.max(0, Math.round(servicio.citasFacturadas * mockPeriodScale));
    const citasPorIntervalo = dividirCitas(citasFacturadas, labels.length, servicio.tendenciaBase);
    const ingresosAcumulados = citasFacturadas * servicio.ingresoPromedio;

    return {
      servicioId: servicio.servicioId,
      nombreServicio: servicio.nombreServicio,
      categoria: servicio.categoria,
      citasFacturadas,
      ingresosAcumulados,
      porcentajeDemanda: 0,
      tendencia: labels.map((etiqueta, index) => ({
        etiqueta,
        citas: citasPorIntervalo[index],
        ingresos: citasPorIntervalo[index] * servicio.ingresoPromedio,
      })),
    };
  });
}

export async function obtenerReporteUsoServicios(
  periodo: string,
  servicioId?: string,
): Promise<ReporteUsoServiciosResponse> {
  const periodoFiltro = getPeriodo(periodo);
  await new Promise<void>((resolve) => window.setTimeout(resolve, 300));

  const todasLasMetricas = construirMetricas(periodoFiltro);
  const totalCitas = todasLasMetricas.reduce((sum, servicio) => sum + servicio.citasFacturadas, 0);
  const totalIngresos = todasLasMetricas.reduce((sum, servicio) => sum + servicio.ingresosAcumulados, 0);
  const serviciosOrdenados = todasLasMetricas
    .map((servicio) => ({
      ...servicio,
      porcentajeDemanda: totalCitas > 0
        ? Math.round((servicio.citasFacturadas / totalCitas) * 1000) / 10
        : 0,
    }))
    .sort((left, right) => right.citasFacturadas - left.citasFacturadas);

  if (!servicioId) {
    return { periodo: periodoFiltro, totalCitas, totalIngresos, servicios: serviciosOrdenados };
  }

  const servicioSeleccionado = serviciosOrdenados.find((servicio) => servicio.servicioId === servicioId);
  if (!servicioSeleccionado) {
    throw new Error('No se encontró el servicio seleccionado en el reporte.');
  }

  return {
    periodo: periodoFiltro,
    totalCitas: servicioSeleccionado.citasFacturadas,
    totalIngresos: servicioSeleccionado.ingresosAcumulados,
    servicios: [servicioSeleccionado],
  };
}

export function formatearIngresos(valor: number): string {
  return currencyFormatter.format(valor);
}

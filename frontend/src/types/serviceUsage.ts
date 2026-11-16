export type ServiceUsageItem = {
  posicion: number;
  servicio: string;
  solicitudes: number;
  atencionesRealizadas: number;
  tasaAtencion: number;
  valorFacturado: number;
};

export type ServiceUsageTrend = {
  semana: number;
  etiqueta: string;
  solicitudes: number;
};

export type ServiceUsageReport = {
  periodo: string;
  periodoTexto: string;
  servicioFiltro: string | null;
  citasSolicitadas: number;
  atencionesRealizadas: number;
  tasaCumplimiento: number;
  ingresosGenerados: number;
  servicios: ServiceUsageItem[];
  tendencia: ServiceUsageTrend[];
  serviciosDisponibles: string[];
};

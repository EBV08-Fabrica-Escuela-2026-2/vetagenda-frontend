// ──────────────────────────────────────────────
// Tipos del dominio "Historial asistencial"
// Reflejan el contrato documentado en docs/API_CONTRACT.md
// ──────────────────────────────────────────────

export type Rol = 'CLIENTE' | 'VETERINARIO';

export type EstadoCita = 'COMPLETADA' | 'CANCELADA';

export type TipoCita = 'CONSULTA_GENERAL' | 'CONTROL' | 'VACUNACION' | 'CIRUGIA' | 'URGENCIA';

export type Especie = 'PERRO' | 'GATO' | 'OTRO';

export type MascotaResumen = {
  id: number;
  nombre: string;
  especie: Especie;
  raza: string;
  fotoUrl?: string | null;
};

export type ProfesionalResumen = {
  id: number;
  nombre: string;
  especialidad: string;
  registroProfesional: string;
  fotoUrl?: string | null;
  verificado: boolean;
};

/** Ítem de la línea de tiempo (lista). No incluye información clínica sensible. */
export type CitaHistorial = {
  id: number;
  mascota: Pick<MascotaResumen, 'id' | 'nombre'>;
  profesional: Pick<ProfesionalResumen, 'id' | 'nombre'>;
  fechaHora: string; // ISO-8601 con zona (America/Bogota)
  duracionMinutos: number;
  tipo: TipoCita;
  servicio: string; // nombre del servicio principal ("Consulta general")
  motivo: string; // descripción corta
  estado: EstadoCita;
};

export type Diagnostico = {
  id: number;
  citaId: number;
  fecha: string;
  descripcion: string;
  observaciones: string;
  principal: boolean;
  registradoPor: string;
};

export type ServicioAplicado = {
  id: number;
  nombre: string;
  cantidad: number;
  detalle: string;
};

export type Tratamiento = {
  id: number;
  citaId: number;
  medicamento: string;
  dosis: string;
  duracion: string;
  fechaIndicacion: string;
};

export type Cancelacion = {
  fecha: string;
  canceladaPor: 'CLIENTE' | 'VETERINARIO' | 'CLINICA';
  motivo: string;
};

/** Detalle completo de una atención (drawer). */
export type DetalleAtencion = CitaHistorial & {
  profesional: ProfesionalResumen;
  diagnosticoPrincipal: Diagnostico | null;
  diagnosticosSecundarios: Diagnostico[];
  serviciosAplicados: ServicioAplicado[];
  notasClinicas: string | null;
  tratamientos: Tratamiento[];
  cancelacion: Cancelacion | null;
};

export type ResumenCumplimiento = {
  total: number;
  completadas: number;
  canceladas: number;
  /** completadas / total * 100, redondeado. 0 si no hay citas. */
  porcentaje: number;
};

export type PaginaHistorial = {
  citas: CitaHistorial[];
  resumen: ResumenCumplimiento;
  page: number;
  size: number;
  totalElementos: number;
  hayMas: boolean;
};

export type FiltrosHistorial = {
  mascotaId: number | 'TODAS';
  desde: string; // yyyy-mm-dd
  hasta: string; // yyyy-mm-dd
  tipo: TipoCita | 'TODOS';
  estado: EstadoCita | 'TODOS';
};

// ── Módulo médico (veterinario) ─────────────────

export type PacienteDetalle = MascotaResumen & {
  edadAnios: number;
  pesoKg: number;
  sexo: 'MACHO' | 'HEMBRA';
  propietario: string;
};

export type ConsultaActiva = {
  citaId: number;
  inicio: string; // ISO
  paciente: PacienteDetalle;
};

export type ResumenClinico = {
  alergias: string[];
  diagnosticosActivos: string[];
  ultimaVacuna: { nombre: string; fecha: string } | null;
  proximoControl: string | null; // ISO
};

export type HistorialClinico = {
  paciente: PacienteDetalle;
  cumplimiento: ResumenCumplimiento;
  citas: CitaHistorial[];
  diagnosticos: Diagnostico[];
  tratamientos: Tratamiento[];
  resumen: ResumenClinico;
};

export type FiltrosClinicos = {
  q: string;
  periodo: 'ULTIMOS_12_MESES' | 'ULTIMOS_6_MESES' | 'TODO';
  tipo: TipoCita | 'TODOS';
};

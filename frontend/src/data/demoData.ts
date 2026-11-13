// ──────────────────────────────────────────────
// Datos de demostración.
// Simulan lo que guardaría el backend (incluye una mascota de OTRO cliente
// y un paciente NO asignado al veterinario demo para probar el 403).
// ──────────────────────────────────────────────
import type {
  Cancelacion,
  Diagnostico,
  EstadoCita,
  PacienteDetalle,
  ProfesionalResumen,
  ResumenClinico,
  ServicioAplicado,
  TipoCita,
  Tratamiento,
} from '../types/historial';

export type DemoPaciente = PacienteDetalle & {
  clienteId: number;
  veterinariosAsignados: number[];
  resumen: ResumenClinico;
};

export type DemoCita = {
  id: number;
  mascotaId: number;
  profesionalId: number;
  fechaHora: string;
  duracionMinutos: number;
  tipo: TipoCita;
  servicio: string;
  motivo: string;
  estado: EstadoCita;
  diagnosticos: Omit<Diagnostico, 'citaId' | 'fecha' | 'registradoPor'>[];
  serviciosAplicados: ServicioAplicado[];
  notasClinicas: string | null;
  tratamientos: Omit<Tratamiento, 'citaId' | 'fechaIndicacion'>[];
  cancelacion: Cancelacion | null;
};

const foto = (seed: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(seed)}`;

const avatarPerro = foto(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#F4E3C3"/><ellipse cx="32" cy="38" rx="17" ry="15" fill="#D9A55B"/><ellipse cx="17" cy="30" rx="7" ry="12" fill="#B9813C"/><ellipse cx="47" cy="30" rx="7" ry="12" fill="#B9813C"/><circle cx="26" cy="34" r="2.4" fill="#2B1B0E"/><circle cx="38" cy="34" r="2.4" fill="#2B1B0E"/><ellipse cx="32" cy="42" rx="4" ry="3" fill="#2B1B0E"/></svg>',
);
const avatarGato = foto(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#E8DCCB"/><path d="M14 22 L20 8 L28 20 Z M50 22 L44 8 L36 20 Z" fill="#9A7B5A"/><ellipse cx="32" cy="36" rx="19" ry="17" fill="#B8936B"/><circle cx="25" cy="33" r="2.6" fill="#3B5D2E"/><circle cx="39" cy="33" r="2.6" fill="#3B5D2E"/><path d="M30 40 h4 l-2 2.4z" fill="#7A3E3E"/></svg>',
);
const avatarOtro = foto(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#DCE5EA"/><circle cx="32" cy="36" r="16" fill="#8AA0A9"/></svg>',
);
const avatarProfesional = (fondo: string) =>
  foto(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${fondo}"/><circle cx="32" cy="26" r="11" fill="#F1D3BC"/><path d="M12 64c2-14 10-20 20-20s18 6 20 20z" fill="#FFFFFF"/><path d="M27 44l5 8 5-8" fill="none" stroke="#0C9A90" stroke-width="3"/></svg>`,
  );

export const DEMO_PROFESIONALES: ProfesionalResumen[] = [
  { id: 7, nombre: 'Dra. Valentina Gómez', especialidad: 'Medicina interna', registroProfesional: 'MP 18429', verificado: true, fotoUrl: avatarProfesional('#D7F6EF') },
  { id: 9, nombre: 'Dr. Camilo Durán', especialidad: 'Medicina general', registroProfesional: 'MP 20117', verificado: true, fotoUrl: avatarProfesional('#DCE5EA') },
];

export const DEMO_PACIENTES: DemoPaciente[] = [
  {
    id: 1,
    nombre: 'Bruno',
    especie: 'PERRO',
    raza: 'Golden Retriever',
    fotoUrl: avatarPerro,
    edadAnios: 5,
    pesoKg: 28.4,
    sexo: 'MACHO',
    propietario: 'Camila Mejía',
    clienteId: 101,
    veterinariosAsignados: [7, 9],
    resumen: {
      alergias: ['Polen y ácaros'],
      diagnosticosActivos: ['Dermatitis alérgica', 'Sensibilidad digestiva'],
      ultimaVacuna: { nombre: 'Vacuna múltiple', fecha: '2026-03-15' },
      proximoControl: '2026-11-25T10:00:00-05:00',
    },
  },
  {
    id: 2,
    nombre: 'Mía',
    especie: 'GATO',
    raza: 'Criolla',
    fotoUrl: avatarGato,
    edadAnios: 3,
    pesoKg: 4.1,
    sexo: 'HEMBRA',
    propietario: 'Camila Mejía',
    clienteId: 101,
    veterinariosAsignados: [7, 9],
    resumen: {
      alergias: [],
      diagnosticosActivos: ['Otitis externa (en seguimiento)'],
      ultimaVacuna: { nombre: 'Triple felina', fecha: '2026-08-14' },
      proximoControl: null,
    },
  },
  // Mascota de OTRO cliente: la clienta demo no debe poder verla (403).
  {
    id: 3,
    nombre: 'Luna',
    especie: 'PERRO',
    raza: 'Beagle',
    fotoUrl: avatarOtro,
    edadAnios: 7,
    pesoKg: 12.3,
    sexo: 'HEMBRA',
    propietario: 'Andrés Rojas',
    clienteId: 202,
    veterinariosAsignados: [9],
    resumen: { alergias: ['Penicilina'], diagnosticosActivos: ['Hipotiroidismo'], ultimaVacuna: null, proximoControl: null },
  },
];

export const DEMO_CITAS: DemoCita[] = [
  // ── Bruno ──
  {
    id: 501,
    mascotaId: 1,
    profesionalId: 7,
    fechaHora: '2026-11-10T10:30:00-05:00',
    duracionMinutos: 30,
    tipo: 'CONSULTA_GENERAL',
    servicio: 'Consulta general',
    motivo: 'Control digestivo y seguimiento de evolución',
    estado: 'COMPLETADA',
    diagnosticos: [
      {
        id: 9001,
        descripcion: 'Gastritis leve de origen alimentario',
        observaciones: 'Paciente estable, hidratado y con respuesta favorable al manejo inicial. Sin signos de alarma.',
        principal: true,
      },
    ],
    serviciosAplicados: [
      { id: 1, nombre: 'Consulta médica general', cantidad: 1, detalle: 'Evaluación completa' },
      { id: 2, nombre: 'Hemograma básico', cantidad: 1, detalle: 'Resultados dentro de rango' },
    ],
    notasClinicas:
      'Continuar dieta gastrointestinal por 7 días. Garantizar agua fresca y regresar si presenta vómito persistente o inapetencia.',
    tratamientos: [
      { id: 801, medicamento: 'Omeprazol', dosis: '20 mg / 24 h', duracion: '7 días' },
      { id: 802, medicamento: 'Dieta gastrointestinal', dosis: '280 g / día', duracion: '7 días' },
    ],
    cancelacion: null,
  },
  {
    id: 502,
    mascotaId: 1,
    profesionalId: 9,
    fechaHora: '2026-11-02T16:00:00-05:00',
    duracionMinutos: 30,
    tipo: 'VACUNACION',
    servicio: 'Vacunación',
    motivo: 'Refuerzo anual vacuna múltiple',
    estado: 'CANCELADA',
    diagnosticos: [],
    serviciosAplicados: [],
    notasClinicas: null,
    tratamientos: [],
    cancelacion: {
      fecha: '2026-10-31T14:22:00-05:00',
      canceladaPor: 'CLIENTE',
      motivo: 'Imprevisto familiar. El cliente indicó que reagendará la vacunación durante la próxima semana.',
    },
  },
  {
    id: 503,
    mascotaId: 1,
    profesionalId: 7,
    fechaHora: '2026-10-12T09:15:00-05:00',
    duracionMinutos: 30,
    tipo: 'CONTROL',
    servicio: 'Control',
    motivo: 'Seguimiento clínico posterior a tratamiento',
    estado: 'COMPLETADA',
    diagnosticos: [
      {
        id: 9002,
        descripcion: 'Dermatitis alérgica estacional',
        observaciones: 'Lesiones superficiales en región abdominal. Manejo tópico indicado.',
        principal: true,
      },
      {
        id: 9003,
        descripcion: 'Otitis externa leve (oído derecho)',
        observaciones: 'Secreción escasa, sin dolor a la palpación.',
        principal: false,
      },
    ],
    serviciosAplicados: [
      { id: 3, nombre: 'Control médico', cantidad: 1, detalle: 'Revisión dermatológica' },
      { id: 4, nombre: 'Citología de piel', cantidad: 1, detalle: 'Sin hallazgos bacterianos' },
    ],
    notasClinicas: 'Bañar con champú hipoalergénico cada 5 días. Evitar paseos en zonas de pasto alto durante la temporada de polen.',
    tratamientos: [{ id: 803, medicamento: 'Prednisolona', dosis: '10 mg / 24 h', duracion: '5 días' }],
    cancelacion: null,
  },
  {
    id: 504,
    mascotaId: 1,
    profesionalId: 9,
    fechaHora: '2026-03-15T11:00:00-05:00',
    duracionMinutos: 20,
    tipo: 'VACUNACION',
    servicio: 'Vacunación',
    motivo: 'Vacuna múltiple anual',
    estado: 'COMPLETADA',
    diagnosticos: [],
    serviciosAplicados: [{ id: 5, nombre: 'Vacuna múltiple (DHPPi+L)', cantidad: 1, detalle: 'Lote VX-2291' }],
    notasClinicas: 'Sin reacciones adversas durante la observación de 15 minutos.',
    tratamientos: [],
    cancelacion: null,
  },
  {
    id: 505,
    mascotaId: 1,
    profesionalId: 7,
    fechaHora: '2026-01-20T08:30:00-05:00',
    duracionMinutos: 30,
    tipo: 'CONSULTA_GENERAL',
    servicio: 'Consulta general',
    motivo: 'Revisión por rascado frecuente',
    estado: 'CANCELADA',
    diagnosticos: [],
    serviciosAplicados: [],
    notasClinicas: null,
    tratamientos: [],
    cancelacion: {
      fecha: '2026-01-19T17:05:00-05:00',
      canceladaPor: 'CLINICA',
      motivo: 'Reprogramación por incapacidad médica de la profesional asignada.',
    },
  },
  {
    id: 506,
    mascotaId: 1,
    profesionalId: 7,
    fechaHora: '2025-12-05T15:00:00-05:00',
    duracionMinutos: 30,
    tipo: 'CONTROL',
    servicio: 'Control',
    motivo: 'Control de peso y condición corporal',
    estado: 'COMPLETADA',
    diagnosticos: [
      { id: 9004, descripcion: 'Sensibilidad digestiva', observaciones: 'Heces blandas intermitentes asociadas a cambios de dieta.', principal: true },
    ],
    serviciosAplicados: [{ id: 6, nombre: 'Control médico', cantidad: 1, detalle: 'Peso 27.9 kg' }],
    notasClinicas: 'Mantener una sola fuente de alimento. Introducir cambios de dieta de forma gradual en 7 días.',
    tratamientos: [{ id: 804, medicamento: 'Probiótico veterinario', dosis: '1 sobre / 24 h', duracion: '10 días' }],
    cancelacion: null,
  },
  // ── Mía ──
  {
    id: 601,
    mascotaId: 2,
    profesionalId: 9,
    fechaHora: '2026-10-28T14:00:00-05:00',
    duracionMinutos: 30,
    tipo: 'CONSULTA_GENERAL',
    servicio: 'Consulta general',
    motivo: 'Sacude la cabeza con frecuencia',
    estado: 'COMPLETADA',
    diagnosticos: [
      { id: 9101, descripcion: 'Otitis externa leve', observaciones: 'Cerumen abundante en ambos oídos, sin lesión de tímpano.', principal: true },
    ],
    serviciosAplicados: [
      { id: 7, nombre: 'Consulta médica general', cantidad: 1, detalle: 'Otoscopia' },
      { id: 8, nombre: 'Limpieza ótica', cantidad: 1, detalle: 'Ambos oídos' },
    ],
    notasClinicas: 'Aplicar gotas óticas cada 12 horas. Control en 15 días si persisten los síntomas.',
    tratamientos: [{ id: 805, medicamento: 'Gotas óticas (otomax)', dosis: '4 gotas / 12 h', duracion: '10 días' }],
    cancelacion: null,
  },
  {
    id: 602,
    mascotaId: 2,
    profesionalId: 7,
    fechaHora: '2026-08-14T10:00:00-05:00',
    duracionMinutos: 20,
    tipo: 'VACUNACION',
    servicio: 'Vacunación',
    motivo: 'Triple felina anual',
    estado: 'COMPLETADA',
    diagnosticos: [],
    serviciosAplicados: [{ id: 9, nombre: 'Vacuna triple felina', cantidad: 1, detalle: 'Lote TF-1180' }],
    notasClinicas: 'Paciente tranquila. Sin reacciones posvacunales.',
    tratamientos: [],
    cancelacion: null,
  },
  {
    id: 603,
    mascotaId: 2,
    profesionalId: 9,
    fechaHora: '2026-06-03T09:00:00-05:00',
    duracionMinutos: 30,
    tipo: 'CONTROL',
    servicio: 'Control',
    motivo: 'Control de esterilización',
    estado: 'CANCELADA',
    diagnosticos: [],
    serviciosAplicados: [],
    notasClinicas: null,
    tratamientos: [],
    cancelacion: { fecha: '2026-06-02T19:40:00-05:00', canceladaPor: 'CLIENTE', motivo: 'La clienta no pudo asistir por viaje.' },
  },
  // ── Luna (de otro cliente) ──
  {
    id: 701,
    mascotaId: 3,
    profesionalId: 9,
    fechaHora: '2026-09-09T11:30:00-05:00',
    duracionMinutos: 30,
    tipo: 'CONTROL',
    servicio: 'Control',
    motivo: 'Control endocrino',
    estado: 'COMPLETADA',
    diagnosticos: [{ id: 9201, descripcion: 'Hipotiroidismo', observaciones: 'Información confidencial de otro cliente.', principal: true }],
    serviciosAplicados: [],
    notasClinicas: 'Información confidencial de otro cliente.',
    tratamientos: [{ id: 806, medicamento: 'Levotiroxina', dosis: '0.2 mg / 12 h', duracion: 'Crónico' }],
    cancelacion: null,
  },
];

/** Consulta activa del veterinario demo (id 7). */
export const DEMO_CONSULTA_ACTIVA = {
  veterinarioId: 7,
  citaId: 510,
  mascotaId: 1,
  // Inició hace ~24 minutos respecto a la carga de la app
  inicio: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
};

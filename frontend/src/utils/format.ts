import type { EstadoCita, Especie, TipoCita } from '../types/historial';

const TZ = 'America/Bogota';

const partes = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('es-CO', { timeZone: TZ, ...options }).format(new Date(iso));

export const dia = (iso: string) => partes(iso, { day: '2-digit' });
export const mesCorto = (iso: string) => partes(iso, { month: 'short' }).replace('.', '').toUpperCase();
export const anio = (iso: string) => partes(iso, { year: 'numeric' });
export const hora = (iso: string) => partes(iso, { hour: '2-digit', minute: '2-digit', hour12: false });

/** "10 NOV 2026" */
export const fechaCorta = (iso: string) => `${dia(iso)} ${mesCorto(iso)} ${anio(iso)}`;

/** "10 Nov 2026" */
export const fechaTabla = (iso: string) => {
  const m = mesCorto(iso).toLowerCase();
  return `${dia(iso)} ${m.charAt(0).toUpperCase()}${m.slice(1)} ${anio(iso)}`;
};

/** "31 de octubre de 2026" */
export const fechaLarga = (iso: string) => partes(iso, { day: 'numeric', month: 'long', year: 'numeric' });

/** "25 de noviembre, 10:00" */
export const fechaControl = (iso: string) => `${partes(iso, { day: 'numeric', month: 'long' })}, ${hora(iso)}`;

/** Fecha local yyyy-mm-dd (para inputs type="date"). */
export const isoDia = (date: Date) => {
  const local = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  return local;
};

export const TIPO_LABEL: Record<TipoCita, string> = {
  CONSULTA_GENERAL: 'Consulta general',
  CONTROL: 'Control',
  VACUNACION: 'Vacunación',
  CIRUGIA: 'Cirugía',
  URGENCIA: 'Urgencia',
};

export const ESTADO_LABEL: Record<EstadoCita, string> = {
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
};

export const ESPECIE_LABEL: Record<Especie, string> = {
  PERRO: 'Perro',
  GATO: 'Gato',
  OTRO: 'Otra especie',
};

export const CANCELADA_POR_LABEL = {
  CLIENTE: 'el cliente',
  VETERINARIO: 'el veterinario',
  CLINICA: 'la clínica',
} as const;

export const plural = (n: number, singular: string, pluralForm = `${singular}s`) => `${n} ${n === 1 ? singular : pluralForm}`;

export const iniciales = (nombre: string) =>
  nombre
    .replace(/^(Dra?\.)\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

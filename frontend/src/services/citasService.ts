import { API_BASE_URL } from './api';

export type EstadoCita = 'PROGRAMADA' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';

export interface Profesional {
  id: string;
  nombre: string;
  especialidad?: string;
  fotoUrl?: string;
}

export interface Mascota {
  nombre: string;
  especieRaza: string;
  edad: string;
}

export interface Cita {
  id: string;
  codigo: string;
  servicio: string;
  categoriaServicio?: string;
  fecha: string;
  hora: string;
  duracion: string;
  costo: number;
  estado: EstadoCita;
  mascota: Mascota;
  profesional: Profesional;
  indicacionesPrevias?: string[];
}

export type TipoErrorCita = 'NOT_FOUND' | 'UNAUTHORIZED' | 'NETWORK_ERROR';

export class CitaApiError extends Error {
  constructor(
    public readonly tipo: TipoErrorCita,
    message: string,
  ) {
    super(message);
    this.name = 'CitaApiError';
  }
}

type CitaDetalleApi = {
  id: number;
  codigo: string;
  estado: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  mascota: {
    nombre: string;
    especie: string;
    raza: string;
    edad: number;
  };
  servicio: {
    nombre: string;
    categoria?: string;
    precio: number;
    duracionMinutos: number;
    indicacionesPrevias?: string;
  };
  profesional: {
    id: number;
    nombre: string;
    especialidad?: string;
    fotoUrl?: string;
  };
};

function normalizarEstado(estado: string): EstadoCita {
  if (estado === 'ANULADA' || estado.startsWith('CANCELADA')) return 'CANCELADA';
  if (estado === 'COMPLETADA') return 'COMPLETADA';
  if (estado === 'PROGRAMADA' || estado === 'PENDIENTE') return 'PROGRAMADA';
  if (estado === 'CONFIRMADA') return 'CONFIRMADA';
  throw new Error('El backend devolvió un estado de cita no reconocido.');
}

function mapearDetalle(datos: CitaDetalleApi): Cita {
  const inicio = new Date(datos.fechaHoraInicio);
  const especieRaza = [datos.mascota.especie, datos.mascota.raza, `${datos.mascota.edad} años`]
    .filter(Boolean)
    .join(' · ');
  const indicaciones = datos.servicio.indicacionesPrevias
    ?.split(/\r?\n/)
    .map((indicacion) => indicacion.trim())
    .filter(Boolean);

  return {
    id: String(datos.id),
    codigo: datos.codigo,
    servicio: datos.servicio.nombre,
    categoriaServicio: datos.servicio.categoria,
    fecha: new Intl.DateTimeFormat('es-CO', { dateStyle: 'full' }).format(inicio),
    hora: new Intl.DateTimeFormat('es-CO', { timeStyle: 'short' }).format(inicio),
    duracion: `${datos.servicio.duracionMinutos} min`,
    costo: Number(datos.servicio.precio),
    estado: normalizarEstado(datos.estado),
    mascota: {
      nombre: datos.mascota.nombre,
      especieRaza,
      edad: `${datos.mascota.edad} años`,
    },
    profesional: {
      id: String(datos.profesional.id),
      nombre: datos.profesional.nombre,
      especialidad: datos.profesional.especialidad,
      fotoUrl: datos.profesional.fotoUrl,
    },
    indicacionesPrevias: indicaciones,
  };
}

export async function obtenerDetalleCita(citaId: string, token?: string): Promise<Cita> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/citas/${encodeURIComponent(citaId)}`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new CitaApiError('NETWORK_ERROR', 'No fue posible conectar con el servidor.');
  }

  if (response.status === 404) {
    throw new CitaApiError('NOT_FOUND', 'La cita no existe o fue cancelada.');
  }

  if (response.status === 401 || response.status === 403) {
    throw new CitaApiError('UNAUTHORIZED', 'No tienes permisos para consultar esta cita.');
  }

  if (!response.ok) {
    throw new CitaApiError('NETWORK_ERROR', 'El servidor no pudo completar la solicitud.');
  }

  try {
    const respuesta: unknown = await response.json();
    if (!respuesta || typeof respuesta !== 'object') {
      throw new Error('Respuesta inválida');
    }

    const datos = 'cita' in respuesta ? respuesta.cita : respuesta;
    if (!datos || typeof datos !== 'object') {
      throw new Error('Respuesta inválida');
    }

    return mapearDetalle(datos as CitaDetalleApi);
  } catch {
    throw new CitaApiError('NETWORK_ERROR', 'El servidor devolvió una respuesta inválida.');
  }
}

import { API_BASE_URL } from './api';

export type EstadoCita = 'PROGRAMADA' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';

export interface Profesional {
  id: string;
  nombre: string;
  titulo: string;
  especialidad: string;
  numeroLicencia: string;
  experiencia: string;
  fotoUrl: string;
}

export interface Mascota {
  nombre: string;
  especieRaza: string;
  edad: string;
  avatarBg: string;
}

export interface Cita {
  id: string;
  codigo: string;
  clienteOwnerId: string;
  servicio: string;
  categoriaServicio: string;
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

    return datos as Cita;
  } catch {
    throw new CitaApiError('NETWORK_ERROR', 'El servidor devolvió una respuesta inválida.');
  }
}

export interface CitaReprogramacionDetalle {
  id: number;
  codigo: string;
  estado: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  puedeCancelarse: boolean;
  mascota: {
    id: number;
    nombre: string;
    especie: string;
    raza: string;
    edad: number;
    sexo: string;
  };
  servicio: {
    id: number;
    nombre: string;
    categoria: string;
    precio: number;
    duracionMinutos: number;
    indicacionesPrevias: string;
  };
  profesional: {
    id: number;
    nombre: string;
    especialidad: string;
    fotoUrl: string | null;
  };
}

export interface FranjaHorariaDisponible {
  horaInicio: string;
  horaFin: string;
}

export interface DisponibilidadReprogramacion {
  servicioId: number;
  servicioNombre: string;
  duracionMinutos: number;
  veterinarioId: number;
  veterinarioNombre: string;
  fecha: string;
  hayDisponibilidad: boolean;
  horariosDisponibles: FranjaHorariaDisponible[];
  mensaje: string | null;
  fechaDisponibleMasCercana: string | null;
}

export interface ReprogramacionCitaRespuesta {
  mensaje: string;
  fechaHoraAnterior: string;
  cita: {
    id: number;
    mascotaNombre: string;
    veterinarioNombre: string;
    servicioNombre: string;
    fechaHoraInicio: string;
    fechaHoraFin: string;
    estado: string;
    etiquetaEstado: string;
    cupoLiberado: boolean;
    createdAt: string;
  };
}

export class ReprogramacionApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
  ) {
    super(message);
    this.name = 'ReprogramacionApiError';
  }
}

async function solicitarReprogramacionApi<T>(
  url: string,
  token: string | undefined,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ReprogramacionApiError('No fue posible conectar con el servidor.', null);
  }

  const respuesta: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const mensaje =
      respuesta && typeof respuesta === 'object' && 'mensaje' in respuesta && typeof respuesta.mensaje === 'string'
        ? respuesta.mensaje
        : response.status === 401 || response.status === 403
          ? 'Tu sesión no está autorizada para reprogramar esta cita.'
          : 'No fue posible completar la operación.';
    throw new ReprogramacionApiError(mensaje, response.status);
  }

  if (respuesta === null) {
    throw new ReprogramacionApiError('El servidor devolvió una respuesta inválida.', response.status);
  }

  return respuesta as T;
}

export function obtenerCitaParaReprogramar(citaId: string, token?: string): Promise<CitaReprogramacionDetalle> {
  return solicitarReprogramacionApi(`${API_BASE_URL}/citas/${encodeURIComponent(citaId)}`, token);
}

export function consultarDisponibilidadReprogramacion(
  citaId: string,
  fecha: string,
  token?: string,
): Promise<DisponibilidadReprogramacion> {
  const query = new URLSearchParams({ fecha });
  return solicitarReprogramacionApi(
    `${API_BASE_URL}/citas/${encodeURIComponent(citaId)}/disponibilidad?${query.toString()}`,
    token,
  );
}

export function reprogramarCita(
  citaId: string,
  nuevaFecha: string,
  nuevaHoraInicio: string,
  token?: string,
): Promise<ReprogramacionCitaRespuesta> {
  return solicitarReprogramacionApi(
    `${API_BASE_URL}/citas/${encodeURIComponent(citaId)}/reprogramar`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify({ nuevaFecha, nuevaHoraInicio }),
    },
  );
}
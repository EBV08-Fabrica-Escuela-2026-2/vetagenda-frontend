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
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

export function buscarCitaLocal(citaId: string): Cita | null {
  try {
    const raw = localStorage.getItem('vetagenda_citas_locales');
    if (!raw) return null;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return null;

    const query = citaId.trim().toLowerCase();
    const querySinPrefijo = query.replace(/^va-0*/i, '');

    const encontrado = list.find((item: any) => {
      const idStr = String(item.id || '').toLowerCase();
      const idSinPrefijo = idStr.replace(/^va-0*/i, '');
      const codStr = String(item.codigoReserva || item.codigo || '').toLowerCase();
      const codSinPrefijo = codStr.replace(/^va-0*/i, '');

      return (
        idStr === query ||
        codStr === query ||
        (querySinPrefijo && (idSinPrefijo === querySinPrefijo || codSinPrefijo === querySinPrefijo))
      );
    });

    if (!encontrado) return null;

    return {
      id: String(encontrado.id),
      codigo: encontrado.codigoReserva || `VA-${String(encontrado.id).padStart(4, '0')}`,
      servicio: encontrado.servicioNombre || encontrado.servicio || 'Consulta general',
      categoriaServicio: 'Atención médica',
      fecha: encontrado.fecha || 'Fecha programada',
      hora: encontrado.hora || '08:00 a. m.',
      duracion: '30 min',
      costo: 65000,
      estado: (encontrado.estado === 'CANCELADA' ? 'CANCELADA' : 'CONFIRMADA') as EstadoCita,
      mascota: {
        nombre: encontrado.mascotaNombre || 'Mascota',
        especieRaza: encontrado.mascotaEspecie ? `${encontrado.mascotaEspecie} · Canino` : 'Canino',
        edad: '3 años',
      },
      profesional: {
        id: String(encontrado.veterinarioId || '1'),
        nombre: encontrado.veterinarioNombre || 'Veterinario asignado',
        especialidad: 'Medicina Veterinaria',
      },
      indicacionesPrevias: [
        'Presentar carné de vacunación al llegar',
        'Llegar 10 minutos antes de la hora fijada',
        'Mantener a la mascota con correa o en transportadora',
      ],
    };
  } catch {
    return null;
  }
}

export async function obtenerDetalleCita(citaId: string, token?: string): Promise<Cita> {
  let response: Response | null = null;

  try {
    response = await fetch(`${API_BASE_URL}/citas/${encodeURIComponent(citaId)}`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.ok) {
      const respuesta: unknown = await response.json();
      if (respuesta && typeof respuesta === 'object') {
        const datos = 'cita' in respuesta ? respuesta.cita : respuesta;
        if (datos && typeof datos === 'object') {
          return mapearDetalle(datos as CitaDetalleApi);
        }
      }
    }

    if (response.status === 401 || response.status === 403) {
      throw new CitaApiError('UNAUTHORIZED', 'No tienes permisos para consultar esta cita.');
    }
  } catch (error) {
    if (error instanceof CitaApiError) {
      throw error;
    }
  }

  // Fallback a cita creada localmente (HU12)
  const citaLocal = buscarCitaLocal(citaId);
  if (citaLocal) {
    return citaLocal;
  }

  if (response && response.status === 404) {
    throw new CitaApiError('NOT_FOUND', 'La cita no existe o fue cancelada.');
  }

  throw new CitaApiError('NOT_FOUND', 'La cita no existe o fue cancelada.');
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

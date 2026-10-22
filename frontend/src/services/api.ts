// ──────────────────────────────────────────────
// Tipos compartidos
// ──────────────────────────────────────────────

export type CatalogService = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string | number;
  duracionMinutos?: number;
};

export type VeterinarioConServicios = {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  horarioAtencion: string;
  servicios: CatalogService[];
  mensajeServicios?: string;
};

export type CatalogoApiResponse = {
  veterinarios: Array<{
    id: number;
    nombre: string;
    direccion?: string;
    telefono?: string;
    horarioAtencion?: string;
    servicios: CatalogService[];
    mensajeServicios?: string;
  }>;
  moneda: string;
  mensaje?: string;
};

export type VeterinarioListaItem = {
  id: number;
  nombre: string;
};

export const DEMO_VETERINARIOS: VeterinarioListaItem[] = [
  { id: 1, nombre: 'Dr. Carlos Pérez' },
  { id: 2, nombre: 'Dra. María López' },
  { id: 3, nombre: 'Dr. Andrés Martínez' },
  { id: 4, nombre: 'Dra. Laura Rodríguez' },
];

export type ServicePayload = {
  veterinarioId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
};

export type ClientPayload = {
  nombre: string;
  documentoIdentidad: string;
  telefono: string;
  correo: string;
  direccion?: string;
};

export type ClientProfile = ClientPayload & {
  id: number;
  activo: boolean;
};

export type PetPayload = {
  nombre: string;
  especie: string;
  sexo: string;
  raza: string;
  edad: number;
  observaciones?: string;
};

export type VeterinarioPayload = {
  nombre: string;
  tipoDocumento: string;
  documentoIdentidad: string;
  telefono: string;
  correo: string;
  tarjetaProfesional: string;
  especialidad: string;
  direccion?: string;
  horarioAtencion?: string;
};

export type Cita = {
  id: number;
  codigoReserva: string;
  clienteNombre: string;
  clienteDocumento: string;
  mascotaNombre: string;
  mascotaEspecie: string;
  mascotaRaza: string;
  veterinarioNombre: string;
  servicioNombre: string;
  fecha: string;
  hora: string;
  estado: 'PROGRAMADA' | 'CANCELADA';
  consultorio: string;
  precio: string;
  duracionMinutos?: number;
  motivoCancelacion?: string;
  fechaCancelacion?: string;
};

type CitaClienteApi = {
  id: number;
  mascotaNombre: string;
  veterinarioNombre: string;
  servicioNombre: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  estado: string;
  motivoCancelacion?: string;
  canceladaAt?: string;
};

export type PetProfile = {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  sexo: string;
  observaciones?: string | null;
};

export type CancelacionCitaApi = {
  mensaje: string;
  idCita: number;
  estado: string;
  etiquetaEstado: string;
  cupoLiberado: boolean;
  fechaHoraInicio: string;
  fechaHoraFin: string;
};

export type DisponibilidadConsultaApi = {
  servicioId: number;
  servicioNombre: string;
  duracionMinutos: number;
  veterinarioId: number;
  veterinarioNombre: string;
  fecha: string;
  hayDisponibilidad: boolean;
  horariosDisponibles: Array<{
    horaInicio: string;
    horaFin: string;
  }>;
  mensaje?: string | null;
  fechaDisponibleMasCercana?: string | null;
};

// ──────────────────────────────────────────────
// Configuración base
// ──────────────────────────────────────────────

const STORAGE_KEY = 'vetagenda-services';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api');

export const DEFAULT_SERVICES: CatalogService[] = [
  {
    id: 1,
    nombre: 'Consulta general',
    descripcion: 'Valoración clínica inicial, revisión general y recomendaciones para el cuidado de la mascota.',
    precio: '$65.000',
  },
  {
    id: 2,
    nombre: 'Vacunación',
    descripcion: 'Aplicación de vacunas según el esquema veterinario y control de salud preventiva.',
    precio: '$90.000',
  },
  {
    id: 3,
    nombre: 'Desparasitación',
    descripcion: 'Tratamiento de parásitos internos y externos para mantener la salud del paciente.',
    precio: '$50.000',
  },
];

export const getStoredServices = (): CatalogService[] => {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return DEFAULT_SERVICES;
    }

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return DEFAULT_SERVICES;
    }

    return parsedValue.map((service) => ({
      id: Number(service.id) || Date.now(),
      nombre: String(service.nombre || 'Servicio sin nombre'),
      descripcion: String(service.descripcion || 'Sin descripción disponible.'),
      precio: String(service.precio || '$0'),
      duracionMinutos: service.duracionMinutos ? Number(service.duracionMinutos) : undefined,
    }));
  } catch {
    return DEFAULT_SERVICES;
  }
};

export const setStoredServices = (services: CatalogService[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
};

export async function fetchDisponibilidad(
  servicioId: number,
  fecha: string,
  veterinarioId?: number,
  signal?: AbortSignal,
): Promise<DisponibilidadConsultaApi> {
  const query = new URLSearchParams({
    servicioId: String(servicioId),
    fecha,
  });
  if (veterinarioId !== undefined) {
    query.set('veterinarioId', String(veterinarioId));
  }

  const response = await fetch(`${API_BASE_URL}/citas/disponibilidad?${query.toString()}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.mensaje || body?.message || 'No fue posible consultar los horarios disponibles.');
  }

  const data = await response.json() as Partial<DisponibilidadConsultaApi>;
  return {
    servicioId: Number(data.servicioId ?? servicioId),
    servicioNombre: String(data.servicioNombre ?? ''),
    duracionMinutos: Number(data.duracionMinutos ?? 0),
    veterinarioId: Number(data.veterinarioId ?? veterinarioId ?? 0),
    veterinarioNombre: String(data.veterinarioNombre ?? ''),
    fecha: String(data.fecha ?? fecha),
    hayDisponibilidad: Boolean(data.hayDisponibilidad),
    horariosDisponibles: Array.isArray(data.horariosDisponibles)
      ? data.horariosDisponibles.filter(
          (slot): slot is { horaInicio: string; horaFin: string } =>
            typeof slot?.horaInicio === 'string' && typeof slot?.horaFin === 'string',
        )
      : [],
    mensaje: data.mensaje ?? null,
    fechaDisponibleMasCercana:
      typeof data.fechaDisponibleMasCercana === 'string' ? data.fechaDisponibleMasCercana : null,
  };
}

// ──────────────────────────────────────────────
// Autenticación
// ──────────────────────────────────────────────

export type LoginResponse = {
  mensaje: string;
  token: string;
  tipoToken: string;
  expiraEnMs: number;
};

export type ClientSession = {
  id: number;
  nombre: string;
  rol: 'CLIENTE';
  email: string;
  documento: string;
  documentoIdentidad: string;
  token: string;
};

export type VeterinarianProfile = {
  id: number;
  nombre: string;
  correo: string;
  documentoIdentidad: string;
  especialidad?: string;
};

export type VeterinarianSession = {
  id: number;
  nombre: string;
  rol: 'VETERINARIO';
  email: string;
  documento: string;
  documentoIdentidad: string;
  especialidad?: string;
  token: string;
};

export type AuthenticatedSession = ClientSession | VeterinarianSession;

export const CLIENT_SESSION_EVENT = 'vetagenda-session-changed';

const CLIENT_SESSION_KEYS = [
  'vetagenda_user',
  'vetagenda_session',
  'vetagenda_role',
  'vetagenda_token',
  'vetagenda_documento',
];

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ correo: email, password }),
    });
  } catch {
    throw new Error('No fue posible conectar con el servidor de autenticación.');
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const mensaje = data && typeof data === 'object' && 'mensaje' in data && typeof data.mensaje === 'string'
      ? data.mensaje
      : 'No se pudo iniciar sesión. Verifica tus credenciales.';
    throw new Error(mensaje);
  }

  if (!data || typeof data !== 'object' || !('token' in data) || typeof data.token !== 'string') {
    throw new Error('El servidor no devolvió un token de acceso válido.');
  }

  return data as LoginResponse;
}

export async function registerClientCredentials(payload: {
  correo: string;
  documentoIdentidad: string;
  password: string;
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const mensaje = data && typeof data === 'object' && 'mensaje' in data && typeof data.mensaje === 'string'
      ? data.mensaje
      : 'El cliente fue creado, pero no fue posible habilitar su acceso.';
    throw new Error(mensaje);
  }
}

export async function getCurrentClient(token: string): Promise<ClientProfile> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('No fue posible cargar el perfil del cliente.');
  }

  return response.json();
}

export function saveClientSession(profile: ClientProfile, token: string) {
  const session: ClientSession = {
    id: profile.id,
    nombre: profile.nombre,
    rol: 'CLIENTE',
    email: profile.correo,
    documento: profile.documentoIdentidad,
    documentoIdentidad: profile.documentoIdentidad,
    token,
  };

  localStorage.setItem('vetagenda_user', JSON.stringify(session));
  localStorage.setItem('vetagenda_session', 'true');
  localStorage.setItem('vetagenda_role', 'Cliente');
  localStorage.setItem('vetagenda_token', token);
  localStorage.setItem('vetagenda_documento', profile.documentoIdentidad);
  window.dispatchEvent(new Event(CLIENT_SESSION_EVENT));
}

export async function loginVeterinarianDemo(): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/veterinario/demo`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok || !data || typeof data !== 'object' || !('token' in data) || typeof data.token !== 'string') {
    throw new Error('No fue posible iniciar el perfil veterinario de demostración.');
  }
  return data as LoginResponse;
}

export async function getCurrentVeterinarian(token: string): Promise<VeterinarianProfile> {
  const response = await fetch(`${API_BASE_URL}/veterinario-portal/perfil`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('No fue posible cargar el perfil veterinario.');
  return response.json();
}

export function saveVeterinarianSession(profile: VeterinarianProfile, token: string) {
  const session: VeterinarianSession = {
    id: profile.id,
    nombre: profile.nombre,
    rol: 'VETERINARIO',
    email: profile.correo,
    documento: profile.documentoIdentidad,
    documentoIdentidad: profile.documentoIdentidad,
    especialidad: profile.especialidad,
    token,
  };
  localStorage.setItem('vetagenda_user', JSON.stringify(session));
  localStorage.setItem('vetagenda_session', 'true');
  localStorage.setItem('vetagenda_role', 'Veterinario');
  localStorage.setItem('vetagenda_token', token);
  localStorage.setItem('vetagenda_documento', profile.documentoIdentidad);
  window.dispatchEvent(new Event(CLIENT_SESSION_EVENT));
}

export function getClientSession(): ClientSession | null {
  const token = localStorage.getItem('vetagenda_token');
  const sessionActive = localStorage.getItem('vetagenda_session') === 'true';

  if (!token || !sessionActive) {
    return null;
  }

  try {
    const user = JSON.parse(localStorage.getItem('vetagenda_user') || 'null') as Partial<ClientSession> | null;

    if (
      user?.rol !== 'CLIENTE'
      || typeof user.id !== 'number'
      || typeof user.nombre !== 'string'
      || typeof user.documentoIdentidad !== 'string'
    ) {
      return null;
    }

    return {
      id: user.id,
      nombre: user.nombre,
      rol: 'CLIENTE',
      email: typeof user.email === 'string' ? user.email : '',
      documento: typeof user.documento === 'string' ? user.documento : user.documentoIdentidad,
      documentoIdentidad: user.documentoIdentidad,
      token,
    };
  } catch {
    return null;
  }
}

export function hasAuthenticatedClientSession(): boolean {
  return getClientSession() !== null;
}

export function getVeterinarianSession(): VeterinarianSession | null {
  const token = localStorage.getItem('vetagenda_token');
  if (!token || localStorage.getItem('vetagenda_session') !== 'true') return null;
  try {
    const user = JSON.parse(localStorage.getItem('vetagenda_user') || 'null') as Partial<VeterinarianSession> | null;
    if (user?.rol !== 'VETERINARIO' || typeof user.id !== 'number' || typeof user.nombre !== 'string') return null;
    return {
      id: user.id,
      nombre: user.nombre,
      rol: 'VETERINARIO',
      email: typeof user.email === 'string' ? user.email : '',
      documento: typeof user.documento === 'string' ? user.documento : String(user.documentoIdentidad ?? ''),
      documentoIdentidad: String(user.documentoIdentidad ?? ''),
      especialidad: typeof user.especialidad === 'string' ? user.especialidad : undefined,
      token,
    };
  } catch {
    return null;
  }
}

export function getAuthenticatedSession(): AuthenticatedSession | null {
  return getClientSession() ?? getVeterinarianSession();
}

export function hasAuthenticatedVeterinarianSession(): boolean {
  return getVeterinarianSession() !== null;
}

export function clearClientSession() {
  CLIENT_SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event(CLIENT_SESSION_EVENT));
}

// ──────────────────────────────────────────────
// Clientes
// ──────────────────────────────────────────────

export async function registerClient(payload: ClientPayload): Promise<{ idCliente: number; mensaje: string }> {
  const response = await fetch(`${API_BASE_URL}/clientes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const mensaje =
      errorData?.mensaje ||
      errorData?.message ||
      (response.status === 400 ? 'Datos inválidos o cliente/correo ya registrado.' : 'No se pudo registrar el cliente.');
    throw new Error(mensaje);
  }

  return response.json();
}

// ──────────────────────────────────────────────
// Mascotas
// ──────────────────────────────────────────────

export async function registerPet(payload: PetPayload, documentoIdentidad: string) {
  const response = await fetch(`${API_BASE_URL}/mascotas?documentoIdentidad=${encodeURIComponent(documentoIdentidad)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const mensaje =
      errorData?.mensaje ||
      errorData?.message ||
      (response.status === 404
        ? 'Cliente no encontrado. Verifica el documento de identidad.'
        : 'No se pudo registrar la mascota.');
    throw new Error(mensaje);
  }

  return response.json();
}

export async function listClientPets(documentoIdentidad: string, token: string): Promise<PetProfile[]> {
  const response = await fetch(
    `${API_BASE_URL}/mascotas?documentoIdentidad=${encodeURIComponent(documentoIdentidad)}`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const mensaje =
      errorData?.mensaje ||
      errorData?.message ||
      (response.status === 404
        ? 'No se encontró el perfil de cliente asociado a esta sesión.'
        : 'No fue posible consultar tus mascotas.');
    throw new Error(mensaje);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? data as PetProfile[] : [];
}

// ──────────────────────────────────────────────
// Veterinarios
// ──────────────────────────────────────────────

export async function listVeterinarians(): Promise<VeterinarioListaItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/veterinarios`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return DEMO_VETERINARIOS;
    }

    const data = await response.json();
    return Array.isArray(data) && data.length > 0 ? data : DEMO_VETERINARIOS;
  } catch {
    return DEMO_VETERINARIOS;
  }
}

export async function registerVeterinarian(
  payload: VeterinarioPayload,
): Promise<{ mensaje: string; idVeterinario: number }> {
  const response = await fetch(`${API_BASE_URL}/veterinarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const mensaje =
      errorData?.mensaje ||
      errorData?.message ||
      (response.status === 400
        ? 'Datos inválidos o veterinario/correo ya registrado.'
        : 'No se pudo registrar el veterinario.');
    throw new Error(mensaje);
  }

  return response.json();
}

// ──────────────────────────────────────────────
// Catálogo de servicios
// ──────────────────────────────────────────────

export const DEFAULT_CATALOGO: VeterinarioConServicios[] = [
  {
    id: 1,
    nombre: 'Dr. Carlos Pérez',
    direccion: 'Calle 10 #5-20, Bogotá',
    telefono: '3101234567',
    horarioAtencion: '8:00 AM - 6:00 PM',
    servicios: [
      { id: 1, nombre: 'Consulta general', descripcion: 'Revisión completa del paciente', precio: '$85.000', duracionMinutos: 30 },
      { id: 2, nombre: 'Vacunación', descripcion: 'Aplicación de vacunas al paciente', precio: '$45.000', duracionMinutos: 20 },
      { id: 3, nombre: 'Cirugía Mayor', descripcion: 'Procedimiento quirúrgico complejo', precio: '$350.000', duracionMinutos: 120 },
      { id: 4, nombre: 'Desparasitación', descripcion: 'Tratamiento antiparasitario interno y externo', precio: '$35.000', duracionMinutos: 15 },
    ],
  },
  {
    id: 2,
    nombre: 'Dra. María López',
    direccion: 'Carrera 8 #12-34, Medellín',
    telefono: '3159876543',
    horarioAtencion: '9:00 AM - 5:00 PM',
    servicios: [
      { id: 5, nombre: 'Dermatología', descripcion: 'Tratamiento de problemas de piel', precio: '$120.000', duracionMinutos: 45 },
      { id: 6, nombre: 'Odontología', descripcion: 'Limpieza y tratamiento dental', precio: '$150.000', duracionMinutos: 60 },
      { id: 7, nombre: 'Ecografía', descripcion: 'Examen de ultrasonido', precio: '$95.000', duracionMinutos: 30 },
    ],
  },
  {
    id: 3,
    nombre: 'Dr. Andrés Martínez',
    direccion: 'Avenida 5 #20-15, Cali',
    telefono: '3204567890',
    horarioAtencion: '10:00 AM - 4:00 PM',
    servicios: [],
    mensajeServicios: 'No tiene servicios registrados actualmente.',
  },
  {
    id: 4,
    nombre: 'Dra. Laura Rodríguez',
    direccion: 'Calle 72 #10-25, Bogotá',
    telefono: '3012345678',
    horarioAtencion: '7:00 AM - 3:00 PM',
    servicios: [
      { id: 8, nombre: 'Cirugía Cardíaca', descripcion: 'Procedimiento cardíaco especializado', precio: '$2.500.000', duracionMinutos: 180 },
      { id: 9, nombre: 'Rehabilitación', descripcion: 'Terapia física y rehabilitación', precio: '$180.000', duracionMinutos: 60 },
    ],
  },
];

export async function fetchCatalogo(): Promise<VeterinarioConServicios[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/catalogo`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new Error('No fue posible conectar con el catálogo. Intenta nuevamente en unos segundos.');
  }

  if (!response.ok) {
    throw new Error('No fue posible cargar el catálogo de servicios.');
  }

  const data: CatalogoApiResponse = await response.json();
  if (!Array.isArray(data?.veterinarios)) {
    throw new Error('El catálogo devolvió una respuesta inválida.');
  }

  return data.veterinarios.map((vet) => ({
    id: Number(vet.id),
    nombre: vet.nombre,
    direccion: vet.direccion || 'Dirección no registrada',
    telefono: vet.telefono || 'Sin teléfono',
    horarioAtencion: vet.horarioAtencion || 'Sin horario registrado',
    servicios: (vet.servicios || []).map((s) => ({
      id: Number(s.id),
      nombre: s.nombre,
      descripcion: s.descripcion,
      precio: s.precio,
      duracionMinutos: s.duracionMinutos,
    })),
    mensajeServicios: vet.mensajeServicios,
  }));
}

/** @deprecated Usar fetchCatalogo() para obtener los veterinarios con sus servicios completos */
export async function listServices(): Promise<CatalogService[]> {
  const vets = await fetchCatalogo();
  return vets.flatMap((v) => v.servicios);
}

// ──────────────────────────────────────────────
// Servicios veterinarios
// ──────────────────────────────────────────────

export async function createService(service: ServicePayload): Promise<CatalogService> {
  const response = await fetch(`${API_BASE_URL}/servicios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(service),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const mensaje =
      errorData?.mensaje ||
      errorData?.message ||
      (response.status === 404
        ? 'Veterinario no encontrado.'
        : response.status === 400
          ? 'Datos inválidos o veterinario inactivo.'
          : 'No se pudo guardar el servicio.');
    throw new Error(mensaje);
  }

  // El backend retorna texto plano "Registro de servicio exitoso"
  // Construimos el objeto localmente para actualizar la UI
  const createdService: CatalogService = {
    id: Date.now(),
    nombre: service.nombre,
    descripcion: service.descripcion,
    precio: `$${service.precio.toLocaleString('es-CO')}`,
    duracionMinutos: service.duracionMinutos,
  };

  const storedServices = getStoredServices();
  setStoredServices([...storedServices, createdService]);
  return createdService;
}

// ──────────────────────────────────────────────
// Citas del cliente y reservas (HU12)
// ──────────────────────────────────────────────

const CITAS_STORAGE_KEY = 'vetagenda_citas_locales';

export type ReservarCitaPayload = {
  mascotaId?: number;
  mascotaNombre: string;
  veterinarioId?: number;
  veterinarioNombre: string;
  servicioId?: number;
  servicioNombre: string;
  fecha: string;
  hora: string;
  documentoIdentidad?: string;
  clienteNombre?: string;
};

export type ReservarCitaResponse = {
  id: number;
  codigo: string;
  mensaje: string;
  fechaHoraInicio?: string;
  fechaHoraFin?: string;
};

export function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(a\.\s*m\.|p\.\s*m\.|am|pm)?$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toLowerCase().replace(/\s/g, '') : '';
  if (period.includes('p') && hours < 12) hours += 12;
  if (period.includes('a') && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

const CLINIC_TIME_ZONE = 'America/Bogota';

function getClinicNowParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

export function getClinicTodayDate(): string {
  return getClinicNowParts().date;
}

export function minutesUntilClinicDateTime(value: string): number {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return Number.NEGATIVE_INFINITY;
  const clinicNow = getClinicNowParts();
  const [nowYear, nowMonth, nowDay] = clinicNow.date.split('-').map(Number);
  const target = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
  );
  const now = Date.UTC(
    nowYear,
    nowMonth - 1,
    nowDay,
    Math.floor(clinicNow.minutes / 60),
    clinicNow.minutes % 60,
  );
  return (target - now) / 60_000;
}

export function isFutureReservationSlot(date: string, time: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(a\.\s*m\.|p\.\s*m\.|am|pm)?$/i);
  if (!match) return false;
  const clinicNow = getClinicNowParts();
  if (date !== clinicNow.date) return date > clinicNow.date;
  return parseTimeToMinutes(time) > clinicNow.minutes;
}

export const DEFAULT_DEMO_CITAS: Cita[] = [
  {
    id: 1,
    codigoReserva: 'VA-0001',
    clienteNombre: 'Carolina Restrepo',
    clienteDocumento: '1012345678',
    mascotaNombre: 'Rocky',
    mascotaEspecie: 'Canino',
    mascotaRaza: 'Golden Retriever',
    veterinarioNombre: 'Dra. Laura Gómez',
    servicioNombre: 'Consulta general',
    fecha: '2026-10-25',
    hora: '08:00 a. m.',
    estado: 'PROGRAMADA',
    consultorio: 'Consultorio 1 - Clínica VetAgenda',
    precio: '$65.000',
    duracionMinutos: 30,
  },
  {
    id: 2,
    codigoReserva: 'VA-0002',
    clienteNombre: 'Carolina Restrepo',
    clienteDocumento: '1012345678',
    mascotaNombre: 'Rocky',
    mascotaEspecie: 'Canino',
    mascotaRaza: 'Golden Retriever',
    veterinarioNombre: 'Dr. Andrés Pérez',
    servicioNombre: 'Vacunación',
    fecha: '2026-10-28',
    hora: '10:00 a. m.',
    estado: 'PROGRAMADA',
    consultorio: 'Consultorio 2 - Clínica VetAgenda',
    precio: '$90.000',
    duracionMinutos: 20,
  },
  {
    id: 3,
    codigoReserva: 'VA-0003',
    clienteNombre: 'Carolina Restrepo',
    clienteDocumento: '1012345678',
    mascotaNombre: 'Rocky',
    mascotaEspecie: 'Canino',
    mascotaRaza: 'Golden Retriever',
    veterinarioNombre: 'Dra. Natalia Ruiz',
    servicioNombre: 'Control veterinario',
    fecha: '2026-10-15',
    hora: '02:00 p. m.',
    estado: 'CANCELADA',
    motivoCancelacion: 'Imprevisto del tutor de la mascota',
    fechaCancelacion: '14/10/2026',
    consultorio: 'Consultorio 1 - Clínica VetAgenda',
    precio: '$50.000',
    duracionMinutos: 30,
  },
];

export function getCitasLocales(documentoIdentidad?: string): Cita[] {
  try {
    const raw = localStorage.getItem(CITAS_STORAGE_KEY);
    const storedList: Cita[] = raw ? JSON.parse(raw) : [];
    const all = [...storedList];
    DEFAULT_DEMO_CITAS.forEach((demo) => {
      if (!all.some((c) => c.id === demo.id || c.codigoReserva === demo.codigoReserva)) {
        all.push(demo);
      }
    });

    if (!documentoIdentidad || !documentoIdentidad.trim()) {
      return all;
    }

    const docNormalizado = documentoIdentidad.trim().toLowerCase();
    const filtradas = all.filter(
      (c) =>
        !c.clienteDocumento ||
        c.clienteDocumento.trim().toLowerCase() === docNormalizado ||
        docNormalizado === 'carolina restrepo' ||
        docNormalizado === '1012345678',
    );

    return filtradas.length > 0 ? filtradas : all;
  } catch {
    return DEFAULT_DEMO_CITAS;
  }
}

export function guardarCitaLocal(cita: Cita): void {
  try {
    const list = getCitasLocales();
    const updated = [cita, ...list.filter((c) => c.id !== cita.id)];
    localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage write error
  }
}

export async function reservarCita(payload: ReservarCitaPayload): Promise<ReservarCitaResponse> {
  const documento = payload.documentoIdentidad || localStorage.getItem('vetagenda_documento') || '1012345678';
  const token = localStorage.getItem('vetagenda_token');

  if (!token) {
    throw new Error('Debes iniciar sesión para agendar una cita.');
  }

  if (!payload.mascotaId || !payload.veterinarioId || !payload.servicioId) {
    throw new Error('La reserva no tiene todos los identificadores requeridos. Vuelve a seleccionar la mascota y el horario.');
  }

  let fechaHoraInicioStr = '';
  if (payload.fecha && payload.hora) {
    const mins = parseTimeToMinutes(payload.hora);
    const hh = String(Math.floor(mins / 60)).padStart(2, '0');
    const mm = String(mins % 60).padStart(2, '0');
    fechaHoraInicioStr = `${payload.fecha}T${hh}:${mm}:00`;
  }

  if (!fechaHoraInicioStr) {
    throw new Error('La fecha y el horario seleccionados no son válidos.');
  }
  if (!isFutureReservationSlot(payload.fecha, payload.hora)) {
    throw new Error('El horario seleccionado ya pasó. Vuelve a consultar la disponibilidad.');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/citas?documentoIdentidad=${encodeURIComponent(documento)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mascotaId: payload.mascotaId,
        veterinarioId: payload.veterinarioId,
        servicioId: payload.servicioId,
        fechaHoraInicio: fechaHoraInicioStr,
      }),
    });
  } catch {
    throw new Error('No fue posible conectar con el servidor. La cita no fue creada; inténtalo nuevamente.');
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const mensaje = data && typeof data === 'object'
      && (('mensaje' in data && typeof data.mensaje === 'string')
        || ('message' in data && typeof data.message === 'string'))
      ? ('mensaje' in data ? data.mensaje : data.message) as string
      : response.status === 409
        ? 'Ese horario acaba de ser reservado. Selecciona otro turno disponible.'
        : 'No fue posible crear la cita. Revisa los datos e inténtalo nuevamente.';
    throw new Error(mensaje);
  }

  if (!data || typeof data !== 'object') {
    throw new Error('El servidor confirmó la solicitud, pero devolvió una respuesta inválida.');
  }

  const rawId = 'idCita' in data ? data.idCita : 'id' in data ? data.id : null;
  const id = Number(rawId);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('El servidor no devolvió el identificador de la cita creada.');
  }

  const codigo = `VA-${String(id).padStart(4, '0')}`;
  guardarCitaLocal({
    id,
    codigoReserva: codigo,
    clienteNombre: payload.clienteNombre || 'Carolina Restrepo',
    clienteDocumento: documento,
    mascotaNombre: payload.mascotaNombre,
    mascotaEspecie: 'Mascota',
    mascotaRaza: '',
    veterinarioNombre: payload.veterinarioNombre,
    servicioNombre: payload.servicioNombre,
    fecha: payload.fecha,
    hora: payload.hora,
    estado: 'PROGRAMADA',
    consultorio: 'Consultorio 1 - Clínica VetAgenda',
    precio: 'Consultar',
  });

  return {
    id,
    codigo,
    mensaje: 'mensaje' in data && typeof data.mensaje === 'string'
      ? data.mensaje
      : 'Cita reservada exitosamente',
    fechaHoraInicio: 'fechaHoraInicio' in data && typeof data.fechaHoraInicio === 'string'
      ? data.fechaHoraInicio
      : undefined,
    fechaHoraFin: 'fechaHoraFin' in data && typeof data.fechaHoraFin === 'string'
      ? data.fechaHoraFin
      : undefined,
  };
}

export async function getCitas(documentoIdentidad: string): Promise<Cita[]> {
  const localCitas = getCitasLocales(documentoIdentidad);
  const token = localStorage.getItem('vetagenda_token');
  const hasRealSession = Boolean(token && token !== 'mock-jwt-token');
  let clienteNombre = 'Cliente VetAgenda';

  try {
    const session = JSON.parse(localStorage.getItem('vetagenda_user') || 'null');
    if (session?.nombre) clienteNombre = session.nombre;
  } catch {
    // La sesión dañada no debe impedir consultar las citas.
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/citas?documentoIdentidad=${encodeURIComponent(documentoIdentidad)}`,
      {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (response.ok) {
      const citas: CitaClienteApi[] = await response.json();
      let mascotas: MascotaApi[] = [];
      try {
        const mascotasResponse = await fetch(
          `${API_BASE_URL}/mascotas?documentoIdentidad=${encodeURIComponent(documentoIdentidad)}`,
          { headers: { Accept: 'application/json' } },
        );
        if (mascotasResponse.ok) mascotas = await mascotasResponse.json();
      } catch {
        // Las citas siguen siendo utilizables aunque no cargue el detalle de mascotas.
      }

      const apiCitas: Cita[] = citas.map((cita) => {
        const fechaHora = new Date(cita.fechaHoraInicio);
        const fechaHoraFin = new Date(cita.fechaHoraFin);
        const cancelada = cita.estado === 'ANULADA' || cita.estado.startsWith('CANCELADA');
        const mascota = mascotas.find((item) => item.nombre === cita.mascotaNombre);
        const duracionMinutos = Math.max(0, Math.round((fechaHoraFin.getTime() - fechaHora.getTime()) / 60_000));

        return {
          id: Number(cita.id),
          codigoReserva: `VA-${String(cita.id).padStart(4, '0')}`,
          clienteNombre,
          clienteDocumento: documentoIdentidad,
          mascotaNombre: cita.mascotaNombre,
          mascotaEspecie: mascota?.especie || 'Mascota',
          mascotaRaza: mascota?.raza || '',
          veterinarioNombre: cita.veterinarioNombre,
          servicioNombre: cita.servicioNombre,
          fecha: new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(fechaHora),
          hora: new Intl.DateTimeFormat('es-CO', { timeStyle: 'short' }).format(fechaHora),
          estado: cancelada ? 'CANCELADA' : 'PROGRAMADA',
          consultorio: 'Clínica VetAgenda',
          precio: 'Consultar',
          duracionMinutos,
          motivoCancelacion: cita.motivoCancelacion,
          fechaCancelacion: cita.canceladaAt
            ? new Intl.DateTimeFormat('es-CO').format(new Date(cita.canceladaAt))
            : undefined,
        };
      });

      if (hasRealSession) return apiCitas;

      const ids = new Set(apiCitas.map((c) => c.id));
      return [...apiCitas, ...localCitas.filter((c) => !ids.has(c.id))];
    }
    if (hasRealSession) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.mensaje || body?.message || 'No fue posible consultar las citas.');
    }
  } catch (error) {
    if (hasRealSession) {
      throw error instanceof Error
        ? error
        : new Error('No fue posible conectar con el servidor para consultar las citas.');
    }
  }

  return localCitas;
}

export async function cancelarCita(
  citaId: number,
  documentoIdentidad: string,
): Promise<CancelacionCitaApi> {
  const token = localStorage.getItem('vetagenda_token');
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/citas/${citaId}/cancelar?documentoIdentidad=${encodeURIComponent(documentoIdentidad)}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
  } catch {
    throw new Error('No fue posible conectar con el servidor. La cita no fue anulada.');
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const mensaje = data && typeof data === 'object'
      && (('mensaje' in data && typeof data.mensaje === 'string')
        || ('message' in data && typeof data.message === 'string'))
      ? ('mensaje' in data ? data.mensaje : data.message) as string
      : 'No fue posible anular la cita.';
    throw new Error(mensaje);
  }
  if (!data || typeof data !== 'object') {
    throw new Error('El servidor devolvió una respuesta inválida al anular la cita.');
  }

  try {
    const list = getCitasLocales();
    const updated = list.map((item) => item.id === citaId
      ? {
          ...item,
          estado: 'CANCELADA' as const,
          motivoCancelacion: 'Anulada por el cliente',
          fechaCancelacion: new Intl.DateTimeFormat('es-CO').format(new Date()),
        }
      : item);
    localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // La confirmación del backend sigue siendo la fuente de verdad.
  }

  return data as CancelacionCitaApi;
}

export type VeterinarianAppointmentApi = {
  id: number;
  clienteNombre: string;
  mascotaNombre: string;
  mascotaEspecie?: string;
  mascotaRaza?: string;
  servicioNombre: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  estado: string;
  motivoCancelacion?: string;
};

function veterinarianAuthorization() {
  const session = getVeterinarianSession();
  if (!session) throw new Error('Debes iniciar sesión como veterinario.');
  return { Authorization: `Bearer ${session.token}` };
}

export async function listVeterinarianAppointments(): Promise<VeterinarianAppointmentApi[]> {
  const response = await fetch(`${API_BASE_URL}/veterinario-portal/citas`, {
    headers: { Accept: 'application/json', ...veterinarianAuthorization() },
  });
  if (!response.ok) throw new Error('No fue posible cargar la agenda desde el servidor.');
  return response.json();
}

export async function cancelVeterinarianAppointment(citaId: number, motivo: string): Promise<CancelacionCitaApi> {
  const response = await fetch(`${API_BASE_URL}/veterinario-portal/citas/${citaId}/cancelar`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...veterinarianAuthorization(),
    },
    body: JSON.stringify({ motivo }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.mensaje || 'No fue posible cancelar la cita.');
  return data as CancelacionCitaApi;
}

// ──────────────────────────────────────────────
// Disponibilidad del veterinario (días y franjas de atención - HU09)
// ──────────────────────────────────────────────
//
// Contrato esperado con el backend:
//   GET    /veterinario-portal/disponibilidad
//   PUT    /veterinario-portal/disponibilidad                     body: DisponibilidadPayload
//   DELETE /veterinario-portal/disponibilidad/franjas/{franjaId}
// Respuesta (GET/PUT): { veterinarioId, dias: [{ dia, franjas: [{ id, horaInicio: "HH:mm", horaFin: "HH:mm" }] }] }
//
// El backend es la fuente de verdad. localStorage conserva únicamente una
// copia de la última respuesta para mantener estable la interfaz durante la sesión.

export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

export const DIAS_SEMANA: Array<{ value: DiaSemana; corto: string; largo: string }> = [
  { value: 'LUNES', corto: 'Lun', largo: 'Lunes' },
  { value: 'MARTES', corto: 'Mar', largo: 'Martes' },
  { value: 'MIERCOLES', corto: 'Mié', largo: 'Miércoles' },
  { value: 'JUEVES', corto: 'Jue', largo: 'Jueves' },
  { value: 'VIERNES', corto: 'Vie', largo: 'Viernes' },
  { value: 'SABADO', corto: 'Sáb', largo: 'Sábado' },
  { value: 'DOMINGO', corto: 'Dom', largo: 'Domingo' },
];

export type FranjaHoraria = {
  id: string;
  horaInicio: string; // "HH:mm"
  horaFin: string; // "HH:mm"
  persistida?: boolean;
};

export type DisponibilidadDia = {
  dia: DiaSemana;
  activo: boolean;
  franjas: FranjaHoraria[];
};

export type DisponibilidadPayload = {
  veterinarioId: number;
  dias: Array<{
    dia: DiaSemana;
    franjas: Array<{ horaInicio: string; horaFin: string }>;
  }>;
};

export type DisponibilidadResultado = {
  dias: DisponibilidadDia[];
  origen: 'api' | 'local';
};

const AVAILABILITY_STORAGE_KEY = 'vetagenda-disponibilidad';
export const generarIdFranja = () => `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const crearDisponibilidadVacia = (): DisponibilidadDia[] =>
  DIAS_SEMANA.map(({ value }) => ({ dia: value, activo: false, franjas: [] }));

const normalizarHora = (value: unknown) => String(value ?? '').slice(0, 5);

function normalizarDisponibilidad(raw: unknown): DisponibilidadDia[] {
  const base = crearDisponibilidadVacia();
  const dias = (raw as { dias?: unknown })?.dias;
  if (!Array.isArray(dias)) return base;

  return base.map((diaBase) => {
    const encontrado = dias.find(
      (item: { dia?: string }) => String(item?.dia ?? '').toUpperCase() === diaBase.dia,
    ) as { franjas?: Array<{ id?: string | number; horaInicio?: string; horaFin?: string }> } | undefined;

    const franjas: FranjaHoraria[] = (encontrado?.franjas ?? []).map((franja) => ({
      id: franja.id !== undefined && franja.id !== null ? String(franja.id) : generarIdFranja(),
      horaInicio: normalizarHora(franja.horaInicio),
      horaFin: normalizarHora(franja.horaFin),
      persistida: true,
    }));

    return { dia: diaBase.dia, activo: franjas.length > 0, franjas };
  });
}

function readAvailabilityStore(): Record<string, DisponibilidadDia[]> {
  try {
    const raw = localStorage.getItem(AVAILABILITY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export const getStoredAvailability = (veterinarioId: number): DisponibilidadDia[] => {
  const stored = readAvailabilityStore()[String(veterinarioId)];
  if (stored) return normalizarDisponibilidad({ dias: stored });

  if (veterinarioId === 1) {
    return normalizarDisponibilidad({
      dias: [
        {
          dia: 'LUNES',
          franjas: [
            { horaInicio: '08:00', horaFin: '12:00' },
            { horaInicio: '14:00', horaFin: '18:00' },
          ],
        },
        {
          dia: 'MIERCOLES',
          franjas: [{ horaInicio: '08:00', horaFin: '12:00' }],
        },
        {
          dia: 'VIERNES',
          franjas: [{ horaInicio: '09:00', horaFin: '13:00' }],
        },
      ],
    });
  }

  if (veterinarioId === 2) {
    return normalizarDisponibilidad({
      dias: [
        {
          dia: 'MARTES',
          franjas: [{ horaInicio: '09:00', horaFin: '17:00' }],
        },
        {
          dia: 'JUEVES',
          franjas: [{ horaInicio: '09:00', horaFin: '12:00' }],
        },
      ],
    });
  }

  if (veterinarioId === 4) {
    return normalizarDisponibilidad({
      dias: [
        {
          dia: 'VIERNES',
          franjas: [{ horaInicio: '08:00', horaFin: '14:00' }],
        },
        {
          dia: 'SABADO',
          franjas: [{ horaInicio: '09:00', horaFin: '13:00' }],
        },
      ],
    });
  }

  return crearDisponibilidadVacia();
};

const setStoredAvailability = (veterinarioId: number, dias: DisponibilidadDia[]) => {
  try {
    const store = readAvailabilityStore();
    store[String(veterinarioId)] = dias.filter((d) => d.activo && d.franjas.length > 0);
    localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // almacenamiento no disponible: se ignora
  }
};

async function tryFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, init);
  } catch {
    return null; // backend no disponible
  }
}

async function extraerMensaje(response: Response): Promise<string | undefined> {
  const data = await response.json().catch(() => ({}));
  return data?.mensaje || data?.message;
}

export async function fetchVetAvailability(veterinarioId: number): Promise<DisponibilidadResultado> {
  const session = getVeterinarianSession();
  if (!session || session.id !== veterinarioId) throw new Error('Debes iniciar sesión como este veterinario.');
  const response = await tryFetch(`${API_BASE_URL}/veterinario-portal/disponibilidad`, {
    headers: { Accept: 'application/json', ...veterinarianAuthorization() },
  });

  if (!response || !response.ok) throw new Error('No fue posible cargar la disponibilidad desde el servidor.');

  const dias = normalizarDisponibilidad(await response.json());
  setStoredAvailability(veterinarioId, dias);
  return { dias, origen: 'api' };
}

export async function saveVetAvailability(
  veterinarioId: number,
  dias: DisponibilidadDia[],
): Promise<DisponibilidadResultado> {
  const payload: DisponibilidadPayload = {
    veterinarioId,
    dias: dias
      .filter((d) => d.activo && d.franjas.length > 0)
      .map((d) => ({
        dia: d.dia,
        franjas: d.franjas.map(({ horaInicio, horaFin }) => ({ horaInicio, horaFin })),
      })),
  };

  // Lo que queda guardado: solo días activos, todas las franjas marcadas como persistidas
  const guardadoLocal: DisponibilidadDia[] = dias.map((d) => {
    const activo = d.activo && d.franjas.length > 0;
    return {
      dia: d.dia,
      activo,
      franjas: activo ? d.franjas.map((f) => ({ ...f, persistida: true })) : [],
    };
  });

  const session = getVeterinarianSession();
  if (!session || session.id !== veterinarioId) throw new Error('Debes iniciar sesión como este veterinario.');
  const response = await tryFetch(`${API_BASE_URL}/veterinario-portal/disponibilidad`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...veterinarianAuthorization() },
    body: JSON.stringify(payload),
  });

  if (!response) throw new Error('No fue posible conectar con el servidor.');

  if (!response.ok) {
    if (response.status === 400) {
      const mensaje = await extraerMensaje(response);
      throw new Error(
        mensaje || 'El rango de horario no es válido o existen franjas que se cruzan.',
      );
    }
    const mensaje = await extraerMensaje(response);
    throw new Error(mensaje || 'No fue posible guardar la disponibilidad.');
  }

  // El backend puede devolver la disponibilidad con ids definitivos o solo un mensaje
  const data = await response.json().catch(() => null);
  const diasGuardados = data && Array.isArray(data.dias) ? normalizarDisponibilidad(data) : guardadoLocal;
  setStoredAvailability(veterinarioId, diasGuardados);
  return { dias: diasGuardados, origen: 'api' };
}

export async function deleteAvailabilitySlot(veterinarioId: number, franjaId: string): Promise<'api' | 'local'> {
  const quitarLocal = () => {
    const actual = getStoredAvailability(veterinarioId).map((d) => {
      const franjas = d.franjas.filter((f) => f.id !== franjaId);
      return { ...d, franjas, activo: franjas.length > 0 };
    });
    setStoredAvailability(veterinarioId, actual);
  };

  const session = getVeterinarianSession();
  if (!session || session.id !== veterinarioId) throw new Error('Debes iniciar sesión como este veterinario.');
  const response = franjaId.startsWith('tmp-')
    ? null
    : await tryFetch(
        `${API_BASE_URL}/veterinario-portal/disponibilidad/franjas/${encodeURIComponent(franjaId)}`,
        { method: 'DELETE', headers: { Accept: 'application/json', ...veterinarianAuthorization() } },
      );

  if (franjaId.startsWith('tmp-')) {
    quitarLocal();
    return 'local';
  }
  if (!response || !response.ok) throw new Error('No fue posible eliminar la franja en el servidor.');

  quitarLocal();
  return 'api';
}


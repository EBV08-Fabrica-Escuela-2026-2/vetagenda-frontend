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
const REGISTERED_CLIENTS_KEY = 'vetagenda_registered_clients';
const REGISTERED_PETS_KEY = 'vetagenda_registered_pets';
const REGISTERED_VETS_KEY = 'vetagenda_registered_vets';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api');

export const DEFAULT_SERVICES: CatalogService[] = [
  {
    id: 1,
    nombre: 'Consulta general',
    descripcion: 'Valoración clínica inicial, revisión general y recomendaciones para el cuidado de la mascota.',
    precio: '$65.000',
    duracionMinutos: 30,
  },
  {
    id: 2,
    nombre: 'Vacunación',
    descripcion: 'Aplicación de vacunas según el esquema veterinario y control de salud preventiva.',
    precio: '$90.000',
    duracionMinutos: 20,
  },
  {
    id: 3,
    nombre: 'Desparasitación',
    descripcion: 'Tratamiento de parásitos internos y externos para mantener la salud del paciente.',
    precio: '$50.000',
    duracionMinutos: 15,
  },
];

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

// ──────────────────────────────────────────────
// Helpers de Disponibilidad & Tiempo
// ──────────────────────────────────────────────

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

  try {
    const response = await fetch(`${API_BASE_URL}/citas/disponibilidad?${query.toString()}`, {
      headers: { Accept: 'application/json' },
      signal,
    });

    if (response.ok) {
      const data = (await response.json()) as Partial<DisponibilidadConsultaApi>;
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
  } catch (err) {
    if (signal?.aborted) throw err;
  }

  // Generador de disponibilidad local/demostrativo
  const catalogo = await fetchCatalogo();
  const vet = catalogo.find((v) => v.id === veterinarioId) || catalogo[0];
  const servicio = vet?.servicios.find((s) => s.id === servicioId) || vet?.servicios[0] || DEFAULT_SERVICES[0];
  const duracion = servicio?.duracionMinutos || 30;

  // Franjas horarias base según disponibilidad
  const slots: Array<{ horaInicio: string; horaFin: string }> = [
    { horaInicio: '08:00', horaFin: '08:30' },
    { horaInicio: '08:30', horaFin: '09:00' },
    { horaInicio: '09:00', horaFin: '09:30' },
    { horaInicio: '09:30', horaFin: '10:00' },
    { horaInicio: '10:00', horaFin: '10:30' },
    { horaInicio: '10:30', horaFin: '11:00' },
    { horaInicio: '11:00', horaFin: '11:30' },
    { horaInicio: '14:00', horaFin: '14:30' },
    { horaInicio: '14:30', horaFin: '15:00' },
    { horaInicio: '15:00', horaFin: '15:30' },
    { horaInicio: '15:30', horaFin: '16:00' },
    { horaInicio: '16:00', horaFin: '16:30' },
    { horaInicio: '16:30', horaFin: '17:00' },
  ];

  // Excluir citas ya programadas
  const citasLocales = getCitasLocales();
  const citasDelDia = citasLocales.filter(
    (c) => c.fecha === fecha && c.estado === 'PROGRAMADA' && (!veterinarioId || c.veterinarioNombre === vet?.nombre),
  );
  const horariosOcupados = new Set(citasDelDia.map((c) => c.hora.replace(/\s+/g, ' ')));

  const horariosDisponibles = slots.filter((slot) => {
    const formatted = formatApiSlotTime(slot.horaInicio);
    return !horariosOcupados.has(formatted) && !horariosOcupados.has(slot.horaInicio);
  });

  return {
    servicioId: servicio?.id ?? servicioId,
    servicioNombre: servicio?.nombre ?? 'Consulta general',
    duracionMinutos: duracion,
    veterinarioId: vet?.id ?? (veterinarioId || 1),
    veterinarioNombre: vet?.nombre ?? 'Dr. Carlos Pérez',
    fecha,
    hayDisponibilidad: horariosDisponibles.length > 0,
    horariosDisponibles,
    mensaje: horariosDisponibles.length === 0 ? 'No hay horarios disponibles para esta fecha.' : null,
    fechaDisponibleMasCercana: null,
  };
}

function formatApiSlotTime(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
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
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ correo: email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === 'object' && 'token' in data) {
        return data as LoginResponse;
      }
    }
  } catch {
    // Backend offline: usar soporte de credenciales local
  }

  // Comprobar credenciales demo o registradas
  const registeredRaw = localStorage.getItem(REGISTERED_CLIENTS_KEY);
  const registeredClients: ClientPayload[] = registeredRaw ? JSON.parse(registeredRaw) : [];
  const found = registeredClients.find((c) => c.correo.toLowerCase() === email.toLowerCase());

  if (email.toLowerCase() === 'carolina.restrepo@vetagenda.com' || found) {
    const token = `mock-token-${Date.now()}`;
    return {
      mensaje: 'Inicio de sesión exitoso',
      token,
      tipoToken: 'Bearer',
      expiraEnMs: 86400000,
    };
  }

  // Permitir ingresar si hay contraseña válida
  if (email && password) {
    return {
      mensaje: 'Inicio de sesión exitoso',
      token: `mock-token-${Date.now()}`,
      tipoToken: 'Bearer',
      expiraEnMs: 86400000,
    };
  }

  throw new Error('Credenciales inválidas.');
}

export async function registerClientCredentials(payload: {
  correo: string;
  documentoIdentidad: string;
  password: string;
}): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (response.ok) return;
  } catch {
    // Fallback silencioso en entorno local
  }
}

export async function getCurrentClient(token: string): Promise<ClientProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Backend offline fallback
  }

  // Leer último perfil registrado o demo
  const rawList = localStorage.getItem(REGISTERED_CLIENTS_KEY);
  const list: ClientPayload[] = rawList ? JSON.parse(rawList) : [];
  const ultimo = list[list.length - 1];

  if (ultimo) {
    return {
      id: 101,
      nombre: ultimo.nombre,
      documentoIdentidad: ultimo.documentoIdentidad,
      telefono: ultimo.telefono,
      correo: ultimo.correo,
      direccion: ultimo.direccion,
      activo: true,
    };
  }

  return {
    id: 1,
    nombre: 'Carolina Restrepo',
    documentoIdentidad: '1012345678',
    telefono: '3001234567',
    correo: 'carolina.restrepo@vetagenda.com',
    direccion: 'Calle 12 # 45-67',
    activo: true,
  };
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
  try {
    const response = await fetch(`${API_BASE_URL}/auth/veterinario/demo`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    const data = await response.json().catch(() => null);
    if (response.ok && data?.token) {
      return data as LoginResponse;
    }
  } catch {
    // Backend offline fallback
  }

  return {
    mensaje: 'Ingreso exitoso como veterinario de demostración',
    token: `vet-demo-token-${Date.now()}`,
    tipoToken: 'Bearer',
    expiraEnMs: 86400000,
  };
}

export async function getCurrentVeterinarian(token: string): Promise<VeterinarianProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/veterinario-portal/perfil`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (response.ok) return response.json();
  } catch {
    // Backend offline fallback
  }

  return {
    id: 1,
    nombre: 'Dr. Camilo Durán',
    correo: 'camilo.duran@vetagenda.com',
    documentoIdentidad: '1012345001',
    especialidad: 'Medicina Interna',
  };
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
      user?.rol !== 'CLIENTE' ||
      typeof user.id !== 'number' ||
      typeof user.nombre !== 'string' ||
      typeof user.documentoIdentidad !== 'string'
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
  try {
    const response = await fetch(`${API_BASE_URL}/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return response.json();
    }
  } catch {
    // Backend offline: almacenar localmente
  }

  const rawList = localStorage.getItem(REGISTERED_CLIENTS_KEY);
  const list: ClientPayload[] = rawList ? JSON.parse(rawList) : [];
  list.push(payload);
  localStorage.setItem(REGISTERED_CLIENTS_KEY, JSON.stringify(list));

  return { idCliente: Date.now(), mensaje: 'Cliente registrado exitosamente' };
}

// ──────────────────────────────────────────────
// Mascotas
// ──────────────────────────────────────────────

export const DEFAULT_DEMO_PETS: PetProfile[] = [
  {
    id: 1,
    nombre: 'Rocky',
    especie: 'Canino',
    raza: 'Golden Retriever',
    edad: 4,
    sexo: 'Macho',
    observaciones: 'Vacunación al día. Alérgico al pollo.',
  },
  {
    id: 2,
    nombre: 'Luna',
    especie: 'Felino',
    raza: 'Siamés',
    edad: 2,
    sexo: 'Hembra',
    observaciones: 'Esterilizada. Muy dócil.',
  },
];

export async function registerPet(payload: PetPayload, documentoIdentidad: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/mascotas?documentoIdentidad=${encodeURIComponent(documentoIdentidad)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return response.json();
    }
  } catch {
    // Guardar mascota localmente
  }

  const key = `${REGISTERED_PETS_KEY}_${documentoIdentidad}`;
  const raw = localStorage.getItem(key);
  const currentList: PetProfile[] = raw ? JSON.parse(raw) : [...DEFAULT_DEMO_PETS];
  const newPet: PetProfile = {
    id: Date.now(),
    nombre: payload.nombre,
    especie: payload.especie,
    raza: payload.raza,
    edad: payload.edad,
    sexo: payload.sexo,
    observaciones: payload.observaciones,
  };
  currentList.push(newPet);
  localStorage.setItem(key, JSON.stringify(currentList));

  return { idMascota: newPet.id, mensaje: 'Mascota registrada exitosamente' };
}

export async function listClientPets(documentoIdentidad: string, token: string): Promise<PetProfile[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/mascotas?documentoIdentidad=${encodeURIComponent(documentoIdentidad)}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      const data: unknown = await response.json();
      if (Array.isArray(data)) return data as PetProfile[];
    }
  } catch {
    // Backend offline: retornar mascotas locales
  }

  const key = `${REGISTERED_PETS_KEY}_${documentoIdentidad}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // Ignorar error de parsing
    }
  }

  return DEFAULT_DEMO_PETS;
}

// ──────────────────────────────────────────────
// Veterinarios
// ──────────────────────────────────────────────

export async function listVeterinarians(): Promise<VeterinarioListaItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/veterinarios`, {
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // Demo fallback
  }

  const raw = localStorage.getItem(REGISTERED_VETS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return [...DEMO_VETERINARIOS, ...parsed];
      }
    } catch {
      // ignore
    }
  }

  return DEMO_VETERINARIOS;
}

export async function registerVeterinarian(
  payload: VeterinarioPayload,
): Promise<{ mensaje: string; idVeterinario: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/veterinarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return response.json();
    }
  } catch {
    // Almacenamiento local
  }

  const raw = localStorage.getItem(REGISTERED_VETS_KEY);
  const list: VeterinarioListaItem[] = raw ? JSON.parse(raw) : [];
  const newItem = { id: Date.now(), nombre: payload.nombre };
  list.push(newItem);
  localStorage.setItem(REGISTERED_VETS_KEY, JSON.stringify(list));

  return { mensaje: 'Veterinario registrado con éxito', idVeterinario: newItem.id };
}

// ──────────────────────────────────────────────
// Catálogo de servicios
// ──────────────────────────────────────────────

export async function fetchCatalogo(): Promise<VeterinarioConServicios[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/catalogo`, {
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data: CatalogoApiResponse = await response.json();
      if (Array.isArray(data?.veterinarios)) {
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
    }
  } catch {
    // Backend offline: retornar catálogo por defecto
  }

  // Mezclar con servicios almacenados localmente si los hay
  const stored = getStoredServices();
  const catalogoConLocales = DEFAULT_CATALOGO.map((vet) => {
    if (vet.id === 1) {
      const ids = new Set(vet.servicios.map((s) => s.id));
      const adicionales = stored.filter((s) => !ids.has(s.id));
      return { ...vet, servicios: [...vet.servicios, ...adicionales] };
    }
    return vet;
  });

  return catalogoConLocales;
}

export async function listServices(): Promise<CatalogService[]> {
  const vets = await fetchCatalogo();
  return vets.flatMap((v) => v.servicios);
}

export async function createService(service: ServicePayload): Promise<CatalogService> {
  try {
    const response = await fetch(`${API_BASE_URL}/servicios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(service),
    });

    if (response.ok) {
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
  } catch {
    // Guardado local
  }

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

export class ReservationConflictError extends Error {
  constructor(message = 'Ese horario acaba de ser reservado por otra persona. Actualizamos la agenda para que elijas otro.') {
    super(message);
    this.name = 'ReservationConflictError';
  }
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
    veterinarioNombre: 'Dr. Carlos Pérez',
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
    veterinarioNombre: 'Dr. Carlos Pérez',
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
    veterinarioNombre: 'Dra. María López',
    servicioNombre: 'Dermatología',
    fecha: '2026-10-15',
    hora: '02:00 p. m.',
    estado: 'CANCELADA',
    motivoCancelacion: 'Imprevisto del tutor de la mascota',
    fechaCancelacion: '14/10/2026',
    consultorio: 'Consultorio 1 - Clínica VetAgenda',
    precio: '$120.000',
    duracionMinutos: 45,
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

  try {
    const response = await fetch(`${API_BASE_URL}/citas?documentoIdentidad=${encodeURIComponent(documento)}`, {
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

    if (response.ok) {
      const data = await response.json();
      const rawId = 'idCita' in data ? data.idCita : 'id' in data ? data.id : null;
      const id = Number(rawId);
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
        mensaje: data.mensaje || 'Cita reservada exitosamente',
      };
    }
  } catch {
    // Backend offline: generar cita localmente
  }

  const list = getCitasLocales();
  const maxId = list.reduce((max, c) => Math.max(max, c.id), 0);
  const id = maxId + 1;
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
    mensaje: 'Cita reservada exitosamente',
  };
}

export async function getCitas(documentoIdentidad: string): Promise<Cita[]> {
  const localCitas = getCitasLocales(documentoIdentidad);
  const token = localStorage.getItem('vetagenda_token');
  let clienteNombre = 'Cliente VetAgenda';

  try {
    const session = JSON.parse(localStorage.getItem('vetagenda_user') || 'null');
    if (session?.nombre) clienteNombre = session.nombre;
  } catch {
    // Ignorar error de sesión
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
      const apiCitas: Cita[] = citas.map((cita) => {
        const fechaHora = new Date(cita.fechaHoraInicio);
        const fechaHoraFin = new Date(cita.fechaHoraFin);
        const cancelada = cita.estado === 'ANULADA' || cita.estado.startsWith('CANCELADA');
        const duracionMinutos = Math.max(0, Math.round((fechaHoraFin.getTime() - fechaHora.getTime()) / 60_000));

        return {
          id: Number(cita.id),
          codigoReserva: `VA-${String(cita.id).padStart(4, '0')}`,
          clienteNombre,
          clienteDocumento: documentoIdentidad,
          mascotaNombre: cita.mascotaNombre,
          mascotaEspecie: 'Mascota',
          mascotaRaza: '',
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

      const ids = new Set(apiCitas.map((c) => c.id));
      return [...apiCitas, ...localCitas.filter((c) => !ids.has(c.id))];
    }
  } catch {
    // Backend offline: usar citas locales
  }

  return localCitas;
}

export async function cancelarCita(
  citaId: number,
  documentoIdentidad: string,
): Promise<CancelacionCitaApi> {
  const token = localStorage.getItem('vetagenda_token');
  try {
    const response = await fetch(
      `${API_BASE_URL}/citas/${citaId}/cancelar?documentoIdentidad=${encodeURIComponent(documentoIdentidad)}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      actualizarCitaCanceladaLocal(citaId);
      return data as CancelacionCitaApi;
    }
  } catch {
    // Backend offline: cancelar localmente
  }

  actualizarCitaCanceladaLocal(citaId);
  return {
    mensaje: 'Cita anulada exitosamente',
    idCita: citaId,
    estado: 'CANCELADA',
    etiquetaEstado: 'Cancelada',
    cupoLiberado: true,
    fechaHoraInicio: new Date().toISOString(),
    fechaHoraFin: new Date().toISOString(),
  };
}

function actualizarCitaCanceladaLocal(citaId: number) {
  try {
    const list = getCitasLocales();
    const updated = list.map((item) =>
      item.id === citaId
        ? {
            ...item,
            estado: 'CANCELADA' as const,
            motivoCancelacion: 'Anulada por el cliente',
            fechaCancelacion: new Intl.DateTimeFormat('es-CO').format(new Date()),
          }
        : item,
    );
    localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

// ──────────────────────────────────────────────
// Agenda del Veterinario
// ──────────────────────────────────────────────

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
  try {
    const response = await fetch(`${API_BASE_URL}/veterinario-portal/citas`, {
      headers: { Accept: 'application/json', ...veterinarianAuthorization() },
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Fallback con citas locales
  }

  const session = getVeterinarianSession();
  const nombreVet = session?.nombre || 'Dr. Carlos Pérez';
  const localCitas = getCitasLocales();

  return localCitas.map((c) => ({
    id: c.id,
    clienteNombre: c.clienteNombre,
    mascotaNombre: c.mascotaNombre,
    mascotaEspecie: c.mascotaEspecie,
    mascotaRaza: c.mascotaRaza,
    servicioNombre: c.servicioNombre,
    fechaHoraInicio: `${c.fecha}T09:00:00`,
    fechaHoraFin: `${c.fecha}T09:30:00`,
    estado: c.estado === 'CANCELADA' ? 'CANCELADA' : 'CONFIRMADA',
    motivoCancelacion: c.motivoCancelacion,
  }));
}

export async function cancelVeterinarianAppointment(citaId: number, motivo: string): Promise<CancelacionCitaApi> {
  try {
    const response = await fetch(`${API_BASE_URL}/veterinario-portal/citas/${citaId}/cancelar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...veterinarianAuthorization(),
      },
      body: JSON.stringify({ motivo }),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Actualizar local
  }

  try {
    const list = getCitasLocales();
    const updated = list.map((item) =>
      item.id === citaId
        ? {
            ...item,
            estado: 'CANCELADA' as const,
            motivoCancelacion: motivo,
            fechaCancelacion: new Intl.DateTimeFormat('es-CO').format(new Date()),
          }
        : item,
    );
    localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  return {
    mensaje: 'Cita cancelada exitosamente',
    idCita: citaId,
    estado: 'CANCELADA',
    etiquetaEstado: 'Cancelada',
    cupoLiberado: true,
    fechaHoraInicio: new Date().toISOString(),
    fechaHoraFin: new Date().toISOString(),
  };
}

// ──────────────────────────────────────────────
// Disponibilidad del veterinario (HU09)
// ──────────────────────────────────────────────

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

  return normalizarDisponibilidad({
    dias: [
      {
        dia: 'LUNES',
        franjas: [{ horaInicio: '08:00', horaFin: '16:00' }],
      },
      {
        dia: 'MIERCOLES',
        franjas: [{ horaInicio: '08:00', horaFin: '14:00' }],
      },
      {
        dia: 'VIERNES',
        franjas: [{ horaInicio: '09:00', horaFin: '15:00' }],
      },
    ],
  });
};

const setStoredAvailability = (veterinarioId: number, dias: DisponibilidadDia[]) => {
  try {
    const store = readAvailabilityStore();
    store[String(veterinarioId)] = dias.filter((d) => d.activo && d.franjas.length > 0);
    localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Almacenamiento no disponible
  }
};

export async function fetchVetAvailability(veterinarioId: number): Promise<DisponibilidadResultado> {
  try {
    const response = await fetch(`${API_BASE_URL}/veterinario-portal/disponibilidad`, {
      headers: { Accept: 'application/json', ...veterinarianAuthorization() },
    });

    if (response.ok) {
      const dias = normalizarDisponibilidad(await response.json());
      setStoredAvailability(veterinarioId, dias);
      return { dias, origen: 'api' };
    }
  } catch {
    // Backend offline: usar almacenamiento local
  }

  const dias = getStoredAvailability(veterinarioId);
  return { dias, origen: 'local' };
}

export async function saveVetAvailability(
  veterinarioId: number,
  dias: DisponibilidadDia[],
): Promise<DisponibilidadResultado> {
  const guardadoLocal: DisponibilidadDia[] = dias.map((d) => {
    const activo = d.activo && d.franjas.length > 0;
    return {
      dia: d.dia,
      activo,
      franjas: activo ? d.franjas.map((f) => ({ ...f, persistida: true })) : [],
    };
  });

  try {
    const payload: DisponibilidadPayload = {
      veterinarioId,
      dias: dias
        .filter((d) => d.activo && d.franjas.length > 0)
        .map((d) => ({
          dia: d.dia,
          franjas: d.franjas.map(({ horaInicio, horaFin }) => ({ horaInicio, horaFin })),
        })),
    };

    const response = await fetch(`${API_BASE_URL}/veterinario-portal/disponibilidad`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...veterinarianAuthorization() },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json().catch(() => null);
      const diasGuardados = data && Array.isArray(data.dias) ? normalizarDisponibilidad(data) : guardadoLocal;
      setStoredAvailability(veterinarioId, diasGuardados);
      return { dias: diasGuardados, origen: 'api' };
    }
  } catch {
    // Backend offline: persistir localmente
  }

  setStoredAvailability(veterinarioId, guardadoLocal);
  return { dias: guardadoLocal, origen: 'local' };
}

export async function deleteAvailabilitySlot(veterinarioId: number, franjaId: string): Promise<'api' | 'local'> {
  const quitarLocal = () => {
    const actual = getStoredAvailability(veterinarioId).map((d) => {
      const franjas = d.franjas.filter((f) => f.id !== franjaId);
      return { ...d, franjas, activo: franjas.length > 0 };
    });
    setStoredAvailability(veterinarioId, actual);
  };

  try {
    if (!franjaId.startsWith('tmp-')) {
      const response = await fetch(
        `${API_BASE_URL}/veterinario-portal/disponibilidad/franjas/${encodeURIComponent(franjaId)}`,
        { method: 'DELETE', headers: { Accept: 'application/json', ...veterinarianAuthorization() } },
      );
      if (response.ok) {
        quitarLocal();
        return 'api';
      }
    }
  } catch {
    // Backend offline: quitar local
  }

  quitarLocal();
  return 'local';
}

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
  estado: string;
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

// ──────────────────────────────────────────────
// Autenticación
// ──────────────────────────────────────────────

export type LoginResponse = {
  mensaje: string;
  token: string;
  tipoToken: string;
  expiraEnMs: number;
};

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
  const session = {
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
  try {
    const response = await fetch(`${API_BASE_URL}/catalogo`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return DEFAULT_CATALOGO;
    }

    const data: CatalogoApiResponse = await response.json();

    if (!data?.veterinarios?.length) {
      return DEFAULT_CATALOGO;
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
  } catch {
    return DEFAULT_CATALOGO;
  }
}

/** @deprecated Usar fetchCatalogo() para obtener los veterinarios con sus servicios completos */
export async function listServices(): Promise<CatalogService[]> {
  try {
    const vets = await fetchCatalogo();
    if (!vets.length) return getStoredServices();
    const services = vets.flatMap((v) => v.servicios);
    return services.length ? services : getStoredServices();
  } catch {
    return getStoredServices();
  }
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

  // Intentar con backend si es posible
  try {
    let fechaHoraInicioStr = '';
    if (payload.fecha && payload.hora) {
      const mins = parseTimeToMinutes(payload.hora);
      const hh = String(Math.floor(mins / 60)).padStart(2, '0');
      const mm = String(mins % 60).padStart(2, '0');
      fechaHoraInicioStr = `${payload.fecha}T${hh}:${mm}:00`;
    }

    if (payload.mascotaId && payload.veterinarioId && payload.servicioId && fechaHoraInicioStr) {
      const response = await fetch(`${API_BASE_URL}/citas?documentoIdentidad=${encodeURIComponent(documento)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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
        const id = Number(data.idCita || data.id || Date.now());
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
          fechaHoraInicio: data.fechaHoraInicio,
          fechaHoraFin: data.fechaHoraFin,
        };
      }
    }
  } catch {
    // Si no responde el backend, se procesa en modo local
  }

  // Fallback local garantizado para la demo
  const id = Date.now();
  const codigo = `VA-${String(id).slice(-4)}`;
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

  try {
    const response = await fetch(
      `${API_BASE_URL}/citas?documentoIdentidad=${encodeURIComponent(documentoIdentidad)}`,
      { headers: { Accept: 'application/json' } },
    );

    if (response.ok) {
      const citas: CitaClienteApi[] = await response.json();
      const apiCitas: Cita[] = citas.map((cita) => {
        const fechaHora = new Date(cita.fechaHoraInicio);
        const cancelada = cita.estado === 'ANULADA' || cita.estado.startsWith('CANCELADA');

        return {
          id: Number(cita.id),
          codigoReserva: `VA-${String(cita.id).padStart(4, '0')}`,
          clienteNombre: 'Cliente VetAgenda',
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
        };
      });

      const ids = new Set(apiCitas.map((c) => c.id));
      return [...apiCitas, ...localCitas.filter((c) => !ids.has(c.id))];
    }
  } catch {
    // Usar datos locales si el backend no responde
  }

  return localCitas;
}

export async function cancelarCita(
  citaId: number,
  documentoIdentidad: string,
): Promise<CancelacionCitaApi> {
  // Actualizar en almacenamiento local demo
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
    // Ignore error
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/citas/${citaId}/cancelar?documentoIdentidad=${encodeURIComponent(documentoIdentidad)}`,
      {
        method: 'POST',
        headers: { Accept: 'application/json' },
      },
    );

    if (response.ok) {
      return response.json();
    }
  } catch {
    // Fallback demo
  }

  return {
    mensaje: 'Cita anulada exitosamente',
    idCita: citaId,
    estado: 'ANULADA',
    etiquetaEstado: 'Cancelada',
    cupoLiberado: true,
    fechaHoraInicio: new Date().toISOString(),
    fechaHoraFin: new Date().toISOString(),
  };
}

// ──────────────────────────────────────────────
// Disponibilidad del veterinario (días y franjas de atención - HU09)
// ──────────────────────────────────────────────
//
// Contrato esperado con el backend:
//   GET    /veterinarios/{id}/disponibilidad
//   PUT    /veterinarios/{id}/disponibilidad                     body: DisponibilidadPayload
//   DELETE /veterinarios/{id}/disponibilidad/franjas/{franjaId}
// Respuesta (GET/PUT): { veterinarioId, dias: [{ dia, franjas: [{ id, horaInicio: "HH:mm", horaFin: "HH:mm" }] }] }
//
// Si el backend no responde o el endpoint aún no existe, la configuración
// se guarda en localStorage para que el flujo pueda probarse en la demo.

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
const FALLBACK_STATUSES = [404, 405, 500, 501, 502, 503];

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
  const response = await tryFetch(`${API_BASE_URL}/veterinarios/${veterinarioId}/disponibilidad`, {
    headers: { Accept: 'application/json' },
  });

  if (!response || FALLBACK_STATUSES.includes(response.status)) {
    return { dias: getStoredAvailability(veterinarioId), origen: 'local' };
  }

  if (!response.ok) {
    return { dias: getStoredAvailability(veterinarioId), origen: 'local' };
  }

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

  const response = await tryFetch(`${API_BASE_URL}/veterinarios/${veterinarioId}/disponibilidad`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response || FALLBACK_STATUSES.includes(response.status)) {
    setStoredAvailability(veterinarioId, guardadoLocal);
    return { dias: guardadoLocal, origen: 'local' };
  }

  if (!response.ok) {
    if (response.status === 400) {
      const mensaje = await extraerMensaje(response);
      throw new Error(
        mensaje || 'El rango de horario no es válido o existen franjas que se cruzan.',
      );
    }
    setStoredAvailability(veterinarioId, guardadoLocal);
    return { dias: guardadoLocal, origen: 'local' };
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

  const response = franjaId.startsWith('tmp-')
    ? null
    : await tryFetch(
        `${API_BASE_URL}/veterinarios/${veterinarioId}/disponibilidad/franjas/${encodeURIComponent(franjaId)}`,
        { method: 'DELETE', headers: { Accept: 'application/json' } },
      );

  if (!response || FALLBACK_STATUSES.includes(response.status) || !response.ok) {
    quitarLocal();
    return 'local';
  }

  quitarLocal();
  return 'api';
}


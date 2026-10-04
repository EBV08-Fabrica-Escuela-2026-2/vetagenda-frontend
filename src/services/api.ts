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

// ──────────────────────────────────────────────
// Configuración base y almacenamiento local
// ──────────────────────────────────────────────

const SERVICES_KEY = 'vetagenda-services';
const VETS_KEY = 'vetagenda-vets';
const CLIENTS_KEY = 'vetagenda-clients';
const PETS_KEY = 'vetagenda-pets';
const CITAS_KEY = 'vetagenda-citas';

export type CitaEstado = 'PROGRAMADA' | 'CANCELADA';

export type Cita = {
  id: number;
  codigoReserva: string;
  clienteNombre: string;
  clienteDocumento: string;
  clienteTelefono: string;
  mascotaNombre: string;
  mascotaEspecie: string;
  mascotaRaza: string;
  veterinarioId: number;
  veterinarioNombre: string;
  servicioNombre: string;
  precio: string;
  fecha: string;
  hora: string;
  duracionMinutos: number;
  consultorio: string;
  estado: CitaEstado;
  motivoCancelacion?: string;
  fechaCancelacion?: string;
  fechaCreacion: string;
};

export const DEFAULT_CITAS: Cita[] = [
  {
    id: 101,
    codigoReserva: 'VET-2026-084',
    clienteNombre: 'Valentina Restrepo',
    clienteDocumento: '1020304050',
    clienteTelefono: '3001234567',
    mascotaNombre: 'Max',
    mascotaEspecie: 'Canino',
    mascotaRaza: 'Golden Retriever',
    veterinarioId: 1,
    veterinarioNombre: 'Dr. Carlos Pérez',
    servicioNombre: 'Consulta General',
    precio: '$85.000',
    fecha: '2026-10-15',
    hora: '09:00 AM',
    duracionMinutos: 30,
    consultorio: 'Consultorio 101 (Sede Bogotá Norte)',
    estado: 'PROGRAMADA',
    fechaCreacion: '2026-10-01T10:00:00Z',
  },
  {
    id: 102,
    codigoReserva: 'VET-2026-092',
    clienteNombre: 'Valentina Restrepo',
    clienteDocumento: '1020304050',
    clienteTelefono: '3001234567',
    mascotaNombre: 'Mía',
    mascotaEspecie: 'Felino',
    mascotaRaza: 'Siamés',
    veterinarioId: 2,
    veterinarioNombre: 'Dra. María López',
    servicioNombre: 'Dermatología',
    precio: '$120.000',
    fecha: '2026-10-18',
    hora: '11:30 AM',
    duracionMinutos: 45,
    consultorio: 'Consultorio 204 (Sede Medellín Centro)',
    estado: 'PROGRAMADA',
    fechaCreacion: '2026-10-02T14:30:00Z',
  },
  {
    id: 103,
    codigoReserva: 'VET-2026-077',
    clienteNombre: 'Carlos Arturo Gómez',
    clienteDocumento: '1012345678',
    clienteTelefono: '3109876543',
    mascotaNombre: 'Toby',
    mascotaEspecie: 'Canino',
    mascotaRaza: 'Poodle',
    veterinarioId: 1,
    veterinarioNombre: 'Dr. Carlos Pérez',
    servicioNombre: 'Vacunación',
    precio: '$45.000',
    fecha: '2026-10-08',
    hora: '02:00 PM',
    duracionMinutos: 20,
    consultorio: 'Consultorio 102 (Sede Bogotá Norte)',
    estado: 'CANCELADA',
    motivoCancelacion: 'Imprevisto laboral del tutor',
    fechaCancelacion: '2026-10-03 04:15 PM',
    fechaCreacion: '2026-09-28T09:15:00Z',
  },
  {
    id: 104,
    codigoReserva: 'VET-2026-105',
    clienteNombre: 'Valentina Restrepo',
    clienteDocumento: '1020304050',
    clienteTelefono: '3001234567',
    mascotaNombre: 'Max',
    mascotaEspecie: 'Canino',
    mascotaRaza: 'Golden Retriever',
    veterinarioId: 4,
    veterinarioNombre: 'Dra. Laura Rodríguez',
    servicioNombre: 'Rehabilitación',
    precio: '$180.000',
    fecha: '2026-10-22',
    hora: '03:00 PM',
    duracionMinutos: 60,
    consultorio: 'Sala Terapéutica 1 (Sede Bogotá Chapinero)',
    estado: 'PROGRAMADA',
    fechaCreacion: '2026-10-03T11:00:00Z',
  },
];

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api');

export const DEFAULT_VETS: VeterinarioConServicios[] = [
  {
    id: 1,
    nombre: 'Dr. Carlos Pérez',
    direccion: 'Calle 10 #5-20, Bogotá',
    telefono: '3101234567',
    horarioAtencion: '8:00 AM - 6:00 PM',
    servicios: [
      { id: 1, nombre: 'Consulta General', descripcion: 'Revisión completa del paciente', precio: '$85.000', duracionMinutos: 30 },
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
    mensajeServicios: 'Sin servicios registrados',
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

export const getStoredVets = (): VeterinarioConServicios[] => {
  try {
    const rawValue = localStorage.getItem(VETS_KEY);
    if (!rawValue) {
      setStoredVets(DEFAULT_VETS);
      return DEFAULT_VETS;
    }
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_VETS;
  } catch {
    return DEFAULT_VETS;
  }
};

export const setStoredVets = (vets: VeterinarioConServicios[]) => {
  try {
    localStorage.setItem(VETS_KEY, JSON.stringify(vets));
  } catch (e) {
    console.warn('Error saving vets to localStorage', e);
  }
};

export const getStoredServices = (): CatalogService[] => {
  try {
    const rawValue = localStorage.getItem(SERVICES_KEY);
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
  try {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  } catch (e) {
    console.warn('Error saving services to localStorage', e);
  }
};

const getStoredClients = (): any[] => {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setStoredClients = (clients: any[]) => {
  try {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  } catch (e) {
    console.warn('Error saving clients to localStorage', e);
  }
};

const getStoredPets = (): any[] => {
  try {
    const raw = localStorage.getItem(PETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setStoredPets = (pets: any[]) => {
  try {
    localStorage.setItem(PETS_KEY, JSON.stringify(pets));
  } catch (e) {
    console.warn('Error saving pets to localStorage', e);
  }
};

// ──────────────────────────────────────────────
// Autenticación
// ──────────────────────────────────────────────

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('No se pudo autenticar');
    }

    return response.json();
  } catch {
    return {
      mensaje: 'Login sin backend disponible',
      token: 'offline-token',
    };
  }
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
      return await response.json();
    }

    const errorData = await response.json().catch(() => ({}));
    if (response.status === 400) {
      const msg = errorData?.mensaje || errorData?.message || 'Datos inválidos o cliente/correo ya registrado.';
      throw new Error(msg);
    }
  } catch (err: any) {
    if (err.message && err.message.includes('ya registrado')) {
      throw err;
    }
  }

  // Offline mock fallback
  const clients = getStoredClients();
  const idCliente = Date.now();
  setStoredClients([...clients, { ...payload, id: idCliente }]);
  return { idCliente, mensaje: 'Cliente registrado exitosamente' };
}

// ──────────────────────────────────────────────
// Mascotas
// ──────────────────────────────────────────────

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
      return await response.json();
    }
  } catch {
    // Offline fallback
  }

  // Offline mock fallback
  const pets = getStoredPets();
  const idMascota = Date.now();
  setStoredPets([...pets, { ...payload, id: idMascota, documentoIdentidad }]);
  return { idMascota, mensaje: 'Mascota registrada exitosamente' };
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
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Offline fallback
  }

  const stored = getStoredVets();
  return stored.map((v) => ({ id: v.id, nombre: v.nombre }));
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
      return await response.json();
    }

    const errorData = await response.json().catch(() => ({}));
    if (response.status === 400) {
      const msg = errorData?.mensaje || errorData?.message || 'Datos inválidos o veterinario/correo ya registrado.';
      throw new Error(msg);
    }
  } catch (err: any) {
    if (err.message && err.message.includes('ya registrado')) {
      throw err;
    }
  }

  // Offline mock fallback
  const vets = getStoredVets();
  const idVeterinario = Date.now();
  const newVet: VeterinarioConServicios = {
    id: idVeterinario,
    nombre: payload.nombre,
    direccion: payload.direccion || 'Dirección no registrada',
    telefono: payload.telefono || 'Sin teléfono',
    horarioAtencion: payload.horarioAtencion || '8:00 AM - 5:00 PM',
    servicios: [],
    mensajeServicios: 'Sin servicios registrados',
  };
  setStoredVets([...vets, newVet]);
  return { mensaje: 'Registro de veterinario exitoso', idVeterinario };
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

      if (data?.veterinarios?.length) {
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
    // Offline fallback
  }

  return getStoredVets();
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
  const createdService: CatalogService = {
    id: Date.now(),
    nombre: service.nombre,
    descripcion: service.descripcion,
    precio: `$${service.precio.toLocaleString('es-CO')}`,
    duracionMinutos: service.duracionMinutos,
  };

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
      const storedServices = getStoredServices();
      setStoredServices([...storedServices, createdService]);
      return createdService;
    }
  } catch {
    // Offline fallback
  }

  // Update in stored vets
  const vets = getStoredVets();
  const vetIndex = vets.findIndex((v) => v.id === service.veterinarioId);
  if (vetIndex !== -1) {
    vets[vetIndex].servicios.push(createdService);
    delete vets[vetIndex].mensajeServicios;
    setStoredVets(vets);
  }

  const storedServices = getStoredServices();
  setStoredServices([...storedServices, createdService]);
  return createdService;
}

// ──────────────────────────────────────────────
// Citas y anulación (HU14 - Cancelar cita)
// ──────────────────────────────────────────────

export const getStoredCitas = (): Cita[] => {
  try {
    const rawValue = localStorage.getItem(CITAS_KEY);
    if (!rawValue) {
      setStoredCitas(DEFAULT_CITAS);
      return DEFAULT_CITAS;
    }
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CITAS;
  } catch {
    return DEFAULT_CITAS;
  }
};

export const setStoredCitas = (citas: Cita[]) => {
  try {
    localStorage.setItem(CITAS_KEY, JSON.stringify(citas));
  } catch (e) {
    console.warn('Error saving citas to localStorage', e);
  }
};

export async function getCitas(documento?: string): Promise<Cita[]> {
  try {
    const url = documento
      ? `${API_BASE_URL}/citas?documento=${encodeURIComponent(documento)}`
      : `${API_BASE_URL}/citas`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Offline fallback
  }

  const allCitas = getStoredCitas();
  if (!documento || documento.trim() === '') {
    return allCitas;
  }

  const term = documento.trim().toLowerCase();
  return allCitas.filter(
    (c) =>
      c.clienteDocumento.toLowerCase().includes(term) ||
      c.codigoReserva.toLowerCase().includes(term) ||
      c.clienteNombre.toLowerCase().includes(term) ||
      c.mascotaNombre.toLowerCase().includes(term)
  );
}

export async function cancelarCita(id: number, motivo: string): Promise<Cita> {
  const fechaCancelacionStr = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  try {
    const response = await fetch(`${API_BASE_URL}/citas/${id}/cancelar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ motivo, fechaCancelacion: fechaCancelacionStr }),
    });

    if (response.ok) {
      const updated = await response.json();
      // Keep local sync
      const citas = getStoredCitas().map((c) => (c.id === id ? { ...c, ...updated } : c));
      setStoredCitas(citas);
      return updated;
    }
  } catch {
    // Offline fallback
  }

  const citas = getStoredCitas();
  const index = citas.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('No se encontró la cita a cancelar.');
  }

  const updatedCita: Cita = {
    ...citas[index],
    estado: 'CANCELADA',
    motivoCancelacion: motivo.trim() || 'Sin motivo especificado',
    fechaCancelacion: fechaCancelacionStr,
  };

  citas[index] = updatedCita;
  setStoredCitas(citas);
  return updatedCita;
}

export function resetCitas(): Cita[] {
  setStoredCitas(DEFAULT_CITAS);
  return DEFAULT_CITAS;
}


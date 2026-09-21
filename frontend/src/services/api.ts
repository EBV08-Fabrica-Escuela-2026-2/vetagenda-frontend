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
// Configuración base
// ──────────────────────────────────────────────

const STORAGE_KEY = 'vetagenda-services';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
  const response = await fetch(`${API_BASE_URL}/veterinarios`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener la lista de veterinarios.');
  }

  return response.json();
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

export async function fetchCatalogo(): Promise<VeterinarioConServicios[]> {
  const response = await fetch(`${API_BASE_URL}/catalogo`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener el catálogo.');
  }

  const data: CatalogoApiResponse = await response.json();

  if (!data?.veterinarios?.length) {
    return [];
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

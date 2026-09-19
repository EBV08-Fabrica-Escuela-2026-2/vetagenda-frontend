export type CatalogService = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
};

export type CatalogoApiResponse = {
  veterinarios: Array<{
    id: number;
    nombre: string;
    servicios: CatalogService[];
    mensajeServicios?: string;
  }>;
  moneda: string;
  mensaje?: string;
};

export type ServicePayload = {
  veterinarioId: number;
  nombre: string;
  descripcion: string;
  precio: number;
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
    }));
  } catch {
    return DEFAULT_SERVICES;
  }
};

export const setStoredServices = (services: CatalogService[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
};

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

export async function registerClient(payload: ClientPayload) {
  try {
    const response = await fetch(`${API_BASE_URL}/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('No se pudo registrar el cliente');
    }

    return response.json();
  } catch {
    const savedClient = {
      idCliente: Date.now(),
      cliente: payload,
      mensaje: 'Registro de cliente exitoso',
    };
    localStorage.setItem('vetagenda_clientes', JSON.stringify(savedClient));
    return savedClient;
  }
}

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

    if (!response.ok) {
      throw new Error('No se pudo registrar la mascota');
    }

    return response.json();
  } catch {
    const savedPet = {
      idMascota: Date.now(),
      documentoIdentidad,
      mascota: payload,
      mensaje: 'Mascota registrada exitosamente',
    };
    localStorage.setItem('vetagenda_mascotas', JSON.stringify(savedPet));
    return savedPet;
  }
}

export async function listServices(): Promise<CatalogService[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/catalogo`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('No se pudo obtener el catálogo');
    }

    const data: CatalogoApiResponse = await response.json();

    if (!data?.veterinarios?.length) {
      return getStoredServices();
    }

    const services = data.veterinarios.flatMap((veterinario) => veterinario.servicios || []);
    return services.length ? services : getStoredServices();
  } catch {
    return getStoredServices();
  }
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

    if (!response.ok) {
      throw new Error('No se pudo guardar el servicio');
    }

    const data = await response.json();
    return {
      id: Number(data?.id) || Date.now(),
      nombre: String(data?.nombre || service.nombre),
      descripcion: String(data?.descripcion || service.descripcion),
      precio: data?.precio ? String(data.precio) : `$${service.precio.toLocaleString('es-CO')}`,
    };
  } catch {
    const storedServices = getStoredServices();
    const createdService: CatalogService = {
      id: Date.now(),
      nombre: service.nombre,
      descripcion: service.descripcion,
      precio: `$${service.precio.toLocaleString('es-CO')}`,
    };
    setStoredServices([...storedServices, createdService]);
    return createdService;
  }
}

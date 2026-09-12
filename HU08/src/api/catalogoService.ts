import { Veterinario } from '../types/veterinario';

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Simula la validación de sesión. Reemplazar por el mecanismo real
 * de autenticación del proyecto (contexto de auth, cookie httpOnly, etc.)
 * cuando HU03 - Inicio de Sesión quede integrada.
 */
export function obtenerTokenSesion(): string | null {
  return localStorage.getItem('vetagenda_token');
}

// Mock de datos - reemplazar por la llamada real a GET /veterinarios/catalogo
const MOCK_VETERINARIOS: Veterinario[] = [
  {
    id: '1',
    nombre: 'Dra. Ana Torres',
    especialidad: 'Medicina general',
    direccion: 'Cra 15 # 45-20, Bogotá',
    horario: 'Lun - Vie: 8:00 a.m. - 6:00 p.m.',
    telefono: '(601) 555-1234',
    servicios: [
      { id: 's1', nombre: 'Consulta General Canina', descripcion: 'Revisión completa del animal', precio: 45000 },
      { id: 's2', nombre: 'Vacunación', descripcion: 'Aplicación de vacuna anual', precio: 60000 }
    ]
  },
  {
    id: '2',
    nombre: 'Dr. Luis Fernández',
    especialidad: 'Cirugía',
    direccion: 'Calle 100 # 12-30, Bogotá',
    horario: 'Lun - Sáb: 9:00 a.m. - 5:00 p.m.',
    telefono: '(601) 555-5678',
    servicios: []
  },
  {
    id: '3',
    nombre: 'Dra. Camila Rojas',
    especialidad: 'Odontología veterinaria',
    direccion: 'Av. Suba # 80-15, Bogotá',
    horario: 'Mar - Sáb: 10:00 a.m. - 7:00 p.m.',
    telefono: '(601) 555-9012',
    servicios: [
      { id: 's3', nombre: 'Profilaxis Dental', descripcion: 'Limpieza dental completa bajo sedación', precio: 180000 }
    ]
  }
];

export async function fetchCatalogoVeterinarios(): Promise<Veterinario[]> {
  const token = obtenerTokenSesion();

  if (!token) {
    throw new ApiError('No hay sesión iniciada', 401);
  }

  // --- Reemplazar este bloque por la llamada real al backend ---
  // const API_BASE_URL = import.meta.env.VITE_API_URL;
  // const response = await fetch(`${API_BASE_URL}/veterinarios/catalogo`, {
  //   headers: { Authorization: `Bearer ${token}` }
  // });
  // if (response.status === 401) throw new ApiError('Sesión expirada', 401);
  // if (!response.ok) throw new ApiError(`Error del servidor: ${response.status}`);
  // return response.json();

  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_VETERINARIOS), 1000);
  });
  // ---------------------------------------------------------------
}

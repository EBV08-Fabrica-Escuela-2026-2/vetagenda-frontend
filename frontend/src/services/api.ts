// ──────────────────────────────────────────────
// Configuración base, sesión y cliente HTTP
// ──────────────────────────────────────────────
import type { Rol } from '../types/historial';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api');

/**
 * Origen de datos:
 *  - "api":  consume el backend Spring Boot (VITE_API_URL).
 *  - "demo": usa datos locales que simulan el backend, incluida la validación
 *            de titularidad que responde 403. Útil sin backend disponible.
 * Por defecto: "demo" si no se configuró VITE_API_URL.
 */
export const DATA_SOURCE: 'api' | 'demo' =
  (import.meta.env.VITE_DATA_SOURCE as 'api' | 'demo' | undefined)
  ?? (import.meta.env.VITE_API_URL ? 'api' : 'demo');

export const IS_DEMO = DATA_SOURCE === 'demo';

// ── Errores tipados ─────────────────────────────

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** 403: el recurso existe pero no pertenece al usuario autenticado. */
export class ForbiddenError extends ApiError {
  constructor(message = 'No tienes permiso para ver esta información.') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

/** 401: no hay sesión o expiró. */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Tu sesión expiró. Inicia sesión nuevamente.') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export const isForbidden = (error: unknown): error is ForbiddenError =>
  error instanceof ForbiddenError || (error instanceof ApiError && error.status === 403);

// ── Sesión (mismas claves que el frontend principal de VetAgenda) ──

export type Session = {
  id: number;
  nombre: string;
  rol: Rol;
  email: string;
  token: string;
  especialidad?: string;
};

export const SESSION_EVENT = 'vetagenda-session-changed';
const SESSION_KEYS = ['vetagenda_user', 'vetagenda_session', 'vetagenda_role', 'vetagenda_token'];

export function getSession(): Session | null {
  try {
    const token = localStorage.getItem('vetagenda_token');
    if (!token || localStorage.getItem('vetagenda_session') !== 'true') return null;
    const user = JSON.parse(localStorage.getItem('vetagenda_user') || 'null') as Partial<Session> | null;
    if (!user || (user.rol !== 'CLIENTE' && user.rol !== 'VETERINARIO')) return null;
    if (typeof user.id !== 'number' || typeof user.nombre !== 'string') return null;
    return {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol,
      email: typeof user.email === 'string' ? user.email : '',
      especialidad: typeof user.especialidad === 'string' ? user.especialidad : undefined,
      token,
    };
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  const { token, ...user } = session;
  localStorage.setItem('vetagenda_token', token);
  localStorage.setItem('vetagenda_session', 'true');
  localStorage.setItem('vetagenda_role', session.rol);
  localStorage.setItem('vetagenda_user', JSON.stringify(user));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearSession() {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

// ── Cliente HTTP ────────────────────────────────

type ErrorBody = { mensaje?: string; message?: string; error?: string };

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>, signal?: AbortSignal): Promise<T> {
  const session = getSession();
  if (!session) throw new UnauthorizedError();

  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const url = `${API_BASE_URL}${path}${query.toString() ? `?${query.toString()}` : ''}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${session.token}` },
      signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError(0, 'No pudimos conectar con el servicio.');
  }

  if (response.status === 204) return null as T;
  if (response.ok) return (await response.json()) as T;

  // Importante: en 403 NO se lee ni se reutiliza el cuerpo más allá del mensaje,
  // para no exponer datos aunque el backend los enviara por error.
  const body = (await response.json().catch(() => ({}))) as ErrorBody;
  const message = body.mensaje || body.message || body.error || `Error ${response.status}`;

  if (response.status === 401) {
    clearSession();
    throw new UnauthorizedError();
  }
  if (response.status === 403) throw new ForbiddenError();
  throw new ApiError(response.status, message);
}

// ── Autenticación ───────────────────────────────

type LoginResponse = { token: string };
type PerfilCliente = { id: number; nombre: string; email?: string; correo?: string };
type PerfilVeterinario = { id: number; nombre: string; correo?: string; especialidad?: string };

export const DEMO_USERS: Record<Rol, Omit<Session, 'token'>> = {
  CLIENTE: { id: 101, nombre: 'Camila Mejía', rol: 'CLIENTE', email: 'camila.mejia@vetagenda.test' },
  VETERINARIO: {
    id: 7,
    nombre: 'Dra. Valentina Gómez',
    rol: 'VETERINARIO',
    email: 'valentina.gomez@vetagenda.test',
    especialidad: 'Medicina interna',
  },
};

export function loginDemo(rol: Rol): Session {
  const session: Session = { ...DEMO_USERS[rol], token: `demo-token-${rol.toLowerCase()}` };
  saveSession(session);
  return session;
}

/** Login de cliente contra el backend (POST /auth/login + GET /auth/me). */
export async function loginCliente(email: string, password: string): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).catch(() => {
    throw new ApiError(0, 'No pudimos conectar con el servicio.');
  });
  if (!response.ok) throw new ApiError(response.status, 'Correo o contraseña incorrectos.');
  const { token } = (await response.json()) as LoginResponse;

  const me = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!me.ok) throw new ApiError(me.status, 'No pudimos obtener tu perfil.');
  const perfil = (await me.json()) as PerfilCliente;
  const session: Session = { id: perfil.id, nombre: perfil.nombre, rol: 'CLIENTE', email: perfil.email ?? perfil.correo ?? email, token };
  saveSession(session);
  return session;
}

/** Login de veterinario demo del backend (POST /auth/veterinario/demo + GET /veterinario-portal/perfil). */
export async function loginVeterinario(): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/auth/veterinario/demo`, { method: 'POST' }).catch(() => {
    throw new ApiError(0, 'No pudimos conectar con el servicio.');
  });
  if (!response.ok) throw new ApiError(response.status, 'No pudimos iniciar la sesión del veterinario.');
  const { token } = (await response.json()) as LoginResponse;

  const perfilResponse = await fetch(`${API_BASE_URL}/veterinario-portal/perfil`, { headers: { Authorization: `Bearer ${token}` } });
  if (!perfilResponse.ok) throw new ApiError(perfilResponse.status, 'No pudimos obtener el perfil del veterinario.');
  const perfil = (await perfilResponse.json()) as PerfilVeterinario;
  const session: Session = {
    id: perfil.id,
    nombre: perfil.nombre,
    rol: 'VETERINARIO',
    email: perfil.correo ?? '',
    especialidad: perfil.especialidad,
    token,
  };
  saveSession(session);
  return session;
}

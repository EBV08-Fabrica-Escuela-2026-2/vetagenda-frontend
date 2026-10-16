// ──────────────────────────────────────────────
// Tipos compartidos
// ──────────────────────────────────────────────

export type VeterinarioListaItem = {
  id: number;
  nombre: string;
};

// ──────────────────────────────────────────────
// Configuración base
// ──────────────────────────────────────────────

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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

// ──────────────────────────────────────────────
// Disponibilidad del veterinario (días y franjas de atención)
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
const FALLBACK_STATUSES = [404, 405, 501];

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
  return stored ? normalizarDisponibilidad({ dias: stored }) : crearDisponibilidadVacia();
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
    throw new Error((await extraerMensaje(response)) || 'No se pudo consultar la disponibilidad del veterinario.');
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

  if (!response) {
    setStoredAvailability(veterinarioId, guardadoLocal);
    return { dias: guardadoLocal, origen: 'local' };
  }

  if (!response.ok) {
    const mensaje = await extraerMensaje(response);
    if (!mensaje && FALLBACK_STATUSES.includes(response.status)) {
      setStoredAvailability(veterinarioId, guardadoLocal);
      return { dias: guardadoLocal, origen: 'local' };
    }
    throw new Error(
      mensaje ||
        (response.status === 400
          ? 'El rango de horario no es válido o existen franjas que se cruzan.'
          : 'No se pudo guardar la disponibilidad.'),
    );
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

  if (!response || (FALLBACK_STATUSES.includes(response.status) && !(await extraerMensaje(response.clone())))) {
    quitarLocal();
    return 'local';
  }

  if (!response.ok) {
    throw new Error((await extraerMensaje(response)) || 'No se pudo eliminar la franja horaria.');
  }

  quitarLocal();
  return 'api';
}

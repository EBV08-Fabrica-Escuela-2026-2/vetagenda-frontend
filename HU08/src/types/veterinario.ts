export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  /** Valor en pesos colombianos (COP), sin formatear. */
  precio: number;
}

export interface Veterinario {
  id: string;
  nombre: string;
  especialidad?: string;
  direccion: string;
  horario: string;
  telefono: string;
  servicios: Servicio[];
}

export interface ClientFormData {
  nombre: string;
  cedula: string;
  correo: string;
  telefono: string;
  direccion: string;
}

export type ClientFormErrors = Partial<Record<keyof ClientFormData, string>>;

export interface ClientSubmitResponse {
  success: boolean;
  message: string;
  data?: ClientFormData & { id: string; fechaRegistro: string };
}

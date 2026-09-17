import { ClientFormData, ClientFormErrors } from '../types/client';

/**
 * Expresiones regulares para validación de campos
 */
export const REGEX = {
  // Solo letras, tildes, diéresis, ñ y espacios (mínimo 3 caracteres, máximo 80)
  NOMBRE: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{3,80}$/,
  
  // Solo dígitos numéricos entre 6 y 10 caracteres (cédula de ciudadanía o extranjería)
  CEDULA: /^\d{6,10}$/,
  
  // Formato estándar de correo electrónico RFC 5322 simplificado
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Número telefónico colombiano (celular de 10 dígitos comúnmente iniciando en 3, o fijo de 7 a 10 dígitos)
  // Permite opcionalmente formato con prefijo +57 o espacios
  TELEFONO: /^(?:\+?57)?(?:\s*)?(?:3\d{9}|[1-9]\d{6,9})$/,
  
  // Dirección con longitud mínima de 5 caracteres, caracteres válidos como Calle, Cra, #, -, etc.
  DIRECCION: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s#.,\-_/°]{5,120}$/
};

/**
 * Valida un campo individual del formulario de cliente
 */
export const validateField = (
  field: keyof ClientFormData,
  value: string
): string | undefined => {
  const trimmed = value.trim();

  switch (field) {
    case 'nombre':
      if (!trimmed) {
        return 'El nombre completo es obligatorio.';
      }
      if (trimmed.length < 3) {
        return 'El nombre debe tener al menos 3 caracteres.';
      }
      if (!REGEX.NOMBRE.test(trimmed)) {
        return 'El nombre solo debe contener letras y espacios válidos.';
      }
      return undefined;

    case 'cedula':
      if (!trimmed) {
        return 'El número de cédula es obligatorio.';
      }
      if (!/^\d+$/.test(trimmed)) {
        return 'La cédula debe contener únicamente números.';
      }
      if (trimmed.length < 6 || trimmed.length > 10) {
        return 'La cédula debe tener entre 6 y 10 dígitos.';
      }
      return undefined;

    case 'correo':
      if (!trimmed) {
        return 'El correo electrónico es obligatorio.';
      }
      if (!REGEX.EMAIL.test(trimmed)) {
        return 'Ingresa un correo electrónico válido (ej. usuario@dominio.com).';
      }
      return undefined;

    case 'telefono':
      if (!trimmed) {
        return 'El teléfono de contacto es obligatorio.';
      }
      // Limpiar espacios y guiones para verificar dígitos
      const cleanPhone = trimmed.replace(/[\s-]/g, '');
      if (!/^\+?\d+$/.test(cleanPhone)) {
        return 'El teléfono solo debe contener números.';
      }
      if (!REGEX.TELEFONO.test(trimmed)) {
        return 'Ingresa un número de celular válido de 10 dígitos (ej. 300 123 4567).';
      }
      return undefined;

    case 'direccion':
      if (!trimmed) {
        return 'La dirección de residencia es obligatoria.';
      }
      if (trimmed.length < 5) {
        return 'La dirección debe tener al menos 5 caracteres.';
      }
      if (!REGEX.DIRECCION.test(trimmed)) {
        return 'La dirección contiene caracteres inválidos.';
      }
      return undefined;

    default:
      return undefined;
  }
};

/**
 * Valida todos los campos del formulario de registro de cliente
 */
export const validateClientForm = (data: ClientFormData): {
  isValid: boolean;
  errors: ClientFormErrors;
} => {
  const errors: ClientFormErrors = {};

  const fields: (keyof ClientFormData)[] = [
    'nombre',
    'cedula',
    'correo',
    'telefono',
    'direccion'
  ];

  for (const field of fields) {
    const error = validateField(field, data[field]);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

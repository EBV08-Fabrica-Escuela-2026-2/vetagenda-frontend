import React, { useState } from 'react';
import {
  User,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Loader2,
  RotateCcw,
  CheckCircle2,
  Save
} from 'lucide-react';
import { ClientFormData, ClientFormErrors } from '../../types/client';
import { validateField, validateClientForm } from '../../utils/validation';
import { Logo } from '../ui/Logo';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface ClientRegisterFormProps {
  /**
   * Callback opcional que se ejecuta cuando los datos son válidos y enviados.
   * Permite conectar fácilmente con endpoints de API en el backend.
   */
  onSubmitSuccess?: (data: ClientFormData) => Promise<void> | void;
}

const INITIAL_FORM_DATA: ClientFormData = {
  nombre: '',
  cedula: '',
  correo: '',
  telefono: '',
  direccion: ''
};

export const ClientRegisterForm: React.FC<ClientRegisterFormProps> = ({
  onSubmitSuccess
}) => {
  // Estado de los datos del formulario
  const [formData, setFormData] = useState<ClientFormData>(INITIAL_FORM_DATA);

  // Estado de errores de validación por campo
  const [errors, setErrors] = useState<ClientFormErrors>({});

  // Control de campos que han sido interactuados (touched)
  const [touched, setTouched] = useState<Partial<Record<keyof ClientFormData, boolean>>>({});

  // Estados de control de la interfaz (loading, alertas y modales)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<ClientFormData | null>(null);

  /**
   * Manejador de cambio en los inputs del formulario.
   * Realiza validación en vivo si el campo ya fue tocado.
   */
  const handleChange = (field: keyof ClientFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;

    // Restricciones preventivas de tipeo
    if (field === 'cedula') {
      // Solo permitir dígitos numéricos
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'telefono') {
      // Permitir dígitos y espacios, máximo 12 caracteres
      value = value.replace(/[^\d\s+]/g, '').slice(0, 14);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // Si el campo ya fue tocado o tiene un error previo, revalidar en tiempo real
    if (touched[field] || errors[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error
      }));
    }

    if (generalError) {
      setGeneralError(null);
    }
  };

  /**
   * Manejador del evento Blur (cuando el usuario desenfoca un input).
   * Marca el campo como interactuado y ejecuta su validación.
   */
  const handleBlur = (field: keyof ClientFormData) => () => {
    setTouched((prev) => ({
      ...prev,
      [field]: true
    }));

    const error = validateField(field, formData[field]);
    setErrors((prev) => ({
      ...prev,
      [field]: error
    }));
  };

  /**
   * Reiniciar el formulario a su estado inicial
   */
  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setTouched({});
    setGeneralError(null);
  };

  /**
   * Manejador del envío del formulario (Submit)
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    const allTouched: Record<keyof ClientFormData, boolean> = {
      nombre: true,
      cedula: true,
      correo: true,
      telefono: true,
      direccion: true
    };
    setTouched(allTouched);

    // Validar exhaustivamente todos los campos con las reglas de negocio
    const validation = validateClientForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setGeneralError('Por favor verifica los campos marcados en rojo antes de continuar.');
      return;
    }

    // Limpiar errores si la validación pasa
    setErrors({});
    setGeneralError(null);
    setIsLoading(true);

    try {
      if (onSubmitSuccess) {
        await onSubmitSuccess(formData);
      } else {
        // Simulación de latencia de red de 900ms para mostrar el estado de carga
        await new Promise((resolve) => setTimeout(resolve, 900));
      }

      // Guardar datos enviados para el modal de confirmación
      setSubmittedData({ ...formData });
      setIsSuccessModalOpen(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Ocurrió un problema al procesar el registro del cliente. Inténtalo nuevamente.';
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto'
      }}
    >
      {/* Tarjeta Contenedora Principal */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '1.25rem',
          boxShadow: '0 10px 25px -3px rgba(13, 92, 117, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
          border: '1px solid #D0DFE4',
          overflow: 'hidden'
        }}
      >
        {/* Cabecera de la Tarjeta con Identidad VetAgenda */}
        <div
          style={{
            backgroundColor: '#E8F4F1',
            padding: '2rem 1.75rem 1.5rem 1.75rem',
            textAlign: 'center',
            borderBottom: '1px solid #D0DFE4'
          }}
        >
          <Logo size="md" showSubtitle />
          <div style={{ marginTop: '1.25rem' }}>
            <h1
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '1.375rem',
                fontWeight: 700,
                color: '#0D5C75',
                letterSpacing: '-0.015em'
              }}
            >
              Registro de Nuevo Cliente
            </h1>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#6B7E84',
                marginTop: '0.25rem'
              }}
            >
              Ingresa los datos personales del propietario para habilitar la atención veterinaria
            </p>
          </div>
        </div>

        {/* Cuerpo del Formulario */}
        <div style={{ padding: '1.75rem' }}>
          {/* Alerta General de Error */}
          {generalError && (
            <div
              className="animate-fade-in"
              role="alert"
              style={{
                marginBottom: '1.25rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: '#F8D7DA',
                borderLeft: '4px solid #C82333',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#C82333',
                fontSize: '0.875rem'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{generalError}</span>
            </div>
          )}

          {/* Formulario HTML Semántico */}
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              
              {/* CAMPO 1: Nombre Completo */}
              <div>
                <label
                  htmlFor="client-nombre"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    marginBottom: '0.375rem'
                  }}
                >
                  <span>
                    Nombre completo <span style={{ color: '#C82333' }}>*</span>
                  </span>
                  {touched.nombre && !errors.nombre && formData.nombre.trim() && (
                    <span style={{ color: '#1E7E34', display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '0.25rem' }}>
                      <CheckCircle2 size={13} /> Válido
                    </span>
                  )}
                </label>

                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: errors.nombre ? '#C82333' : '#6B7E84',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <User size={18} />
                  </div>

                  <input
                    id="client-nombre"
                    type="text"
                    name="nombre"
                    placeholder="Ej. Carlos Andrés Pérez"
                    value={formData.nombre}
                    onChange={handleChange('nombre')}
                    onBlur={handleBlur('nombre')}
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.nombre)}
                    aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                    className={`input-base ${errors.nombre ? 'input-error' : ''}`}
                    style={{ paddingLeft: '2.625rem' }}
                  />
                </div>

                {errors.nombre && (
                  <p
                    id="nombre-error"
                    className="animate-fade-in"
                    style={{
                      color: '#C82333',
                      fontSize: '0.75rem',
                      marginTop: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}
                  >
                    <AlertCircle size={13} />
                    <span>{errors.nombre}</span>
                  </p>
                )}
              </div>

              {/* CAMPO 2: Cédula de Identidad */}
              <div>
                <label
                  htmlFor="client-cedula"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    marginBottom: '0.375rem'
                  }}
                >
                  <span>
                    Cédula / Documento <span style={{ color: '#C82333' }}>*</span>
                  </span>
                  {touched.cedula && !errors.cedula && formData.cedula.trim() && (
                    <span style={{ color: '#1E7E34', display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '0.25rem' }}>
                      <CheckCircle2 size={13} /> Válido
                    </span>
                  )}
                </label>

                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: errors.cedula ? '#C82333' : '#6B7E84',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <CreditCard size={18} />
                  </div>

                  <input
                    id="client-cedula"
                    type="text"
                    inputMode="numeric"
                    name="cedula"
                    placeholder="Ej. 1020304050 (6 a 10 dígitos)"
                    value={formData.cedula}
                    onChange={handleChange('cedula')}
                    onBlur={handleBlur('cedula')}
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.cedula)}
                    aria-describedby={errors.cedula ? 'cedula-error' : undefined}
                    className={`input-base ${errors.cedula ? 'input-error' : ''}`}
                    style={{ paddingLeft: '2.625rem' }}
                  />
                </div>

                {errors.cedula ? (
                  <p
                    id="cedula-error"
                    className="animate-fade-in"
                    style={{
                      color: '#C82333',
                      fontSize: '0.75rem',
                      marginTop: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}
                  >
                    <AlertCircle size={13} />
                    <span>{errors.cedula}</span>
                  </p>
                ) : (
                  <p style={{ color: '#6B7E84', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Solo números sin puntos ni guiones.
                  </p>
                )}
              </div>

              {/* CAMPO 3: Correo Electrónico */}
              <div>
                <label
                  htmlFor="client-correo"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    marginBottom: '0.375rem'
                  }}
                >
                  <span>
                    Correo electrónico <span style={{ color: '#C82333' }}>*</span>
                  </span>
                  {touched.correo && !errors.correo && formData.correo.trim() && (
                    <span style={{ color: '#1E7E34', display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '0.25rem' }}>
                      <CheckCircle2 size={13} /> Válido
                    </span>
                  )}
                </label>

                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: errors.correo ? '#C82333' : '#6B7E84',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Mail size={18} />
                  </div>

                  <input
                    id="client-correo"
                    type="email"
                    name="correo"
                    placeholder="cliente@ejemplo.com"
                    value={formData.correo}
                    onChange={handleChange('correo')}
                    onBlur={handleBlur('correo')}
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.correo)}
                    aria-describedby={errors.correo ? 'correo-error' : undefined}
                    className={`input-base ${errors.correo ? 'input-error' : ''}`}
                    style={{ paddingLeft: '2.625rem' }}
                  />
                </div>

                {errors.correo ? (
                  <p
                    id="correo-error"
                    className="animate-fade-in"
                    style={{
                      color: '#C82333',
                      fontSize: '0.75rem',
                      marginTop: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}
                  >
                    <AlertCircle size={13} />
                    <span>{errors.correo}</span>
                  </p>
                ) : (
                  <p style={{ color: '#6B7E84', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Enviaremos confirmaciones de citas e historial médico.
                  </p>
                )}
              </div>

              {/* CAMPO 4: Teléfono de Contacto */}
              <div>
                <label
                  htmlFor="client-telefono"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    marginBottom: '0.375rem'
                  }}
                >
                  <span>
                    Teléfono / Celular <span style={{ color: '#C82333' }}>*</span>
                  </span>
                  {touched.telefono && !errors.telefono && formData.telefono.trim() && (
                    <span style={{ color: '#1E7E34', display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '0.25rem' }}>
                      <CheckCircle2 size={13} /> Válido
                    </span>
                  )}
                </label>

                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: errors.telefono ? '#C82333' : '#6B7E84',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Phone size={18} />
                  </div>

                  <input
                    id="client-telefono"
                    type="tel"
                    inputMode="tel"
                    name="telefono"
                    placeholder="Ej. 300 123 4567"
                    value={formData.telefono}
                    onChange={handleChange('telefono')}
                    onBlur={handleBlur('telefono')}
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.telefono)}
                    aria-describedby={errors.telefono ? 'telefono-error' : undefined}
                    className={`input-base ${errors.telefono ? 'input-error' : ''}`}
                    style={{ paddingLeft: '2.625rem' }}
                  />
                </div>

                {errors.telefono ? (
                  <p
                    id="telefono-error"
                    className="animate-fade-in"
                    style={{
                      color: '#C82333',
                      fontSize: '0.75rem',
                      marginTop: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}
                  >
                    <AlertCircle size={13} />
                    <span>{errors.telefono}</span>
                  </p>
                ) : (
                  <p style={{ color: '#6B7E84', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    10 dígitos para recordatorios SMS o WhatsApp.
                  </p>
                )}
              </div>

              {/* CAMPO 5: Dirección de Residencia */}
              <div>
                <label
                  htmlFor="client-direccion"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    marginBottom: '0.375rem'
                  }}
                >
                  <span>
                    Dirección de residencia <span style={{ color: '#C82333' }}>*</span>
                  </span>
                  {touched.direccion && !errors.direccion && formData.direccion.trim() && (
                    <span style={{ color: '#1E7E34', display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '0.25rem' }}>
                      <CheckCircle2 size={13} /> Válido
                    </span>
                  )}
                </label>

                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: errors.direccion ? '#C82333' : '#6B7E84',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <MapPin size={18} />
                  </div>

                  <input
                    id="client-direccion"
                    type="text"
                    name="direccion"
                    placeholder="Ej. Calle 50 # 45-20 Apto 301"
                    value={formData.direccion}
                    onChange={handleChange('direccion')}
                    onBlur={handleBlur('direccion')}
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.direccion)}
                    aria-describedby={errors.direccion ? 'direccion-error' : undefined}
                    className={`input-base ${errors.direccion ? 'input-error' : ''}`}
                    style={{ paddingLeft: '2.625rem' }}
                  />
                </div>

                {errors.direccion && (
                  <p
                    id="direccion-error"
                    className="animate-fade-in"
                    style={{
                      color: '#C82333',
                      fontSize: '0.75rem',
                      marginTop: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}
                  >
                    <AlertCircle size={13} />
                    <span>{errors.direccion}</span>
                  </p>
                )}
              </div>

            </div>

            {/* Acciones del formulario: Botón Guardar y Botón Limpiar */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginTop: '1.75rem',
                paddingTop: '1rem',
                borderTop: '1px solid #E5E7EB'
              }}
            >
              {/* Botón Principal: Registrar Cliente con estado Loading */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: '#0D5C75',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  minHeight: '44px',
                  boxShadow: '0 1px 3px rgba(13, 92, 117, 0.2)',
                  transition: 'background-color 0.15s, transform 0.1s'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = '#094A5E';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = '#0D5C75';
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Registrando cliente...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Registrar Cliente</span>
                  </>
                )}
              </button>

              {/* Botón Secundario: Limpiar Formulario */}
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#6B7E84',
                  border: '1px solid #D0DFE4',
                  borderRadius: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  minHeight: '44px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#F8F9FA';
                    e.currentTarget.style.color = '#1A1A1A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6B7E84';
                  }
                }}
              >
                <RotateCcw size={16} />
                <span>Limpiar campos</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Confirmación Exitosa */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onResetAndClose={() => {
          setIsSuccessModalOpen(false);
          handleReset();
        }}
        clientData={submittedData}
      />
    </div>
  );
};

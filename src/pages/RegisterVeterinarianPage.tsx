import React, { useState } from 'react';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  documentNumber?: string;
  phone?: string;
  professionalLicense?: string;
  email?: string;
  specialty?: string;
}

export const RegisterVeterinarianPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentType: 'CC',
    documentNumber: '',
    phone: '',
    professionalLicense: '',
    email: '',
    specialty: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleLettersKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', ' '];
    if (!allowedKeys.includes(e.key) && /\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Este campo es obligatorio';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'El nombre no debe contener números';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Este campo es obligatorio';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'El apellido no debe contener números';
    }

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'Este campo es obligatorio';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Este campo es obligatorio';
    } else if (formData.phone.trim().length !== 10) {
      newErrors.phone = 'El número celular no es válido';
    }

    const digitsInLicense = (formData.professionalLicense.match(/\d/g) || []).length;
    if (!formData.professionalLicense.trim()) {
      newErrors.professionalLicense = 'Este campo es obligatorio';
    } else if (digitsInLicense < 4) {
      newErrors.professionalLicense = 'Debe incluir letras y al menos 4 números';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Este campo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'El correo no es válido';
    }

    if (!formData.specialty) {
      newErrors.specialty = 'Este campo es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (validateForm()) {
      setIsLoading(true);

      // Simulación de respuesta de red/servidor (1.5 segundos)
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccessModal(true);
      }, 1500);
    } else {
      setErrorMessage('Por favor, corrija los campos marcados antes de continuar.');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      documentType: 'CC',
      documentNumber: '',
      phone: '',
      professionalLicense: '',
      email: '',
      specialty: '',
      isActive: true,
    });
    setErrors({});
    setErrorMessage(null);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    resetForm();
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '32px 16px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Encabezado */}
      <div style={{ maxWidth: '800px', margin: '0 auto 24px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          Alta de Profesional Veterinario
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>Sistema activo</span>
        </div>
      </div>

      {/* Alerta de Error General */}
      {errorMessage && (
        <div style={{ maxWidth: '800px', margin: '0 auto 16px auto', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '14px', fontWeight: '500' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Tarjeta contenedora */}
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        <div style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#115e59', margin: '0 0 4px 0' }}>
            Información del Profesional
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Complete todos los campos obligatorios para dar de alta al médico.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Nombres y Apellidos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                Nombres <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="firstName"
                disabled={isLoading}
                value={formData.firstName}
                onChange={handleChange}
                onKeyDown={handleLettersKeyDown}
                placeholder="Ej. Carlos Andrés"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${errors.firstName ? '#ef4444' : '#cbd5e1'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: isLoading ? '#f1f5f9' : '#ffffff',
                }}
              />
              {errors.firstName && (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.firstName}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                Apellidos <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="lastName"
                disabled={isLoading}
                value={formData.lastName}
                onChange={handleChange}
                onKeyDown={handleLettersKeyDown}
                placeholder="Ej. Ramírez Torres"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${errors.lastName ? '#ef4444' : '#cbd5e1'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: isLoading ? '#f1f5f9' : '#ffffff',
                }}
              />
              {errors.lastName && (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.lastName}
                </span>
              )}
            </div>
          </div>

          {/* Tipo y Número de Documento */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                Tipo de documento <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="documentType"
                disabled={isLoading}
                value={formData.documentType}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: isLoading ? '#f1f5f9' : '#fff', boxSizing: 'border-box' }}
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                Número de documento <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="documentNumber"
                disabled={isLoading}
                value={formData.documentNumber}
                onChange={handleChange}
                onKeyDown={handleNumericKeyDown}
                placeholder="Ej. 1012345678"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${errors.documentNumber ? '#ef4444' : '#cbd5e1'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: isLoading ? '#f1f5f9' : '#ffffff',
                }}
              />
              {errors.documentNumber && (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.documentNumber}
                </span>
              )}
            </div>
          </div>

          {/* Celular y Tarjeta Profesional */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                Número Celular <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="phone"
                maxLength={10}
                disabled={isLoading}
                value={formData.phone}
                onChange={handleChange}
                onKeyDown={handleNumericKeyDown}
                placeholder="Ej. 3001234567"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${errors.phone ? '#ef4444' : '#cbd5e1'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: isLoading ? '#f1f5f9' : '#ffffff',
                }}
              />
              {errors.phone && (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.phone}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                Tarjeta Profesional / Registro Médico <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="professionalLicense"
                disabled={isLoading}
                value={formData.professionalLicense}
                onChange={handleChange}
                placeholder="Ej. TP-123456-VET"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${errors.professionalLicense ? '#ef4444' : '#cbd5e1'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: isLoading ? '#f1f5f9' : '#ffffff',
                }}
              />
              {errors.professionalLicense ? (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.professionalLicense}
                </span>
              ) : (
                <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  Debe contener letras y mínimo 4 números.
                </span>
              )}
            </div>
          </div>

          {/* Correo Electrónico Institucional */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
              Correo Electrónico Institucional <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              disabled={isLoading}
              value={formData.email}
              onChange={handleChange}
              placeholder="medico@veterinaria.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `1px solid ${errors.email ? '#ef4444' : '#cbd5e1'}`,
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                backgroundColor: isLoading ? '#f1f5f9' : '#ffffff',
              }}
            />
            {errors.email && (
              <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Especialidad Asistencial */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
              Especialidad Asistencial <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name="specialty"
              disabled={isLoading}
              value={formData.specialty}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `1px solid ${errors.specialty ? '#ef4444' : '#cbd5e1'}`,
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f1f5f9' : '#fff',
                boxSizing: 'border-box',
              }}
            >
              <option value="">Selecciona una especialidad</option>
              <option value="Medicina General">Medicina General</option>
              <option value="Cirugía">Cirugía</option>
              <option value="Dermatología">Dermatología</option>
              <option value="Cardiología">Cardiología</option>
            </select>
            {errors.specialty && (
              <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {errors.specialty}
              </span>
            )}
          </div>

          {/* Estado de la Cuenta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Estado de la Cuenta</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>El médico podrá iniciar sesión y gestionar citas.</p>
            </div>
            <div
              onClick={() => !isLoading && setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
              style={{
                width: '44px',
                height: '24px',
                backgroundColor: formData.isActive ? '#115e59' : '#cbd5e1',
                borderRadius: '12px',
                position: 'relative',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '3px',
                  left: formData.isActive ? '23px' : '3px',
                  transition: 'left 0.2s',
                }}
              ></div>
            </div>
          </div>

          {/* Botones de Acción con Estado de Carga */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: isLoading ? '#0f766e' : '#115e59',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isLoading ? 0.8 : 1,
              }}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={resetForm}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              Cancelar registro
            </button>
          </div>

        </form>
      </div>

      {/* Modal de Confirmación de Registro Exitoso (Escenario 1) */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#d1fae5', borderRadius: '50%', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '24px', fontWeight: 'bold' }}>
              ✓
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
              Registro de veterinario exitoso
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
              El profesional médico ha sido registrado correctamente en el sistema con estado activo.
            </p>
            <button
              onClick={handleCloseModal}
              style={{ width: '100%', padding: '10px', backgroundColor: '#115e59', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
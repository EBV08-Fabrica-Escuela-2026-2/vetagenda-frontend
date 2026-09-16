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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Prevenir tecleo de letras en campos numéricos (Documento y Celular)
  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Prevenir tecleo de números en campos de texto (Nombres y Apellidos)
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
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar Nombres (solo letras)
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Este campo es obligatorio';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'El nombre no debe contener números';
    }

    // Validar Apellidos (solo letras)
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Este campo es obligatorio';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'El apellido no debe contener números';
    }

    // Validar Documento
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'Este campo es obligatorio';
    }

    // Validar Celular (10 dígitos)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Este campo es obligatorio';
    } else if (formData.phone.trim().length !== 10) {
      newErrors.phone = 'El número celular no es válido';
    }

    // Validar Tarjeta Profesional (debe incluir letras y al menos 4 números)
    const digitsInLicense = (formData.professionalLicense.match(/\d/g) || []).length;
    if (!formData.professionalLicense.trim()) {
      newErrors.professionalLicense = 'Este campo es obligatorio';
    } else if (digitsInLicense < 4) {
      newErrors.professionalLicense = 'Debe incluir letras y al menos 4 números';
    }

    // Validar Correo
    if (!formData.email.trim()) {
      newErrors.email = 'Este campo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'El correo no es válido';
    }

    // Validar Especialidad
    if (!formData.specialty) {
      newErrors.specialty = 'Este campo es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (validateForm()) {
      setSuccessMessage('Registro de veterinario exitoso');
    }
  };

  const handleCancel = () => {
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
    setSuccessMessage(null);
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

      {/* Alerta de Éxito */}
      {successMessage && (
        <div style={{ maxWidth: '800px', margin: '0 auto 16px auto', padding: '12px 16px', backgroundColor: '#d1fae5', border: '1px solid #10b981', borderRadius: '8px', color: '#065f46', fontSize: '14px', fontWeight: '600' }}>
          ✓ {successMessage}
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
                value={formData.documentType}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: '#fff', boxSizing: 'border-box' }}
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
              value={formData.specialty}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `1px solid ${errors.specialty ? '#ef4444' : '#cbd5e1'}`,
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#fff',
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
              onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
              style={{
                width: '44px',
                height: '24px',
                backgroundColor: formData.isActive ? '#115e59' : '#cbd5e1',
                borderRadius: '12px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
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

          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="submit"
              style={{ padding: '10px 20px', backgroundColor: '#115e59', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{ padding: '10px 20px', backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
            >
              Cancelar registro
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
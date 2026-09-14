import React from 'react';

export const RegisterVeterinarianPage: React.FC = () => {
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

        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Nombres y Apellidos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                Nombres <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Carlos Andrés"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                Apellidos <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Ramírez Torres"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
          </div>

          {/* Tipo y Número de Documento */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                Tipo de documento <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: '#fff', boxSizing: 'border-box' }}>
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
                placeholder="Ej. 1012345678"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Tarjeta Profesional */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
              Tarjeta Profesional / Registro Médico <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. TP-123456-VET"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
            />
            <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Número de registro ante el Consejo Profesional de Medicina Veterinaria.
            </span>
          </div>

          {/* Correo Electrónico Institucional */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
              Correo Electrónico Institucional <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              placeholder="medico@veterinaria.com"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Especialidad Asistencial */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
              Especialidad Asistencial <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: '#fff', boxSizing: 'border-box' }}>
              <option value="">Selecciona una especialidad</option>
              <option value="Medicina General">Medicina General</option>
              <option value="Cirugía">Cirugía</option>
              <option value="Dermatología">Dermatología</option>
            </select>
          </div>

          {/* Estado de la Cuenta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Estado de la Cuenta</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>El médico podrá iniciar sesión y gestionar citas.</p>
            </div>
            <div style={{ width: '44px', height: '24px', backgroundColor: '#115e59', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '18px', height: '18px', backgroundColor: '#ffffff', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }}></div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="button"
              style={{ padding: '10px 20px', backgroundColor: '#115e59', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
            >
              Registrar y Activar Médico
            </button>
            <button
              type="button"
              style={{ padding: '10px 20px', backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
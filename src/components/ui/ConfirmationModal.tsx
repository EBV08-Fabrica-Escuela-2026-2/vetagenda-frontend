import React from 'react';
import { CheckCircle2, User, CreditCard, Mail, Phone, MapPin, X } from 'lucide-react';
import { ClientFormData } from '../../types/client';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetAndClose: () => void;
  clientData: ClientFormData | null;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onResetAndClose,
  clientData
}) => {
  if (!isOpen || !clientData) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(10, 74, 94, 0.45)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="animate-pop-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: '1.25rem',
          boxShadow: '0 25px 50px -12px rgba(13, 92, 117, 0.25)',
          overflow: 'hidden',
          border: '1px solid #D0DFE4'
        }}
      >
        {/* Cabecera del modal */}
        <div
          style={{
            backgroundColor: '#E8F4F1',
            padding: '1.5rem',
            textAlign: 'center',
            position: 'relative',
            borderBottom: '1px solid #D0DFE4'
          }}
        >
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B7E84',
              padding: '0.25rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s'
            }}
          >
            <X size={20} />
          </button>

          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#D4EDDA',
              color: '#1E7E34',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem auto'
            }}
          >
            <CheckCircle2 size={32} strokeWidth={2.5} />
          </div>

          <h3
            id="modal-title"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0D5C75',
              marginBottom: '0.25rem'
            }}
          >
            ¡Cliente Registrado con Éxito!
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6B7E84' }}>
            Los datos del cliente han sido validados y guardados en el sistema.
          </p>
        </div>

        {/* Resumen de los datos del cliente registrado */}
        <div style={{ padding: '1.5rem' }}>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6B7E84',
              marginBottom: '0.75rem'
            }}
          >
            Resumen de Información
          </p>

          <div
            style={{
              backgroundColor: '#F8F9FA',
              borderRadius: '0.75rem',
              border: '1px solid #E5E7EB',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '0.5rem',
                  backgroundColor: '#E8F4F1',
                  color: '#0D5C75',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: '#6B7E84', display: 'block' }}>
                  Nombre Completo
                </span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    wordBreak: 'break-word'
                  }}
                >
                  {clientData.nombre}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '0.5rem',
                  backgroundColor: '#E8F4F1',
                  color: '#0D5C75',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CreditCard size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: '#6B7E84', display: 'block' }}>
                  Cédula / Documento
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>
                  {clientData.cedula}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '0.5rem',
                  backgroundColor: '#E8F4F1',
                  color: '#0D5C75',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Mail size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: '#6B7E84', display: 'block' }}>
                  Correo Electrónico
                </span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    wordBreak: 'break-word'
                  }}
                >
                  {clientData.correo}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '0.5rem',
                  backgroundColor: '#E8F4F1',
                  color: '#0D5C75',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Phone size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: '#6B7E84', display: 'block' }}>
                  Teléfono de Contacto
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>
                  {clientData.telefono}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '0.5rem',
                  backgroundColor: '#E8F4F1',
                  color: '#0D5C75',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <MapPin size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: '#6B7E84', display: 'block' }}>
                  Dirección de Residencia
                </span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    wordBreak: 'break-word'
                  }}
                >
                  {clientData.direccion}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de acción del modal */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1.5rem'
            }}
          >
            <button
              onClick={onResetAndClose}
              style={{
                flex: 1,
                backgroundColor: '#0D5C75',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                minHeight: '44px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#094A5E')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0D5C75')}
            >
              Registrar Otro Cliente
            </button>

            <button
              onClick={onClose}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#6B7E84',
                border: '1px solid #D0DFE4',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                minHeight: '44px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8F9FA';
                e.currentTarget.style.color = '#1A1A1A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#6B7E84';
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

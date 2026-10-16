import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { DetalleCitaFeedback, DetalleCitaSkeleton } from '../components/DetalleCitaFeedback';
import { CitaApiError, obtenerDetalleCita, type Cita, type EstadoCita, type TipoErrorCita } from '../services/citasService';

const MOCK_CITAS: Cita[] = [
  {
    id: '1',
    codigo: 'VA-1048',
    clienteOwnerId: 'USR-001',
    servicio: 'Vacunación anual',
    categoriaServicio: 'MEDICINA PREVENTIVA',
    fecha: 'Miércoles, 14 de octubre de 2026',
    hora: '11:00 a. m.',
    duracion: '30 min',
    costo: 85000,
    estado: 'CONFIRMADA',
    mascota: {
      nombre: 'Luna',
      especieRaza: 'Perra · Mestiza · 4 años',
      edad: '4 años',
      avatarBg: '#fef3c7',
    },
    profesional: {
      id: 'PROF-101',
      nombre: 'Dra. Laura Méndez',
      titulo: 'Médica veterinaria',
      especialidad: 'Medicina general',
      numeroLicencia: 'MV-CO 18427',
      experiencia: '8 años de experiencia en consulta preventiva, vacunación y acompañamiento integral de perros y gatos.',
      fotoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    },
    indicacionesPrevias: [
      'Trae el carné de vacunación de Luna.',
      'Evita alimentarla durante las 2 horas previas.',
      'Llega 10 minutos antes para realizar el registro.',
    ],
  },
  {
    id: '2',
    codigo: 'VA-1012',
    clienteOwnerId: 'USR-001',
    servicio: 'Consulta general',
    categoriaServicio: 'MEDICINA GENERAL',
    fecha: '18 de septiembre de 2026',
    hora: '9:30 a. m.',
    duracion: '45 min',
    costo: 60000,
    estado: 'COMPLETADA',
    mascota: {
      nombre: 'Luna',
      especieRaza: 'Perra · Mestiza · 4 años',
      edad: '4 años',
      avatarBg: '#fef3c7',
    },
    profesional: {
      id: 'PROF-101',
      nombre: 'Dra. Laura Méndez',
      titulo: 'Médica veterinaria',
      especialidad: 'Medicina general',
      numeroLicencia: 'MV-CO 18427',
      experiencia: '8 años de experiencia en consulta preventiva, vacunación y acompañamiento integral de perros y gatos.',
      fotoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    },
    indicacionesPrevias: ['Trae la historia clínica previa si es la primera consulta.'],
  },
  {
    id: '3',
    codigo: 'VA-1090',
    clienteOwnerId: 'USR-001',
    servicio: 'Consulta Odontológica',
    categoriaServicio: 'ESPECIALIDADES',
    fecha: '29 de octubre de 2026',
    hora: '3:30 p. m.',
    duracion: '60 min',
    costo: 120000,
    estado: 'PROGRAMADA',
    mascota: {
      nombre: 'Simón',
      especieRaza: 'Gato · Persa · 2 años',
      edad: '2 años',
      avatarBg: '#e0f2fe',
    },
    profesional: {
      id: 'PROF-102',
      nombre: 'Dr. Roberto Gómez',
      titulo: 'Médico veterinario cirujano',
      especialidad: 'Odontología oral',
      numeroLicencia: 'MV-CO 20491',
      experiencia: '10 años de experiencia en tratamientos dentales, limpiezas profilácticas y cirugía maxilofacial.',
      fotoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    },
    indicacionesPrevias: [],
  },
];

export const DetalleCitaPage: React.FC = () => {
  const { id: citaId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [citaActual, setCitaActual] = useState<Cita | null>(null);
  const [cargando, setCargando] = useState(true);
  const [tipoError, setTipoError] = useState<TipoErrorCita | null>(null);
  const [intento, setIntento] = useState(0);
  const [showProfesionalModal, setShowProfesionalModal] = useState<boolean>(false);

  const handleSelectCita = (cita: Cita) => {
    navigate(`/cliente/citas/${encodeURIComponent(cita.id)}`);
  };

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setCitaActual(null);
    setTipoError(null);

    const token = localStorage.getItem('vetagenda_token') ?? undefined;
    obtenerDetalleCita(citaId, token)
      .then((cita) => {
        if (vigente) setCitaActual(cita);
      })
      .catch((error: unknown) => {
        if (!vigente) return;
        setTipoError(error instanceof CitaApiError ? error.tipo : 'NETWORK_ERROR');
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [citaId, intento]);

  const renderEstadoBadge = (estado: EstadoCita) => {
    const config = {
      CONFIRMADA: { bg: '#dcfce7', text: '#15803d', label: '• CONFIRMADA' },
      PROGRAMADA: { bg: '#e0e7ff', text: '#4338ca', label: '• PROGRAMADA' },
      COMPLETADA: { bg: '#f1f5f9', text: '#64748b', label: '• COMPLETADA' },
      CANCELADA: { bg: '#fee2e2', text: '#b91c1c', label: '• CANCELADA' },
    }[estado];

    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.text,
          fontSize: '11px',
          fontWeight: '700',
          padding: '4px 12px',
          borderRadius: '12px',
          letterSpacing: '0.5px',
          display: 'inline-block',
        }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Navbar Superior */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '900px' }}>
            <BrandHeader subtitle="Mis citas" />
            <div className="flex items-center gap-3">                        
            <BackToHomeButton />
            </div>
            </div>
        </div>
     </header>

      {/* Contenido Principal */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <button type="button" onClick={() => navigate('/cliente/citas')} style={{ border: 'none', background: 'none', color: '#0d5c75', fontWeight: '600', fontSize: '13px', cursor: 'pointer', padding: 0, minHeight: '44px' }}>
            ‹ Volver a mis citas
          </button>
          <p style={{ margin: '8px 0 2px 0', fontSize: '13px', color: '#64748b' }}>
            Mis citas / <span style={{ fontWeight: '600', color: '#334155' }}>{citaActual?.codigo}</span>
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Detalle de la cita</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>Revisa toda la información antes de tu visita.</p>
          </div>
          {citaActual && renderEstadoBadge(citaActual.estado)}
        </div>

        {cargando ? (
          <DetalleCitaSkeleton />
        ) : tipoError ? (
          <DetalleCitaFeedback tipoError={tipoError} onReintentar={() => setIntento((actual) => actual + 1)} />
        ) : citaActual ? (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* Selector Lateral */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 2px 0' }}>Mis citas</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>Selecciona una para ver el detalle.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {MOCK_CITAS.map((item) => {
                  const isSelected = item.id === citaId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectCita(item)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #0d9488' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '6px 10px', textAlign: 'center', minWidth: '40px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', display: 'block' }}>
                          {item.fecha.split(',')[1]?.trim().split(' ')[0] || '14'}
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                          {item.fecha.includes('octubre') ? 'OCT' : 'SEP'}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{item.servicio}</h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 4px 0' }}>
                          {item.hora} · {item.mascota.nombre}
                        </p>
                        {renderEstadoBadge(item.estado)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '16px', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '11px' }}>
                🔒 Solo tú puedes ver estas citas
              </div>
            </div>

            {/* Resumen de la Cita */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#0d9488', letterSpacing: '0.5px' }}>
                      {citaActual.categoriaServicio}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>• {citaActual.codigo}</span>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>{citaActual.servicio}</h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Valor del servicio</span>
                    <span style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
                      ${citaActual.costo.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#f0fdf4', color: '#0d9488', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      📅
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Fecha y hora</span>
                      <strong style={{ fontSize: '14px', color: '#1e293b', display: 'block' }}>{citaActual.fecha}</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{citaActual.hora} · {citaActual.duracion}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ backgroundColor: citaActual.mascota.avatarBg, color: '#d97706', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>
                      LU
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Mascota</span>
                      <strong style={{ fontSize: '14px', color: '#1e293b', display: 'block' }}>{citaActual.mascota.nombre}</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{citaActual.mascota.especieRaza}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ficha abreviada del profesional con botón "Ver perfil" */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img
                    src={citaActual.profesional.fotoUrl}
                    alt={citaActual.profesional.nombre}
                    style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                  />
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Profesional asignada</span>
                    <button
                      onClick={() => setShowProfesionalModal(true)}
                      style={{ border: 'none', background: 'none', padding: 0, fontSize: '15px', fontWeight: '700', color: '#0f766e', cursor: 'pointer', textAlign: 'left' }}
                    >
                      {citaActual.profesional.nombre} ›
                    </button>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{citaActual.profesional.especialidad}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfesionalModal(true)}
                  style={{ border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                  Ver perfil
                </button>
              </div>

              {/* Indicaciones Previas */}
              <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '20px 24px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>📋</span>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#713f12', margin: 0 }}>Indicaciones previas</h3>
                </div>

                {citaActual.indicacionesPrevias && citaActual.indicacionesPrevias.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#854d0e', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {citaActual.indicacionesPrevias.map((indicacion, idx) => (
                      <li key={idx}>{indicacion}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, fontSize: '13px', color: '#854d0e' }}>
                    No hay indicaciones especiales para este servicio.
                  </p>
                )}
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                

                {citaActual.estado !== 'COMPLETADA' && citaActual.estado !== 'CANCELADA' && (
                  <button style={{ padding: '10px 20px', border: '1px solid #fca5a5', backgroundColor: '#ffffff', color: '#b91c1c', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                    Cancelar cita
                  </button>
                )}
              </div>

            </div>
          </div>
        ) : null}
      </main>

      {/* MODAL DETALLADO DE FIGMA: Ficha del Profesional */}
      {showProfesionalModal && citaActual && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '90%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Cabecera Azul Oscura con Botón Cierre */}
            <div style={{ backgroundColor: '#0e4a5b', height: '110px', position: 'relative', padding: '16px' }}>
              <button
                onClick={() => setShowProfesionalModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>

              {/* Avatar Flotante Superpuesto */}
              <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)' }}>
                <img
                  src={citaActual.profesional.fotoUrl}
                  alt={citaActual.profesional.nombre}
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '16px',
                    objectFit: 'cover',
                    border: '4px solid #ffffff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </div>
            </div>

            {/* Cuerpo del Modal */}
            <div style={{ paddingTop: '52px', paddingBottom: '28px', paddingLeft: '28px', paddingRight: '28px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                {citaActual.profesional.nombre}
              </h3>
              <p style={{ fontSize: '13px', color: '#0d9488', fontWeight: '600', margin: '0 0 20px 0' }}>
                {citaActual.profesional.titulo}
              </p>

              {/* Tarjetas de Especialidad y Licencia Profesional */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', textAlign: 'left' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Especialidad</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{citaActual.profesional.especialidad}</strong>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', textAlign: 'left' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Licencia profesional</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{citaActual.profesional.numeroLicencia}</strong>
                </div>
              </div>

              {/* Experiencia y Descripción */}
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 24px 0' }}>
                {citaActual.profesional.experiencia}
              </p>

              {/* Botón Principal "Cerrar perfil" */}
              <button
                onClick={() => setShowProfesionalModal(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0e4a5b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cerrar perfil
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
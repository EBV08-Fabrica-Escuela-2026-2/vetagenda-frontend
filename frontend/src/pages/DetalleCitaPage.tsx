import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { DetalleCitaFeedback, DetalleCitaSkeleton } from '../components/DetalleCitaFeedback';
import { CitaApiError, obtenerDetalleCita, type Cita, type EstadoCita, type TipoErrorCita } from '../services/citasService';

export const DetalleCitaPage: React.FC = () => {
  const { id: citaId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [citaActual, setCitaActual] = useState<Cita | null>(null);
  const [cargando, setCargando] = useState(true);
  const [tipoError, setTipoError] = useState<TipoErrorCita | null>(null);
  const [intento, setIntento] = useState(0);

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
      <header className="border-b border-slate-200 bg-white px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <BrandHeader subtitle="Detalle de cita" />
          <BackToHomeButton />
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
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
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
                    <div style={{ backgroundColor: '#e0f2fe', color: '#0d5c75', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>
                      {citaActual.mascota.nombre.trim().slice(0, 2).toLocaleUpperCase('es-CO')}
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
                  {citaActual.profesional.fotoUrl && (
                    <img
                      src={citaActual.profesional.fotoUrl}
                      alt={citaActual.profesional.nombre}
                      style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Profesional asignada</span>
                    <strong style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{citaActual.profesional.nombre}</strong>
                    {citaActual.profesional.especialidad && (
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{citaActual.profesional.especialidad}</span>
                    )}
                  </div>
                </div>
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

            </div>
          </div>
        ) : null}
      </main>

    </div>
  );
};
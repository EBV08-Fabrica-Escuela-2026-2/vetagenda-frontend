import React, { useState } from 'react';
import { BrandHeader } from '../components/BrandHeader';
import { BackToHomeButton } from '../components/BackToHomeButton';

// Interfaces de la HU13
export interface CitaReprogramable {
  codigoReserva: string;
  servicio: string;
  duracion: string;
  costo: string;
  fechaLegible: string;
  fechaIso: string; // Para calcular las 4 horas de anticipación
  hora: string;
  paciente: {
    nombre: string;
    especieRaza: string;
    avatarBg: string;
  };
  profesional: {
    nombre: string;
    especialidad: string;
  };
  estado: 'CONFIRMADA' | 'PROGRAMADA' | 'COMPLETADA' | 'CANCELADA';
}

// Interfaz para días del calendario
interface DiaCalendario {
  numero: number;
  esMesActual: boolean;
  tieneHorariosDisponibles: boolean;
}

export const ReprogramarCitaPage: React.FC = () => {
  // Estado inicial de la cita basada en la imagen de Figma
  const [cita, setCita] = useState<CitaReprogramable>({
    codigoReserva: 'VA-141025-1000',
    servicio: 'Consulta General Canina',
    duracion: '30 minutos',
    costo: '$85.000 COP',
    fechaLegible: 'Martes, 14 de octubre',
    fechaIso: '2026-10-14T10:00:00', // Fecha futura válida
    hora: '10:00 a. m.',
    paciente: {
      nombre: 'Max',
      especieRaza: 'Canino · Labrador',
      avatarBg: '#ffedd5', // Fondo beige/naranja suave
    },
    profesional: {
      nombre: 'Dr. Camilo Durán',
      especialidad: 'Medicina veterinaria general',
    },
    estado: 'CONFIRMADA',
  });

  // Estados para el Modal de Reprogramación
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDia, setSelectedDia] = useState<number>(16); // Día seleccionado en la imagen (16 de Octubre)
  const [selectedHora, setSelectedHora] = useState<string | null>('11:30 a. m.'); // Horario seleccionado en la imagen
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Tarea 2: Validación de la regla de negocio de 4 horas de anticipación
  const calcularHorasFaltantes = (fechaIsoStr: string): number => {
    const fechaCita = new Date(fechaIsoStr).getTime();
    const ahora = new Date().getTime();
    const diferenciaMs = fechaCita - ahora;
    return diferenciaMs / (1000 * 60 * 60);
  };

  const horasFaltantes = calcularHorasFaltantes(cita.fechaIso);
  const esReprogramable = horasFaltantes >= 4;

  // Días exactos del calendario de OCTUBRE 2026 (El 1 de Octubre cae Jueves)
  const diasOctubre: DiaCalendario[] = [
    // Semana 1 (Septiembre)
    { numero: 28, esMesActual: false, tieneHorariosDisponibles: false },
    { numero: 29, esMesActual: false, tieneHorariosDisponibles: false },
    { numero: 30, esMesActual: false, tieneHorariosDisponibles: false },
    { numero: 1, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 2, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 3, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 4, esMesActual: true, tieneHorariosDisponibles: false },

    // Semana 2
    { numero: 5, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 6, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 7, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 8, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 9, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 10, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 11, esMesActual: true, tieneHorariosDisponibles: false },

    // Semana 3
    { numero: 12, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 13, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 14, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 15, esMesActual: true, tieneHorariosDisponibles: true },
    { numero: 16, esMesActual: true, tieneHorariosDisponibles: true }, // Seleccionado por defecto
    { numero: 17, esMesActual: true, tieneHorariosDisponibles: true },
    { numero: 18, esMesActual: true, tieneHorariosDisponibles: false },

    // Semana 4
    { numero: 19, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 20, esMesActual: true, tieneHorariosDisponibles: true },
    { numero: 21, esMesActual: true, tieneHorariosDisponibles: true },
    { numero: 22, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 23, esMesActual: true, tieneHorariosDisponibles: true },
    { numero: 24, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 25, esMesActual: true, tieneHorariosDisponibles: false },

    // Semana 5
    { numero: 26, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 27, esMesActual: true, tieneHorariosDisponibles: true },
    { numero: 28, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 29, esMesActual: true, tieneHorariosDisponibles: true },
    { numero: 30, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 31, esMesActual: true, tieneHorariosDisponibles: false },
    { numero: 1, esMesActual: false, tieneHorariosDisponibles: false },
  ];

  // Función para determinar si el día seleccionado actualmente tiene turnos
  const diaSeleccionadoObj = diasOctubre.find(
    (d) => d.numero === selectedDia && d.esMesActual
  );
  const tieneTurnosElDiaSeleccionado = diaSeleccionadoObj?.tieneHorariosDisponibles ?? false;

  // Horarios para el día 16 de Octubre
  const horariosDia16 = {
    manana: [
      { hora: '08:00 a. m.', disponible: true },
      { hora: '09:00 a. m.', disponible: false }, // Ocupado
      { hora: '10:30 a. m.', disponible: true },
      { hora: '11:30 a. m.', disponible: true },
    ],
    tarde: [
      { hora: '02:00 p. m.', disponible: true },
      { hora: '03:00 p. m.', disponible: true },
      { hora: '04:30 p. m.', disponible: false }, // Ocupado
      { hora: '05:00 p. m.', disponible: true },
    ],
  };

  const handleSelectDia = (dia: DiaCalendario) => {
    if (!dia.esMesActual) return;
    setSelectedDia(dia.numero);
    // Escenario 3: Si selecciona un día sin disponibilidad, resetea el horario
    if (!dia.tieneHorariosDisponibles) {
      setSelectedHora(null);
    }
  };

  const handleConfirmarReprogramacion = () => {
  if (!selectedHora) return;

  // Mapa de días de la semana según la posición del día en Octubre 2025/2026
  // (Para Octubre 2026: el día 1 es Jueves, así que calculamos el nombre real del día)
  const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  // Asumiendo Octubre de 2026 (o el año actual del calendario)
  const fechaObjeto = new Date(2026, 9, selectedDia); // Mes 9 es Octubre en JavaScript (0-indexed)
  const nombreDiaSemana = nombresDias[fechaObjeto.getDay()];

  const nuevaFechaLegible = `${nombreDiaSemana}, ${selectedDia} de octubre`;

  setCita((prev) => ({
    ...prev,
    fechaLegible: nuevaFechaLegible,
    hora: selectedHora,
  }));

  setShowModal(false);
  setMensajeExito(`¡Cita reprogramada con éxito para el ${nuevaFechaLegible} a las ${selectedHora}!`);
};

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '32px 16px' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="flex items-center justify-between px-5 py-5 md:px-8 md:py-6">
          <BrandHeader subtitle="Alta de Profesional Veterinario" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-500">Sistema activo</span>
            </div>
            <BackToHomeButton />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <button style={{ border: 'none', background: 'none', color: '#0d9488', fontWeight: '600', fontSize: '14px', cursor: 'pointer', padding: 0 }}>
            ‹ Volver a mis citas
          </button>
        </div>

        {mensajeExito && (
          <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '14px 20px', color: '#166534', fontSize: '14px', fontWeight: '600', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>✓ {mensajeExito}</span>
            <button onClick={() => setMensajeExito(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#166534', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Detalle de la cita</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{cita.servicio}</h1>
          <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginTop: '4px' }}>Código de reserva: {cita.codigoReserva}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ backgroundColor: '#f0fdf4', padding: '20px 24px', borderBottom: '1px solid #dc262600', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0d9488', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  PRÓXIMA CITA
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '4px 0 2px 0' }}>{cita.fechaLegible}</h2>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{cita.hora} · {cita.duracion}</span>
              </div>
              <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '12px' }}>
                • CONFIRMADA
              </span>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ backgroundColor: cita.paciente.avatarBg, color: '#d97706', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px' }}>
                    MX
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Paciente</span>
                    <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{cita.paciente.nombre}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{cita.paciente.especieRaza}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ backgroundColor: '#ccfbf1', color: '#0f766e', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    👤
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Profesional asignado</span>
                    <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{cita.profesional.nombre}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{cita.profesional.especialidad}</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  disabled={!esReprogramable}
                  onClick={() => setShowModal(true)}
                  style={{
                    backgroundColor: esReprogramable ? '#115e59' : '#cbd5e1',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: esReprogramable ? 'pointer' : 'not-allowed',
                  }}
                >
                  Reprogramar cita
                </button>

                {!esReprogramable && (
                  <p style={{ marginTop: '10px', fontSize: '12px', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                    ⚠️ Por políticas de la clínica no se permiten cambios con menos de 4 horas de antelación. Por favor comunícate telefónicamente.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>Información del servicio</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Servicio</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{cita.servicio}</strong>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Duración</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{cita.duracion}</strong>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Costo estimado</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{cita.costo}</strong>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '820px', width: '92%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Reprogramar Cita Médica</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Selecciona una nueva fecha y hora para {cita.paciente.nombre}.</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#0d9488', letterSpacing: '0.5px' }}>CITA ACTUAL</span>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>Paciente</span>
                <strong style={{ fontSize: '12px', color: '#0f172a' }}>{cita.paciente.nombre} · {cita.paciente.especieRaza}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '16px' }}>Servicio</span>
                <strong style={{ fontSize: '12px', color: '#0f172a' }}>{cita.servicio}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '16px' }}>Veterinario asignado</span>
                <strong style={{ fontSize: '12px', color: '#0f172a' }}>{cita.profesional.nombre}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '16px' }}>Horario actual</span>
                <strong style={{ fontSize: '12px', color: '#0f172a' }}>{cita.fechaLegible}, {cita.hora}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Nueva fecha</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Octubre 2025</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>‹</button>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#0d9488' }}>›</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>
                  <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                  {diasOctubre.map((dia, idx) => {
                    const isSelected = dia.numero === selectedDia && dia.esMesActual;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectDia(dia)}
                        style={{
                          padding: '8px 0',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: isSelected ? '800' : '500',
                          backgroundColor: isSelected ? '#115e59' : 'transparent',
                          color: isSelected ? '#ffffff' : dia.esMesActual ? '#1e293b' : '#cbd5e1',
                          cursor: dia.esMesActual ? 'pointer' : 'default',
                          position: 'relative',
                        }}
                      >
                        {dia.numero}
                        {dia.tieneHorariosDisponibles && dia.esMesActual && !isSelected && (
                          <span style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '3px', height: '3px', backgroundColor: '#0d9488', borderRadius: '50%' }}></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!tieneTurnosElDiaSeleccionado ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                  <p style={{ fontSize: '13px', margin: 0 }}>
                    ⚠️ No hay horarios libres para esta fecha.
                  </p>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Por favor selecciona un día marcado con un punto en el calendario.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>Mañana</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {horariosDia16.manana.map((slot, idx) => {
                        const isSelected = selectedHora === slot.hora;
                        return (
                          <button
                            key={idx}
                            disabled={!slot.disponible}
                            onClick={() => setSelectedHora(slot.hora)}
                            style={{
                              padding: '10px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              border: isSelected ? '2px solid #115e59' : '1px solid #e2e8f0',
                              backgroundColor: isSelected ? '#115e59' : slot.disponible ? '#ffffff' : '#f8fafc',
                              color: isSelected ? '#ffffff' : slot.disponible ? '#0f172a' : '#cbd5e1',
                              textDecoration: slot.disponible ? 'none' : 'line-through',
                              cursor: slot.disponible ? 'pointer' : 'not-allowed',
                            }}
                          >
                            {slot.hora}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>Tarde</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {horariosDia16.tarde.map((slot, idx) => {
                        const isSelected = selectedHora === slot.hora;
                        return (
                          <button
                            key={idx}
                            disabled={!slot.disponible}
                            onClick={() => setSelectedHora(slot.hora)}
                            style={{
                              padding: '10px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              border: isSelected ? '2px solid #115e59' : '1px solid #e2e8f0',
                              backgroundColor: isSelected ? '#115e59' : slot.disponible ? '#ffffff' : '#f8fafc',
                              color: isSelected ? '#ffffff' : slot.disponible ? '#0f172a' : '#cbd5e1',
                              textDecoration: slot.disponible ? 'none' : 'line-through',
                              cursor: slot.disponible ? 'pointer' : 'not-allowed',
                            }}
                          >
                            {slot.hora}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '12px 16px', fontSize: '12px', color: '#854d0e', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>⚠️</span>
              <div>
                <strong>Política de cambios:</strong> Recuerda que solo puedes reprogramar con un mínimo de 4 horas de anticipación a la cita original.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: '10px 20px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
              >
                Conservar Cita Actual
              </button>

              <button
                disabled={!selectedHora}
                onClick={handleConfirmarReprogramacion}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: selectedHora ? '#115e59' : '#cbd5e1',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: selectedHora ? 'pointer' : 'not-allowed',
                }}
              >
                Confirmar Nueva Fecha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
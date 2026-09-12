import React, { useEffect, useState } from 'react';
import {
  Stethoscope,
  MapPin,
  Clock,
  Phone,
  ArrowLeft,
  AlertCircle,
  RotateCcw,
  Lock,
  PawPrint
} from 'lucide-react';
import { Veterinario, Servicio } from '../../types/veterinario';
import { formatPrecioCOP } from '../../utils/formatPrecio';
import { useCatalogoServicios } from '../../hooks/useCatalogoServicios';

// ============================================================
// HU08 - Consultar catálogo de servicios
// Escenarios 1-6 cubiertos. Sigue las convenciones visuales del
// proyecto (colores/CSS vars de index.css, tipografía DM Sans /
// Inter, tarjetas redondeadas estilo ClientRegisterForm).
// ============================================================

// ---------- Item de servicio dentro de una tarjeta ----------
function ServicioItem({ servicio }: { servicio: Servicio }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.625rem 0',
        borderTop: '1px solid var(--color-border-subtle)'
      }}
    >
      <div>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
          {servicio.nombre}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.125rem' }}>
          {servicio.descripcion}
        </p>
      </div>
      <span
        style={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: 'var(--color-primary)',
          whiteSpace: 'nowrap'
        }}
      >
        {formatPrecioCOP(servicio.precio)}
      </span>
    </div>
  );
}

// ---------- Skeleton de carga (Task 48) ----------
function VeterinarioCardSkeleton() {
  const bar = (w: string, h = 10) => (
    <div
      className="animate-pulse-fade"
      style={{
        height: h,
        width: w,
        backgroundColor: '#E5ECEE',
        borderRadius: 4
      }}
    />
  );

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem'
      }}
    >
      <div style={{ marginBottom: 6 }}>{bar('65%', 15)}</div>
      <div style={{ marginBottom: 14 }}>{bar('35%')}</div>
      <div style={{ marginBottom: 6 }}>{bar('85%')}</div>
      <div style={{ marginBottom: 14 }}>{bar('45%')}</div>
      <div style={{ marginBottom: 6 }}>{bar('70%')}</div>
      <div>{bar('40%')}</div>
    </div>
  );
}

// ---------- Estado vacío (Escenario 4) ----------
function EmptyState({ titulo }: { titulo: string }) {
  return (
    <div
      style={{
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: '4rem 1.25rem'
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: 'var(--color-mint)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.875rem'
        }}
      >
        <PawPrint size={22} color="var(--color-primary)" />
      </div>
      <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)' }}>{titulo}</p>
    </div>
  );
}

// ---------- Estado de error ----------
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      style={{
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: '4rem 1.25rem'
      }}
    >
      <AlertCircle size={26} color="var(--color-error)" style={{ marginBottom: 10 }} />
      <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-error)' }}>
        Ocurrió un error al cargar el catálogo
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginTop: '0.375rem' }}>
        Verifica tu conexión e inténtalo nuevamente.
      </p>
      <button
        type="button"
        onClick={onRetry}
        style={{
          marginTop: '1rem',
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '0.625rem 1.25rem',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
      >
        <RotateCcw size={15} />
        Reintentar
      </button>
    </div>
  );
}

// ---------- Tarjeta de veterinario (Escenario 1 / 5) ----------
function VeterinarioCard({
  veterinario,
  onSeleccionar
}: {
  veterinario: Veterinario;
  onSeleccionar: (v: Veterinario) => void;
}) {
  const tieneServicios = veterinario.servicios.length > 0;
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onSeleccionar(veterinario)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: 'left',
        backgroundColor: 'var(--color-surface)',
        border: `1px solid ${hover ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        cursor: 'pointer',
        fontFamily: 'inherit',
        color: 'inherit',
        transition: 'border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover ? 'var(--shadow-md)' : 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '0.875rem' }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            backgroundColor: 'var(--color-mint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Stethoscope size={16} color="var(--color-primary)" />
        </div>
        <div>
          <p className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>
            {veterinario.nombre}
          </p>
          {veterinario.especialidad && (
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
                opacity: 0.75,
                marginTop: 1
              }}
            >
              {veterinario.especialidad}
            </p>
          )}
        </div>
      </div>

      {tieneServicios ? (
        veterinario.servicios.map((s) => <ServicioItem key={s.id} servicio={s} />)
      ) : (
        <p style={{ fontStyle: 'italic', color: 'var(--color-muted)', fontSize: '0.8125rem', padding: '0.375rem 0' }}>
          Sin servicios publicados
        </p>
      )}
    </button>
  );
}

// ---------- Ficha de detalle (Escenario 2) ----------
function VeterinarioDetalle({
  veterinario,
  onVolver
}: {
  veterinario: Veterinario;
  onVolver: () => void;
}) {
  const tieneServicios = veterinario.servicios.length > 0;

  const infoItem = (icon: React.ReactNode, label: string, valor: string) => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
        {icon}
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            color: 'var(--color-primary)'
          }}
        >
          {label}
        </p>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>{valor}</p>
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-mint)',
          padding: '1.5rem 1.75rem',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <button
          type="button"
          onClick={onVolver}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '0.875rem'
          }}
        >
          <ArrowLeft size={15} />
          Volver al catálogo
        </button>

        <p className="font-display" style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          {veterinario.nombre}
        </p>
        {veterinario.especialidad && (
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              color: 'var(--color-primary)',
              opacity: 0.75,
              marginTop: 2
            }}
          >
            {veterinario.especialidad}
          </p>
        )}
      </div>

      <div style={{ padding: '1.75rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1.25rem',
            backgroundColor: '#F8F9FA',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.125rem',
            marginBottom: '1.5rem'
          }}
        >
          {infoItem(<MapPin size={14} color="var(--color-primary)" />, 'Dirección', veterinario.direccion)}
          {infoItem(<Clock size={14} color="var(--color-primary)" />, 'Horario', veterinario.horario)}
          {infoItem(<Phone size={14} color="var(--color-primary)" />, 'Teléfono', veterinario.telefono)}
        </div>

        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          Servicios ofrecidos
        </p>

        {tieneServicios ? (
          veterinario.servicios.map((s) => <ServicioItem key={s.id} servicio={s} />)
        ) : (
          <p style={{ fontStyle: 'italic', color: 'var(--color-muted)', fontSize: '0.8125rem', padding: '0.375rem 0' }}>
            Sin servicios publicados
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- Estado sin sesión (Escenario 6) ----------
function SesionInvalidaState() {
  return (
    <div
      style={{
        maxWidth: 420,
        margin: '4rem auto',
        textAlign: 'center',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-2xl)',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: 'var(--color-error-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem'
        }}
      >
        <Lock size={22} color="var(--color-error)" />
      </div>
      <p className="font-display" style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)' }}>
        Redirigiendo a inicio de sesión…
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginTop: '0.375rem' }}>
        No hay una sesión activa, por lo tanto el catálogo no se muestra.
      </p>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
interface CatalogoServiciosProps {
  /**
   * Callback invocado cuando no hay sesión válida (Escenario 6).
   * El proyecto decide cómo navegar (react-router, cambio de vista, etc.)
   * cuando HU03 - Inicio de Sesión quede integrada.
   */
  onSesionInvalida?: () => void;
}

export const CatalogoServicios: React.FC<CatalogoServiciosProps> = ({ onSesionInvalida }) => {
  const { veterinarios, isLoading, error, sesionInvalida, recargar } = useCatalogoServicios();
  const [veterinarioSeleccionado, setVeterinarioSeleccionado] = useState<Veterinario | null>(null);

  useEffect(() => {
    if (sesionInvalida && onSesionInvalida) {
      onSesionInvalida();
    }
  }, [sesionInvalida, onSesionInvalida]);

  if (sesionInvalida) {
    return <SesionInvalidaState />;
  }

  return (
    <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
      {/* Encabezado estilo ClientRegisterForm */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          className="font-display"
          style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-primary)' }}
        >
          Catálogo de servicios
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
          {veterinarioSeleccionado
            ? 'Detalle completo del veterinario seleccionado.'
            : 'Consulta los veterinarios registrados y sus servicios disponibles.'}
        </p>
      </div>

      {veterinarioSeleccionado ? (
        <VeterinarioDetalle
          veterinario={veterinarioSeleccionado}
          onVolver={() => setVeterinarioSeleccionado(null)}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1rem'
          }}
        >
          {isLoading && Array.from({ length: 6 }).map((_, i) => <VeterinarioCardSkeleton key={i} />)}

          {!isLoading && error && <ErrorState onRetry={recargar} />}

          {!isLoading && !error && veterinarios.length === 0 && (
            <EmptyState titulo="No hay veterinarios disponibles por el momento" />
          )}

          {!isLoading &&
            !error &&
            veterinarios.length > 0 &&
            veterinarios.map((vet) => (
              <VeterinarioCard key={vet.id} veterinario={vet} onSeleccionar={setVeterinarioSeleccionado} />
            ))}
        </div>
      )}
    </div>
  );
};

export default CatalogoServicios;

import React from 'react';
import { CatalogoServicios } from './components/services/CatalogoServicios';
import { Logo } from './components/ui/Logo';

export const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8F9FA' }}>
      {/* Barra de Navegación Superior: Solo Logo y Nombre */}
      <header
        style={{
          backgroundColor: '#0A4A5E',
          color: '#FFFFFF',
          padding: '0.875rem 2rem',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Logo size="sm" light />
      </header>

      {/* Contenido Principal: HU08 - Consultar catálogo de servicios */}
      <main
        style={{
          flex: 1,
          padding: '2.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <CatalogoServicios onSesionInvalida={() => console.warn('Redirigir a login (HU03)')} />
      </main>

      {/* Pie de página institucional */}
      <footer
        style={{
          padding: '1.25rem',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: '#6B7E84',
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF'
        }}
      >
        <p>
          © 2026 <strong>VetAgenda</strong> — Plataforma de Gestión Veterinaria. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default App;

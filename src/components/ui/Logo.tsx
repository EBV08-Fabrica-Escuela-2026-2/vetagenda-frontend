import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  light = false,
  showSubtitle = false
}) => {
  const iconDimensions = {
    sm: 24,
    md: 32,
    lg: 42
  }[size];

  const textSizes = {
    sm: '1.125rem',
    md: '1.5rem',
    lg: '1.875rem'
  }[size];

  const primaryColor = light ? '#E8F4F1' : '#0D5C75';
  const secondaryColor = light ? '#0D5C75' : '#E8F4F1';

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.625rem',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: textSizes,
          color: primaryColor,
          userSelect: 'none'
        }}
      >
        {/* Isotipo SVG idéntico al prototipo de Figma */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg
            width={iconDimensions}
            height={iconDimensions}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="40" rx="10" fill={primaryColor} />
            <path
              d="M20 8 C14 8 10 13 10 18 C10 24 16 30 20 34 C24 30 30 24 30 18 C30 13 26 8 20 8Z"
              fill={secondaryColor}
            />
            <rect x="18" y="14" width="4" height="10" rx="2" fill={primaryColor} />
            <rect x="14" y="18" width="12" height="4" rx="2" fill={primaryColor} />
          </svg>
        </div>

        {/* Logotipo Tipográfico */}
        <span style={{ letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
          <span>Vet</span>
          <span
            style={{
              color: light ? 'rgba(232,244,241,0.75)' : '#0D5C75',
              opacity: light ? 1 : 0.75,
              fontWeight: 600
            }}
          >
            Agenda
          </span>
        </span>
      </div>

      {showSubtitle && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: light ? 'rgba(232, 244, 241, 0.7)' : '#6B7E84',
            marginTop: '0.375rem',
            fontWeight: 400
          }}
        >
          Plataforma de Gestión Veterinaria
        </p>
      )}
    </div>
  );
};

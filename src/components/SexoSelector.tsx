import type { Sexo } from '../types/mascota'

interface SexoSelectorProps {
  value: Sexo | null
  onChange: (sexo: Sexo) => void
}

const OPCIONES: Sexo[] = ['Macho', 'Hembra']

export default function SexoSelector({ value, onChange }: SexoSelectorProps) {
  return (
    <div className="sexo-grid" role="radiogroup" aria-label="Sexo de la mascota">
      {OPCIONES.map((sexo) => {
        const selected = value === sexo
        return (
          <button
            key={sexo}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? 'sexo-pill sexo-pill--selected' : 'sexo-pill'}
            onClick={() => onChange(sexo)}
          >
            {sexo}
          </button>
        )
      })}
    </div>
  )
}

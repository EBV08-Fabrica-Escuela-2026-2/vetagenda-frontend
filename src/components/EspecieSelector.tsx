import { ESPECIE_ICONOS, type Especie } from '../types/mascota'

interface EspecieSelectorProps {
  value: Especie | null
  onChange: (especie: Especie) => void
}

const ESPECIES: Especie[] = ['Perro', 'Gato', 'Otro']

export default function EspecieSelector({ value, onChange }: EspecieSelectorProps) {
  return (
    <div className="especie-grid" role="radiogroup" aria-label="Especie de la mascota">
      {ESPECIES.map((especie) => {
        const selected = value === especie
        return (
          <button
            key={especie}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? 'especie-card especie-card--selected' : 'especie-card'}
            onClick={() => onChange(especie)}
          >
            <span className="especie-card__icon" aria-hidden="true">
              {ESPECIE_ICONOS[especie]}
            </span>
            <span className="especie-card__label">{especie}</span>
          </button>
        )
      })}
    </div>
  )
}

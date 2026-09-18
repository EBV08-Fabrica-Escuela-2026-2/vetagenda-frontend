import { CLIENTES_MOCK } from '../types/mascota'

interface ClienteSelectorProps {
  value: string
  onChange: (clienteId: string) => void
  invalid?: boolean
}

export default function ClienteSelector({ value, onChange, invalid }: ClienteSelectorProps) {
  return (
    <div className="select-wrapper">
      <select
        id="cliente"
        className="field__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
      >
        <option value="" disabled>
          Selecciona un cliente registrado
        </option>
        {CLIENTES_MOCK.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.nombre} · {cliente.documento}
          </option>
        ))}
      </select>
    </div>
  )
}
